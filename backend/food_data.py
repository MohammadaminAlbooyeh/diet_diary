# backend/food_data.py


FOOD_CALORIES = {
    "apple": {"calories": 95.0, "unit": "1 medium"},
    "banana": {"calories": 105.0, "unit": "1 medium"},
    "orange": {"calories": 62.0, "unit": "1 medium"},
    "chicken breast": {"calories": 165.0, "unit": "100g"},
    "rice": {"calories": 130.0, "unit": "100g"},
    "bread (slice)": {"calories": 80.0, "unit": "1 slice"},
    "egg": {"calories": 78.0, "unit": "1 large"},
    "milk (cup)": {"calories": 103.0, "unit": "1 cup"},
    "yogurt (plain)": {"calories": 150.0, "unit": "1 cup"},
    "salmon": {"calories": 208.0, "unit": "100g"},
    "broccoli": {"calories": 55.0, "unit": "1 cup chopped"},
    "potato (medium)": {"calories": 161.0, "unit": "1 medium"},
    "carrot": {"calories": 52.0, "unit": "1 cup chopped"}
}

def get_calories_by_food_name(food_name: str) -> float | None:
    food_info = FOOD_CALORIES.get(food_name.lower())
    return food_info["calories"] if food_info else None