import sqlite3
import os

DB_NAME = 'sensor_data.db'

def init_db():
    """Initialize the SQLite database with the required table."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT (datetime('now', 'localtime')),
            temperature REAL,
            humidity REAL
        )
    ''')
    conn.commit()
    conn.close()

def insert_data(temperature, humidity):
    """Insert a new temperature and humidity reading."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO sensor_data (temperature, humidity) VALUES (?, ?)', (temperature, humidity))
    conn.commit()
    conn.close()

def get_latest_data(limit=50):
    """Retrieve the latest records from the sensor data table."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # Fetch ordered by id descending to get the latest, then reverse in python
    cursor.execute("SELECT datetime(timestamp), temperature, humidity FROM sensor_data ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    return [{"timestamp": row[0], "temperature": row[1], "humidity": row[2]} for row in reversed(rows)]
