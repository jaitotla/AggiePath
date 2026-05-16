# AggiePath 🎓

A full-stack graduation planning web application for UC Davis students.

## Overview

AggiePath helps Computer Science students track their academic progress, plan their path to graduation, and simulate "what-if" scenarios like adding a minor.

Built as a learning project to practice full-stack development with a real-world use case.

## Features

- **Dashboard** — Track completed courses, view degree progress by category, see available courses based on prerequisites
- **AI Transcript Import** — Upload a photo of your transcript and Claude AI automatically extracts your completed courses
- **Graduation Plan** — Generate a quarter-by-quarter course schedule with adjustable settings
- **What-If Scenarios** — See how adding a minor (e.g. Statistics) affects your graduation timeline
- **Prerequisite Engine** — Intelligently determines which courses you're eligible to take based on what you've completed

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Plain CSS-in-JS

**Backend**
- Python 3.12
- FastAPI
- SQLModel (SQLAlchemy + Pydantic)

**Database**
- SQLite (development)
- PostgreSQL (production)

**AI**
- Anthropic Claude API (vision model for transcript extraction)

## Data

- Real UC Davis Computer Science major requirements (2024-2025 catalog)
- Real UC Davis Statistics minor requirements
- 25 prerequisite relationships modeled
- Priority-based plan generator using topological sorting

## Project Structure
aggiepath/
├── backend/
│   ├── main.py          # FastAPI routes and business logic
│   ├── models.py        # Database models (Course, DegreeRequirement, etc.)
│   ├── database.py      # Database connection and session management
│   └── requirements.txt
│
└── frontend/
└── src/
├── pages/       # Dashboard, Plan, WhatIf, Login, Onboarding, Upload
└── components/  # Reusable UI components
## Running Locally

**Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY="your-key-here"
python -m uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Then visit `http://localhost:5173`

**Seed the database**

After starting the backend, hit `POST /seed` at `http://127.0.0.1:8000/docs`

## Author

Jai Totla — UC Davis Computer Science & Statistics