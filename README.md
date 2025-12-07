<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the following in [.env.local](.env.local):
   - `GEMINI_API_KEY` = your Gemini API key
   - `GOOGLE_CLIENT_ID` = your Google OAuth client ID (Web application)
   - `MONGODB_URI` = your MongoDB Atlas connection string (Serverless functions)
3. Run the app:
   `npm run dev`

## Deploy to Vercel with MongoDB Atlas

1. Push this repo to GitHub/GitLab and import into Vercel.
2. In Vercel Project Settings → Environment Variables, add:
   - `GEMINI_API_KEY` (Server)
   - `MONGODB_URI` (Server)
   - `GOOGLE_CLIENT_ID` (Client)
3. Vercel will build the frontend and deploy API routes under `/api/*`.
4. (Optional) Use object storage (e.g., Vercel Blob/S3/GCS) for images. Store only metadata in MongoDB.
5. Update frontend services to call the new `/api/*` endpoints for AI and persistence.

## MongoDB URI Format

Use a properly URL-encoded URI with no quotes:

```
MONGODB_URI=mongodb+srv://<USER>:<URL_ENCODED_PASSWORD>@<HOST>/?retryWrites=true&w=majority&appName=<YourAppName>
MONGODB_DB=stylemate
```

If your password contains special characters, URL-encode them (e.g., `@` → `%40`).

## GridFS (Free Tier) and Endpoints

GridFS is available on the Atlas M0 free tier. It doesn’t cost money itself, but storage/compute are limited by free quotas.

- `POST /api/upload-image` — upload base64 image to GridFS (requires auth)
  - Body: `{ base64: string, mimeType: string, filename?: string }`
  - Returns: `{ fileId, mimeType }`
- `GET /api/image?id=<fileId>` — stream image bytes (use in `<img src="/api/image?id=..."/>`)
- `DELETE /api/image?id=<fileId>` — delete image (requires auth and ownership)

Frontend options:
- Local-only (simplest): keep images in browser storage; save metadata via `/api/items`.
- GridFS: upload via `/api/upload-image`, save `fileId` and `mimeType` in items; render with `/api/image?id=<fileId>`.
