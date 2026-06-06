# Salesforce Switch (MERN Stack)

A production-ready MERN Stack application for disabling and enabling Salesforce automations (Workflows, Flows, Validation Rules, and Triggers) in bulk.

## Features

- **Salesforce OAuth**: Securely connect to Production or Sandbox environments.
- **Bulk Metadata Management**: Toggle the active status of multiple metadata components at once.
- **Background Processing**: Handles large metadata retrievals and deployments using BullMQ and Redis.
- **Real-time Status Updates**: Polling mechanism to track job progress.

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, React Router, Axios.
- **Backend**: Node.js, Express.js, jsforce (Salesforce API client).
- **Database**: MongoDB (Mongoose).
- **Queue**: BullMQ, Redis.

## Prerequisites

- Node.js (v18+)
- MongoDB
- Redis
- Salesforce Connected App (Consumer Key and Secret)

## Setup

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm run install:all
   ```
3. **Environment Variables**
   Create a `.env` file in the `backend/` directory with the following:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/your_db_name
   SALESFORCE_CONSUMER_KEY=your_key
   SALESFORCE_CONSUMER_SECRET=your_secret
   SALESFORCE_REDIRECT_URI=your_url
   SALESFORCE_API_VERSION=your_data
   REDIS_URL=your_url
   JWT_SECRET=your_secret
   ```
4. **Run the application**
   ```bash
   npm run dev
   ```

   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## Project Structure

- `backend/`: Node.js/Express server and background workers.
- `frontend/`: React/Vite application.
