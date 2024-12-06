"use strict";
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
// Create Prisma client with debug logging
const prisma = new PrismaClient({
    log: ['warn', 'error'],
});
async function updateSubjectPositions() {
    var _a, _b, _c, _d, _e, _f, _g;
    console.log('Starting subject position update...');
    try {
        // Get all subjects ordered by creation date
        const subjects = await prisma.subject.findMany({
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                name: true,
                userId: true,
                expectedMarks: true,
                foundationLevel: true,
                overallProgress: true,
                learningProgress: true,
                revisionProgress: true,
                practiceProgress: true,
                testProgress: true,
            }
        });
        console.log(`Found ${subjects.length} subjects to update`);
        // Group subjects by userId
        const subjectsByUser = subjects.reduce((acc, subject) => {
            if (!acc[subject.userId]) {
                acc[subject.userId] = [];
            }
            acc[subject.userId].push(subject);
            return acc;
        }, {});
        // Update positions for each user's subjects
        for (const userId in subjectsByUser) {
            const userSubjects = subjectsByUser[userId];
            console.log(`Updating ${userSubjects.length} subjects for user ${userId}`);
            for (let i = 0; i < userSubjects.length; i++) {
                const subject = userSubjects[i];
                try {
                    await prisma.subject.update({
                        where: { id: subject.id },
                        data: {
                            position: i,
                            expectedMarks: (_a = subject.expectedMarks) !== null && _a !== void 0 ? _a : 0,
                            foundationLevel: (_b = subject.foundationLevel) !== null && _b !== void 0 ? _b : 'Beginner',
                            overallProgress: (_c = subject.overallProgress) !== null && _c !== void 0 ? _c : 0,
                            learningProgress: (_d = subject.learningProgress) !== null && _d !== void 0 ? _d : 0,
                            revisionProgress: (_e = subject.revisionProgress) !== null && _e !== void 0 ? _e : 0,
                            practiceProgress: (_f = subject.practiceProgress) !== null && _f !== void 0 ? _f : 0,
                            testProgress: (_g = subject.testProgress) !== null && _g !== void 0 ? _g : 0,
                        }
                    });
                    console.log(`Updated subject: ${subject.name} with position: ${i}`);
                }
                catch (updateError) {
                    console.error(`Failed to update subject ${subject.name}:`, updateError);
                }
            }
        }
        console.log('Subject position update completed successfully');
    }
    catch (error) {
        console.error('Error during subject position update:', error);
        throw error;
    }
}
// Execute the update
async function main() {
    try {
        await updateSubjectPositions();
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
        console.log('Database connection closed');
    }
}
main();
