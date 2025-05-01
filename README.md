EncryptEase Frontend

Welcome to the frontend repository of EncryptEase this is your secure, all-in-one life management platform for students and professionals. This frontend is built using React + TypeScript, with Vite, TailwindCSS, and integrates seamlessly with the Django backend API.

🛠️ Tech Stack

React 18 (with Hooks and Functional Components)

Vite (Blazing fast dev/build tool)

TypeScript

TailwindCSS

Shadcn/UI for component styling

React Router DOM for routing

Sonner for toast notifications

Axios for API calls

📁 Project Structure

src/
├── api/                # Axios API utilities
├── components/         # Shared UI components (buttons, modals, layout, etc.)
├── hooks/              # Custom hooks
├── lib/                # Utility functions
├── pages/              # All page-level components (views)
├── types/              # Shared TypeScript types
├── App.tsx             # Root component
├── main.tsx            # Entry point

🚀 Getting Started


1. Install Dependencies

npm install

2. Create Environment Variables

Create a .env file in the root with the following:

VITE_API_URL=

Replace the URL with your deployed or local Django backend.

3. Run the App Locally

npm run dev

Open http://localhost:5173 to see the app.

🧪 Running Tests

Vitest + React Testing Library:

npm run test

Coverage reports can be generated with:

npm run coverage

Test coverage is actively maintained for both unit and integration tests, especially across AI tools, password vault, and job applications.

Features Implemented

Secure Login / Signup / MFA OTP

AI Tools (Follow-up Emails, Resume/Cover Letters, Interview Prep)

Documents Vault (Upload, Edit, Replace)

Bill Tracker

Job Application Tracker (Attachments, Cover Letter, Follow-Ups)

Password Vault (AI Category + Strength Meter)
Smart Reminders & Dashboard
Build for Production

npm run build



