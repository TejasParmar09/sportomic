import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { format, parseISO } from 'date-fns'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const RevenueChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-dashed border-gray-200">
                <div className="flex h-80 items-center justify-center text-sm text-gray-500">
                    No data available
                </div>
            </div>
        )
    }

    // Determine date format based on number of dates
    const dateCount = data.length
    const dateFormat = dateCount > 14 ? 'dd/MM' : 'EEE dd MMM' // Shorter format for many dates

    const chartData = {
        labels: data.map(item => {
            const date = parseISO(item.date)
            return format(date, dateFormat)
        }),
        datasets: [
            {
                label: 'Revenue',
                data: data.map(item => item.revenue),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: dateCount > 30 ? 2 : 4, // Smaller points for many dates
                pointHoverRadius: 6,
                pointBackgroundColor: '#4CAF50',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    }

    // Configure x-axis to show all dates
    const xAxisConfig = {
        ticks: {
            font: {
                size: dateCount > 30 ? 9 : 10,
            },
            maxRotation: dateCount > 14 ? 90 : 45,
            minRotation: dateCount > 14 ? 90 : 45,
            autoSkip: false, // Show all labels
            maxTicksLimit: undefined, // No limit
        },
        grid: {
            display: false,
        },
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 13,
                },
                callbacks: {
                    label: function (context) {
                        return `₹${context.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        if (value >= 1000) {
                            return `₹${(value / 1000).toFixed(1)}K`
                        }
                        return `₹${value}`
                    },
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: xAxisConfig,
        },
    }

    return (
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue - Venues</h3>
            <div className="h-80">
                <Line data={chartData} options={options} />
            </div>
        </div>
    )
}

export default RevenueChart

