import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import BookingPage from './pages/BookingPage'
import CoachingPage from './pages/CoachingPage'

function App() {
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/coaching" element={<CoachingPage />} />
            </Routes>
        </div>
    )
}

export default App

