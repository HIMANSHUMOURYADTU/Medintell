# InteliMed - AI Healthcare Platform

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install --production
   ```

2. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export PORT=5000
   export DATABASE_URL=your_postgresql_connection_string
   export GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Initialize database:**
   ```bash
   npm run db:push
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

The app will be available at http://localhost:5000

## Features
- AI-powered healthcare chat with Google Gemini
- Health goal tracking and medication management
- Emergency services (108) integration
- Healthcare facility finder
- Health risk assessments
- Multiple user personas (senior, child, anxious, caregiver)

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini API key for AI functionality
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Set to 'production' for production deployments

## Support
For deployment issues, check the deployment-info.md file for detailed instructions.