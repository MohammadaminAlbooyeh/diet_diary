import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW

# Define constants for styles
BACKGROUND_COLOR = '#ADD8E6'  # Light Blue
LABEL_TEXT_COLOR = 'red'
LABEL_FONT_SIZE = 30
BUTTON_BACKGROUND_COLOR = 'green'
BUTTON_TEXT_COLOR = 'white'
BUTTON_FONT_SIZE = 20
WINDOW_SIZE = (400, 300)

class DietDiary(toga.App):
    def startup(self):
        # Create a main box to hold all content.
        main_box = toga.Box(style=Pack(direction=COLUMN, background_color=BACKGROUND_COLOR, padding=20))

        # Create a label with clearly visible text color.
        self.label = toga.Label(
            "Welcome to your Diet Diary - Fresh Start!",
            style=Pack(text_align='center', font_size=LABEL_FONT_SIZE, color=LABEL_TEXT_COLOR, padding_top=50)
        )

        # Create a button to test interactivity
        self.button = toga.Button(
            "Click Me to Change Text!",
            on_press=self.button_handler,
            style=Pack(padding=15, margin_top=30, background_color=BUTTON_BACKGROUND_COLOR, color=BUTTON_TEXT_COLOR, border_radius=10, font_size=BUTTON_FONT_SIZE)
        )

        # Add the label and button to the main box
        main_box.add(self.label)
        main_box.add(self.button)

        # Create the main window and set its content to the main_box
        self.main_window = toga.MainWindow(
            title=self.formal_name,
            size=WINDOW_SIZE
        )
        self.main_window.content = main_box
        self.main_window.show()

    def button_handler(self, widget):
        try:
            # Update the label text when the button is pressed
            self.label.text = "Button Clicked! Hello from Toga!"
            print("Button was clicked!")
        except Exception as e:
            print(f"An error occurred: {e}")

def main():
    return DietDiary()
