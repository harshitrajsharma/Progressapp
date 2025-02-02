import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function verifyConnection() {
  try {
    console.log('Attempting to connect to database...');
    console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));
    
    await prisma.$connect();
    console.log('Successfully connected to database');

    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`Database connection verified. Found ${userCount} users.`);

    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

verifyConnection()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Verification script failed:', error);
    process.exit(1);
  }); 