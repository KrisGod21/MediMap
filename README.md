# MediMap - AI-Powered Healthcare Navigator for Women

MediMap is an intelligent healthcare navigation system specifically designed to help women assess urgency, find appropriate specialists, and book clinic appointments. It uses an AI-driven, multi-agent architecture to streamline patient intake, triage, and referrals.

## Features

- **Conversational Intake:** Collects symptoms naturally using a conversational AI agent.
- **Intelligent Triage:** Assesses the urgency of symptoms using a machine learning model to provide a medical urgency score (Low, Medium, High).
- **Smart Referrals:** Recommends the right type of specialist (e.g., Gynecologist, General Physician) based on the reported symptoms.
- **Clinic Matching:** Finds nearby clinics that match the required specialty, taking into account factors like female doctors, safety scores, and ratings.
- **Appointment Booking:** Simulates booking an appointment with a chosen doctor at a recommended clinic.
- **Follow-up Scheduling:** Automatically schedules follow-up checks after an appointment.

## Architecture

The system is built with a decoupled frontend and backend architecture:

- **Frontend:** A modern React application (Vite + TypeScript) using Tailwind CSS and `shadcn/ui` components for a clean, responsive user interface.
- **Backend:** A robust FastAPI backend in Python, connected to an SQLite database (`medimap.db`) for storing clinic and appointment data.
- **AI Agents:** Custom Python agents handle specific domains:
  - `intake_agent`: Extracts symptoms and pain levels from natural language.
  - `triage_agent`: Uses an ML model to determine urgency and recommend specialists.
  - `referral_agent`: Queries the database to find the best matching clinics.
  - `appointment_agent` & `followup_agent`: Handle booking logic and post-visit care.

## Technology Stack

### Frontend
- **React 18** (with Vite)
- **TypeScript**
- **Tailwind CSS** (Styling)
- **shadcn/ui** (Component Library)
- **Lucide React** (Icons)
- **React Router** (Navigation)
- **React Hook Form & Zod** (Form validation)

### Backend
- **Python 3.10+**
- **FastAPI** (RESTful API framework)
- **Uvicorn** (ASGI Server)
- **Scikit-learn / Pandas** (Machine Learning for triage)
- **SQLite** (Database)

## Running the Application Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or bun
- Python 3.10+

### 1. Start the Backend Server
First, install the Python dependencies and run the FastAPI server:

```bash
# Navigate to the project root
# Install dependencies
python -m pip install -r backend/requirements.txt

# Start the server (runs on http://localhost:8000)
python -m uvicorn backend.main:app --reload --port 8000
```

### 2. Start the Frontend Server
Open a new terminal window, install the Node dependencies, and start the Vite development server:

```bash
# Navigate to the project root
# Install dependencies
npm install

# Start the development server (runs on http://localhost:8080)
npm run dev
```

### 3. Access the Application
Open your browser and navigate to `http://localhost:8080` (or the port specified by Vite in your terminal) to use MediMap.

## Database and ML Model
- **Database:** The local database is initialized automatically. It uses seed data from `backend/data/clinics.json`.
- **ML Model:** The `triage_agent` uses a pre-trained model `backend/model.pkl` to make urgency predictions based on the dataset features listed in `backend/model_columns.pkl`.

## Contributing
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License
Distributed under the MIT License.
