# YieldSim: Climate-Based Crop Yield Decision Support System
<img width="1351" height="539" alt="image" src="https://github.com/user-attachments/assets/2a9927be-abe7-41f7-8416-280d7288541b" />

---

## Overview

**YieldSim DSS** is a Decision Support System (DSS) designed to analyze climate conditions and simulate their impact on crop yield.

The system helps users understand how environmental factors such as temperature, rainfall, and humidity influence agricultural productivity and supports data-driven farming decisions.
It is a web application built to simulate and analyze the impact of climate conditions on agricultural crop yields. It's designed to help farmers, agronomists, and agricultural planners make data-driven decisions — answering questions like "What yield should I expect from wheat if temperatures rise 3°C?" or "Which crop is best suited to my current soil and rainfall conditions?"
The system is model-driven and data-driven, combining a real dataset of 10,000 historical records (1990–2024) with a rule-based prediction engine to produce yield estimates, risk assessments, and adaptive recommendations.

---

## Key Features

🗂️ **Dashboard Overview** — KPI cards + monthly temperature and rainfall charts

🌡️ **Climate Analysis** — Sliders for temp, rainfall, sunlight, CO₂; instant yield preview for 4 crops

🌾 **Crop Yield Prediction** — 6-parameter input → predicted yield (MT/ha), confidence, status, and recommendation

🌩️ **Climate Simulation** — Scenario builder with delta changes to see yield impact vs. a 2.4 MT/ha baseline

🏆 **Crop Recommendation** — Ranks all 10 crops by suitability for given conditions

⚠️ **Risk Alerts** — Flags heat stress, low rainfall, poor soil health, and low irrigation

📊 **Data Visualization** — Heatmap, scatter plots, bar charts, and pie chart

📄 **PDF Report Export** — One-click formatted report with full session data

---

## How It Works

1.  **Data Layer** — 10,000 records (1990–2024) loaded from a CSV via `/api/climate-data`;
   pre-aggregated stats served instantly from `lib/dataset.ts`

2.  **Prediction Model** — Multiplicative factor model: base crop yield × temperature
   × precipitation × CO₂ × soil × fertilizer × irrigation factors → clamped to 0.5–4.5 MT/ha

3.  **Simulation Engine** — Applies delta changes (temp, rain, CO₂) to a 2.4 MT/ha
   baseline using linear weights → returns simulated yield + % change

4.  **UI Flow** — Single-page dashboard with collapsible sidebar; state managed via
   React hooks; report context accumulates session data for export

5.  **Report Generation** — jsPDF builds a multi-page PDF with styled headers,
   metric tables, historical records, and country-level yield summaries 
---

##  Tech Stack

- ⚡ **Framework** — Next.js 16 (App Router) + React 19
- 🔷 **Language** — TypeScript
- 🎨 **Styling** — Tailwind CSS v4
- 🧩 **UI Components** — shadcn/ui + Radix UI
- 📊 **Charts** — Recharts v2.15
- 🖼️ **Icons** — Lucide React
- 📄 **PDF Export** — jsPDF + jspdf-autotable
- 🔌 **API** — Next.js API Route + csv-parse
- 🐍 **Python Utility** — generate_charts.py (offline use)


---

## Author

Developed by: *Tanisha Kadam*

---
## License

This project is licensed under the [MIT License](LICENSE).  



