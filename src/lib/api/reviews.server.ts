import { createServerFn } from "@tanstack/react-start";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDatabase } from "@/lib/db/mongo";
import { ReviewSchema, type ReviewDocument } from "@/lib/db/schemas";

const imageUrlSchema = z.union([z.string().url(), z.string().startsWith("data:image/")]);
const DEFAULT_AVATAR =
  "https://i.postimg.cc/pVSsv7cK/Whats-App-Image-2026-05-08-at-01-33-44.jpg";

function normalizeAvatarUrl(avatar?: string) {
  if (!avatar) return undefined;
  if (avatar.startsWith("data:image/")) return avatar;
  if (avatar.includes("i.postimg.cc")) return DEFAULT_AVATAR;
  if (avatar.includes("@fs/") || avatar.includes("localhost")) return DEFAULT_AVATAR;
  return avatar;
}

function serializeReview(doc: ReviewDocument) {
  return {
    ...doc,
    _id: doc._id.toString(),
    avatar: normalizeAvatarUrl(doc.avatar),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
    images: doc.images.map((image) => ({
      ...image,
      uploadedAt:
        image.uploadedAt instanceof Date ? image.uploadedAt.toISOString() : image.uploadedAt,
    })),
  };
}

export const getReviewsServerFn = createServerFn({ method: "POST" })
  .inputValidator(z.string())
  .handler(async ({ data: customerId }) => {
    try {
      console.log("[reviews] fetch:start", { customerId });
      const db = await getDatabase();
      const reviews = await db
        .collection<ReviewDocument>("reviews")
        .find({ customerId })
        .sort({ createdAt: -1 })
        .toArray();

      console.log("[reviews] fetch:success", { customerId, count: reviews.length });
      return {
        success: true,
        data: reviews.map(serializeReview),
      };
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return { success: false, error: "Failed to fetch reviews" };
    }
  });

export const createReviewServerFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      order: z.string().min(1),
      item: z.string().min(1).max(120),
      text: z.string().min(1).max(1000),
      author: z.string().min(1).max(60),
      stars: z.number().int().min(1).max(5),
      published: z.boolean().default(true),
      avatar: imageUrlSchema.optional(),
      images: z
        .array(
          z.object({
            url: imageUrlSchema,
            uploadedAt: z.string(),
          }),
        )
        .default([]),
      customerId: z.string(),
      createdAt: z.string().optional(),
    }),
  )
  .handler(async ({ data: review }) => {
    try {
      console.log("[reviews] create:start", {
        customerId: review.customerId,
        item: review.item,
        imageCount: review.images.length,
      });
      const validated = ReviewSchema.parse({
        ...review,
        avatar: normalizeAvatarUrl(review.avatar),
        images: review.images.map((image) => ({
          ...image,
          uploadedAt: new Date(image.uploadedAt),
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const db = await getDatabase();
      const result = await db.collection<ReviewDocument>("reviews").insertOne(validated);
      const insertedReview = {
        ...validated,
        _id: result.insertedId,
      };

      console.log("[reviews] create:success", {
        id: result.insertedId.toString(),
        customerId: validated.customerId,
      });
      return {
        success: true,
        data: serializeReview(insertedReview),
      };
    } catch (error) {
      console.error("Error creating review:", error);
      return { success: false, error: "Failed to create review" };
    }
  });

export const updateReviewServerFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      review: z.object({
        text: z.string().optional(),
        published: z.boolean().optional(),
        stars: z.number().optional(),
        images: z
          .array(
            z.object({
              url: imageUrlSchema,
              uploadedAt: z.string(),
            }),
          )
          .optional(),
      }),
    }),
  )
  .handler(async ({ data: { id, review } }) => {
    try {
      console.log("[reviews] update:start", { id, fields: Object.keys(review) });
      const db = await getDatabase();
      const objectId = new ObjectId(id);

      const result = await db.collection<ReviewDocument>("reviews").findOneAndUpdate(
        { _id: objectId },
        {
          $set: {
            ...review,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );

      if (!result) {
        console.log("[reviews] update:not-found", { id });
        return { success: false, error: "Review not found" };
      }

      console.log("[reviews] update:success", { id });
      return {
        success: true,
        data: serializeReview(result),
      };
    } catch (error) {
      console.error("Error updating review:", error);
      return { success: false, error: "Failed to update review" };
    }
  });

export const deleteReviewServerFn = createServerFn({ method: "POST" })
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    try {
      console.log("[reviews] delete:start", { id });
      const db = await getDatabase();
      const objectId = new ObjectId(id);

      const result = await db.collection("reviews").deleteOne({ _id: objectId });

      if (result.deletedCount === 0) {
        console.log("[reviews] delete:not-found", { id });
        return { success: false, error: "Review not found" };
      }

      console.log("[reviews] delete:success", { id });
      return { success: true };
    } catch (error) {
      console.error("Error deleting review:", error);
      return { success: false, error: "Failed to delete review" };
    }
  });
