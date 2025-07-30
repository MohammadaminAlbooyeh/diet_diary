# Diet Diary App

## Overview
The Diet Diary App is a calorie tracking application that allows users to log their daily food intake and monitor their calorie consumption. It consists of a FastAPI backend and a React frontend.

## Features
- Add calorie records with date, food name, and calorie count
- View, search, and delete all calorie records
- Interactive and modern web interface (React + Vite)
- Dashboard with calorie goal progress bar and macronutrient chart
- Responsive layout (no horizontal scroll at 100% zoom)
- Sidebar navigation (Dashboard, Weekly, Monthly)
- Autocomplete for food names
- Dockerized backend and frontend for easy deployment
- Bug fixes and UI/UX improvements (colors, spacing, font, cards)


## Backend
The backend is built using FastAPI and SQLite. It provides the following API endpoints:

- `GET /entries/`: Fetch all calorie entries
- `POST /entries/`: Add a new calorie entry
- `DELETE /entries/{id}`: Delete a calorie entry
- `GET /food-suggestions/`: Get food name suggestions for autocomplete


### Running the Backend (Standalone)
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn backend.main:app --reload
   ```
3. Access the API documentation at `http://127.0.0.1:8000/docs`.

### Running with Docker Compose (Recommended)
1. Make sure Docker and Docker Compose are installed.
2. In the project root, run:
   ```bash
   docker-compose up --build
   ```
3. The backend will be available at `http://localhost:8000` and the frontend at `http://localhost:3000` (or as configured).


## Frontend
The frontend is built using React (Vite) and integrates with the backend API to display, add, and delete calorie entries. It features a modern dashboard, sidebar, and responsive design.

### Running the Frontend (Standalone)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser.

### Running with Docker Compose
See the Docker Compose section above.


## Requirements
- Python 3.11+
- Node.js
- SQLite
- Docker (optional, for containerized deployment)


## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MohammadaminAlbooyeh/diet_diary_app.git
   cd diet_diary_app
   ```
2. Follow the backend and frontend setup instructions above.

## Usage Notes
- All dashboard features are visible at 100% browser zoom without horizontal scrolling.
- Sidebar and dashboard are fully responsive.
- For best experience, use the Docker Compose setup.

## Credits
Developed by Mohammadamin Albooyeh

## License

This project is licensed under the MIT License.
