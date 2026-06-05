import { ObjectId } from "mongodb";
import { z } from "zod";

const imageUrlSchema = z.union([z.string().url(), z.string().startsWith("data:image/")]);

// Zod schema for validation
export const ReviewImageSchema = z.object({
  url: imageUrlSchema,
  uploadedAt: z.date().default(() => new Date()),
});

export const ReviewSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  order: z.string().min(1),
  item: z.string().min(1).max(120),
  text: z.string().min(1).max(1000),
  author: z.string().min(1).max(60),
  stars: z.number().int().min(1).max(5),
  published: z.boolean().default(true),
  avatar: imageUrlSchema.optional(),
  images: z.array(ReviewImageSchema).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  customerId: z.string(),
});

export type ReviewImage = z.infer<typeof ReviewImageSchema>;
export type Review = z.infer<typeof ReviewSchema>;

export interface ReviewDocument extends Review {
  _id: ObjectId;
}
