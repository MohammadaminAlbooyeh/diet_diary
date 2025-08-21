
# Diet Diary App

## Overview
Diet Diary is a modern calorie and food tracking web application. Users can add foods, see their daily calories and macros, and manage their food log with a clean, responsive interface. The app uses a FastAPI backend with SQLite and a React (Vite) frontend.

## Features
- Add foods with automatic calorie and macronutrient lookup
- View all added foods in a table with calories and date
- Delete foods from your log (updates all stats instantly)
- See total calories, carbs, protein, and fat for each meal and the whole day
- Modern, responsive UI (fills the whole browser page)
- Data is saved in a local SQLite database via FastAPI backend
- Autocomplete for food names (from a built-in food list)
- Dockerized backend and frontend for easy deployment



## Backend
The backend is built with FastAPI and SQLite. It provides these API endpoints:

- `GET /entries/` — Fetch all food entries
- `POST /entries/` — Add a new food entry
- `DELETE /entries/{id}` — Delete a food entry
- `GET /food-suggestions/` — Get food name suggestions for autocomplete



### Running the Backend (Standalone)
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn backend.main:app --reload
   ```
3. Access the API docs at `http://127.0.0.1:8000/docs`.


### Running with Docker Compose (Recommended)
1. Make sure Docker and Docker Compose are installed.
2. In the project root, run:
   ```bash
   docker-compose up --build
   ```
3. The backend will be at `http://localhost:8000` and the frontend at `http://localhost:5173` (or as configured).



## Frontend
The frontend is built with React (Vite) and connects to the backend API. It displays, adds, and deletes foods, and shows all stats in real time.

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
- Docker (optional)



## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MohammadaminAlbooyeh/diet_diary_app.git
   cd diet_diary_app
   ```
2. Follow the backend and frontend setup instructions above.


## Usage Notes
- All features are visible at 100% browser zoom without horizontal scrolling.
- The dashboard is fully responsive and fills the whole browser window.
- For best experience, use the Docker Compose setup.


## Credits
Developed by Mohammadamin Albooyeh

## License

This project is licensed under the MIT License.
