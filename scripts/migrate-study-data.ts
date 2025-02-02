import { PrismaClient } from '@prisma/client';
import { SubjectWithRelations } from '@/types/prisma/subject';
import { Topic, StudyProgress, PreparationConfig, TrackType, StudyBlock } from '@/types/gate-preparation';
import fs from 'fs';
import path from 'path';

// Initialize Prisma client with increased timeout and connection retry
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL?.replace(
                '?',
                '?retryWrites=true&w=majority&serverSelectionTimeoutMS=60000&connectTimeoutMS=60000&socketTimeoutMS=60000&maxPoolSize=1&'
            )
        }
    },
    log: ['warn', 'error']
});

async function retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts = 5,
    delayMs = 5000,
    operationName = 'Operation'
): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Attempting ${operationName} (${attempt}/${maxAttempts})...`);
            const result = await operation();
            console.log(`${operationName} successful`);
            return result;
        } catch (error) {
            console.error(`${operationName} attempt ${attempt}/${maxAttempts} failed:`, error);
            if (attempt === maxAttempts) {
                throw error;
            }
            console.log(`Waiting ${delayMs}ms before retrying...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    throw new Error(`${operationName} failed after ${maxAttempts} attempts`);
}

async function ensureConnection() {
    let isConnected = false;
    while (!isConnected) {
        try {
            console.log('Testing database connection...');
            await prisma.$connect();
            await prisma.user.count();
            console.log('Successfully connected to database');
            isConnected = true;
        } catch (error) {
            console.error('Connection failed:', error);
            console.log('Retrying in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

async function migrateStudyData() {
    try {
        console.log('Starting study data migration...');

        // Ensure database connection
        await ensureConnection();

        // Get all users with their data
        const users = await retryOperation(
            async () => {
                console.log('Fetching users data...');
                return prisma.user.findMany({
                    include: {
                        subjects: {
                            include: {
                                chapters: {
                                    include: {
                                        topics: true
                                    }
                                }
                            }
                        },
                        studyStreak: true,
                        dailyActivities: true
                    }
                });
            },
            5,
            5000,
            'Fetch users'
        );

        console.log(`Found ${users.length} users to migrate`);

        for (const user of users) {
            console.log(`\nMigrating data for user: ${user.email}`);

            try {
                // Transform topics into the new format
                const topics: Topic[] = user.subjects.flatMap(subject =>
                    subject.chapters.flatMap(chapter =>
                        chapter.topics.map(topic => ({
                            id: topic.id,
                            name: topic.name,
                            subject: subject.name,
                            priority: topic.important ? 'HIGH' : 'MEDIUM',
                            estimatedHours: calculateEstimatedHours(topic, subject),
                            track: determineTrack(chapter, subject),
                            completedHours: calculateCompletedHours(topic),
                            lastStudied: topic.lastRevised
                        }))
                    )
                );

                // Create study progress entries
                const progressEntries = topics.map(topic => ({
                    userId: user.id,
                    topicId: topic.id,
                    completedHours: topic.completedHours || 0,
                    lastStudied: topic.lastStudied || new Date(),
                    confidence: calculateConfidence(topic.id, user.subjects)
                }));

                // Create default study plan config
                const config: PreparationConfig = {
                    examDate: user.examDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    dailyAvailableHours: {
                        MORNING: 4,
                        AFTERNOON: 4,
                        EVENING: 4
                    },
                    preferredTrackOrder: ['CORE', 'MATHEMATICAL', 'REVISION'],
                    topicPriorityWeights: {
                        HIGH: 1.5,
                        MEDIUM: 1.0,
                        LOW: 0.5
                    }
                };

                console.log('Deleting existing data...');
                await retryOperation(
                    async () => {
                        await prisma.studyProgress.deleteMany({
                            where: { userId: user.id }
                        });
                        await prisma.studyPlan.deleteMany({
                            where: { userId: user.id }
                        });
                    },
                    5,
                    5000,
                    'Delete existing data'
                );

                console.log('Processing study progress entries...');
                // Process study progress entries sequentially in small batches
                const BATCH_SIZE = 3;
                for (let i = 0; i < progressEntries.length; i += BATCH_SIZE) {
                    const batch = progressEntries.slice(i, i + BATCH_SIZE);
                    await retryOperation(
                        async () => {
                            // Process entries sequentially
                            for (const entry of batch) {
                                await prisma.studyProgress.create({
                                    data: entry
                                });
                                // Small delay between individual creates
                                await new Promise(resolve => setTimeout(resolve, 500));
                            }
                            console.log(`Processed ${Math.min(i + BATCH_SIZE, progressEntries.length)} of ${progressEntries.length} progress entries`);
                        },
                        5,
                        5000,
                        `Process batch ${i + 1}-${Math.min(i + BATCH_SIZE, progressEntries.length)}`
                    );
                    // Delay between batches
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                console.log('Generating daily plans...');
                const dailyPlans = generateInitialDailyPlans(topics, config);

                console.log('Creating study plan...');
                const studyPlan = await retryOperation(
                    async () => {
                        return prisma.studyPlan.create({
                            data: {
                                userId: user.id,
                                startDate: new Date(),
                                endDate: config.examDate,
                                config: config as any,
                                dailyPlans: {
                                    create: dailyPlans.map(plan => ({
                                        date: plan.date,
                                        slots: plan.slots as any,
                                        totalHours: plan.totalHours
                                    }))
                                }
                            }
                        });
                    },
                    5,
                    5000,
                    'Create study plan'
                );

                console.log(`Created study plan ${studyPlan.id} for user ${user.email}`);
            } catch (error) {
                console.error(`Error processing user ${user.email}:`, error);
                // Continue with next user instead of failing completely
                continue;
            }
        }

        console.log('\nStudy data migration completed successfully');
    } catch (error) {
        console.error('Error during migration:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Helper functions
function calculateEstimatedHours(topic: any, subject: SubjectWithRelations): number {
    // Base hours based on subject weightage
    const baseHours = subject.weightage * 2;
    
    // Adjust based on topic importance
    const importanceMultiplier = topic.important ? 1.5 : 1;
    
    return Math.round(baseHours * importanceMultiplier);
}

function determineTrack(chapter: any, subject: SubjectWithRelations): TrackType {
    // Determine track based on subject and chapter characteristics
    if (subject.name.toLowerCase().includes('math') || 
        subject.name.toLowerCase().includes('algorithm')) {
        return 'MATHEMATICAL';
    }
    
    if (chapter.important) {
        return 'CORE';
    }
    
    return 'REVISION';
}

function calculateCompletedHours(topic: any): number {
    // Calculate completed hours based on existing progress
    let completedHours = 0;
    
    if (topic.learningStatus) completedHours += 2;
    completedHours += topic.revisionCount * 1;
    completedHours += topic.practiceCount * 1.5;
    completedHours += topic.testCount * 0.5;
    
    return completedHours;
}

function calculateConfidence(topicId: string, subjects: SubjectWithRelations[]): number {
    // Find the topic in subjects
    for (const subject of subjects) {
        for (const chapter of subject.chapters) {
            const topic = chapter.topics.find(t => t.id === topicId);
            if (topic) {
                // Calculate confidence based on various factors
                let confidence = 0;
                
                if (topic.learningStatus) confidence += 40;
                confidence += topic.revisionCount * 10;
                confidence += topic.practiceCount * 15;
                confidence += topic.testCount * 5;
                
                // Cap at 100
                return Math.min(confidence, 100);
            }
        }
    }
    return 0;
}

function generateInitialDailyPlans(topics: Topic[], config: PreparationConfig) {
    const plans = [];
    const daysUntilExam = Math.ceil(
        (config.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate first week of plans
    for (let day = 0; day < Math.min(7, daysUntilExam); day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);

        const slots = generateDailySlots(topics, config.dailyAvailableHours);
        const totalHours = Object.values(config.dailyAvailableHours).reduce((a, b) => a + b, 0);

        plans.push({
            date,
            slots,
            totalHours
        });
    }

    return plans;
}

function generateDailySlots(topics: Topic[], dailyHours: Record<StudyBlock, number>) {
    const slots = [];
    const blocks: StudyBlock[] = ['MORNING', 'AFTERNOON', 'EVENING'];
    
    blocks.forEach((block, index) => {
        const hours = dailyHours[block];
        const track = ['CORE', 'MATHEMATICAL', 'REVISION'][index % 3] as TrackType;
        
        // Find a suitable topic for this slot
        const availableTopics = topics.filter(t => t.track === track);
        if (availableTopics.length > 0) {
            const topic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
            
            slots.push({
                block,
                duration: hours,
                topic,
                isCompleted: false
            });
        }
    });

    return slots;
}

// Run migration
migrateStudyData()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
