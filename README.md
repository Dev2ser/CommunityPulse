# CommunityPulse

A MERN stack application for community engagement and interaction.

## Project Structure

- `/frontend` - React.js frontend application
- `/backend` - Express.js and Node.js backend server

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the backend directory and add your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/communitypulse
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Available Scripts

In both the frontend and backend directories, you can run:

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm start` - Runs the app in production mode
- `npm test` - Runs the test suite

## Contributing

Please read our contributing guidelines before submitting pull requests.