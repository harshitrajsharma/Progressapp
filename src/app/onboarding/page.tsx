'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Rocket, Target, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

const formSchema = z.object({
  examName: z.string().min(1, "Exam name is required"),
  examDate: z.string().min(1, "Exam date is required"),
  totalMarks: z.string()
    .min(1, "Total marks is required")
    .refine((val) => {
      const marks = parseInt(val)
      return marks > 0
    }, "Total marks must be greater than 0"),
  targetMarks: z.string()
    .min(1, "Target marks is required")
    .refine((val) => {
      const marks = parseInt(val)
      return marks > 0
    }, "Target marks must be greater than 0"),
}).refine((data) => {
  const target = parseInt(data.targetMarks)
  const total = parseInt(data.totalMarks)
  return target <= total
}, {
  message: "Target marks cannot be greater than total marks",
  path: ["targetMarks"]
})

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { update: updateSession, data: session } = useSession()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examName: "",
      examDate: "",
      totalMarks: "",
      targetMarks: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          targetScore: (parseInt(values.targetMarks) / parseInt(values.totalMarks)) * 100
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save preferences")
      }

      // Update the session with new user data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          ...data.user,
          needsOnboarding: false
        }
      })

      toast.success("Onboarding completed successfully!")

      // Small delay to ensure session is updated
      await new Promise(resolve => setTimeout(resolve, 100))
      
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Onboarding error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save preferences")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[500px] px-4"
      >
        <Card className="relative overflow-hidden border-border/40 bg-background/60 backdrop-blur-xl">
          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          </div>

          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-2.5 ring-2 ring-primary/20"
            >
              <Sparkles className="h-full w-full text-primary" />
            </motion.div>
            <CardTitle className="text-2xl sm:text-3xl bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
              Welcome to Progress Tracker!
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Let&rsquo;s personalize your learning journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <FormField
                    control={form.control}
                    name="examName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">
                          <Rocket className="inline-block w-4 h-4 mr-2 text-primary" />
                          Exam Name
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="e.g. Your exam name" 
                            className="bg-background/50 border-border/50 focus-visible:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name="examDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">
                          <Calendar className="inline-block w-4 h-4 mr-2 text-primary" />
                          Exam Date
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="bg-background/50 border-border/50 focus-visible:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <FormField
                      control={form.control}
                      name="totalMarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">Total Marks</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Enter total marks"
                              {...field}
                              className="bg-background/50 border-border/50 focus-visible:ring-primary/20"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Maximum marks possible
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <FormField
                      control={form.control}
                      name="targetMarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground/80">
                            <Target className="inline-block w-4 h-4 mr-2 text-primary" />
                            Target Marks
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Your target"
                              {...field}
                              className="bg-background/50 border-border/50 focus-visible:ring-primary/20"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Must be ≤ total marks
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-2"
                >
                  <Button 
                    type="submit" 
                    className={cn(
                      "w-full bg-gradient-to-r from-primary via-purple-500 to-blue-500",
                      "hover:opacity-90 transition-opacity",
                      "font-medium tracking-wide"
                    )} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Sparkles className="h-4 w-4" />
                        </motion.div>
                        Setting up your journey...
                      </>
                    ) : (
                      "Continue to Dashboard"
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 