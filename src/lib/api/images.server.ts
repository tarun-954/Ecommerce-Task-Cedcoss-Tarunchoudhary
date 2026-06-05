import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDatabase } from "@/lib/db/mongo";
import { ObjectId } from "mongodb";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadReviewImageServerFn = createServerFn({ method: "POST" })
  .inputValidator(z.string())
  .handler(async ({ data: imageData }) => {
    try {
      // Validate image size and format
      if (!imageData.startsWith("data:image/")) {
        return { success: false, error: "Invalid image format" };
      }

      const binaryString = atob(imageData.split(",")[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      if (bytes.length > MAX_IMAGE_SIZE) {
        return { success: false, error: "Image size exceeds 5MB limit" };
      }

      // For now, we'll store the base64 directly in MongoDB
      // In production, consider using a cloud storage service
      return {
        success: true,
        data: {
          url: imageData,
          uploadedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      return { success: false, error: "Failed to upload image" };
    }
  });

export const addImageToReviewServerFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      imageUrl: z.string(),
    }),
  )
  .handler(async ({ data: { id, imageUrl } }) => {
    try {
      const db = await getDatabase();
      const objectId = new ObjectId(id);

      const result = await db.collection("reviews").findOneAndUpdate(
        { _id: objectId },
        {
          $push: {
            images: {
              url: imageUrl,
              uploadedAt: new Date(),
            },
          },
          $set: {
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );

      if (!result) {
        return { success: false, error: "Review not found" };
      }

      return {
        success: true,
        data: {
          ...result,
          _id: result._id.toString(),
        },
      };
    } catch (error) {
      console.error("Error adding image to review:", error);
      return { success: false, error: "Failed to add image" };
    }
  });

export const removeImageFromReviewServerFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      imageUrl: z.string(),
    }),
  )
  .handler(async ({ data: { id, imageUrl } }) => {
    try {
      const db = await getDatabase();
      const objectId = new ObjectId(id);

      const result = await db.collection("reviews").findOneAndUpdate(
        { _id: objectId },
        {
          $pull: {
            images: { url: imageUrl },
          },
          $set: {
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );

      if (!result) {
        return { success: false, error: "Review not found" };
      }

      return {
        success: true,
        data: {
          ...result,
          _id: result._id.toString(),
        },
      };
    } catch (error) {
      console.error("Error removing image from review:", error);
      return { success: false, error: "Failed to remove image" };
    }
  });
