// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Assuming you have an App.css for basic styling

const API_BASE_URL = 'http://127.0.0.1:8000'; // Base URL of your FastAPI backend

function App() {
  const [entries, setEntries] = useState([]);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch calorie entries from the backend
  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/entries/`);
      setEntries(response.data);
    } catch (err) {
      console.error("Error fetching entries:", err);
      setError("Failed to fetch entries. Please check the backend server.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch entries when the component mounts
  useEffect(() => {
    fetchEntries();
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle form submission (adding a new entry)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!foodName || !calories) {
      setError("Please fill in both food name and calories.");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/entries/`, {
        food_name: foodName,
        calories: parseFloat(calories), // Convert calories to a number
      });
      setEntries([...entries, response.data]); // Add new entry to state
      setFoodName(''); // Clear form fields
      setCalories('');
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error creating entry:", err);
      setError("Failed to add entry. Ensure calories is a valid number.");
    }
  };

  return (
    <div className="App">
      <h1>Calorie Tracker</h1>

      {/* Form for adding new entries */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Food Name"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          required
        />
        <button type="submit">Add Entry</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Recorded Entries</h2>
      {loading ? (
        <p>Loading entries...</p>
      ) : entries.length === 0 ? (
        <p>No entries yet. Add some above!</p>
      ) : (
        <ul>
          {entries.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.food_name}:</strong> {entry.calories} calories (
              {new Date(entry.consumed_at).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;