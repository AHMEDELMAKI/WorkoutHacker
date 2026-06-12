# Workout Hacker AI - Production Ready Fitness Platform

Workout Hacker AI is an advanced fitness ecosystem designed for Android that leverages AI-driven coaching, real-time fatigue monitoring, and motion analysis to optimize resistance training. It combines a high-performance React Native mobile app with a Node.js/Prisma backend and integrated IoT sensor support.

## 🚀 Core Features

*   **AI Coach & Workout Planner:** Personalized training plans and real-time coaching powered by Google Gemini AI.
*   **Advanced Fatigue Assessment:** Hybrid fatigue monitoring system using:
    *   **EMG (Electromyography):** Real-time muscle activation data from ESP32 wearable sensors.
    *   **PPG (Photoplethysmography):** Camera-based heart rate monitoring.
    *   **Barbell Velocity:** IMU-based movement tracking to detect performance drops.
*   **Intelligent Exercise Tracking:** Automated rep counting and form analysis using specialized ML models (Random Forest, Pose Landmarks).
*   **Voice Control:** Hands-free operation via a local Voice Assistant (powered by Vosk).
*   **Unified Dashboard:** Comprehensive progress tracking, analytics, and recovery recommendations.

## 🏗️ Project Architecture

The repository is organized into several key modules:

*   **/ (Root):** React Native Mobile App (`WorkoutHackerV2`).
*   **backend/:** Express.js server with Prisma ORM and Gemini AI integration.
*   **core/:** Shared workout planning logic for both client and server.
*   **ESP-connection-main/:** WiFi/Bluetooth bridge for ESP32 sensor integration.
*   **Fatigue-with-HeartRate-main/:** The "Fitness Fatigue System" engine for signal fusion and assessment.
*   **react-native-workout-planner-main/:** Modularized workout planning component.

## 🛠️ Tech Stack

### Frontend (Mobile)
*   **Framework:** React Native (TypeScript)
*   **State Management:** Zustand
*   **Navigation:** React Navigation
*   **Sensors:** Vision Camera (PPG), Wifi LE (EMG), Accelerometer/IMU.
*   **ML Integration:** Custom JSI modules for Random Forest and Pose Landmark detection.

### Backend
*   **Environment:** Node.js, Express.js
*   **Database:** Prisma (PostgreSQL recommended)
*   **AI:** Google Generative AI (Gemini Pro)
*   **Auth:** JWT with Secure Storage (Keychain/EncryptedSharedPreferences)

### IoT / ML
*   **Sensors:** ESP32 with EMG and IMU sensors.
*   **Voice:** Vosk (Local offline Speech-to-Text).

## 🚦 Getting Started

### Prerequisites
*   Node.js (>= 22.11.0)
*   Java Development Kit (JDK 17+)
*   Android Studio & SDK
*   Physical Android Device (for sensor-based features)

### ☁️ Backend Configuration
By default, the app is configured to connect to the production cloud backend at `https://gymhacker.onrender.com`. **Setting up the local backend is not required to run or test the mobile app.**

### Mobile App Setup
1.  Install dependencies:
    ```sh
    npm install
    ```
2.  Start the Metro Bundler:
    ```sh
    npm start
    ```
3.  Run on Android:
    ```sh
    npm run android
    ```

### 🛠️ Local Backend Setup (Optional)
The `backend/` directory contains a local version of the API used for development and testing.
1.  Navigate to the backend directory:
    ```sh
    cd backend
    npm install
    ```
2.  Configure your `.env` file (see `.env.example`).
3.  Initialize the database:
    ```sh
    npm run prisma:generate
    npm run prisma:migrate dev
    ```
4.  Start the development server:
    ```sh
    npm run dev
    ```

## 📖 Documentation & Guides

For more detailed information, please refer to the documents in the `readme_files/` directory:

*   **[Backend Requirements](readme_files/BACKEND_REQUIREMENTS.md):** Detailed API specification.
*   **[Fatigue System Guide](Fatigue-with-HeartRate-main/IMPLEMENTATION_GUIDE.md):** Architecture of the fatigue engine.
*   **[Vosk Setup](readme_files/VOSK_SETUP.md):** Voice assistant configuration.
*   **[WiFi Integration](readme_files/WIFI_INTEGRATION_GUIDE.md):** Connecting ESP32 sensors.
*   **[Refactoring Summary](readme_files/REFACTORING_SUMMARY.md):** Overview of recent architectural improvements.

## ⚖️ License
This project is licensed under the MIT License.
