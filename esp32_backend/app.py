from flask import Flask, request, jsonify, render_template
import threading
import time
import math
import database

app = Flask(__name__)

# Initialize database
database.init_db()

# Simulation settings
simulation_active = False

def simulation_thread():
    """Background thread to generate simulated sensor data."""
    global simulation_active
    t = 0
    # Create the simulation loop that runs indefinitely
    while True:
        if simulation_active:
            # Generate simulated data using periodic functions
            # Temperature oscillates between 20 and 30 degrees Celsius
            temp = 25 + 5 * math.sin(t * 0.1)
            # Humidity oscillates between 40% and 60%
            hum = 50 + 10 * math.cos(t * 0.1)
            
            # Store in the database
            database.insert_data(round(temp, 2), round(hum, 2))
            t += 1
            
        time.sleep(2) # Generate new data every 2 seconds

# Start background thread
thread = threading.Thread(target=simulation_thread, daemon=True)
thread.start()

@app.route('/')
def index():
    """Render the dashboard UI."""
    return render_template('index.html')

@app.route('/api/update', methods=['GET'])
def update_data():
    """
    Endpoint for ESP32 to push real data.
    Usage format: /api/update?temp=25.5&hum=60.0
    """
    temp = request.args.get('temp')
    hum = request.args.get('hum')
    
    if temp is not None and hum is not None:
        try:
            database.insert_data(float(temp), float(hum))
            return jsonify({"status": "success", "message": "Data inserted"}), 200
        except ValueError:
            return jsonify({"status": "error", "message": "Invalid numeric data format"}), 400
    
    return jsonify({"status": "error", "message": "Missing temp or hum parameters"}), 400

@app.route('/api/data', methods=['GET'])
def get_data():
    """Endpoint for frontend to fetch historical datalog."""
    data = database.get_latest_data(30)
    return jsonify(data)

@app.route('/api/simulation/status', methods=['GET'])
def get_simulation_status():
    """Check if simulation mode is active."""
    return jsonify({"active": simulation_active})

@app.route('/api/simulation/toggle', methods=['POST'])
def toggle_simulation():
    """Toggle the simulation mode on or off."""
    global simulation_active
    simulation_active = not simulation_active
    return jsonify({"status": "success", "active": simulation_active})

if __name__ == '__main__':
    # Run the application publicly accessible on port 5000
    app.run(debug=True, host='0.0.0.0', port=5001)
