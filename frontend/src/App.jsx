import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import BookingPage from './pages/BookingPage'
import CoachingPage from './pages/CoachingPage'
import './App.css'

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/coaching" element={<CoachingPage />} />
            </Routes>
        </div>
    )
}

export default App

