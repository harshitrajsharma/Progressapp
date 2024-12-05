'use client';

import { EditSubjectDialog } from "./edit-subject-dialog";
import { SubjectWithRelations } from "@/types/prisma/subject";

type EditSubjectDialogProps = {
  subject: SubjectWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSubjectDialogWrapper(props: EditSubjectDialogProps) {
  return <EditSubjectDialog {...props} />;
} 