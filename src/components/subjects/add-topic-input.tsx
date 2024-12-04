'use client';

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddTopicInputProps {
  chapterId: string;
  onAddTopic: (topic: { id: string; name: string }) => void;
  onClose: () => void;
}

export function AddTopicInput({ chapterId, onAddTopic, onClose }: AddTopicInputProps) {
  const [topicName, setTopicName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentTopics, setRecentTopics] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Keep focus after state updates
  useEffect(() => {
    if (!isSubmitting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSubmitting, topicName]);

  const handleSubmit = async () => {
    const trimmedName = topicName.trim();
    if (!trimmedName) return;

    // Don't allow duplicates in recent topics
    if (recentTopics.includes(trimmedName)) {
      toast({
        title: "Warning",
        description: "This topic has already been added.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Clear input immediately for better UX
      setTopicName("");
      // Add to recent topics optimistically
      setRecentTopics(prev => [...prev, trimmedName]);
      
      const response = await fetch(`/api/chapters/${chapterId}/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add topic");
      }

      const newTopic = await response.json();
      onAddTopic(newTopic);

      // Show success message with the topic name
      toast({
        title: "Topic Added",
        description: `"${trimmedName}" has been added successfully. Keep typing to add more topics.`,
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      });

    } catch (error) {
      console.error(error);
      // Remove from recent topics if failed
      setRecentTopics(prev => prev.filter(t => t !== trimmedName));
      // Restore the topic name if there was an error
      setTopicName(trimmedName);
      toast({
        title: "Error",
        description: "Failed to add topic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting && topicName.trim()) {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      if (topicName) {
        // First Escape clears the input
        setTopicName("");
      } else {
        // Second Escape closes the input
        onClose();
      }
    }
  };

  return (
    <div className="space-y-2 w-full mb-4">
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          placeholder="Start typing topic name and press Enter to add quickly"
          className={cn(
            "flex-1 transition-colors",
            isSubmitting && "opacity-70"
          )}
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoFocus
          disabled={isSubmitting}
        />
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !topicName.trim()}
            className="min-w-[60px]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Add'
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Done
          </Button>
        </div>
      </div>
      
      {recentTopics.length > 0 && (
        <div className="text-sm text-muted-foreground animate-in fade-in">
          Recently added: {recentTopics.slice(-3).join(", ")}
        </div>
      )}
    </div>
  );
} 