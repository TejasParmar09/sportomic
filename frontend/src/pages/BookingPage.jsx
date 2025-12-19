import { useState, useEffect, useRef } from 'react'
import DashboardTabs from '../components/DashboardTabs'
import FilterDropdown from '../components/FilterDropdown'
import { dashboardAPI } from '../services/api'
import './BookingPage.css'

const BookingPage = () => {
    const [bookings, setBookings] = useState([])
    const [venues, setVenues] = useState([])
    const [sports, setSports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState({
        venue_id: '',
        sport_id: '',
    })
    const debounceTimer = useRef(null)

    useEffect(() => {
        fetchVenues()
        fetchSports()
    }, [])

    // Debounced effect for filter changes
    useEffect(() => {
        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }

        // Set new timer
        debounceTimer.current = setTimeout(() => {
            fetchBookings()
        }, 300) // 300ms debounce

        // Cleanup
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    const fetchVenues = async () => {
        try {
            const response = await dashboardAPI.getVenues()
            if (response && response.data && Array.isArray(response.data)) {
                setVenues(response.data)
            } else {
                console.warn('Invalid venues response:', response)
                setVenues([])
            }
        } catch (error) {
            console.error('Error fetching venues:', error)
            setVenues([])
        }
    }

    const fetchSports = async () => {
        try {
            const response = await dashboardAPI.getSports()
            if (response && response.data && Array.isArray(response.data)) {
                setSports(response.data)
            } else {
                console.warn('Invalid sports response:', response)
                setSports([])
            }
        } catch (error) {
            console.error('Error fetching sports:', error)
            setSports([])
        }
    }

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => {
            const newFilters = { ...prev }
            // Only set filter if value is provided, otherwise remove it
            if (value && value !== '') {
                newFilters[filterName] = value
            } else {
                newFilters[filterName] = ''
            }
            return newFilters
        })
    }

    const fetchBookings = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await dashboardAPI.getBookings(filters)
            if (response && response.data) {
                setBookings(Array.isArray(response.data) ? response.data : [])
            } else {
                setBookings([])
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
            setError(error.response?.status === 429
                ? 'Too many requests. Please wait a moment.'
                : 'Failed to load bookings. Please try again.')
            setBookings([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Booking Dashboard</h1>
            </div>

            <DashboardTabs />

            <div className="dashboard-content">
                <div className="filters-section">
                    <div className="filters">
                        <FilterDropdown
                            label="All Venues"
                            value={filters.venue_id}
                            options={venues}
                            onChange={(value) => handleFilterChange('venue_id', value)}
                            placeholder="All Venues"
                        />
                        <FilterDropdown
                            label="All Sports"
                            value={filters.sport_id}
                            options={sports}
                            onChange={(value) => handleFilterChange('sport_id', value)}
                            placeholder="All Sports"
                        />
                    </div>
                </div>

                {error && (
                    <div className="error-message" style={{ marginBottom: '20px', padding: '12px', background: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
                        {error}
                        <button onClick={fetchBookings} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}>
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="loading">Loading bookings...</div>
                ) : (
                    <div className="bookings-list">
                        <h2>Bookings ({bookings.length})</h2>
                        <div className="bookings-table-container">
                            <table className="bookings-table">
                                <thead>
                                    <tr>
                                        <th>Booking ID</th>
                                        <th>Venue ID</th>
                                        <th>Member ID</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Coupon Code</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking.booking_id}>
                                            <td>{booking.booking_id}</td>
                                            <td>{booking.venue_id}</td>
                                            <td>{booking.member_id}</td>
                                            <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                                            <td>₹{booking.amount.toFixed(2)}</td>
                                            <td>
                                                <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td>{booking.coupon_code || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BookingPage

