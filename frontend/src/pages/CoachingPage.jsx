import { useState, useEffect } from 'react'
import DashboardTabs from '../components/DashboardTabs'
import MetricCard from '../components/MetricCard'
import { dashboardAPI } from '../services/api'

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
        <div className="px-3 py-6 sm:px-4 lg:px-6 max-w-7xl mx-auto">
            <div className="mb-6 border-b border-gray-200 pb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Coaching Dashboard</h1>
            </div>

            <DashboardTabs />

            <div className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-500" />
                        <span className="ml-3 text-sm text-gray-600">Loading coaching data...</span>
                    </div>
                ) : error ? (
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg flex items-center justify-between">
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={fetchCoachingData}
                            className="ml-4 inline-flex items-center rounded-md bg-yellow-600 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : stats ? (
                    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

                        <div className="mt-8 border-t border-gray-100 pt-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Coaching Overview</h2>
                            <p className="text-sm text-gray-600">
                                This section provides detailed insights into coaching revenue and performance metrics.
                            </p>
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

