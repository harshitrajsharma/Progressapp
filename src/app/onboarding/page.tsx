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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examName: "",
      examDate: "",
      totalMarks: "100",
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

      if (!response.ok) throw new Error("Failed to save preferences")

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Onboarding error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome to GATE Progress!</CardTitle>
          <CardDescription>
            Let&rsquo;s set up your exam preferences to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="examName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. GATE CSE 2025" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="examDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Exam Marks</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Enter total marks"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The maximum marks possible in the exam
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Target Marks</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Enter your target marks"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be less than or equal to total marks
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Continue to Dashboard"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 