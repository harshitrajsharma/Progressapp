'use client';

import { AddTopicInput } from "./add-topic-input";
import type { BaseTopic } from "@/types/prisma/topic";

type AddTopicInputProps = {
  chapterId: string;
  onAddTopic: (topic: Pick<BaseTopic, 'id' | 'name'>) => void;
  onClose: () => void;
}

export function AddTopicInputWrapper(props: AddTopicInputProps) {
  return <AddTopicInput {...props} />;
} 