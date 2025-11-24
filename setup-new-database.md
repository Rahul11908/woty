# New Database Setup Guide

## Step 1: Create New Neon Database

1. **Go to Neon Console**: Visit [console.neon.tech](https://console.neon.tech)
2. **Create New Project**: 
   - Click "New Project"
   - Name: `glory-women-of-the-year`
   - Region: Choose closest to your users (e.g., US East)
3. **Copy Connection String**: Save the DATABASE_URL for later

## Step 2: Update Environment Variables

Replace your DATABASE_URL in:
- `.env.vercel` file (for reference)
- Vercel dashboard environment variables

## Step 3: Run Database Migration

After setting up the new database, run:

```bash
npm run db:push
```

This will create all the tables defined in your schema.

## Step 4: Data Migration (if needed)

If you have existing data to migrate:
1. Export data from old Replit database
2. Import into new Neon database
3. Or start fresh (recommended for development)

## Database Schema Overview

Your application uses these main tables:
- `users` - User accounts and profiles
- `conversations` - Chat conversations
- `messages` - Chat messages
- `connections` - User connections/networking
- `questions` - Q&A system
- `surveys` - Survey system
- `group_chats` - Group chat functionality
- `user_sessions` - Session tracking
- `daily_metrics` - Analytics

## Next Steps

1. Create the Neon database
2. Update DATABASE_URL in Vercel
3. Redeploy the application
4. Test the database connection using `/api/health/db`
