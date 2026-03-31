// frontend/js/apiService.js
class ApiService {
    constructor() {
        // In Docker prod: VITE_API_URL is not set so nginx proxies /api to the backend
        // In local dev:   uses http://localhost:3000/api via .env.local
        this.baseURL = import.meta.env.VITE_API_URL || '/api';
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    getHeaders(includeAuth = true) {
        const headers = { 'Content-Type': 'application/json' };
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.requireAuth !== false), // Send token by default
        };
        try {
            const response = await fetch(url, config);
            // Try parsing JSON first, handle potential non-JSON errors
            let data;
            try {
                 data = await response.json();
            } catch (jsonError) {
                 // If JSON parsing fails, throw error with status text
                 throw new Error(response.statusText || `HTTP error! status: ${response.status}`);
            }

            if (!response.ok) {
                // Use the message from the backend JSON if available
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error('API Request failed:', endpoint, error); // Log endpoint too
            // Re-throw the error so UI can catch it
            throw error;
        }
    }

    // --- Authentication ---
    async login(email, password) {
        return this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            requireAuth: false,
        });
    }

    async register(userData) {
        return this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            requireAuth: false,
        });
    }

    // --- Products ---
    async getProducts() { return this.makeRequest('/products'); }
    async getProductById(id) { return this.makeRequest(`/products/${id}`); }
    async createProduct(productData) { return this.makeRequest('/products', { method: 'POST', body: JSON.stringify(productData) }); }
    async updateProduct(id, productData) { return this.makeRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }); }
    async deleteProduct(id) { return this.makeRequest(`/products/${id}`, { method: 'DELETE' }); }

    // --- Customers ---
    async getCustomers() { return this.makeRequest('/customers'); }
    async getCustomerById(id) { return this.makeRequest(`/customers/${id}`); }
    async createCustomer(customerData) { return this.makeRequest('/customers', { method: 'POST', body: JSON.stringify(customerData) }); }
    async updateCustomer(id, customerData) { return this.makeRequest(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(customerData) }); }
    async deleteCustomer(id) { return this.makeRequest(`/customers/${id}`, { method: 'DELETE' }); }
    
    // ** CUSTOMER REPORT FUNCTION **
    async getCustomerReport(id) {
        return this.makeRequest(`/customers/${id}/report`);
    }

    // --- Sales ---
    async getSales() { return this.makeRequest('/sales'); }
    async createSale(saleData) { return this.makeRequest('/sales', { method: 'POST', body: JSON.stringify(saleData) }); }

    // ** ORDER STATUS FUNCTION **
    async updateSaleStatus(id, status) {
        return this.makeRequest(`/sales/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // ** ANALYTICS REPORT FUNCTION **
    async getFullReport() {
        return this.makeRequest('/sales/reports/full');
    }

    // This function is for the WhatsApp feature, which is complex.
    // We can comment it out for now if you are not using it.
    // async sendTemplateMessage(to, templateName, params) { 
    //     // This would require a new backend endpoint
    //     // e.g., return this.makeRequest('/whatsapp/send', { method: 'POST', body: JSON.stringify({ to, templateName, params }) });
    //     console.warn("WhatsApp feature not fully implemented in apiService.");
    // }
}

export default new ApiService();