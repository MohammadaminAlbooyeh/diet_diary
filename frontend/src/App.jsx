import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './App.css';

function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // Reminder state
  const [reminder, setReminder] = useState(null);

  // Export to CSV
  const exportToCSV = () => {
    const header = ['Food Name', 'Calories', 'Protein', 'Carbs', 'Fat', 'Meal Type', 'Date'];
    const rows = entries.map(e => [
      e.food_name,
      e.calories,
      e.protein || FOOD_CALORIES[e.food_name]?.protein || '',
      e.carbs || FOOD_CALORIES[e.food_name]?.carbs || '',
      e.fat || FOOD_CALORIES[e.food_name]?.fat || '',
      e.meal_type,
      e.consumed_at ? e.consumed_at.split('T')[0] : ''
    ]);
    const csvContent = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diet_diary_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const header = ['Food Name', 'Calories', 'Protein', 'Carbs', 'Fat', 'Meal Type', 'Date'];
    const rows = entries.map(e => [
      e.food_name,
      e.calories,
      e.protein || FOOD_CALORIES[e.food_name]?.protein || '',
      e.carbs || FOOD_CALORIES[e.food_name]?.carbs || '',
      e.fat || FOOD_CALORIES[e.food_name]?.fat || '',
      e.meal_type,
      e.consumed_at ? e.consumed_at.split('T')[0] : ''
    ]);
    doc.setFontSize(16);
    doc.text('Diet Diary Export', 14, 16);
    doc.setFontSize(10);
    // Table header
    let y = 26;
    doc.text(header.join(' | '), 14, y);
    y += 6;
    // Table rows
    rows.forEach(row => {
      doc.text(row.join(' | '), 14, y);
      y += 6;
      if (y > 280) {
        doc.addPage();
        y = 16;
      }
    });
    doc.save('diet_diary_export.pdf');
  };

  // Reminders: show a notification every 4 hours (demo: 10s for test)
  useEffect(() => {
    if (reminder) clearInterval(reminder);
    const interval = setInterval(() => {
      if (Notification && Notification.permission === 'granted') {
        new Notification('Diet Diary Reminder', { body: 'Don\'t forget to log your meals or drink water!' });
      }
    }, 4 * 60 * 60 * 1000); // 4 hours
    // For demo/testing, use 10s: 10000
    // }, 10000);
    setReminder(interval);
    return () => clearInterval(interval);
  }, []);

  // Ask for notification permission on mount
  useEffect(() => {
    if (Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);
  // State
  const [meals, setMeals] = useState({
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snacks: []
  });
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');
  const [entries, setEntries] = useState([]);
  const [showInput, setShowInput] = useState({
    Breakfast: false,
    Lunch: false,
    Dinner: false,
    Snacks: false
  });
  const [inputValue, setInputValue] = useState('');
  const [FOOD_CALORIES, setFoodCalories] = useState({});
  const [customMacros, setCustomMacros] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  // Edit and delete state
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ food_name: '', calories: '', meal_type: 'Breakfast' });

  // Fetch food data and entries from backend on mount
  useEffect(() => {
    fetch('http://localhost:8000/food-suggestions/')
      .then(res => res.json())
      .then(data => setFoodCalories(data));
    fetch('http://localhost:8000/entries/')
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        // Group entries by meal_type
        const grouped = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
        data.forEach(e => {
          if (grouped[e.meal_type]) grouped[e.meal_type].push(e.food_name);
        });
        setMeals(grouped);
      });
  }, []);

  // Helper: group entries by date
  const groupByDate = (entries) => {
    const grouped = {};
    entries.forEach(e => {
      const date = e.consumed_at ? e.consumed_at.split('T')[0] : 'Unknown';
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(e);
    });
    return grouped;
  };

  // Helper: get last N days
  const getLastNDates = (n) => {
    const dates = [];
    for (let i = 0; i < n; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates.reverse();
  };

  // Calculate daily summary for last 7 days
  const groupedByDate = groupByDate(entries);
  const last7 = getLastNDates(7);
  const dailySummary = last7.map(date => {
    const dayEntries = groupedByDate[date] || [];
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    dayEntries.forEach(e => {
      calories += e.calories || 0;
      protein += e.protein || (FOOD_CALORIES[e.food_name]?.protein || 0);
      carbs += e.carbs || (FOOD_CALORIES[e.food_name]?.carbs || 0);
      fat += e.fat || (FOOD_CALORIES[e.food_name]?.fat || 0);
    });
    return { date, calories, protein, carbs, fat };
  });

  // Get today's date in 'D MMM' format (e.g., '13 Aug')
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('en-US', { month: 'short' });
  const formattedDate = `${day} ${month}`;

  // Calculate macros for each meal
  const getMealMacros = (meal) => meals[meal].reduce((acc, food) => {
    const f = FOOD_CALORIES[food] || {};
    return {
      protein: acc.protein + (f.protein || 0),
      carbs: acc.carbs + (f.carbs || 0),
      fat: acc.fat + (f.fat || 0)
    };
  }, { protein: 0, carbs: 0, fat: 0 });

  // Calculate calories for each meal
  const getMealCalories = (meal) => meals[meal].reduce((sum, food) => sum + (FOOD_CALORIES[food]?.calories || 0), 0);
  const breakfastCals = getMealCalories('Breakfast');
  const lunchCals = getMealCalories('Lunch');
  const dinnerCals = getMealCalories('Dinner');
  const snacksCals = getMealCalories('Snacks');
  const totalCals = breakfastCals + lunchCals + dinnerCals + snacksCals;

  // Handle + click
  const handleAddClick = (meal) => {
    setShowInput((prev) => ({ ...prev, [meal]: true }));
    setInputValue('');
    setSelectedMealType(meal);
    setCustomMacros({ calories: '', protein: '', carbs: '', fat: '' });
  };

  // Handle food submit (with custom food support)
  const handleFoodSubmit = async (meal) => {
    const foodKey = inputValue.toLowerCase();
    const isDefault = FOOD_CALORIES[foodKey];
    // If default food, use backend as before
    if (inputValue && isDefault) {
      const res = await fetch('http://localhost:8000/entries/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_name: inputValue, meal_type: meal })
      });
      if (res.ok) {
        const newEntry = await res.json();
        setEntries(prev => [...prev, newEntry]);
        setMeals(prev => ({ ...prev, [meal]: [...prev[meal], newEntry.food_name] }));
        setShowInput((prev) => ({ ...prev, [meal]: false }));
        setInputValue('');
        setCustomMacros({ calories: '', protein: '', carbs: '', fat: '' });
      } else {
        alert('Failed to add food!');
      }
    }
    // If custom food, require macros
    else if (
      inputValue &&
      customMacros.calories &&
      customMacros.protein &&
      customMacros.carbs &&
      customMacros.fat
    ) {
      const res = await fetch('http://localhost:8000/entries/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: inputValue,
          meal_type: meal,
          calories: Number(customMacros.calories),
          protein: Number(customMacros.protein),
          carbs: Number(customMacros.carbs),
          fat: Number(customMacros.fat)
        })
      });
      if (res.ok) {
        const newEntry = await res.json();
        setEntries(prev => [...prev, newEntry]);
        setMeals(prev => ({ ...prev, [meal]: [...prev[meal], newEntry.food_name] }));
        setShowInput((prev) => ({ ...prev, [meal]: false }));
        setInputValue('');
        setCustomMacros({ calories: '', protein: '', carbs: '', fat: '' });
        // Optionally update FOOD_CALORIES for this session
        setFoodCalories(prev => ({
          ...prev,
          [inputValue.toLowerCase()]: {
            calories: Number(customMacros.calories),
            protein: Number(customMacros.protein),
            carbs: Number(customMacros.carbs),
            fat: Number(customMacros.fat)
          }
        }));
      } else {
        alert('Failed to add custom food!');
      }
    } else {
      alert('Please fill all fields for custom food!');
    }
  };

  // Delete entry handler
  const handleDeleteEntry = async (id) => {
    const res = await fetch(`http://localhost:8000/entries/${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      setEntries(prev => {
        const updated = prev.filter(e => e.id !== id);
        // Rebuild meals state from updated entries
        const newMeals = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
        updated.forEach(e => {
          if (newMeals[e.meal_type]) newMeals[e.meal_type].push(e.food_name);
        });
        setMeals(newMeals);
        return updated;
      });
    } else {
      alert('Failed to delete entry!');
    }
  };

  // Edit logic
  const handleEditClick = (entry) => {
    setEditId(entry.id);
    setEditData({
      food_name: entry.food_name,
      calories: entry.calories,
      meal_type: entry.meal_type
    });
  };

  const handleEditSave = async (id) => {
    const res = await fetch(`http://localhost:8000/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    if (res.ok) {
      const updated = await res.json();
      setEntries(prev => prev.map(e => e.id === id ? updated : e));
      setEditId(null);
      setEditData({ food_name: '', calories: '', meal_type: 'Breakfast' });
      // Rebuild meals state
      fetch('http://localhost:8000/entries/')
        .then(res => res.json())
        .then(data => {
          const grouped = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
          data.forEach(e => {
            if (grouped[e.meal_type]) grouped[e.meal_type].push(e.food_name);
          });
          setMeals(grouped);
        });
    } else {
      alert('Failed to update entry!');
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditData({ food_name: '', calories: '', meal_type: 'Breakfast' });
  };

  return (
    <div className={`food-tracker-container${darkMode ? ' dark' : ''}`} style={{ minHeight: '100vh', minWidth: '100vw', background: darkMode ? '#222' : '#fff', color: darkMode ? '#eee' : '#111' }}>
      {/* Dark mode toggle and export */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, margin: '8px 0 0 0' }}>
        <button onClick={() => setDarkMode(d => !d)} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #888', background: darkMode ? '#333' : '#eee', color: darkMode ? '#fff' : '#222', cursor: 'pointer' }}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={exportToCSV} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #888', background: '#f5f5f5', color: '#222', cursor: 'pointer' }}>
          Export CSV
        </button>
        <button onClick={exportToPDF} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #888', background: '#f5f5f5', color: '#222', cursor: 'pointer' }}>
          Export PDF
        </button>
      </div>
      {/* Header */}
      <header className="food-tracker-header">
        <div className="header-left">
          <button className="back-btn">&#8592; Back to Today</button>
          <h2>My Food Tracker</h2>
          <div className="header-icons">
            <span>TOTAL<br/>{totalCals} cals</span>
            <span>CARBS<br/>0g</span>
            <span>PROTEIN<br/>0g</span>
            <span>FAT<br/>0g</span>
          </div>
          <div className="header-tip">Aim to stay within your 1550 calorie sweet spot.</div>
        </div>
        <div className="header-right">
          <div className="calories-left-circle">
            <span>{totalCals}</span>
            <div>cals left</div>
          </div>
        </div>
      </header>

      {/* Date */}
      <div className="food-tracker-date">Today, {formattedDate}</div>

      {/* Meals Section */}
      <div className="meals-section">
        {mealTypes.map((meal) => {
          const macros = getMealMacros(meal);
          return (
            <MealCard
              key={meal}
              meal={meal}
              items={getMealCalories(meal)}
              carbs={macros.carbs}
              protein={macros.protein}
              fat={macros.fat}
              foods={meals[meal]}
              onAddClick={() => handleAddClick(meal)}
              showInput={showInput[meal]}
              inputValue={inputValue}
              setInputValue={setInputValue}
              onFoodSubmit={() => handleFoodSubmit(meal)}
              FOOD_CALORIES={FOOD_CALORIES}
              customMacros={customMacros}
              setCustomMacros={setCustomMacros}
            />
          );
        })}
      </div>

      {/* Foods Table */}
      <div className="foods-table-section">
        <h3 style={{margin: '24px 0 8px 0'}}>All Added Foods</h3>
        <table className="foods-table">
          <thead>
            <tr>
              <th>Food Name</th>
              <th>Calories</th>
              <th>Date</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan="4" style={{textAlign: 'center'}}>No foods added yet</td></tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id}>
                  {editId === entry.id ? (
                    <>
                      <td><input value={editData.food_name} onChange={e => setEditData(d => ({ ...d, food_name: e.target.value }))} /></td>
                      <td><input type="number" value={editData.calories} onChange={e => setEditData(d => ({ ...d, calories: e.target.value }))} /></td>
                      <td>
                        <select value={editData.meal_type} onChange={e => setEditData(d => ({ ...d, meal_type: e.target.value }))}>
                          {mealTypes.map(mt => <option key={mt} value={mt}>{mt}</option>)}
                        </select>
                      </td>
                      <td>
                        <button onClick={() => handleEditSave(entry.id)} style={{color: '#fff', background: '#4caf50', border: 'none', borderRadius: '4px', padding: '2px 10px', cursor: 'pointer', marginRight: 4}}>Save</button>
                        <button onClick={handleEditCancel} style={{color: '#fff', background: '#888', border: 'none', borderRadius: '4px', padding: '2px 10px', cursor: 'pointer'}}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{entry.food_name}</td>
                      <td>{entry.calories}</td>
                      <td>{entry.consumed_at ? entry.consumed_at.split('T')[0] : ''}</td>
                      <td>
                        <button onClick={() => handleEditClick(entry)} style={{color: '#fff', background: '#2196f3', border: 'none', borderRadius: '4px', padding: '2px 10px', cursor: 'pointer', marginRight: 4}}>Edit</button>
                        <button onClick={() => handleDeleteEntry(entry.id)} style={{color: '#fff', background: '#f85a5a', border: 'none', borderRadius: '4px', padding: '2px 10px', cursor: 'pointer'}}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Daily/Weekly/Monthly Summaries */}
      <div className="summary-section" style={{margin: '32px 0'}}>
        <h3>Daily Summary (Last 7 Days)</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Calories</th>
              <th>Protein (g)</th>
              <th>Carbs (g)</th>
              <th>Fat (g)</th>
            </tr>
          </thead>
          <tbody>
            {dailySummary.map(day => (
              <tr key={day.date}>
                <td>{day.date}</td>
                <td>{day.calories}</td>
                <td>{day.protein}</td>
                <td>{day.carbs}</td>
                <td>{day.fat}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* You can add chart.js or recharts here for visual charts! */}
      </div>
    </div>
  );
}

function MealCard({
  meal, items, carbs, protein, fat, foods,
  onAddClick, showInput, inputValue, setInputValue, onFoodSubmit,
  FOOD_CALORIES, customMacros, setCustomMacros
}) {
  const isCustom = inputValue && !FOOD_CALORIES[inputValue.toLowerCase()];
  return (
    <div className="meal-card">
      <div className="meal-header">
        <span className="meal-icon" style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{getMealIcon(meal)}</span>
        <div className="meal-title" style={{ color: '#000', fontWeight: 'bold' }}>{meal}</div>
      </div>
      <div className="meal-items">cals {items && typeof items === 'number' ? items : 0}</div>
      {foods && foods.length > 0 && (
        <ul className="food-list">
          {foods.map((food, idx) => (
            <li key={idx}>{food}</li>
          ))}
        </ul>
      )}
      {showInput ? (
        <div className="add-food-input">
          <input
            type="text"
            placeholder="Enter food name..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onFoodSubmit(meal); }}
            autoFocus
          />
          {isCustom && (
            <div className="custom-macros-inputs" style={{ marginTop: 8 }}>
              <input
                type="number"
                placeholder="Calories"
                value={customMacros.calories}
                onChange={e => setCustomMacros(c => ({ ...c, calories: e.target.value }))}
                style={{ width: 70, marginRight: 4 }}
              />
              <input
                type="number"
                placeholder="Protein"
                value={customMacros.protein}
                onChange={e => setCustomMacros(c => ({ ...c, protein: e.target.value }))}
                style={{ width: 70, marginRight: 4 }}
              />
              <input
                type="number"
                placeholder="Carbs"
                value={customMacros.carbs}
                onChange={e => setCustomMacros(c => ({ ...c, carbs: e.target.value }))}
                style={{ width: 70, marginRight: 4 }}
              />
              <input
                type="number"
                placeholder="Fat"
                value={customMacros.fat}
                onChange={e => setCustomMacros(c => ({ ...c, fat: e.target.value }))}
                style={{ width: 70 }}
              />
            </div>
          )}
          <button onClick={() => onFoodSubmit(meal)} style={{ marginTop: 8 }}>Add</button>
        </div>
      ) : (
        <button className="add-item-btn" onClick={onAddClick}>+</button>
      )}
      <div className="meal-nutrients">
        <div>CARBS<br/>{carbs}g</div>
        <div>PROTEIN<br/>{protein}g</div>
        <div>FAT<br/>{fat}g</div>
      </div>
    </div>
  );
}

function getMealIcon(title) {
  switch (title) {
    case 'Breakfast':
      return '🥞';
    case 'Lunch':
      return '🥗';
    case 'Dinner':
      return '🍝';
    case 'Snacks':
      return '🍎';
    default:
      return '🍽️';
  }
}

export default App;