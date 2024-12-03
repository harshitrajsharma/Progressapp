import { prisma } from "@/lib/db";

/**
 * Helper function to check subject ownership
 * Throws error if subject not found or user is not authorized
 */
export async function checkSubjectOwnership(subjectId: string, userId: string) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });
  
  if (!subject) {
    throw new Error("Subject not found");
  }
  
  if (subject.userId !== userId) {
    throw new Error("Unauthorized");
  }
  
  return subject;
} 