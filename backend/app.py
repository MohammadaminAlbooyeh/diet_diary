from flask import Flask, request, jsonify

app = Flask(__name__)

# In-memory storage for testing
food_data = []

# API to check server health
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "API is running!"})

# API to add food
@app.route('/api/food', methods=['POST'])
def add_food():
    data = request.get_json()
    food_name = data.get('name')
    calories = data.get('calories')

    if not food_name or not calories:
        return jsonify({"error": "Name and calories are required"}), 400

    food_data.append({"name": food_name, "calories": calories})
    return jsonify({"message": "Food added successfully", "data": food_data}), 201

# API to get the list of foods
@app.route('/api/food', methods=['GET'])
def get_food():
    return jsonify({"data": food_data}), 200

# API to delete a food
@app.route('/api/food/<string:food_name>', methods=['DELETE'])
def delete_food(food_name):
    global food_data
    food_data = [food for food in food_data if food['name'] != food_name]
    return jsonify({"message": f"Food '{food_name}' deleted successfully", "data": food_data}), 200

if __name__ == '__main__':
    app.run(debug=True)