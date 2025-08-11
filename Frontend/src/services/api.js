import axios from "axios";

// In a real application, this would point to your backend API
const API_BASE_URL = "http://localhost:8080/api"; // Update with your backend URL

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    if (user && user !== "undefined") {
      try {
        JSON.parse(user); // Validate JSON, but don’t use it (since no tokens)
      } catch (e) {
        console.error("Invalid user data in localStorage:", e.message);
        localStorage.removeItem("user"); // Clear invalid data
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API service functions
const apiService = {
  // Auth
  register: async (name, mobileNumber, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        mobileNumber,
        email,
        password,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  },

  login: async (mobileNumber, password) => {
    try {
      const response = await api.post("/auth/login", { mobileNumber, password });
      console.log("Full response:", response);
      console.log("Response data:", response.data);
      if (!response.data || !response.data.id || !response.data.role) {
        throw new Error("Invalid server response structure");
      }
      const user = {
        id: response.data.id,
        name: response.data.name,
        mobileNumber: response.data.mobileNumber,
        role: response.data.role,
      };
      localStorage.setItem("user", JSON.stringify(user));
      return { success: true, data: user };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

 getEmail: async ({ mobileNumber }) => {
  try {
    const response = await api.post("/auth/forgot-password/get-email", {
      mobileNumber: String(mobileNumber) // Ensure it's a string and wrapped in an object
    }, {
      headers: { "Content-Type": "application/json" }
    });
    return { success: true, email: response.data.email, userName: response.data.userName || "User" };
  } catch (error) {
    console.error("Error fetching email:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch email",
    };
  }
},

 resetPassword: async ({ email, newPassword }) => {
  try {
    const response = await api.post("/auth/forgot-password", {
      email,
      newPassword,
    }, {
      headers: { "Content-Type": "application/json" }
    });
    return { success: true, message: response.data };
  } catch (error) {
    console.error("Reset password error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || "Failed to reset password",
    };
  }
},

  logout: () => {
    localStorage.removeItem("user");
  },

  // Plans
  getPlans: async () => {
    try {
      const response = await api.get("/plans");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching plans:", error.message);
      return { success: false, error: "Failed to fetch plans" };
    }
  },

  getPlansByCategory: async (category) => {
    try {
      const response = await api.get(`/plans?category=${category}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching plans by category:", error.message);
      return { success: false, error: "Failed to fetch plans" };
    }
  },

  getPlan: async (id) => {
    try {
      const response = await api.get(`/plans/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching plan:", error.message);
      return { success: false, error: "Failed to fetch plan details" };
    }
  },

  createPlan: async (planData) => {
    try {
      const response = await api.post("/plans", planData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error creating plan:", error.message);
      return { success: false, error: "Failed to create plan" };
    }
  },

  updatePlan: async (id, planData) => {
    try {
      const response = await api.put(`/plans/${id}`, planData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating plan:", error.message);
      return { success: false, error: "Failed to update plan" };
    }
  },

  deletePlan: async (id) => {
    try {
      const response = await api.delete(`/plans/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting plan:", error.message);
      return { success: false, error: "Failed to delete plan" };
    }
  },

  // Subscribers
  getSubscribers: async () => {
    try {
      const response = await api.get("/subscribers");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching subscribers:", error.message);
      return { success: false, error: "Failed to fetch subscribers" };
    }
  },

  getExpiringSubscriptions: async (days = 3) => {
    try {
      const response = await api.get(`/subscribers/expiring?days=${days}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching expiring subscriptions:", error.message);
      return { success: false, error: "Failed to fetch expiring subscriptions" };
    }
  },

  getSubscriberByUserId: async (userId) => {
    try {
      const response = await api.get(`/subscribers/user/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching subscriber:", error.message);
      return { success: false, error: "Failed to fetch subscriber" };
    }
  },

  // Recharge History
  getRechargeHistory: async () => {
    try {
      const response = await api.get(`/recharge-history`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching recharge history:", error.message);
      return { success: false, error: "Failed to fetch recharge history" };
    }
  },

  getRechargeHistoryById: async (userId) => {
    try {
      const response = await api.get(`/recharge-history/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching recharge history:", error.message);
      return { success: false, error: "Failed to fetch recharge history" };
    }
  },

  performRecharge: async (rechargeData) => {
    try {
      const response = await api.post("/recharge", rechargeData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error performing recharge:", error.message);
      return { success: false, error: "Recharge failed" };
    }
  },
  // Dashboard Stats
getTotalSubscribers: async () => {
  try {
    const response = await api.get("/stats/total-subscribers");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching total subscribers:", error.message);
    return { success: false, error: "Failed to fetch total subscribers" };
  }
},

getMonthlyRevenue: async () => {
  try {
    const response = await api.get("/stats/monthly-revenue");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching monthly revenue:", error.message);
    return { success: false, error: "Failed to fetch monthly revenue" };
  }
},

getActivePlans: async () => {
  try {
    const response = await api.get("/stats/active-plans");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching active plans:", error.message);
    return { success: false, error: "Failed to fetch active plans" };
  }
},
};

export default apiService;