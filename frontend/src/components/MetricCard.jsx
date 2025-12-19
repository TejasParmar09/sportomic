const MetricCard = ({ title, value, icon }) => {
    return (
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
            </div>
            {icon && (
                <div className="ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                    {icon}
                </div>
            )}
        </div>
    )
}

export default MetricCard

