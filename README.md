# Savings App - Spending Tracker

A minimalistic React web application for tracking your spending with categories, amounts, and notes.

## Features

- **Add Spending**: Add new expenses with category, amount, currency, and optional notes
- **Categories**: Choose from General, Personal, Auto, or House
- **Currency Support**: Toggle between MXN and USD
- **Notes**: Add optional notes (max 140 characters)
- **Spending List**: View all your recorded expenses

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and go to `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Technologies Used

- React 18
- Vite
- Vanilla CSS (no external CSS frameworks)

## Usage

1. Select a category from the dropdown (General, Personal, Auto, House)
2. Enter the amount (numbers only, $ symbol is automatically added)
3. Toggle between MXN and USD currency
4. Optionally add a note (up to 140 characters)
5. Click "Add Spending" to save
6. View your spending list below the form 