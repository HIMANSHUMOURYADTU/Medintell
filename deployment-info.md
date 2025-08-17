# InteliMed Deployment Guide

## Project Overview
InteliMed is an AI-powered healthcare platform built with React/TypeScript frontend and Node.js/Express backend with Gemini AI integration.

## System Requirements
- Node.js 18.x or higher
- PostgreSQL database (or compatible cloud database like Neon)
- Google Gemini API key

## Environment Variables Required
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database
GEMINI_API_KEY=your_gemini_api_key_here
```

## Installation Instructions
1. Extract the deployment zip file
2. Run: `npm install --production`
3. Set up your environment variables
4. Run database migrations: `npm run db:push`
5. Start the application: `npm start`

## Files Included
- `/dist/` - Built frontend and backend files
- `package.json` - Dependencies and scripts
- `drizzle.config.ts` - Database configuration
- `shared/schema.ts` - Database schema
- `server/` - Source backend files
- `client/` - Source frontend files

## Port Configuration
The app runs on the PORT environment variable (default: 5000) and serves both frontend and API endpoints.

## Database Setup
The app uses Drizzle ORM with PostgreSQL. Run `npm run db:push` to apply the schema to your database.

## API Endpoints
- GET / - Frontend application
- GET /api/health - Health check
- POST /api/chat - AI chat functionality
- Various other healthcare-related endpoints

## Security Notes
- Ensure GEMINI_API_KEY is kept secure
- Use environment variables for sensitive configuration
- Database credentials should never be committed to version control