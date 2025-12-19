import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response) {
            // Server responded with error status
            if (error.response.status === 429) {
                console.error('Rate limit exceeded. Please wait before making more requests.')
            } else if (error.response.status >= 500) {
                console.error('Server error:', error.response.status)
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response from server. Check if backend is running.')
        } else {
            // Something else happened
            console.error('Request error:', error.message)
        }
        return Promise.reject(error)
    }
)

export const dashboardAPI = {
    getStats: (filters = {}) => {
        const params = new URLSearchParams()
        if (filters.venue_id && filters.venue_id !== '') params.append('venue_id', filters.venue_id)
        if (filters.sport_id && filters.sport_id !== '') params.append('sport_id', filters.sport_id)
        if (filters.month && filters.month !== '') params.append('month', filters.month)
        if (filters.year && filters.year !== '') params.append('year', filters.year)
        if (filters.days && filters.days !== '') params.append('days', filters.days)

        const queryString = params.toString()
        return api.get(`/dashboard/stats${queryString ? '?' + queryString : ''}`)
    },

    getRevenueChart: (filters = {}) => {
        const params = new URLSearchParams()
        if (filters.venue_id && filters.venue_id !== '') params.append('venue_id', filters.venue_id)
        if (filters.sport_id && filters.sport_id !== '') params.append('sport_id', filters.sport_id)
        if (filters.days && filters.days !== '') params.append('days', filters.days)

        const queryString = params.toString()
        return api.get(`/dashboard/revenue-chart${queryString ? '?' + queryString : ''}`)
    },

    getVenues: () => {
        return api.get('/dashboard/venues')
    },

    getSports: () => {
        return api.get('/dashboard/sports')
    },

    getBookings: (filters = {}) => {
        const params = new URLSearchParams()
        if (filters.venue_id && filters.venue_id !== '') params.append('venue_id', filters.venue_id)
        if (filters.sport_id && filters.sport_id !== '') params.append('sport_id', filters.sport_id)

        const queryString = params.toString()
        return api.get(`/bookings${queryString ? '?' + queryString : ''}`)
    },

    getTransactions: (filters = {}) => {
        const params = new URLSearchParams()
        if (filters.booking_id && filters.booking_id !== '') params.append('booking_id', filters.booking_id)

        const queryString = params.toString()
        return api.get(`/transactions${queryString ? '?' + queryString : ''}`)
    },
}

export default api

