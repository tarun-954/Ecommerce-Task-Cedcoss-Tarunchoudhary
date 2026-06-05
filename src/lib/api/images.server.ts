import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ObjectId, type UpdateFilter } from "mongodb";
import { getDatabase } from "@/lib/db/mongo";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

type ReviewImage = {
  url: string;
  uploadedAt: Date;
};

export const uploadReviewImageServerFn = createServerFn({
  method: "POST",
})
  .inputValidator(z.string())
  .handler(async ({ data: imageData }) => {
    try {
      if (!imageData.startsWith("data:image/")) {
        return {
          success: false,
          error: "Invalid image format",
        };
      }

      const parts = imageData.split(",");

      if (parts.length !== 2) {
        return {
          success: false,
          error: "Invalid image data",
        };
      }

      const binaryString = atob(parts[1]);

      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      if (bytes.length > MAX_IMAGE_SIZE) {
        return {
          success: false,
          error: "Image size exceeds 5MB limit",
        };
      }

      return {
        success: true,
        data: {
          url: imageData,
          uploadedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error uploading image:", error);

      return {
        success: false,
        error: "Failed to upload image",
      };
    }
  });

export const addImageToReviewServerFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      id: z.string(),
      imageUrl: z.string(),
    }),
  )
  .handler(async ({ data: { id, imageUrl } }) => {
    try {
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid review id",
        };
      }

      const db = await getDatabase();

      const image: ReviewImage = {
        url: imageUrl,
        uploadedAt: new Date(),
      };

      const update: UpdateFilter<{ images: ReviewImage[]; updatedAt: Date }> = {
        $push: { images: image },
        $set: { updatedAt: new Date() },
      };

      const result = await db.collection("reviews").updateOne({ _id: new ObjectId(id) }, update);

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: "Review not found",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error adding image to review:", error);

      return {
        success: false,
        error: "Failed to add image",
      };
    }
  });

export const removeImageFromReviewServerFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      id: z.string(),
      imageUrl: z.string(),
    }),
  )
  .handler(async ({ data: { id, imageUrl } }) => {
    try {
      if (!ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid review id",
        };
      }

      const db = await getDatabase();

      const update: UpdateFilter<{ images: { url: string }[]; updatedAt: Date }> = {
        $pull: { images: { url: imageUrl } },
        $set: { updatedAt: new Date() },
      };

      const result = await db.collection("reviews").updateOne({ _id: new ObjectId(id) }, update);

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: "Review not found",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error removing image from review:", error);

      return {
        success: false,
        error: "Failed to remove image",
      };
    }
  });

export const getReviewImagesServerFn = createServerFn({
  method: "POST",
})
  .inputValidator(z.string())
  .handler(async ({ data: reviewId }) => {
    try {
      if (!ObjectId.isValid(reviewId)) {
        return {
          success: false,
          error: "Invalid review id",
        };
      }

      const db = await getDatabase();

      const review = await db.collection("reviews").findOne({
        _id: new ObjectId(reviewId),
      });

      if (!review) {
        return {
          success: false,
          error: "Review not found",
        };
      }

      return {
        success: true,
        data: review.images || [],
      };
    } catch (error) {
      console.error("Error fetching images:", error);

      return {
        success: false,
        error: "Failed to fetch images",
      };
    }
  });
