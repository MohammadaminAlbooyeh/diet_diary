# backend/food_data.py


FOOD_CALORIES = {
    "apple": 95.0,
    "banana": 105.0,
    "orange": 62.0,
    "chicken breast": 165.0, # for 100g cooked
    "rice": 130.0, # for 100g cooked
    "bread (slice)": 80.0,
    "egg": 78.0,
    "milk (cup)": 103.0,
    "yogurt (plain)": 150.0,
    "salmon": 208.0, # for 100g cooked
    "broccoli": 55.0, # for 1 cup chopped
    "potato (medium)": 161.0, # for a medium baked potato
    "carrot": 52.0 # for 1 cup chopped
}

def get_calories_by_food_name(food_name: str) -> float | None:
    return FOOD_CALORIES.get(food_name.lower()) 