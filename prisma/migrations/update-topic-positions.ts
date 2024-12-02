import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all chapters
  const chapters = await prisma.chapter.findMany({
    include: {
      topics: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  console.log(`Found ${chapters.length} chapters to process`)

  // Update topics in each chapter
  for (const chapter of chapters) {
    console.log(`Processing chapter "${chapter.name}" with ${chapter.topics.length} topics`)
    
    // Update each topic's position based on its index in the sorted array
    const updates = chapter.topics.map((topic: { id: string }, index: number) => {
      console.log(`Setting position ${index} for topic "${topic.id}"`)
      return prisma.topic.update({
        where: { id: topic.id },
        data: { position: index }
      })
    })

    // Execute all updates in parallel
    await Promise.all(updates)
    console.log(`Updated all topics in chapter "${chapter.name}"`)
  }

  console.log('Successfully updated topic positions')
}

main()
  .catch((e) => {
    console.error('Error updating topic positions:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 