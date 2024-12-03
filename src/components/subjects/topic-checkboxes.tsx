import { memo, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChapterCategory } from "./chapter-categories";

interface Topic {
  id: string;
  name: string;
  important: boolean;
  learningStatus: boolean;
  revisionCount: number;
  practiceCount: number;
  testCount: number;
}

interface TopicCheckboxesProps {
  topic: Topic;
  category: ChapterCategory;
  onTopicToggle: (topicId: string, checkboxIndex?: number) => void;
  isPending?: (topicId: string) => boolean;
}

export const TopicCheckboxes = memo(({ 
  topic, 
  category, 
  onTopicToggle, 
  isPending 
}: TopicCheckboxesProps) => {
  const getTopicStatus = useCallback((checkboxIndex?: number) => {
    switch (category) {
      case 'learning': return topic.learningStatus;
      case 'revision': return topic.revisionCount >= (checkboxIndex !== undefined ? checkboxIndex + 1 : 0);
      case 'practice': return topic.practiceCount >= (checkboxIndex !== undefined ? checkboxIndex + 1 : 0);
      case 'test': return topic.testCount >= (checkboxIndex !== undefined ? checkboxIndex + 1 : 0);
      default: return false;
    }
  }, [category, topic.learningStatus, topic.revisionCount, topic.practiceCount, topic.testCount]);

  const handleToggle = useCallback((index?: number) => {
    onTopicToggle(topic.id, index);
  }, [topic.id, onTopicToggle]);

  if (category === 'learning') {
    return (
      <Checkbox
        id={`${topic.id}-${category}`}
        checked={getTopicStatus()}
        onCheckedChange={() => handleToggle()}
        disabled={isPending?.(topic.id)}
        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
      />
    );
  }

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <Checkbox
          key={index}
          id={`${topic.id}-${category}-${index}`}
          checked={getTopicStatus(index)}
          onCheckedChange={() => handleToggle(index)}
          disabled={isPending?.(topic.id)}
          className={
            category === 'revision'
              ? "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              : category === 'practice'
              ? "data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              : "data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
          }
        />
      ))}
    </div>
  );
});

TopicCheckboxes.displayName = 'TopicCheckboxes'; 