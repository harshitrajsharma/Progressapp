const { PrismaClient } = require('@prisma/client');

// Define TestType enum since we can't import it properly in CommonJS
enum TestType {
    TWT = 'TWT',
    SWT = 'SWT',
    MST = 'MST',
    GBG = 'GBG',
    GATE_PYQ = 'GATE_PYQ'
}

const prisma = new PrismaClient();

const RETRY_COUNT = 5;
const RETRY_DELAY = 5000;

async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    delay: number,
    operationName: string
): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempting ${operationName} (${attempt}/${maxRetries})...`);
            const result = await operation();
            console.log(`${operationName} successful`);
            return result;
        } catch (error) {
            if (attempt === maxRetries) throw error;
            console.log(`Attempt ${attempt} failed, retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error(`Failed after ${maxRetries} attempts`);
}

async function migrateTestData() {
    try {
        console.log('Starting test data migration...');
        console.log('Testing database connection...');

        await retryOperation(
            async () => await prisma.$connect(),
            RETRY_COUNT,
            RETRY_DELAY,
            'Database connection'
        );

        console.log('Successfully connected to database');

        // Get all users
        const users = await retryOperation(
            async () => await prisma.user.findMany({
                include: {
                    subjects: true
                }
            }),
            RETRY_COUNT,
            RETRY_DELAY,
            'Fetch users'
        );

        console.log(`Found ${users.length} users to migrate`);

        // Process each user
        for (const user of users) {
            try {
                console.log(`\nMigrating data for user: ${user.email}`);

                // Delete existing test data
                console.log('Deleting existing test data...');
                await retryOperation(
                    async () => {
                        await prisma.gateTest.deleteMany({
                            where: { userId: user.id }
                        });
                        await prisma.testProgress.deleteMany({
                            where: { userId: user.id }
                        });
                    },
                    RETRY_COUNT,
                    RETRY_DELAY,
                    'Delete existing data'
                );

                // Create test progress entries for each subject
                const testProgressEntries = user.subjects.map((subject: { id: string }) => ({
                    userId: user.id,
                    subjectId: subject.id,
                    twtCompleted: 0,
                    swtCompleted: 0,
                    mstCompleted: 0,
                    gbgCompleted: 0,
                    pyqCompleted: 0
                }));

                // Create initial test schedule
                const testSchedule = generateInitialTestSchedule(user);

                // Create test data in transaction
                await prisma.$transaction(async (tx: typeof prisma) => {
                    // Create test progress entries
                    await tx.testProgress.createMany({
                        data: testProgressEntries
                    });

                    // Create test schedule
                    await tx.gateTest.createMany({
                        data: testSchedule
                    });
                });

                console.log(`Created test data for user ${user.email}`);
            } catch (error) {
                console.error(`Error processing user ${user.email}:`, error);
                continue;
            }
        }

        console.log('\nTest data migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

interface UserWithSubjects {
    id: string;
    email: string;
    subjects: {
        id: string;
    }[];
}

function generateInitialTestSchedule(user: UserWithSubjects) {
    const schedule = [];
    const startDate = new Date();
    let currentDate = new Date(startDate);

    // Generate Topic Wise Tests
    for (let i = 0; i < 46; i++) {
        currentDate.setDate(currentDate.getDate() + 3); // Every 3 days
        schedule.push({
            type: TestType.TWT,
            name: `Topic Wise Test ${i + 1}`,
            questions: 13,
            marks: 20,
            duration: 40,
            scheduledFor: new Date(currentDate),
            userId: user.id,
            subjects: [user.subjects[i % user.subjects.length].id],
            track: 'CORE',
            completed: false,
            attempts: 0
        });
    }

    // Generate Subject Wise Tests
    currentDate = new Date(startDate);
    for (let i = 0; i < 24; i++) {
        currentDate.setDate(currentDate.getDate() + 5); // Every 5 days
        schedule.push({
            type: TestType.SWT,
            name: `Subject Wise Test ${i + 1}`,
            questions: 26,
            marks: 40,
            duration: 75,
            scheduledFor: new Date(currentDate),
            userId: user.id,
            subjects: [user.subjects[i % user.subjects.length].id],
            track: 'CORE',
            completed: false,
            attempts: 0
        });
    }

    // Generate Multiple Subject Tests
    currentDate = new Date(startDate);
    for (let i = 0; i < 4; i++) {
        currentDate.setDate(currentDate.getDate() + 14); // Every 14 days
        schedule.push({
            type: TestType.MST,
            name: `Multiple Subject Test ${i + 1}`,
            questions: 39,
            marks: 60,
            duration: 110,
            scheduledFor: new Date(currentDate),
            userId: user.id,
            subjects: user.subjects.slice(0, 3).map(s => s.id), // First 3 subjects
            track: 'CORE',
            completed: false,
            attempts: 0
        });
    }

    // Generate GATE Before GATE Tests
    currentDate = new Date(startDate);
    for (let i = 0; i < 11; i++) {
        currentDate.setDate(currentDate.getDate() + 7); // Weekly
        schedule.push({
            type: TestType.GBG,
            name: `GATE Before GATE ${i + 1}`,
            questions: 65,
            marks: 100,
            duration: 180,
            scheduledFor: new Date(currentDate),
            userId: user.id,
            subjects: user.subjects.map(s => s.id), // All subjects
            track: 'CORE',
            completed: false,
            attempts: 0
        });
    }

    // Generate GATE PYQ Tests
    currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 30); // Start after 30 days
    for (let i = 0; i < 13; i++) {
        currentDate.setDate(currentDate.getDate() + 3); // Every 3 days
        schedule.push({
            type: TestType.GATE_PYQ,
            name: `GATE PYQ ${2024 - i}`,
            questions: 65,
            marks: 100,
            duration: 180,
            scheduledFor: new Date(currentDate),
            userId: user.id,
            subjects: user.subjects.map(s => s.id), // All subjects
            track: 'CORE',
            completed: false,
            attempts: 0
        });
    }

    return schedule;
}

migrateTestData()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
