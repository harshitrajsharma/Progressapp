"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function migrateStudyData() {
    try {
        console.log('Starting study data migration...');
        // Get all users
        const users = await prisma.user.findMany({
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
        console.log(`Found ${users.length} users to migrate`);
        for (const user of users) {
            console.log(`Migrating data for user: ${user.email}`);
            // Transform topics into the new format
            const topics = user.subjects.flatMap(subject => subject.chapters.flatMap(chapter => chapter.topics.map(topic => ({
                id: topic.id,
                name: topic.name,
                subject: subject.name,
                priority: topic.important ? 'HIGH' : 'MEDIUM',
                estimatedHours: calculateEstimatedHours(topic, subject),
                track: determineTrack(chapter, subject),
                completedHours: calculateCompletedHours(topic),
                lastStudied: topic.lastRevised
            }))));
            // Create study progress entries
            const progressEntries = topics.map(topic => ({
                userId: user.id,
                topicId: topic.id,
                completedHours: topic.completedHours || 0,
                lastStudied: topic.lastStudied || new Date(),
                confidence: calculateConfidence(topic.id, user.subjects)
            }));
            // Create default study plan config
            const config = {
                examDate: user.examDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now if not set
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
            // Create initial study plan
            await prisma.$transaction(async (tx) => {
                // Create study progress entries
                await tx.studyProgress.createMany({
                    data: progressEntries,
                    skipDuplicates: true
                });
                // Create study plan
                const studyPlan = await tx.studyPlan.create({
                    data: {
                        userId: user.id,
                        startDate: new Date(),
                        endDate: config.examDate,
                        config: config,
                        dailyPlans: {
                            create: generateInitialDailyPlans(topics, config)
                        }
                    }
                });
                console.log(`Created study plan ${studyPlan.id} for user ${user.email}`);
            });
        }
        console.log('Study data migration completed successfully');
    }
    catch (error) {
        console.error('Error during migration:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Helper functions
function calculateEstimatedHours(topic, subject) {
    // Base hours based on subject weightage
    const baseHours = subject.weightage * 2;
    // Adjust based on topic importance
    const importanceMultiplier = topic.important ? 1.5 : 1;
    return Math.round(baseHours * importanceMultiplier);
}
function determineTrack(chapter, subject) {
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
function calculateCompletedHours(topic) {
    // Calculate completed hours based on existing progress
    let completedHours = 0;
    if (topic.learningStatus)
        completedHours += 2;
    completedHours += topic.revisionCount * 1;
    completedHours += topic.practiceCount * 1.5;
    completedHours += topic.testCount * 0.5;
    return completedHours;
}
function calculateConfidence(topicId, subjects) {
    // Find the topic in subjects
    for (const subject of subjects) {
        for (const chapter of subject.chapters) {
            const topic = chapter.topics.find(t => t.id === topicId);
            if (topic) {
                // Calculate confidence based on various factors
                let confidence = 0;
                if (topic.learningStatus)
                    confidence += 40;
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
function generateInitialDailyPlans(topics, config) {
    const plans = [];
    const daysUntilExam = Math.ceil((config.examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
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
function generateDailySlots(topics, dailyHours) {
    const slots = [];
    const blocks = ['MORNING', 'AFTERNOON', 'EVENING'];
    blocks.forEach((block, index) => {
        const hours = dailyHours[block];
        const track = ['CORE', 'MATHEMATICAL', 'REVISION'][index % 3];
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
