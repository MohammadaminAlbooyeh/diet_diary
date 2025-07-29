// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://127.0.0.1:8000';
const MAX_DAILY_CALORIES = 2500; // Define your daily calorie goal

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF5733',
  '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1', '#FFBD33'
];

function App() {
  const [entries, setEntries] = useState([]);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchFoodSuggestions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/food-suggestions/`);
      setFoodSuggestions(response.data);
    } catch (err) {
      console.error("Error fetching food suggestions:", err);
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchFoodSuggestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!foodName) {
      setError("Please fill in the food name.");
      return;
    }

    const payload = {
        food_name: foodName,
    };

    if (calories !== '') {
        payload.calories = parseFloat(calories);
    } else {
        const suggestedCal = foodSuggestions[foodName.toLowerCase()];
        if (suggestedCal) {
            payload.calories = suggestedCal;
        }
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/entries/`, payload);
      setEntries([...entries, response.data]);
      setFoodName('');
      setCalories('');
      setError(null);
    } catch (err) {
      console.error("Error creating entry:", err.response ? err.response.data : err);
      setError(err.response && err.response.data && err.response.data.detail
                ? err.response.data.detail
                : "Failed to add entry. Please try again.");
    }
  };

  const chartData = entries.reduce((acc, entry) => {
    const existingFood = acc.find(item => item.name.toLowerCase() === entry.food_name.toLowerCase());
    if (existingFood) {
      existingFood.value += entry.calories;
    } else {
      acc.push({ name: entry.food_name, value: entry.calories });
    }
    return acc;
  }, []);

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
  const calorieProgressPercent = (totalCalories / MAX_DAILY_CALORIES) * 100;

  return (
    <div className="App">
      <h1>Calorie Tracker</h1>

      <div className="main-content-container"> {/* New container for layout */}
        <div className="left-panel"> {/* Left side for input, chart, and progress */}
          {/* Select Food to Add Box */}
          <div className="input-section">
            <h2>Select Food to Add</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Type or Select Food Name"
                value={foodName}
                onChange={(e) => {
                  setFoodName(e.target.value);
                  const suggestedCal = foodSuggestions[e.target.value.toLowerCase()];
                  if (suggestedCal) {
                    setCalories(suggestedCal.toString());
                  } else {
                    setCalories('');
                  }
                }}
                list="food-options"
                required
              />
              <datalist id="food-options">
                {Object.keys(foodSuggestions).map((food) => (
                  <option key={food} value={food} />
                ))}
              </datalist>

              <input
                type="number"
                step="0.01"
                placeholder="Calories (Optional)"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
              <button type="submit">Add Entry</button>
            </form>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          {/* Daily Calorie Progress Bar */}
          <div className="calorie-progress-container">
            <h2>Daily Calorie Goal: {MAX_DAILY_CALORIES} kcal</h2>
            <div className="calorie-progress-bar-background">
              <div
                className="calorie-progress-bar-fill"
                style={{ width: `${Math.min(calorieProgressPercent, 100)}%` }}
              >
                <span className="calorie-progress-text">
                    {totalCalories.toFixed(2)} / {MAX_DAILY_CALORIES} kcal
                    ({calorieProgressPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
            {totalCalories >= MAX_DAILY_CALORIES && (
                <p style={{ color: 'orange', fontWeight: 'bold' }}>
                    You've reached or exceeded your daily calorie goal!
                </p>
            )}
          </div>

          <hr />

          <h2>Calorie Distribution</h2>
          {loading ? (
            <p>Loading chart...</p>
          ) : chartData.length === 0 ? (
            <p>Add entries to see the calorie distribution chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {
                    chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                  }
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} kcal`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div> {/* End left-panel */}

        {/* NEW: Right Panel for Daily Consumptions Table */}
        <div className="right-panel">
          <h2>Daily Consumptions</h2>
          {loading ? (
            <p>Loading entries...</p>
          ) : entries.length === 0 ? (
            <p>No daily consumptions recorded yet.</p>
          ) : (
            <div className="table-container"> {/* Added a container for table overflow */}
              <table>
                <thead>
                  <tr>
                    <th>Food</th>
                    <th>Calories</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.food_name}</td>
                      <td>{entry.calories.toFixed(2)}</td>
                      <td>{new Date(entry.consumed_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div> {/* End right-panel */}
      </div> {/* End main-content-container */}

      {/* The original Recorded Entries list (optional, can be removed if table is sufficient) */}
      <hr />
      <h2>Recorded Entries (Total: {totalCalories.toFixed(2)} kcal)</h2>
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