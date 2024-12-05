import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface EditChapterDialogProps {
  chapterId: string;
  initialName: string;
  initialImportant: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updatedChapter: {
    id: string;
    name: string;
    important: boolean;
  }) => void;
}

export function EditChapterDialog({ 
  chapterId, 
  initialName, 
  initialImportant,
  open,
  onOpenChange,
  onSuccess 
}: EditChapterDialogProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(initialName)
  const [important, setImportant] = useState(initialImportant)
  const { toast } = useToast()

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(initialName)
      setImportant(initialImportant)
    }
  }, [open, initialName, initialImportant])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Chapter name cannot be empty.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          important,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update chapter")
      }
      
      const { chapter } = await response.json()

      toast({
        title: "Success",
        description: "Chapter has been updated.",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      })

      onOpenChange(false)
      if (onSuccess) {
        onSuccess(chapter)
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update chapter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
            <DialogDescription>
              Make changes to your chapter details.
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
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !name.trim() || (name === initialName && important === initialImportant)}
              className="gap-2"
            >
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 