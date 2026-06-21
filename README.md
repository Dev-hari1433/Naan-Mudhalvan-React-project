# 💎 FinLux Premium — Daily Expense Intelligence Dashboard

FinLux Premium is a next-generation, high-performance personal finance tracking dashboard built from scratch. Designed with **Glassmorphic** aesthetics and an **Intelligent Luxury** theme, it brings institutional-grade visual elegance to everyday financial management.

---

## 🚀 Key Feature Highlights

### 1. 🇮🇳 Native Indian Rupee Formatting (₹)
* Fully customized currency formatting utilizing Lakhs/Crores grouping structures (e.g., `₹1,00,000` and `₹1,00,00,000`) instead of western million/billion separations.

### 2. 🤖 Interactive AI Wealth Assistant
* An embedded, collapsible sidebar chat drawer (**Antigravity AI**) running a client-side inference engine.
* Dynamically scans active database records, budgets, and savings rates to provide:
  * **Contextual Explanations:** Explains point-deductions from the health score.
  * **Targeted Saving Tips:** Suggests specific budget limits based on your actual top expense sector.
  * **System Tutorials:** Clear interactive walkthrough guides.

### 3. 📈 Custom SVG Bento Charts
* **IPL-Style Worm Chart:** Cumulative run-rate progression graphing total inflows against total outflows over time, displaying the visual savings gap growing or shrinking.
* **Budget vs Actual Comparison Column Chart:** Interactive double columns plotting category limit thresholds next to actual spending, color-coded by safety tolerances (green/yellow/red).
* **Donut Distribution Chart:** Visual breakdown of outflow sectors with tooltips.
* **Trend Line Chart:** Detailed inflows vs outflows periodic analytics.

### 4. 🎛️ Advanced Transaction Controls
* **One-Click Record Duplication:** Instantly copy existing transactions for fast logging.
* **Bulk Checkbox Deletion:** Select multiple rows at once to perform clean database purges.
* **Filters:** Multi-criteria search filters supporting min/max monetary values.

### 5. 🩺 Algorithmic Financial Health Scoring
* Real-time calculation of overall score (0–100) factoring in budget breaches, savings rates, and debt indicators.
* Maps score directly to a **Spending Efficiency Grade** ranging from **A+** down to **F**.

---

## 🛠️ Technology Stack
* **Core Library:** React 19 (Hooks, state sync, local storage persistence).
* **Build Engine:** Vite 5 (pure JS Rollup bundler configured for Windows compiler stability).
* **Styling System:** Vanilla CSS (Glassmorphism blurs, ambient indigo dropshadows, smooth route transitions).
* **Charts Engine:** Handcrafted inline responsive SVGs (zero heavy chart library dependencies).

---

## 📥 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone or navigate to the directory:
   ```bash
   cd D:/React
   ```
2. Install the necessary node modules:
   ```bash
   npm install
   ```

### Scripts

* **Run Development Server:**
  ```bash
  npm run dev
  ```
  *Launches local hot-reload server at http://localhost:5173.*

* **Execute Arithmetic Tests:**
  ```bash
  npm run test
  ```
  *Runs calculations tests for health scoring, Indian currency groupings, and budget allocations.*

* **Build Production Bundle:**
  ```bash
  npm run build
  ```
  *Compiles assets into minified production files under the `/dist` folder.*
