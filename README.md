# Breathable BCN

**Date:** 2025-05-16  
**Author:** Mohamad Matar
**Tool:** Three.js (JavaScript)

---

## ✅ Dataset Chosen

**Name:** Barcelona Air Quality – Live NO₂, PM10, PM2.5  
**Source:** [Barcelona Open Data Portal](https://opendata-ajuntament.barcelona.cat/en/)  
**API Endpoint (original):**  
```
https://opendata-ajuntament.barcelona.cat/data/en/dataset/qualitat-aire
```

Due to API access limitations, a JSON snapshot was generated and used locally for prototyping:
- `public/data/airquality.json`

---

## 🔢 Data Structure

Each station in the dataset contains:
```json
{
  "station_id": "Eixample-01",
  "latitude": 41.390205,
  "longitude": 2.154007,
  "NO2": 32,
  "PM10": 14,
  "PM2_5": 9,
  "timestamp": "2025-05-14T08:00:00"
}
```

---

## 🧠 Data Processing

- Coordinates (latitude/longitude) were converted into 3D `x` and `z` positions using a simple scale.
- NO₂ values determined bar height and color (green → red gradient).
- Stations are displayed on a 3D plane using `Three.js`.

---

## 🎨 Design & Interaction

- Interactive 3D environment using Three.js and OrbitControls.
- Tooltips on hover show full air quality data per station.
- Grid and axis helpers add spatial orientation.
- 3D text "Barcelona" adds visual branding.
- Ambient and directional lighting with slight animation for visual depth.



