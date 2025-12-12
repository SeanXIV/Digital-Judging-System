# Frontend Deployment Guide

This guide explains how to deploy the React frontend to Vercel.

## Prerequisites

- Vercel account
- GitHub repository with the frontend code
- Backend deployed and accessible

## Environment Variables

Set the following environment variable in Vercel:

- `VITE_API_BASE_URL` - URL of your deployed backend (e.g., `https://your-backend.onrender.com`)

## Deploying to Vercel

### Option 1: Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Add environment variable:
   - Name: `VITE_API_BASE_URL`
   - Value: Your backend URL (e.g., `https://your-backend.onrender.com`)
7. Click "Deploy"

### Option 2: Manual Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Set environment variable:
   ```bash
   vercel env add VITE_API_BASE_URL
   ```

## Configuration Details

The `vercel.json` file in the frontend directory contains:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures:
- Single-page application routing works correctly
- All routes are served the `index.html` file
- Vite build process is used

## CORS Configuration

Make sure your backend allows requests from your Vercel domain. Update the `CORS_ALLOWED_ORIGIN` environment variable in your backend deployment with your Vercel app URL.

## Notes

- The frontend uses Vite for building
- API calls are made to the URL specified in `VITE_API_BASE_URL`
- All authentication is handled via JWT tokens stored in localStorage
- The app is responsive and works on mobile devices