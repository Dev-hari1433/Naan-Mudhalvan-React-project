# 💎 FinLux Premium — Daily Expense Intelligence Dashboard

FinLux Premium is a next-generation, high-performance personal finance tracking dashboard built from scratch. Designed with **Glassmorphic** aesthetics and an **Intelligent Luxury** theme, it brings institutional-grade visual elegance to everyday financial management.

---

## 🚀 Key Feature Highlights

### 1. 🇮🇳 Native Indian Rupee Formatting (₹)
* Fully customized currency formatting utilizing Lakhs/Crores grouping structures (e.g., `₹1,00,000` and `₹1,00,00,000`) instead of Western million/billion separations.

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
* **Build Engine:** Vite 5 (Fast, JS-based Rollup bundler).
* **Styling System:** Vanilla CSS (Glassmorphism blurs, ambient indigo dropshadows, smooth route transitions).
* **Charts Engine:** Handcrafted inline responsive SVGs (zero heavy chart library dependencies).

---

## 📥 Installation & Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) and npm installed.

### 1. Clone the Repository
Clone this repository to your local machine using Git:
```bash
git clone https://github.com/Dev-hari1433/Naan-Mudhalvan-React-project.git
```

### 2. Navigate to Directory
```bash
cd Naan-Mudhalvan-React-project
```

### 3. Install Dependencies
```bash
npm install
```

---

## 💻 Usage & Scripts

Run these scripts from the project root directory:

### Run Development Server
```bash
npm run dev
```
Starts the local development server at `http://localhost:5173`. Open this URL in your web browser to interact with the dashboard.

### Execute Arithmetic Tests
```bash
npm run test
```
Runs the test suite verifying core calculations for health scoring, Indian currency groupings, and budget allocations.

### Build Production Bundle
```bash
npm run build
```
Compiles and minifies the assets into production-ready files in the `/dist` directory.
