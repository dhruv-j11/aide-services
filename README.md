# AIDE - Diagnostics & Engagement Services

AIDE is a healthcare triage system designed to optimize patient flow in clinics and hospitals. Built for the Waterloo Future Cities Institute hackathon by Jaineel Patel and Dhruv Joshi.

## Features

- **Patient Intake System**: Patients can register via web form with symptoms, urgency level, and visit details
- **Intelligent Queue Management**: Automatic triage scoring and positioning based on urgency and visit type
- **Real-time Dashboard**: Admins can view live queue, complete appointments, and see statistics
- **Automated Advisal**: Automatic advisal messages based on symptoms
- **Email Summaries**: Automatic visit summary emails via SendGrid

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Flask (Python)
- **AI Integration**: Gemini/GPT
- **Voice Integration**: ElevenLabs Voice Agent API
- **email integration**: Sendgrid API

## Quick Start

### Backend Setup

```bash
cd backend

# Create virtual environment (if not exists)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

Backend will run on `http://localhost:5001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000`


## API Endpoints

- `POST /api/patient/intake` - Submit new patient intake
- `GET /api/patients` - Get all patients in queue
- `PUT /api/patients/<id>/complete` - Mark patient as completed
- `PUT /api/patients/<id>/cancel` - Cancel patient from queue
- `GET /api/stats` - Get queue statistics
- `GET /health` - Health check

**Note**: Backend runs on port 5001 (instead of 5000) to avoid conflict with macOS AirPlay Receiver on port 5000.

## How AIDE Works

1. **Patient Registration**: Patients fill out intake form with:
   - Personal information (name, email, phone)
   - Symptoms/visit purpose
   - Visit type (advisal, follow-up, routine, emergency)
   - Estimated duration
   - Urgency level (1-10)

2. **AI Triage Scoring**: AIDE calculates a triage score based on:
   - Urgency level (weighted heavily)
   - Visit type (emergency gets priority)
   - Estimated duration (shorter visits prioritized for efficiency)

3. **Queue Positioning**: Patients are automatically positioned in queue by triage score

4. **Real-time Updates**: Admin dashboard shows live queue with full patient details

5. **Completion**: Admins can mark patients as complete or cancel them from the queue

## Demo Flow

1. Start both backend and frontend servers
2. Fill out patient intake form as a patient
3. Switch to Admin Dashboard to see the queue
4. Complete or cancel patients as needed
5. Watch statistics update in real-time

## Notes

- Currently uses in-memory storage (data lost on server restart)

