import { useNavigate, useLocation } from 'react-router-dom'

const DashboardTabs = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const tabs = [
        { id: 'general', label: 'General', path: '/' },
        { id: 'booking', label: 'Booking', path: '/booking' },
        { id: 'coaching', label: 'Coaching', path: '/coaching' },
    ]

    const activeTab = tabs.find(tab => tab.path === location.pathname)?.id || 'general'

    return (
        <div className="mb-6 flex border-b border-gray-200 space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    onClick={() => navigate(tab.path)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}

export default DashboardTabs

