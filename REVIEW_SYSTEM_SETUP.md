# Review System Setup and Usage

This document explains how to set up and use the MongoDB-backed review system with image upload functionality.

## Features

- **Backend Integration**: Reviews are stored in MongoDB
- **Image Upload**: Users can upload multiple images with their reviews
- **Image Display**: Reviews display uploaded images in a gallery
- **CRUD Operations**: Full Create, Read, Update, Delete operations for reviews
- **Real-time Updates**: Reviews sync with backend in real-time

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install the MongoDB driver (`mongodb` v6.5.0) and all other dependencies.

### 2. Configure MongoDB

Create a `.env` file in the root directory with your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017
```

#### Options:

**Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017
```

**MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**With Authentication:**
```env
MONGODB_URI=mongodb://user:password@localhost:27017/lovable?authSource=admin
```

### 3. Create MongoDB Database and Collections

The system will automatically create the database and collections on first use.

**Alternatively, set up manually:**

```javascript
// Connect to MongoDB and run:
use lovable;

db.createCollection("reviews");

db.reviews.createIndex({ customerId: 1, createdAt: -1 });
db.reviews.createIndex({ createdAt: -1 });
```

### 4. Start the Development Server

```bash
npm run dev
```

## File Structure

```
src/
├── lib/
│   ├── api/
│   │   ├── reviews.server.ts      # Review CRUD operations
│   │   └── images.server.ts       # Image upload handling
│   └── db/
│       ├── mongo.ts               # MongoDB connection
│       └── schemas.ts             # Data schemas with Zod validation
└── routes/
    └── index.tsx                  # Main dashboard with reviews
```

## API Functions

### Review Operations

#### Get All Reviews
```typescript
import { getReviewsServerFn } from '~/lib/api/reviews.server';

const result = await getReviewsServerFn(customerId);
// Returns: { success: true, data: Review[] }
```

#### Create Review
```typescript
import { createReviewServerFn } from '~/lib/api/reviews.server';

const result = await createReviewServerFn({
  order: "Order-12345",
  item: "Product Name",
  text: "Review text...",
  author: "John Doe",
  stars: 5,
  published: true,
  avatar: "https://...",
  images: [
    { url: "data:image/...", uploadedAt: "2024-01-01" }
  ],
  customerId: "customer-123"
});
```

#### Update Review
```typescript
import { updateReviewServerFn } from '~/lib/api/reviews.server';

const result = await updateReviewServerFn({
  id: "reviewId",
  review: {
    text: "Updated review text",
    published: true
  }
});
```

#### Delete Review
```typescript
import { deleteReviewServerFn } from '~/lib/api/reviews.server';

const result = await deleteReviewServerFn(reviewId);
```

### Image Operations

#### Upload Image
```typescript
import { uploadReviewImageServerFn } from '~/lib/api/images.server';

const result = await uploadReviewImageServerFn(base64ImageData);
// Returns: { success: true, data: { url: string, uploadedAt: string } }
```

#### Add Image to Review
```typescript
import { addImageToReviewServerFn } from '~/lib/api/images.server';

const result = await addImageToReviewServerFn({
  id: "reviewId",
  imageUrl: "data:image/..."
});
```

#### Remove Image from Review
```typescript
import { removeImageFromReviewServerFn } from '~/lib/api/images.server';

const result = await removeImageFromReviewServerFn({
  id: "reviewId",
  imageUrl: "data:image/..."
});
```

## Database Schema

### Reviews Collection

```typescript
{
  _id: ObjectId;
  order: string;              // Order number
  item: string;               // Product name (1-120 chars)
  text: string;               // Review text (1-1000 chars)
  author: string;             // Reviewer name (1-60 chars)
  stars: number;              // Rating 1-5
  published: boolean;         // Publication status
  avatar: string;             // Profile image URL
  images: [                   // Review images
    {
      url: string;            // Base64 or image URL
      uploadedAt: Date;
    }
  ];
  customerId: string;         // Customer identifier
  createdAt: Date;            // Creation timestamp
  updatedAt: Date;            // Last update timestamp
}
```

## Frontend Usage

The review form is located in the "Review" tab of the dashboard:

1. **Click "Add Review"** to open the review form
2. **Upload Author Photo** (optional) - Click the profile avatar placeholder
3. **Add Product Images** - Click the image upload area to add multiple product photos
4. **Fill Details**:
   - Your name
   - Order number (optional - auto-generated if empty)
   - Product name
   - Review text
5. **Set Rating** - Click the stars to set your rating
6. **Publish Option** - Check "Publish immediately" to make it live
7. **Submit** - Click "Submit Review"

## Image Handling

### Upload Limits
- Maximum 5MB per image
- Supported formats: JPEG, PNG, WebP, GIF
- Multiple images supported per review

### Storage
Images are currently stored as **base64 data URLs** in MongoDB. For production, consider:
- AWS S3
- Google Cloud Storage
- Cloudinary
- Azure Blob Storage

### Future Enhancement
To switch to cloud storage:

1. Modify `uploadReviewImageServerFn` to upload to cloud service
2. Store only the URL in MongoDB
3. Update image display to use cloud URLs

## Error Handling

All API functions return a standard response:

```typescript
// Success
{ success: true, data: ... }

// Error
{ success: false, error: "Error message" }
```

Always check the `success` flag before using the data.

## Development Notes

- **Server Functions**: Using TanStack React Start's `createServerFn` for type-safe API calls
- **Validation**: Zod schema validation on all inputs
- **Caching**: React Query manages data synchronization
- **Real-time**: Changes automatically refetch and update the UI

## Troubleshooting

### MongoDB Connection Error
```
Failed to connect to MongoDB: [error]
```
- Check MongoDB is running
- Verify connection string in `.env`
- Ensure network access (for MongoDB Atlas)

### Image Upload Fails
- Check image file size (< 5MB)
- Verify image format (JPG, PNG, WebP, GIF)
- Check browser console for errors

### Reviews Not Saving
- Verify MongoDB connection
- Check browser DevTools Network tab
- Ensure `customerId` is provided

## Production Deployment

For production deployment:

1. **Set `MONGODB_URI` environment variable** on your hosting platform
2. **Enable MongoDB backups** in MongoDB Atlas
3. **Consider indexing** for large datasets
4. **Implement rate limiting** on API endpoints
5. **Use cloud storage** for images instead of base64
6. **Add user authentication** for review verification
7. **Implement moderation** for published reviews
