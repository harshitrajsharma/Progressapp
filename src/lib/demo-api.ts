import { dummySubjects as initialSubjects } from './demo-data';
import { SubjectWithRelations } from '@/types/prisma/subject';
import { TopicUpdateData, TopicResponse } from '@/types/prisma/topic';

// Client-side state that resets on page reload
let subjects = [...initialSubjects];

export const demoApi = {
  // Get all subjects
  getSubjects: async (): Promise<SubjectWithRelations[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return subjects;
  },

  // Update topic status
  updateTopic: async (
    chapterId: string,
    topicId: string,
    data: TopicUpdateData
  ): Promise<TopicResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    subjects = subjects.map(subject => ({
      ...subject,
      chapters: subject.chapters.map(chapter => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            topics: chapter.topics.map(topic => {
              if (topic.id === topicId) {
                return {
                  ...topic,
                  ...data,
                  updatedAt: new Date()
                };
              }
              return topic;
            })
          };
        }
        return chapter;
      })
    }));

    const updatedTopic = subjects
      .flatMap(s => s.chapters)
      .flatMap(c => c.topics)
      .find(t => t.id === topicId);

    if (!updatedTopic) {
      throw new Error('Topic not found');
    }

    return {
      success: true,
      topic: updatedTopic
    };
  },

  // Update chapter progress
  updateChapterProgress: async (
    chapterId: string,
    progress: { [key: string]: number }
  ) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    subjects = subjects.map(subject => ({
      ...subject,
      chapters: subject.chapters.map(chapter => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            ...progress,
            updatedAt: new Date()
          };
        }
        return chapter;
      })
    }));

    return { success: true };
  },

  // Update subject progress
  updateSubjectProgress: async (
    subjectId: string,
    progress: { [key: string]: number }
  ) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    subjects = subjects.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          ...progress,
          updatedAt: new Date()
        };
      }
      return subject;
    });

    return { success: true };
  },

  // Reset to initial state
  reset: () => {
    subjects = [...initialSubjects];
  }
}; 