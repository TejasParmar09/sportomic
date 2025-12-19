import { useState, useEffect } from 'react'
import DashboardTabs from '../components/DashboardTabs'
import MetricCard from '../components/MetricCard'
import { dashboardAPI } from '../services/api'
import './CoachingPage.css'

const CoachingPage = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchCoachingData()
    }, [])

    const fetchCoachingData = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await dashboardAPI.getStats({})
            if (response && response.data) {
                setStats(response.data)
            } else {
                setError('No data received')
            }
        } catch (error) {
            console.error('Error fetching coaching data:', error)
            setError(error.response?.status === 429
                ? 'Too many requests. Please wait a moment and refresh.'
                : 'Failed to load coaching data. Please try again.')
            // Set default stats to show something
            setStats({
                coaching_revenue: '0.00',
                total_revenue: '0.00',
                active_members: 0,
                bookings: 0
            })
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value) => {
        return `₹${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Coaching Dashboard</h1>
            </div>

            <DashboardTabs />

            <div className="dashboard-content">
                {loading ? (
                    <div className="loading">Loading coaching data...</div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={fetchCoachingData} className="retry-button">
                            Retry
                        </button>
                    </div>
                ) : stats ? (
                    <div className="coaching-metrics">
                        <div className="metrics-grid">
                            <MetricCard
                                title="Coaching Revenue"
                                value={formatCurrency(stats.coaching_revenue)}
                            />
                            <MetricCard
                                title="Total Revenue"
                                value={formatCurrency(stats.total_revenue)}
                            />
                            <MetricCard title="Active Members" value={stats.active_members || 0} />
                            <MetricCard title="Bookings" value={stats.bookings || 0} />
                        </div>

                        <div className="coaching-info">
                            <h2>Coaching Overview</h2>
                            <p>This section provides detailed insights into coaching revenue and performance metrics.</p>
                        </div>
                    </div>
                ) : (
                    <div className="no-data">No coaching data available</div>
                )}
            </div>
        </div>
    )
}

export default CoachingPage

