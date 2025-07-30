
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
// frontend/src/App.jsx

// ... (rest of your imports and component setup)

function App() {
  // ... (all your useState declarations)

  // Example state declarations (replace with your actual ones if needed)
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [calories, setCalories] = useState('');
  const [caloriesPerUnit, setCaloriesPerUnit] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState({});
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [entries, setEntries] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [error, setError] = useState('');

  // Fetch food suggestions on mount
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/food-suggestions/`)
      .then(res => res.json())
      .then(data => setFoodSuggestions(data))
      .catch(() => setFoodSuggestions({}));
  }, []);

  // Fetch entries on mount (optional, for dashboard refresh)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/entries/`)
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(() => setEntries([]));
  }, []);

  // --- handleSubmit implementation ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedFood = foodName.trim();
    if (!trimmedFood) {
      setError('Please enter a food name.');
      return;
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }
    // Find the food info (case-insensitive)
    const foodKey = Object.keys(foodSuggestions).find(
      key => key.toLowerCase() === trimmedFood.toLowerCase()
    );
    let caloriesPerUnitVal = caloriesPerUnit;
    if (foodKey && foodSuggestions[foodKey]) {
      caloriesPerUnitVal = foodSuggestions[foodKey].calories;
    }
    const totalCalories = Number(quantity) * Number(caloriesPerUnitVal);
    if (!caloriesPerUnitVal || isNaN(totalCalories)) {
      setError('Calories info not found for this food. Please select a valid food.');
      return;
    }
    // Prepare payload
    const payload = {
      food_name: foodKey || trimmedFood,
      calories: totalCalories
    };
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/entries/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || 'Failed to add entry.');
        return;
      }
      const newEntry = await response.json();
      setEntries(prev => [newEntry, ...prev]);
      setFoodName('');
      setQuantity('');
      setUnit('');
      setCalories('');
      setCaloriesPerUnit('');
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const [timeoutId, setTimeoutId] = useState(null); // New state to manage timeout for onBlur

  // ... (all your fetchEntries, fetchFoodSuggestions, useEffect, handleSubmit, handleDelete functions)

  return (
    <div className="App" style={{ minHeight: '100vh', minWidth: '100vw', maxWidth: '100vw', overflowX: 'hidden', background: '#fff', display: 'flex' }}>
      {/* Sidebar with green scribble effect */}
      <div className="sidebar" style={{ background: '#13b0c0', minWidth: 220, padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '2px 0 10px rgba(0,0,0,0.07)' }}>
        <div className="sidebar-header" style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: '2em', color: '#fff' }}>Hi dear</h2>
        </div>
        <div className="sidebar-buttons" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', alignItems: 'center' }}>
          <button className={`sidebar-button${currentView === 'dashboard' ? ' active' : ''}`} style={{ width: 170, fontSize: '1.2em', borderRadius: 12, border: 'none', background: '#13b0c0', fontWeight: 600, color: '#fff', boxShadow: currentView === 'dashboard' ? '0 0 8px #43ea4a55' : 'none' }} onClick={() => setCurrentView('dashboard')}>Dashboard</button>
          <button className={`sidebar-button${currentView === 'weekly' ? ' active' : ''}`} style={{ width: 170, fontSize: '1.2em', borderRadius: 12, border: 'none', background: '#13b0c0', fontWeight: 600, color: '#fff', boxShadow: currentView === 'weekly' ? '0 0 8px #43ea4a55' : 'none' }} onClick={() => setCurrentView('weekly')}>Weekly Consume</button>
          <button className={`sidebar-button${currentView === 'monthly' ? ' active' : ''}`} style={{ width: 170, fontSize: '1.2em', borderRadius: 12, border: 'none', background: '#13b0c0', fontWeight: 600, color: '#fff', boxShadow: currentView === 'monthly' ? '0 0 8px #43ea4a55' : 'none' }} onClick={() => setCurrentView('monthly')}>Monthly Consume</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, padding: '40px 0 0 0', display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%', minHeight: '100vh', background: '#fff' }}>
        {/* Conditional rendering for dashboard, weekly, monthly */}
        {currentView === 'dashboard' && (
          <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '32px 32px 48px 32px', marginLeft: 0, boxSizing: 'border-box', display: 'flex', gap: 0, maxWidth: '100%' }}>
            {/* Main (left) content */}
            <div style={{ flex: 2, minWidth: 0 }}>
              {/* Title */}
              <h1 style={{ textAlign: 'center', fontFamily: 'inherit', fontWeight: 400, fontSize: '2.2em', color: '#000', marginBottom: 32 }}>Calorie Tracker</h1>

          {/* Food Entry Row */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', justifyContent: 'center' }}>
              <input type="text" placeholder="Food" value={foodName} autoComplete="off"
                style={{ width: 120, padding: 10, borderRadius: 8, border: '1.5px solid #bbb', fontSize: '1em', color: '#000', background: '#fff' }}
                onFocus={() => {
                  if (!foodName.trim()) setFilteredSuggestions(Object.keys(foodSuggestions));
                  else setFilteredSuggestions(Object.keys(foodSuggestions).filter(f => f.toLowerCase().includes(foodName.trim().toLowerCase())));
                  setShowSuggestions(true);
                  if (timeoutId) clearTimeout(timeoutId);
                }}
                onClick={() => {
                  if (!foodName.trim()) setFilteredSuggestions(Object.keys(foodSuggestions));
                  else setFilteredSuggestions(Object.keys(foodSuggestions).filter(f => f.toLowerCase().includes(foodName.trim().toLowerCase())));
                  setShowSuggestions(true);
                  if (timeoutId) clearTimeout(timeoutId);
                }}
                onBlur={() => { const id = setTimeout(() => setShowSuggestions(false), 150); setTimeoutId(id); }}
                onChange={e => {
                  const val = e.target.value;
                  setFoodName(val);
                  const filtered = Object.keys(foodSuggestions).filter(f => f.toLowerCase().includes(val.trim().toLowerCase()));
                  setFilteredSuggestions(filtered);
                  setShowSuggestions(true);
                  const foodInfo = foodSuggestions[val.trim().toLowerCase()];
                  if (foodInfo) {
                    setUnit(foodInfo.unit || '');
                    setCaloriesPerUnit(foodInfo.calories || '');
                    if (quantity && !isNaN(Number(quantity))) setCalories((Number(quantity) * Number(foodInfo.calories)).toString());
                    else setCalories('');
                  } else {
                    setUnit(''); setCaloriesPerUnit(''); setCalories('');
                  }
                }}
                required
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul style={{ position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #ccc', width: 120, maxHeight: 180, overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {filteredSuggestions.map((food) => (
                    <li key={food} style={{ padding: '8px', cursor: 'pointer' }}
                      onMouseDown={() => {
                        setFoodName(food);
                        const foodInfo = foodSuggestions[food.trim().toLowerCase()];
                        setUnit(foodInfo?.unit || '');
                        setCaloriesPerUnit(foodInfo?.calories || '');
                        if (quantity && foodInfo?.calories) setCalories((Number(quantity) * Number(foodInfo.calories)).toString());
                        else setCalories('');
                        setShowSuggestions(false);
                        if (timeoutId) { clearTimeout(timeoutId); setTimeoutId(null); }
                      }}
                    >{food}</li>
                  ))}
                </ul>
              )}
              <input type="number" placeholder="Quantity" value={quantity} min="1"
                style={{ width: 90, padding: 10, borderRadius: 8, border: '1.5px solid #bbb', fontSize: '1em', color: '#000', background: '#fff' }}
                onChange={e => {
                  setQuantity(e.target.value);
                  if (caloriesPerUnit && !isNaN(Number(e.target.value))) setCalories((Number(e.target.value) * Number(caloriesPerUnit)).toString());
                  else setCalories('');
                }} required />
              <input type="text" placeholder="Unit" value={unit} readOnly style={{ width: 90, padding: 10, borderRadius: 8, border: '1.5px solid #bbb', fontSize: '1em', background: '#f7f7f7', color: '#000' }} />
              <input type="text" placeholder="Calories" value={calories} readOnly style={{ width: 90, padding: 10, borderRadius: 8, border: '1.5px solid #bbb', fontSize: '1em', background: '#f7f7f7', color: '#000' }} />
              <button type="submit" style={{ padding: '10px 18px', borderRadius: 8, background: '#43ea4a', color: '#000', fontWeight: 700, border: 'none', fontSize: '1em', boxShadow: '0 2px 8px #43ea4a33' }}>Add</button>
            </form>

            {error && <div style={{ color: 'red', marginTop: '8px', textAlign: 'center' }}>{error}</div>}

            {/* Calorie Goal Progress Bar */}
            <div style={{ margin: '32px 0 24px 0', width: '100%' }}>
              <h2 style={{ textAlign: 'center', fontWeight: 500, fontSize: '1.5em', marginBottom: 12, color: '#000' }}>Calorie Goal</h2>
              <div style={{ width: '80%', margin: '0 auto', height: 16, background: '#e5e7eb', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 2px #0001' }}>
                <div style={{
                  width: `${Math.min(100, (entries.reduce((sum, e) => sum + (e.calories || 0), 0) / 2000) * 100)}%`,
                  height: '100%',
                  background: '#22c55e',
                  borderRadius: 8,
                  transition: 'width 0.5s',
                }}></div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 6, color: '#000', fontWeight: 500 }}>
                {entries.reduce((sum, e) => sum + (e.calories || 0), 0)} / 2000 kcal
              </div>
            </div>

            {/* Donut Chart Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px 0' }}>
              <PieChart width={320} height={240}>
                <Pie
                  data={[
                    { name: 'Carbs', value: 120 },
                    { name: 'Protein', value: 60 },
                    { name: 'Fats', value: 40 },
                  ]}
                  cx={160}
                  cy={120}
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={3}
                  dataKey="value"
                  label
                >
                  <Cell key="carbs" fill="#3b82f6" />
                  <Cell key="protein" fill="#ef4444" />
                  <Cell key="fats" fill="#38bdf8" />
                </Pie>
                <Tooltip />
              </PieChart>
              <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: '1.1em', fontWeight: 600 }}>
                <span style={{ color: '#000' }}>carbs ... gr</span>
                <span style={{ color: '#000' }}>protein ... gr</span>
                <span style={{ color: '#000' }}>fats ... gr</span>
              </div>
            </div>
          </div>
          {/* Consumed Foods Table (right) - Redesigned */}
          <div style={{ flex: 1, minWidth: 320, background: '#f7f7f7', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 20, marginLeft: '2vw', height: '100%' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.2em', fontWeight: 600, marginBottom: 16, color: '#000' }}>Today's Consumption</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent', fontSize: '1em' }}>
              <thead>
                <tr style={{ background: '#13b0c0', color: '#fff' }}>
                  <th style={{ padding: '8px 4px', fontWeight: 700 }}>Food item</th>
                  <th style={{ padding: '8px 4px', fontWeight: 700 }}>Calories(Kcal)</th>
                  <th style={{ padding: '8px 4px', fontWeight: 700 }}>Time</th>
                  <th style={{ padding: '8px 4px', fontWeight: 700 }}>Remove Item</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888', padding: 12, background: '#eaf6ff' }}>No entries yet.</td></tr>
                ) : (
                  entries.map((entry, idx) => (
                    <tr key={entry.id} style={{ background: idx % 2 === 0 ? '#eaf6ff' : '#cbe7fa' }}>
                      <td style={{ color: '#000', padding: '8px 4px' }}>{entry.food_name}</td>
                      <td style={{ color: '#000', padding: '8px 4px' }}>{entry.calories}</td>
                      <td style={{ color: '#000', padding: '8px 4px' }}>{new Date(entry.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => {
                          // Remove entry from backend and update state
                          fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/entries/${entry.id}`, { method: 'DELETE' })
                            .then(() => setEntries(prev => prev.filter(e => e.id !== entry.id)));
                        }}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, fontSize: '1em', cursor: 'pointer', boxShadow: '0 1px 4px #ef444422' }}
                        >X</button>
                      </td>
                    </tr>
                  ))
                )}
                {/* Total Row */}
                {entries.length > 0 && (
                  <tr style={{ background: '#13b0c0', color: '#fff', fontWeight: 700 }}>
                    <td style={{ padding: '8px 4px' }}>Total</td>
                    <td style={{ padding: '8px 4px' }}>{entries.reduce((sum, e) => sum + (e.calories || 0), 0)}(Kcal)</td>
                    <td colSpan="2"></td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}
        {(currentView === 'weekly' || currentView === 'monthly') && (
          <div className="view-placeholder" style={{ background: '#fff', padding: 40, borderRadius: 10, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h2 style={{ color: '#34495e', marginBottom: 15 }}>{currentView === 'weekly' ? 'Weekly Consumption' : 'Monthly Consumption'}</h2>
            <p style={{ color: '#555', fontSize: '1.1em' }}>This section will show your {currentView} stats soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;