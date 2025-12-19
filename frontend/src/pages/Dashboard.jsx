import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardTabs from '../components/DashboardTabs'
import MetricCard from '../components/MetricCard'
import FilterDropdown from '../components/FilterDropdown'
import RevenueChart from '../components/RevenueChart'
import { dashboardAPI } from '../services/api'
import './Dashboard.css'

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


    if (loading && !stats) {
        return (
            <div className="dashboard-container">
                <div className="loading">Loading...</div>
            </div>
        )
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
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
                        <button onClick={fetchDashboardData} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}>
                            Retry
                        </button>
                    </div>
                )}

                {stats && (
                    <>
                        <div className="metrics-grid">
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

