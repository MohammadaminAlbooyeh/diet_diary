# Diet Diary Mobile App

## Overview
The Diet Diary Mobile App is a calorie tracking application that allows users to log their daily food intake and monitor their calorie consumption. It consists of a FastAPI backend and a React Native frontend.

## Features
- Add calorie records with date, food name, and calorie count.
- View all calorie records.
- Interactive mobile interface.

## Backend
The backend is built using FastAPI and SQLite. It provides the following API endpoints:

- `GET /records`: Fetch all calorie records.
- `POST /records`: Add a new calorie record.

### Running the Backend
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn backend.main:app --reload
   ```
3. Access the API documentation at `http://127.0.0.1:8000/docs`.

## Frontend
The frontend is built using React Native and integrates with the backend API to display and add calorie records.

### Running the Frontend
1. Navigate to the frontend directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Requirements
- Python 3.8+
- Node.js
- SQLite

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MohammadaminAlbooyeh/diet_diary_mobile_app.git
   ```
2. Navigate to the project directory:
   ```bash
   cd diet_diary_mobile_app
   ```
3. Follow the backend and frontend setup instructions.

## License
This project is licensed under the MIT License.
