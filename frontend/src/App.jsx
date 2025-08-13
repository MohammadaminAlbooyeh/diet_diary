import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Get today's date in 'D MMM' format (e.g., '13 Aug')
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('en-US', { month: 'short' });
  const formattedDate = `${day} ${month}`;

    // Delete entry handler
    const handleDeleteEntry = async (id) => {
      const res = await fetch(`http://localhost:8000/entries/${id}`, { method: 'DELETE' });
      if (res.status === 204) {
        // Remove from entries
        setEntries(prev => {
          const updated = prev.filter(e => e.id !== id);
          // Rebuild meals state from updated entries
          const newMeals = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
          updated.forEach(e => {
            // All foods are in Breakfast for now (see previous logic)
            newMeals.Breakfast.push(e.food_name);
          });
          setMeals(newMeals);
          return updated;
        });
      } else {
        alert('Failed to delete entry!');
      }
    };

  // Step 1: State for foods per meal (now from backend)
  const [meals, setMeals] = useState({
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snacks: []
  });
  const [entries, setEntries] = useState([]); // All entries from backend
  // Step 2: State for showing input
  const [showInput, setShowInput] = useState({
    Breakfast: false,
    Lunch: false,
    Dinner: false,
    Snacks: false
  });
  const [inputValue, setInputValue] = useState('');
  // Step 3: Food data (from backend)
  const [FOOD_CALORIES, setFoodCalories] = useState({});
  // Fetch food data and entries from backend on mount
  useEffect(() => {
    fetch('http://localhost:8000/food-suggestions/')
      .then(res => res.json())
      .then(data => setFoodCalories(data));
    fetch('http://localhost:8000/entries/')
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        // Group entries by meal (if you want to support meal type, you need to add it to backend)
        // For now, assign all to Breakfast for demo, or group by food name, etc.
        // Here, we just show all entries in Breakfast for demo:
        setMeals({
          Breakfast: data.map(e => e.food_name),
          Lunch: [],
          Dinner: [],
          Snacks: []
        });
      });
  }, []);

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
  };
  // Handle food submit
  const handleFoodSubmit = async (meal) => {
    if (inputValue && FOOD_CALORIES[inputValue.toLowerCase()]) {
      // Send to backend
      const res = await fetch('http://localhost:8000/entries/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_name: inputValue })
      });
      if (res.ok) {
        const newEntry = await res.json();
        setEntries(prev => [...prev, newEntry]);
        setMeals(prev => ({ ...prev, [meal]: [...prev[meal], newEntry.food_name] }));
        setShowInput((prev) => ({ ...prev, [meal]: false }));
        setInputValue('');
      } else {
        alert('Failed to add food!');
      }
    } else {
      alert('Food not found!');
    }
  };

  return (
    <div className="food-tracker-container">
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
        {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => {
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
              <tr><td colSpan="3" style={{textAlign: 'center'}}>No foods added yet</td></tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.food_name}</td>
                  <td>{entry.calories}</td>
                  <td>{entry.consumed_at ? entry.consumed_at.split('T')[0] : ''}</td>
                    <td>
                      <button onClick={() => handleDeleteEntry(entry.id)} style={{color: '#fff', background: '#f85a5a', border: 'none', borderRadius: '4px', padding: '2px 10px', cursor: 'pointer'}}>Delete</button>
                    </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MealCard({ meal, items, carbs, protein, fat, foods, onAddClick, showInput, inputValue, setInputValue, onFoodSubmit }) {
  return (
    <div className="meal-card">
      <div className="meal-header">
        <span className="meal-icon" style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{getMealIcon(meal)}</span>
        <div className="meal-title">{meal}</div>
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
            onKeyDown={e => { if (e.key === 'Enter') onFoodSubmit(); }}
            autoFocus
          />
          <button onClick={onFoodSubmit}>Add</button>
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
      return '🥞'; // Pancakes
    case 'Lunch':
      return '🥗'; // Salad
    case 'Dinner':
      return '🍝'; // Pasta
    case 'Snacks':
      return '🍎'; // Apple
    default:
      return '🍽️';
  }
}

export default App;