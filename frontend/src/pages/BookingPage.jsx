import { useState, useEffect, useRef } from 'react'
import DashboardTabs from '../components/DashboardTabs'
import FilterDropdown from '../components/FilterDropdown'
import { dashboardAPI } from '../services/api'

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
        <div className="px-3 py-6 sm:px-4 lg:px-6 max-w-7xl mx-auto">
            <div className="mb-6 border-b border-gray-200 pb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Booking Dashboard</h1>
            </div>

            <DashboardTabs />

            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg flex items-center justify-between">
                        <span className="text-sm">{error}</span>
                        <button
                            onClick={fetchBookings}
                            className="ml-4 inline-flex items-center rounded-md bg-yellow-600 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-700"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-500" />
                        <span className="ml-3 text-sm text-gray-600">Loading bookings...</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Bookings <span className="text-sm font-normal text-gray-500">({bookings.length})</span>
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Booking ID</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Venue ID</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Member ID</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Date</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Amount</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Coupon Code</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bookings.map((booking) => (
                                        <tr key={booking.booking_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 whitespace-nowrap">{booking.booking_id}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{booking.venue_id}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{booking.member_id}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                {new Date(booking.booking_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                ₹{booking.amount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${booking.status.toLowerCase() === 'confirmed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : booking.status.toLowerCase() === 'completed'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : booking.status.toLowerCase() === 'cancelled'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">{booking.coupon_code || '-'}</td>
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

