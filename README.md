# OptiManager

OptiManager is a modern, full-stack web application for managing optical stores. It includes inventory tracking, customer management, sales processing with a Point of Sale (POS) interface, and an analytics dashboard.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your system:

* **Node.js** (v14 or higher recommended) & **npm**
* **MySQL Server** (Running and accessible)
* **Git**

### 🛠️ Installation Steps

1.  **Clone the Repository**
    Open your terminal and run:
    ```bash
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git)
    cd YOUR_REPOSITORY_NAME
    ```
    *(Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub details)*

2.  **Database Setup**
    * Open your MySQL client (e.g., phpMyAdmin, MySQL Workbench).
    * Create a new database named `optimanager`.
    * Import the `database_schema.sql` file located in the root directory of this project into your new database.

3.  **Backend Setup**
    * Navigate to the backend directory:
        ```bash
        cd backend
        ```
    * Install dependencies:
        ```bash
        npm install
        ```
    * Configure environment variables:
        * Rename `.env.example` to `.env` (if you provided an example file) OR create a new `.env` file in the `backend` directory.
        * Add your database credentials and a secure JWT secret:
            ```env
            DB_HOST=localhost
            DB_USER=root
            DB_PASSWORD=your_password
            DB_NAME=optimanager
            JWT_SECRET=your_super_secret_key_here
            PORT=3000
            ```

4.  **Start the Server**
    * While still in the `backend` directory, run:
        ```bash
        npm start
        ```
    * You should see: `Server is running on http://localhost:3000` and `Successfully connected to the database.`

5.  **Frontend Setup**
    * Open a new terminal window.
    * Navigate to the project root, then to the frontend folder:
        ```bash
        cd frontend
        ```
    * Serve the frontend. You can use a simple HTTP server like `live-server` (if installed globally) or open the `index.html` file directly with an extension like **Live Server** in VS Code.
        * *Note: Ensure your frontend is running on a different port than your backend (e.g., port 5500).*

6.  **Access the Application**
    * Open your browser and go to your frontend URL (e.g., `http://127.0.0.1:5500`).
    * **Initial Admin Login:** You will need to manually insert an admin user into your `users` database table to log in for the first time, or use the registration page if you've enabled it.

## ✨ Key Features

* **Role-Based Access:** Secure Admin and Employee dashboards.
* **Point of Sale (POS):** streamlined sales process with cart management.
* **Inventory Management:** Track stock, purchase rates, and product details.
* **Customer Management:** Detailed profiles with prescription history.
* **Analytics Dashboard:** Visual reports on sales and revenue.
* **Modern UI:** Clean, responsive dark/light mode interface.
