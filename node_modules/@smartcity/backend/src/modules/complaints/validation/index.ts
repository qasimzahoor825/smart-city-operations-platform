import { z } from "zod";
import { TicketPriority, TicketStatus } from "@prisma/client";

export const createComplaintSchema = z.object({
  title: z.string().min(3, "title must be at least 3 characters"),
  description: z.string().min(5, "description must be at least 5 characters"),
  category: z.string().min(2, "category is required"),
  priority: z.nativeEnum(TicketPriority).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  departmentId: z.string().optional(),
  autoReceived: z.boolean().optional(),
  ai: z
    .object({
      category: z.string().nullable().optional(),
      priority: z.string().nullable().optional(),
      departmentId: z.string().nullable().optional(),
      departmentName: z.string().nullable().optional(),
      summary: z.string().nullable().optional(),
      source: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const updateComplaintSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  category: z.string().min(2).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  address: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  departmentId: z.string().optional(),
});

export const assignComplaintSchema = z.object({
  officerId: z.string().min(1, "officerId is required"),
  departmentId: z.string().optional(),
});

export const complaintStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
  note: z.string().optional(),
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5, "rating must be between 1 and 5"),
  comment: z.string().optional(),
});

export const commentSchema = z.object({
  body: z.string().min(1, "body is required"),
});
