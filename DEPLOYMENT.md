# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to a GitHub repository
3. **Environment Variables**: Prepare all required environment variables

## Required Environment Variables

Set these in your Vercel project dashboard:

### Database
- `DATABASE_URL`: Your Neon database connection string

### Authentication
- `SESSION_SECRET`: A secure random string for session encryption
- `LINKEDIN_CLIENT_ID`: LinkedIn OAuth app client ID
- `LINKEDIN_CLIENT_SECRET`: LinkedIn OAuth app client secret
- `LINKEDIN_CALLBACK_URL`: `https://your-domain.vercel.app/auth/linkedin/callback`

### Email Service
- `SENDGRID_API_KEY`: Your SendGrid API key
- `FROM_EMAIL`: Verified sender email address

### Application
- `NODE_ENV`: Set to `production`

## Deployment Steps

1. **Connect Repository**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository

2. **Configure Build Settings**:
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables listed above

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

## Post-Deployment

1. **Update LinkedIn OAuth**:
   - Update your LinkedIn app's redirect URI to match your Vercel domain
   - Format: `https://your-domain.vercel.app/auth/linkedin/callback`

2. **Database Migration**:
   - Run `npm run db:push` locally to sync your database schema
   - Or set up a deployment hook to run migrations

3. **Test Application**:
   - Verify all features work correctly
   - Test authentication flow
   - Check email functionality

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`

2. **Environment Variables**:
   - Verify all required variables are set
   - Check for typos in variable names

3. **Database Connection**:
   - Ensure DATABASE_URL is correct
   - Check Neon database is accessible

4. **Authentication Issues**:
   - Verify LinkedIn OAuth callback URL
   - Check CLIENT_ID and CLIENT_SECRET

## Performance Optimization

- Vercel automatically handles CDN and caching
- Consider enabling Vercel Analytics for monitoring
- Use Vercel's Edge Functions for better performance if needed

## Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update LinkedIn OAuth callback URL to use custom domain
