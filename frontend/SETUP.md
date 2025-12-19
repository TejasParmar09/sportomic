# Spotomic Frontend Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. The application will be available at: `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── DashboardTabs.jsx
│   │   ├── MetricCard.jsx
│   │   ├── FilterDropdown.jsx
│   │   └── RevenueChart.jsx
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx    # General dashboard
│   │   ├── BookingPage.jsx  # Booking tab
│   │   └── CoachingPage.jsx # Coaching tab
│   ├── services/            # API services
│   │   └── api.js
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Features

### Dashboard (General Tab)
- **Metrics Cards**: Displays 11 KPIs including:
  - Active/Inactive Members
  - Trial Conversion Rate
  - Coaching/Booking Revenue
  - Bookings Count
  - Slots Utilization
  - Coupon Redemption
  - Repeat Booking Rate
  - Total Revenue
  - Refunds & Disputes

- **Filters**:
  - All Venues dropdown
  - All Sports dropdown
  - Month selector
  - Year selector

- **Revenue Chart**: Interactive line chart showing revenue trends over time

### Booking Tab
- List of all bookings in a table format
- Filter by venue and sport
- Shows booking details: ID, Venue, Member, Date, Amount, Status, Coupon Code

### Coaching Tab
- Coaching-specific metrics and overview
- Revenue information

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api` by default. You can change this by setting the `VITE_API_URL` environment variable.

Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5000/api
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Technologies Used

- **React 18**: UI library
- **React Router DOM**: Client-side routing
- **Chart.js & react-chartjs-2**: Charting library for revenue visualization
- **Axios**: HTTP client for API calls
- **date-fns**: Date formatting utilities
- **Vite**: Build tool and dev server

