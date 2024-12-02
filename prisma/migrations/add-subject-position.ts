import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all users
  const users = await prisma.user.findMany()

  // For each user, update their subjects with positions
  for (const user of users) {
    const subjects = await prisma.subject.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' }
    })

    // Update each subject with its position
    for (let i = 0; i < subjects.length; i++) {
      await prisma.subject.update({
        where: { id: subjects[i].id },
        data: { position: i }
      })
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })