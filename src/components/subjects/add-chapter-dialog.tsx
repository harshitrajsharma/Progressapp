'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import { ChapterWithRelations } from "@/types/prisma/chapter";

interface AddChapterDialogProps {
  subjectId: string;
  onSuccess?: (newChapter: ChapterWithRelations) => void;
}

export function AddChapterDialog({ subjectId, onSuccess }: AddChapterDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [important, setImportant] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return

    try {
      setLoading(true)
      const response = await fetch(`/api/subjects/${subjectId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          important,
        }),
      })

      if (!response.ok) throw new Error("Failed to create chapter")
      
      const newChapter = await response.json()

      if (onSuccess) {
        onSuccess({
          ...newChapter,
          topics: newChapter.topics || [],
        })
      }

      toast({
        title: "Success",
        description: "Chapter has been created.",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      })

      setName("")
      setImportant(false)
      setOpen(false)
      
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create chapter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Chapter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Chapter</DialogTitle>
            <DialogDescription>
              Add a new chapter to organize your topics.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Chapter Name</Label>
              <Input
                id="name"
                placeholder="Enter chapter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="important"
                checked={important}
                onCheckedChange={(checked) => setImportant(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="important" className="font-normal">
                Mark as important
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading || !name}
              className="gap-2"
            >
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              Add Chapter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 