# Supabase Setup Guide for Rumo

This guide will walk you through setting up Supabase for authentication and data persistence.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: rumo (or whatever you prefer)
   - **Database Password**: Save this somewhere safe!
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to finish setting up (~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click "Run" or press Cmd/Ctrl + Enter
6. You should see "Success. No rows returned"

This creates all the tables:
- `profiles` - User accounts
- `student_profiles` - Student academic data
- `user_schools` - Saved schools
- `essays` & `essay_versions` - Essay drafts with version control
- `tasks` - Timeline/calendar tasks
- `essay_prompts` - Scraped prompts cache
- `deadlines` - Scraped deadlines cache
- `fit_overviews` - AI-generated school fit assessments

## Step 3: Set Up Authentication

### Enable Email/Password Auth

1. Go to **Authentication** → **Providers** (left sidebar)
2. **Email** should already be enabled
3. Scroll down to **Email Auth** settings:
   - Enable "Confirm email" if you want email verification (recommended for production)
   - For development, you can disable it

### Enable Google OAuth (Optional but Recommended)

1. In the same **Providers** section, find **Google**
2. Toggle it ON
3. You'll need to create Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Select **Web application**
   - Add authorized redirect URIs:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
   - Copy the **Client ID** and **Client Secret**
4. Paste them into Supabase's Google provider settings
5. Click **Save**

## Step 4: Get Your API Keys

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **API** in the settings menu
3. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key

## Step 5: Add Environment Variables

1. In your project root, create or update `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **IMPORTANT**: Add `.env.local` to `.gitignore` (should already be there)

3. For Vercel deployment, add these same variables in:
   - Vercel Dashboard → Your Project → Settings → Environment Variables

## Step 6: Test the Connection

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Check that there are no errors in the console

3. Once we build the auth pages, you'll be able to sign up!

## Database Schema Overview

### Main Tables

- **profiles**: Basic user info (auto-created on signup)
- **student_profiles**: Questionnaire responses, GPA, test scores, preferences
- **user_schools**: Schools the student has saved
- **essays**: Essay metadata (title, school, prompt)
- **essay_versions**: Each revision of an essay (version control!)
- **tasks**: Calendar/timeline tasks
- **fit_overviews**: AI-generated reach/target/safety school assessments

### Cache Tables

- **essay_prompts**: Scraped essay prompts from colleges
- **deadlines**: Scraped application deadlines

## Row Level Security (RLS)

All tables have Row Level Security enabled. This means:
- Users can only see/edit their own data
- Essay prompts and deadlines are public (read-only)
- Counselors will be able to see their assigned students (we'll add this later)

## Next Steps

After completing this setup:
1. We'll create login/signup pages
2. Migrate the in-memory Zustand store to use Supabase
3. Build the essay version control system
4. Implement prompt and deadline scraping

## Troubleshooting

**Can't connect to Supabase?**
- Make sure your `.env.local` variables are set correctly
- Restart your dev server after adding env variables
- Check that your Supabase project is not paused (free tier projects pause after inactivity)

**SQL errors when running schema?**
- Make sure you're running the schema in a fresh project
- If you need to reset, you can drop all tables and re-run
- In SQL Editor: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` then run the schema again

**Auth not working?**
- Check that Email provider is enabled
- For Google OAuth, verify redirect URIs match exactly
- Check browser console for error messages
