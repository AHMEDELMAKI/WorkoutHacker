# Proposed API Improvements

This document outlines proposed improvements to the Workout Hacker API to support new features, including a comprehensive exercise library, heart rate tracking, workout suggestions, and AI-powered metrics.

## 1. Exercise Library API

To ensure the application has a scalable and maintainable list of exercises, the backend should serve as the single source of truth.

### Endpoint

`GET /exercises`

### Description

Retrieves a list of all available exercises that the app supports.

### Example Response Body

```json
[
  {
    "id": "squat",
    "name": "Squat",
    "description": "A compound, full-body exercise that trains the muscles of the thighs, hips and buttocks, quadriceps femoris muscle, hamstrings, as well as strengthening the bones, ligaments and insertion of the tendons throughout the lower body.",
    "targetMuscles": ["Quadriceps", "Glutes", "Hamstrings"],
    "videoUrl": "https://example.com/videos/squat.mp4"
  },
  {
    "id": "bench_press",
    "name": "Bench Press",
    "description": "An upper-body strength training exercise that consists of pressing a weight upwards from a supine position.",
    "targetMuscles": ["Pectoralis Major", "Triceps", "Anterior Deltoid"],
    "videoUrl": "https://example.com/videos/bench_press.mp4"
  }
]
```

### Benefit

This allows for dynamic updates to the exercise list without requiring an app update and provides a central place to manage exercise metadata like descriptions and demonstration videos.

---

## 2. Heart Rate Recording API

The application includes a module for heart rate monitoring, and this endpoint will allow the storage of this valuable data.

### Endpoint

`POST /users/{userId}/workouts/{sessionId}/heart-rate`

### Description

Allows the app to upload a series of heart rate measurements collected during a workout session.

### Example Request Body

```json
{
  "samples": [
    { "timestamp": "2026-06-10T10:01:05Z", "value": 120 },
    { "timestamp": "2026-06-10T10:01:10Z", "value": 122 },
    { "timestamp": "2026-06-10T10:01:15Z", "value": 125 }
  ]
}
```

### Benefit

Storing heart rate data enables advanced fatigue analysis, more accurate calorie burn estimation, and long-term cardiovascular health tracking for the user.

---

## 3. Workout Suggestions API

To provide more meaningful and personalized suggestions, the backend can analyze a completed workout and generate tailored feedback.

### Endpoint

`GET /users/{userId}/workouts/{sessionId}/suggestions`

### Description

Retrieves a list of suggestions for a specific workout session. This would typically be called after a workout is completed and has been processed by the backend.

### Example Response Body

```json
{
  "suggestions": [
    "Your squat depth was a bit shallow on the last set. Try to go a little lower next time to fully engage your glutes.",
    "Your heart rate was in the optimal fat-burning zone for 85% of your cardio session. Great job!",
    "Consider increasing the weight for your bench press by 2.5kg in your next session to continue progressive overload."
  ]
}
```

### Benefit

This moves the suggestion logic to the backend, allowing for more complex analysis without impacting the app's performance. It also allows for the refinement of suggestion algorithms over time.

---

## 4. AI-Powered Metrics API

The app's AI pipeline generates rich, real-time data about the user's performance. This endpoint provides a mechanism for storing this data.

### Endpoint

`POST /users/{userId}/workouts/{sessionId}/ai-metrics`

### Description

A batch endpoint to upload the AI-generated metrics collected during a workout.

### Example Request Body

```json
{
  "metrics": [
    {
      "exercise": "squat",
      "timestamp": "2026-06-10T10:05:15Z",
      "reps": 1,
      "formScore": 0.92,
      "fatigue": "LOW",
      "tempo": "2-0-1-0"
    },
    {
      "exercise": "squat",
      "timestamp": "2026-06-10T10:05:18Z",
      "reps": 2,
      "formScore": 0.91,
      "fatigue": "LOW",
      "tempo": "2-0-1-0"
    }
  ]
}
```

### Benefit

This data is extremely valuable for generating the workout suggestions mentioned above and for providing users with detailed, data-driven feedback on their form and performance over time.
