# 🔍 Lost and Found Portal

A modern, responsive, and full-featured **Lost and Found Portal** web application built for college campuses, schools, and local communities.

This project allows students, staff, and campus visitors to report lost or found belongings, search listings in real time with advanced category and status filters, view detailed contact information, mark items as resolved, and keep the campus organized.

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Project Folder Structure](#-project-folder-structure)
5. [Prerequisites](#-prerequisites)
6. [Step-by-Step Setup Guide (Windows)](#-step-by-step-setup-guide-windows)
7. [MongoDB Atlas Setup Guide](#-mongodb-atlas-setup-guide)
8. [Running with Visual Studio Code](#-running-with-visual-studio-code)
9. [REST API Documentation & Postman Testing](#-rest-api-documentation--postman-testing)
10. [College Project Viva & Demonstration Guide](#-college-project-viva--demonstration-guide)
11. [License](#-license)

---

## 🌟 Project Overview

On any busy college campus, students frequently misplace valuable belongings such as ID cards, laptop chargers, calculators, keys, wallets, and textbooks. 

The **Lost and Found Portal** digitizes and streamlines this recovery workflow:
- **Instant Reporting:** Quickly post lost or found items with location, date, description, and contact info.
- **Smart Filtering:** Instant search by keywords and filter by category (Electronics, Documents & IDs, Wallets, etc.), item type, and status.
- **Privacy & Contact:** Clear contact cards allow finders and owners to coordinate returns safely.
- **Reunite & Resolve:** Mark items as "Resolved" once handed over, keeping active listings clean.

---

## ✨ Key Features

1. **Attractive Live Dashboard:**
   - Real-time counter metrics: Total Reports, Lost Items, Found Items, and Resolved / Reunited Items.
   - Interactive refresh and status indicators.
2. **Report a Lost Item:**
   - Dedicated modal form with validation for item name, category, campus location, date, description, and contact details.
3. **Report a Found Item:**
   - Pre-configured found item submission flow with finder contact options.
4. **Interactive Items Feed:**
   - Glassmorphic card design with custom badges for Item Type (`LOST` / `FOUND`), Category icon, and Status (`Active` / `Resolved`).
   - Dynamic location pin and human-friendly formatted dates.
5. **Real-Time Search & Multi-Criteria Filters:**
   - Search as you type across item names, descriptions, and locations.
   - Category filtering (Electronics, Documents & IDs, Keys, Books, etc.).
   - Type filter pills (All Reports, Lost Only, Found Only).
   - Status toggle (Active, Resolved).
   - Sorting by Newest First, Oldest First, or Alphabetical.
6. **Detailed View Modal:**
   - Full description viewer with campus location badge.
   - High-contrast contact card with 1-click **Copy Contact Info** button.
   - In-modal status toggling and deletion.
7. **Resolution Workflow:**
   - Mark items as "Resolved" or "Reopened" with instant state updates.
8. **Delete Item Report:**
   - Secure deletion with confirmation modal dialog to avoid accidents.
9. **One-Click Demo Seeder:**
   - Built-in `Demo Data` button and `npm run seed` command to immediately populate realistic campus test items for viva presentations.
10. **Toast Notification System:**
    - Non-intrusive animated toast messages for user actions and system feedback.

---

## 🛠 Technology Stack

### Frontend
- **HTML5:** Semantic markup, accessibility labels, and SEO meta tags.
- **CSS3:** Custom design system with CSS custom properties (variables), deep slate aesthetic, neon glassmorphism (`backdrop-filter`), flexbox, grid, and smooth micro-animations.
- **JavaScript (ES6+):** Pure Vanilla JavaScript using `fetch` API, async/await, and event delegation. No heavy external frameworks required.
- **Typography:** Google Fonts (`Plus Jakarta Sans` & `Outfit`).

### Backend
- **Node.js:** JavaScript runtime environment.
- **Express.js:** Fast, unopinionated REST API framework.
- **CORS:** Middleware for cross-origin requests.
- **Dotenv:** Secure environment variable management.

### Database
- **MongoDB Atlas:** Cloud-hosted NoSQL MongoDB database.
- **Mongoose:** Object Data Modeling (ODM) library with schema validation and indexing.

---

## 📂 Project Folder Structure

```text
lost-and-found-portal/
│
├── models/
│   └── Item.js             # Mongoose Schema & model with validations & indexes
│
├── routes/
│   └── items.js            # REST API endpoints (GET, POST, PUT, DELETE, seed, stats)
│
├── public/
│   ├── index.html          # Semantic frontend single-page dashboard & modals
│   ├── styles.css          # Modern glassmorphism stylesheet & responsive design
│   └── app.js              # Client-side API interactions, DOM updates, & toasts
│
├── .env                    # Local environment variables (Port & MongoDB URI)
├── .env.example            # Environment template for safe Git commits
├── .gitignore              # Ignores node_modules, logs, and .env secrets
├── package.json            # Node.js project manifest & scripts
├── seed.js                 # Standalone script to populate sample campus items
├── server.js               # Express application entry point & MongoDB connection
└── README.md               # Complete project documentation
```

---

## 📋 Prerequisites

Before running the project on Windows, ensure you have:
1. **Node.js** (v16.x or higher) & **npm** installed.
   - Download from: [https://nodejs.org/](https://nodejs.org/)
   - Verify installation in Command Prompt / PowerShell:
     ```powershell
     node -v
     npm -v
     ```
2. **Visual Studio Code (VS Code)** or any code editor.
3. A **MongoDB Atlas** free account OR a locally running MongoDB instance.

---

## 🚀 Step-by-Step Setup Guide (Windows)

Follow these simple steps in Windows PowerShell or Command Prompt:

### Step 1: Open the Project Directory
```powershell
cd "c:\Users\Hi\OneDrive\Desktop\lost and found portal"
```

### Step 2: Install Node.js Dependencies
Run the install command to download all required packages:
```powershell
npm install
```

### Step 3: Configure Environment Variables
A `.env` file has been provided in the project root. Open `.env` and verify the settings:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/lost_and_found_db?retryWrites=true&w=majority
```
*(If you are using MongoDB locally, the default is `mongodb://127.0.0.1:27017/lost_and_found_db`)*.

### Step 4: Populate Sample Demo Data (Optional but Recommended)
To immediately populate realistic college items (laptop charger, student ID card, wallet, keys, notebooks):
```powershell
npm run seed
```

### Step 5: Start the Server
Start the development server:
```powershell
npm run dev
```
*Or start in production mode:*
```powershell
npm start
```

### Step 6: Access the Web Portal
Open your web browser (Google Chrome, Edge, etc.) and navigate to:
```text
http://localhost:5000
```

---

## ☁️ MongoDB Atlas Setup Guide

To store your lost and found data permanently in the cloud:

1. **Sign Up / Log In to MongoDB Atlas:**
   - Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. **Create a Free Cluster:**
   - Click **"Build a Database"**.
   - Select the **M0 Free** tier.
   - Choose a cloud provider (AWS/Google Cloud) and region closest to you.
   - Click **"Create Cluster"**.
3. **Create Database User Credentials:**
   - Under **Security** ➔ **Database Access**, click **"Add New Database User"**.
   - Choose **Password** authentication.
   - Enter a username (e.g., `admin`) and a strong password (e.g., `CollegePass123`).
   - Set user privileges to **"Read and write to any database"**.
   - Click **"Add User"**.
4. **Configure Network Access (IP Whitelist):**
   - Under **Security** ➔ **Network Access**, click **"Add IP Address"**.
   - Choose **"Allow Access from Anywhere"** (`0.0.0.0/0`) for development and testing.
   - Click **"Confirm"**.
5. **Get the Connection String:**
   - Go back to **Databases** and click **"Connect"** on your cluster.
   - Select **"Drivers"** (Node.js).
   - Copy the connection string. It looks like:
     ```text
     mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
     ```
6. **Update Your `.env` File:**
   - Replace `<password>` with your database user password.
   - Specify the database name before the `?` query string (e.g., `/lost_and_found_db`).
   - Example:
     ```env
     MONGODB_URI=mongodb+srv://admin:CollegePass123@cluster0.abcde.mongodb.net/lost_and_found_db?retryWrites=true&w=majority
     ```
7. Restart your server (`npm run dev`) and you will see:
   ```text
   ✅ Successfully connected to MongoDB Database!
   ```

---

## 💻 Running with Visual Studio Code

1. Open **VS Code**.
2. Click **File** ➔ **Open Folder...** and select `lost and found portal`.
3. Open the integrated terminal using `Ctrl + \`` (backtick) or **Terminal ➔ New Terminal**.
4. In the terminal, run:
   ```powershell
   npm install
   npm run dev
   ```
5. Click `http://localhost:5000` in the terminal to view the application in your browser.

---

## 📡 REST API Documentation & Postman Testing

All endpoints accept and return `application/json`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/items` | Retrieve all items (supports `search`, `type`, `category`, `status`, `sortBy`) |
| `GET` | `/api/items/stats` | Retrieve dashboard counts (total, lost, found, resolved, active) |
| `GET` | `/api/items/:id` | Retrieve a single item by MongoDB ObjectId |
| `POST` | `/api/items` | Report a new Lost or Found item |
| `PUT` | `/api/items/:id` | Update an existing item (e.g. resolve or edit details) |
| `DELETE` | `/api/items/:id` | Delete an item report from the database |
| `POST` | `/api/items/seed` | Seed demo campus items |
| `GET` | `/api/health` | Health check endpoint checking database connectivity |

---

### Postman Testing Examples

#### 1. Add a New Lost Item (`POST /api/items`)
- **URL:** `http://localhost:5000/api/items`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "itemName": "Casio Scientific Calculator fx-991EX",
  "itemType": "Lost",
  "category": "Electronics",
  "description": "Black calculator with silver sticker 'RK' on back cover.",
  "location": "Seminar Hall 2, Mechanical Block",
  "date": "2026-10-31",
  "contactName": "Rohan Kulkarni",
  "contactDetails": "rohan.k@college.edu | +91 94444 33221"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Lost item reported successfully!",
  "data": {
    "_id": "6724...",
    "itemName": "Casio Scientific Calculator fx-991EX",
    "itemType": "Lost",
    "status": "Active",
    "createdAt": "2026-11-01T..."
  }
}
```

#### 2. Get All Items with Filters (`GET /api/items`)
- **URL:** `http://localhost:5000/api/items?type=Lost&category=Electronics&search=Casio`
- **Method:** `GET`
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [ ... ]
}
```

#### 3. Mark Item as Resolved (`PUT /api/items/:id`)
- **URL:** `http://localhost:5000/api/items/<ITEM_ID>`
- **Method:** `PUT`
- **Body (raw JSON):**
```json
{
  "status": "Resolved"
}
```

#### 4. Delete an Item (`DELETE /api/items/:id`)
- **URL:** `http://localhost:5000/api/items/<ITEM_ID>`
- **Method:** `DELETE`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Item deleted successfully",
  "data": { "id": "<ITEM_ID>" }
}
```

---

## 🎓 College Project Viva & Demonstration Guide

If presenting this project for evaluation or viva, review these key points:

### 1. Architectural Highlights
- **Full-Stack Separation:** Clear separation of concerns between client presentation (`public/`), routing controller logic (`routes/items.js`), data models (`models/Item.js`), and server bootstrap (`server.js`).
- **RESTful API Principles:** Proper HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), semantic status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
- **Data Integrity & Validation:** Input validation both on the client (instant UI feedback) and on the server via Mongoose schema constraints (trimmed strings, enum restrictions, required fields).
- **Indexing for Performance:** MongoDB text indexes and compound indexes on `(itemType, category, status)` ensure rapid query execution even with thousands of campus records.

### 2. Common Viva Questions & Answers
- **Q: Why did you choose MongoDB over a relational SQL database?**
  - *A:* MongoDB's document-oriented JSON model naturally mirrors web application data structures, allows rapid schema iteration, and integrates seamlessly with Node.js and Mongoose.
- **Q: How does search work in the portal?**
  - *A:* The backend supports case-insensitive regex pattern matching across `itemName`, `description`, and `location`, coupled with database indexes for fast query response.
- **Q: How are database credentials protected?**
  - *A:* Credentials are saved in `.env`, which is never exposed to frontend client code and is excluded from version control via `.gitignore`.
- **Q: What is the purpose of Mongoose virtuals and timestamps?**
  - *A:* Mongoose timestamps automatically handle `createdAt` and `updatedAt` fields without manual date handling in each route.

---

## 📄 License

This project is created for educational and academic mini-project purposes under the **MIT License**.
