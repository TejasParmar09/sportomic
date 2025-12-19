import './FilterDropdown.css'

const FilterDropdown = ({ label, value, options = [], onChange, placeholder = "All" }) => {
    // Ensure options is an array
    const optionsArray = Array.isArray(options) ? options : []

    return (
        <div className="filter-dropdown">
            <label className="filter-label">{label}</label>
            <select
                className="filter-select"
                value={value || ''}
                onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
            >
                <option value="">{placeholder}</option>
                {optionsArray.map((option, index) => {
                    // Handle different option formats: venue_id, id, value, or direct value
                    const optionValue = option.venue_id !== undefined ? option.venue_id :
                        (option.value !== undefined ? option.value :
                            (option.id !== undefined ? option.id :
                                (typeof option === 'object' ? index : option)))
                    const optionLabel = option.name || option.label ||
                        (typeof option === 'string' ? option : String(optionValue))
                    return (
                        <option key={optionValue || index} value={optionValue}>
                            {optionLabel}
                        </option>
                    )
                })}
            </select>
        </div>
    )
}

export default FilterDropdown

