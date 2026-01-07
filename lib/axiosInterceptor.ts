import axios from "axios"

const axiosInterceptor = axios.create({
  baseURL: "https://shah-plant-rental.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
})


axiosInterceptor.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
axiosInterceptor.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default axiosInterceptor
