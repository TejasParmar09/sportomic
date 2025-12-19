import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardTabs from '../components/DashboardTabs'
import MetricCard from '../components/MetricCard'
import FilterDropdown from '../components/FilterDropdown'
import RevenueChart from '../components/RevenueChart'
import { dashboardAPI } from '../services/api'

const Dashboard = () => {
    const [stats, setStats] = useState(null)
    const [revenueData, setRevenueData] = useState([])
    const [venues, setVenues] = useState([])
    const [sports, setSports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState({
        venue_id: '',
        sport_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        days: 30,
    })
    const debounceTimer = useRef(null)

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

    const fetchDashboardData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [statsResponse, chartResponse] = await Promise.allSettled([
                dashboardAPI.getStats(filters),
                dashboardAPI.getRevenueChart(filters),
            ])

            // Handle stats response
            if (statsResponse.status === 'fulfilled' && statsResponse.value?.data) {
                setStats(statsResponse.value.data)
            } else if (statsResponse.status === 'rejected') {
                console.error('Error fetching stats:', statsResponse.reason)
                if (statsResponse.reason?.response?.status === 429) {
                    setError('Too many requests. Please wait a moment.')
                }
            }

            // Handle chart response
            if (chartResponse.status === 'fulfilled' && chartResponse.value?.data) {
                setRevenueData(Array.isArray(chartResponse.value.data) ? chartResponse.value.data : [])
            } else if (chartResponse.status === 'rejected') {
                console.error('Error fetching revenue chart:', chartResponse.reason)
            }
        } catch (error) {
            console.error('Unexpected error fetching dashboard data:', error)
            setError('Failed to load dashboard data. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [filters])

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
            fetchDashboardData()
        }, 300) // 300ms debounce

        // Cleanup
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current)
            }
        }
    }, [filters, fetchDashboardData])

    const formatCurrency = (value) => {
        return `₹${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    }

    const formatPercentage = (value) => {
        return `${parseFloat(value || 0).toFixed(2)}%`
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


    return (
        <div className="px-3 py-6 sm:px-4 lg:px-6 max-w-7xl mx-auto">
            <div className="mb-6 border-b border-gray-200 pb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
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
                            onClick={fetchDashboardData}
                            className="ml-4 inline-flex items-center rounded-md bg-yellow-600 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-700"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading && !stats && (
                    <div className="flex items-center justify-center py-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-500" />
                        <span className="ml-3 text-sm text-gray-600">Loading...</span>
                    </div>
                )}

                {stats && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <MetricCard title="Active Members" value={stats.active_members || 0} />
                            <MetricCard title="Inactive Members" value={stats.inactive_members || 0} />
                            <MetricCard
                                title="Trial Conversion Rate"
                                value={formatPercentage(stats.trial_conversion_rate)}
                            />
                            <MetricCard
                                title="Coaching Revenue"
                                value={formatCurrency(stats.coaching_revenue)}
                            />
                            <MetricCard title="Bookings" value={stats.bookings || 0} />
                            <MetricCard
                                title="Booking Revenue"
                                value={formatCurrency(stats.booking_revenue)}
                            />
                            <MetricCard
                                title="Slots Utilization"
                                value={formatPercentage(stats.slots_utilization)}
                            />
                            <MetricCard title="Coupon Redemption" value={stats.coupon_redemption || 0} />
                            <MetricCard
                                title="Repeat Booking"
                                value={formatPercentage(stats.repeat_booking)}
                            />
                            <MetricCard
                                title="Total Revenue"
                                value={formatCurrency(stats.total_revenue)}
                            />
                            <MetricCard title="Refunds & Disputes" value={stats.refunds_disputes || 0} />
                        </div>

                        <RevenueChart data={revenueData} />
                    </>
                )}
            </div>
        </div>
    )
}

export default Dashboard

