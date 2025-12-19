import './MetricCard.css'

const MetricCard = ({ title, value, icon }) => {
    return (
        <div className="metric-card">
            <div className="metric-card-content">
                <div className="metric-title">{title}</div>
                <div className="metric-value">{value}</div>
            </div>
            {icon && <div className="metric-icon">{icon}</div>}
        </div>
    )
}

export default MetricCard

