# Overtime Calculator

A web application for recording and calculating work overtime hours, allowing users to track daily and monthly balances, as well as set goals and generate forecasts.

---

## 🔗 Demo

Access the live project: [overtime-calculator.odutra.com](https://overtime-calculator.odutra.com/)

---

## 🚀 Features

* **Day Registration**: Add clock-in and clock-out times for two daily periods, and mark holidays.
* **Overtime Calculation**:

  * Displays daily hour balances (positive and negative).
  * Automatically sums total overtime hours across all months and for the selected month.
* **Hour Goals**:

  * Set a goal in hours.
  * Store the goal in the browser and display its completion status.
  * Show forecasts estimating how many days remain to reach the goal at different daily paces.
* **Charts**: Visualize the distribution of overtime hours per month using pie charts.
* **Export/Import**:

  * Export recorded data to a JSON file.
  * Import a JSON file to restore or share your records.

---

## 🛠 Technologies

* **React** with **TypeScript**
* **Material UI** for UI components
* **Recharts** for interactive charts
* **localStorage** for client-side data persistence

---

## ⚙️ Installation & Local Development

1. Clone this repository:

   ```bash
   git clone https://github.com/odutradev/calculadora-de-horas.git
   cd calculadora-de-horas
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the development server:

   ```bash
   npm start
   ```
4. Open [http://localhost:7100](http://localhost:7100) in your browser.

---

## 👤 Author

**João Dutra** ([odutradev](https://github.com/odutradev))

## 📄 License

This project is licensed under the [MIT License](LICENSE).