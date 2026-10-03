# Astronaut Health Monitor

A simple, clean web dashboard designed to monitor an astronaut's health status during a space mission.

## Features & Steps Implemented

- **Dark & Light Mode Switcher**: Toggle seamlessly between Dark Mode and Light Mode with theme persistence (`localStorage`).
- **Step 1: Dashboard for one astronaut**: Displays biometric profile for Commander Alex Vance (Artemis XI).
- **Step 2: 5 Health Parameters**:
  1. Heart Rate (bpm)
  2. Oxygen Level (SpO2 %)
  3. Body Temperature (°C)
  4. Sleep Duration (hrs)
  5. Exercise Time (mins)
- **Step 3: Health Status Indicator**: Live status pill displaying **Normal**, **Warning**, or **Critical**.
- **Step 4: Alert Condition**: Triggers a **CRITICAL ALERT** banner when Oxygen Level drops below **90%** (e.g. 87%).
- **Step 5: Mission-Day & Time Indicator**: Live updating mission clock (`Sol 42 • HH:MM:SS`).
- **Step 6: User-Friendly UI**: Clean layout, Chart.js real-time trend line (auto-syncing theme colors), scenario test buttons, and parameter sliders.

## How to Run

1. Open `index.html` directly in any web browser.
2. Or start the local python server:
   ```bash
   python server.py
   ```
   and visit `http://localhost:8000`.
