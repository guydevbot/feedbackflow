import { z } from "zod/v4";

export const createFeedbackSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1, "Category is required"),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000),
  parentCommentId: z.string().uuid().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["under_review", "planned", "in_progress", "shipped", "declined"]),
  statusExplanation: z.string().max(500).optional(),
});
