# Production Deployment Guide: Railway & Vercel

This guide outlines step-by-step instructions to deploy the WildlifeX backend to **Railway** and the frontend to **Vercel**.

---

## 1. Backend Deployment (Railway)

Railway is an excellent platform for hosting Python (Flask) applications. It automatically detects Python projects using your `requirements.txt` and runs Gunicorn defined in your `Procfile`.

### Prerequisites
Make sure your code is pushed to a remote GitHub repository.

### Step-by-Step Instructions
1. Log in to [Railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. When prompted, select the **Root Directory** as `backend`.
5. Under **Variables** for your service, click **Add Variable** and add the following keys from your local `.env`:
   - `MONGO_URI`: Your MongoDB Atlas URI (e.g. `mongodb+srv://...`)
   - `DATABASE_NAME`: `WildlifeX` (or your preferred database name)
   - `JWT_SECRET_KEY`: A secure random string used to sign auth tokens.
   - `SMTP_EMAIL`: `wildlifex74@gmail.com` (Gmail address for notifications)
   - `SMTP_PASSWORD`: Your Gmail App Password (created in Google Account settings -> Security -> App Passwords)
   - `CONTACT_RECIPIENT`: `wildlifex74@gmail.com`
6. Under **Settings**, find **Networking** and click **Generate Domain** or link custom domain. Since your URL is already generated as `https://wildlifex-production-7a43.up.railway.app`, ensure it matches that.
7. Save this URL! You will need it for the frontend configuration.

---

## 2. Frontend Deployment (Vercel)

Vercel is the recommended hosting service for Vite/React applications.

### Step-by-Step Instructions
1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. In the Project configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: `WildLifeX` (Select edit, choose the `WildLifeX` folder)
5. Expand the **Environment Variables** section and add:
   - Key: `VITE_API_URL`
   - Value: `https://wildlifex-production-7a43.up.railway.app` (Make sure NOT to add a trailing slash).
6. Click **Deploy**.
7. Once deployment is complete, Vercel will provide your live website URL (e.g., `https://wildlifex-website.vercel.app`).

---

## 3. Post-Deployment Check
- Visit your frontend website.
- Try signing up/logging in, visiting the Animals Catalog, or trying the Ecosystem Builder.
- All requests will dynamically hit your Railway backend instead of localhost!
