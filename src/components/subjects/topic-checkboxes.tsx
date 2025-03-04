import { memo, useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChapterCategory } from "@/types/prisma/category";
import { BaseTopic } from "@/types/prisma/topic";
import { isTopicCompletedForCategory } from "@/lib/calculations/progress";

interface TopicCheckboxesProps {
  topic: BaseTopic;
  category: ChapterCategory;
  onTopicToggle: (topicId: string, checkboxIndex?: number) => void;
  isPending?: (topicId: string) => boolean;
}

function TopicCheckboxesComponent({ 
  topic, 
  category, 
  onTopicToggle, 
  isPending 
}: TopicCheckboxesProps) {
  // Memoize topic status calculations
  const topicStatuses = useMemo(() => {
    if (category === 'learning') {
      return [topic.learningStatus];
    }
    
    return [0, 1, 2].map(index => {
      switch (category) {
        case 'revision': 
          return topic.revisionCount >= (index + 1);
        case 'practice': 
          return topic.practiceCount >= (index + 1);
        case 'test': 
          return topic.testCount >= (index + 1);
        default: 
          return false;
      }
    });
  }, [category, topic.learningStatus, topic.revisionCount, topic.practiceCount, topic.testCount]);

  const handleToggle = useCallback((index?: number) => {
    onTopicToggle(topic.id, index);
  }, [topic.id, onTopicToggle]);

  const isDisabled = useMemo(() => {
    return isPending?.(topic.id) ?? false;
  }, [isPending, topic.id]);

  const checkboxStyle = useMemo(() => {
    switch (category) {
      case 'learning':
        return "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500";
      case 'revision':
        return "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500";
      case 'practice':
        return "data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500";
      case 'test':
        return "data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500";
    }
  }, [category]);

  if (category === 'learning') {
    return (
      <Checkbox
        id={`${topic.id}-${category}`}
        checked={topicStatuses[0]}
        onCheckedChange={() => handleToggle()}
        disabled={isDisabled}
        className={checkboxStyle}
        data-topic-id={topic.id}
      />
    );
  }

  return (
    <div className="flex items-center gap-1" data-topic-id={topic.id}>
      {topicStatuses.map((isChecked, index) => (
        <Checkbox
          key={`${topic.id}-${category}-${index}`}
          id={`${topic.id}-${category}-${index}`}
          checked={isChecked}
          onCheckedChange={() => handleToggle(index)}
          disabled={isDisabled}
          className={checkboxStyle}
          data-topic-id={topic.id}
        />
      ))}
    </div>
  );
}

TopicCheckboxesComponent.displayName = 'TopicCheckboxes';
export const TopicCheckboxes = memo(TopicCheckboxesComponent); 