import { useNavigate, useLocation } from 'react-router-dom'
import './DashboardTabs.css'

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
        <div className="dashboard-tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => navigate(tab.path)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}

export default DashboardTabs

