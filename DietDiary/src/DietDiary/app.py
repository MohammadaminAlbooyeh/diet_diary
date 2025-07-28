"""
My first application
"""

import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW
import json
from .food_calories import FOOD_CALORIES


class dietdiary(toga.App):
    def __init__(self, **kwargs):
        super().__init__(formal_name="Diet Diary", app_id="com.example.dietdiary", **kwargs)
        # Load predefined food items and their calories
        self.food_calories = FOOD_CALORIES

    def startup(self):
        """Construct and show the Toga application.

        Usually, you would add your application to a main content box.
        We then create a main window (with a name matching the app), and
        show the main window.
        """
        # Main container
        main_box = toga.Box(style=Pack(direction=COLUMN, padding=10))

        # Input fields
        self.food_input = toga.TextInput(placeholder='Enter food name', style=Pack(flex=1))
        self.food_input.on_change = self.update_calorie_field

        # Add button
        add_button = toga.Button('Add', on_press=self.add_food, style=Pack(padding=5))

        # Input row
        input_row = toga.Box(style=Pack(direction=ROW, padding=5))
        input_row.add(self.food_input)
        input_row.add(add_button)

        # Food list display
        self.food_list = toga.Table(['Food', 'Calories'], style=Pack(flex=1))

        # Add components to main box
        main_box.add(input_row)
        main_box.add(self.food_list)

        # Main window
        self.main_window = toga.MainWindow(title=self.formal_name)
        self.main_window.content = main_box
        self.main_window.show()

    def update_calorie_field(self, widget):
        """Update the calorie field based on the food name."""
        food = self.food_input.value.lower()
        if food in self.food_calories:
            self.calorie_input.value = str(self.food_calories[food])
        else:
            self.calorie_input.value = ''

    def add_food(self, widget):
        """Add a food item to the list."""
        food = self.food_input.value.lower()
        calories = self.calorie_input.value

        # Check if the food is in the predefined dictionary
        if food in self.food_calories:
            calories = str(self.food_calories[food])

        if food and (calories.isdigit() or food in self.food_calories):
            self.food_list.data.append((food, calories))
            self.food_input.value = ''
            self.calorie_input.value = ''
        else:
            print("Invalid input. Please enter a valid food name or numeric calories.")


def main():
    return dietdiary()


if __name__ == "__main__":
    main().main_loop()