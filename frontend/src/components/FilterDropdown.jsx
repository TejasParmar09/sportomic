const FilterDropdown = ({ label, value, options = [], onChange, placeholder = "All" }) => {
    // Ensure options is an array
    const optionsArray = Array.isArray(options) ? options : []

    return (
        <div className="flex flex-col text-sm text-gray-700">
            <label className="mb-1 font-medium">{label}</label>
            <select
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                value={value || ''}
                onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
            >
                <option value="">{placeholder}</option>
                {optionsArray.map((option, index) => {
                    // Handle different option formats: venue_id, id, value, or direct value
                    const optionValue =
                        option.venue_id !== undefined
                            ? option.venue_id
                            : option.value !== undefined
                                ? option.value
                                : option.id !== undefined
                                    ? option.id
                                    : typeof option === 'object'
                                        ? index
                                        : option
                    const optionLabel =
                        option.name ||
                        option.label ||
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

