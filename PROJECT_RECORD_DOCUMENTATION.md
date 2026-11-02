# VIGNAN'S FOUNDATION FOR SCIENCE, TECHNOLOGY & RESEARCH
### (Deemed to be University) - Estd. u/s 3 of UGC Act 1956

---

**Course Code:** 24CS810  
**Course Name:** Modern Front-End Frameworks and SPA Development  

**NAME OF STUDENT:** ___________________________  
**REGD NO:** ___________________________  
**SECTION:** ___________________________  
**PROJECT TITLE:** Campus Lost and Found Portal  
**FACULTY SIGNATURE:** ___________________________  

---

### AIM:
To develop a full stack web application for a **Campus Lost and Found Portal** using Node.js, Express.js, MongoDB Atlas, and modern JavaScript that allows students and campus staff to report, browse, search, update, and resolve lost and found belongings, communicating with a RESTful API and persistent cloud database, deployed live on Render.

---

### SOFTWARE REQUIREMENTS:
- **Operating System:** Windows 10/11
- **Frontend:** HTML5, CSS3, Modern JavaScript (ES6+, DOM Manipulation, Async/Await Fetch API)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (MongoDB Atlas Cloud Cluster)
- **ODM Library:** Mongoose
- **Version Control & Repository:** Git, GitHub CLI, GitHub
- **Deployment & Cloud Hosting:** Render (Web Service)
- **Code Editor:** Visual Studio Code / Antigravity IDE
- **Web Browser:** Google Chrome
- **Package Manager:** npm

---

### OBJECTIVE:
1. To design and implement a full-stack client-server architecture with REST API endpoints for complete CRUD operations (Create, Read, Update, Delete).
2. To integrate cloud-native MongoDB Atlas database storage with Mongoose schemas, text indices, and validation.
3. To provide an intuitive, responsive, single-page interface with live search, category filtering, stats counter, status updates, and interactive modal dialogs.
4. To implement version control using Git/GitHub and achieve continuous deployment to a public production URL on Render.

---

### PROJECT STRUCTURE:
```text
lost-and-found-portal/
├── models/
│   └── Item.js              # Mongoose Schema & Validation for Lost/Found items
├── routes/
│   └── items.js             # REST API router (CRUD, search, stats, filter)
├── public/
│   ├── index.html           # Single Page Application HTML structure
│   ├── styles.css           # Modern responsive design & theme styling
│   └── app.js               # Frontend controller, Fetch API client & UI interactions
├── .env                     # Environment variables (PORT, MONGODB_URI)
├── .env.example             # Example environment file template
├── .gitignore               # Ignored files (node_modules, .env)
├── package.json             # Project dependencies & scripts
├── seed.js                  # Database seeding script for sample demo data
└── server.js                # Express application entry point & DB connection
```

---

### SOURCE CODE:

#### BACKEND

##### 1. `server.js`
```javascript
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lost_and_found_db';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/items', itemsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.status(200).json({
    status: 'online',
    timestamp: new Date(),
    database: states[dbState] || 'Unknown',
    uptime: process.uptime()
  });
});

// Database Connection & Server Initialization
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB Database!');

    app.listen(PORT, () => {
      console.log(`Server is running live on: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    app.listen(PORT, () => {
      console.log(`Server started in fallback mode on port ${PORT}`);
    });
  }
}

startServer();
```

##### 2. `models/Item.js`
```javascript
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    itemType: {
      type: String,
      required: [true, 'Item type is required'],
      enum: {
        values: ['Lost', 'Found'],
        message: 'Item type must be either Lost or Found'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Electronics',
          'Documents & IDs',
          'Wallets & Bags',
          'Keys',
          'Books & Stationery',
          'Clothing & Accessories',
          'Other'
        ],
        message: 'Please select a valid category'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters']
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    contactName: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
      maxlength: [100, 'Contact name cannot exceed 100 characters']
    },
    contactDetails: {
      type: String,
      required: [true, 'Contact details are required'],
      trim: true,
      maxlength: [150, 'Contact details cannot exceed 150 characters']
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

itemSchema.index({ itemName: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);
```

##### 3. `routes/items.js`
```javascript
const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// GET /api/items - Fetch all items with search & filters
router.get('/', async (req, res) => {
  try {
    const { search, type, category, status } = req.query;
    const query = {};

    if (type && ['Lost', 'Found'].includes(type)) query.itemType = type;
    if (category && category !== 'All') query.category = category;
    if (status && ['Active', 'Resolved'].includes(status)) query.status = status;

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { itemName: { $regex: regex } },
        { description: { $regex: regex } },
        { location: { $regex: regex } }
      ];
    }

    const items = await Item.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/items/stats - Summary counts
router.get('/stats', async (req, res) => {
  try {
    const total = await Item.countDocuments();
    const lost = await Item.countDocuments({ itemType: 'Lost' });
    const found = await Item.countDocuments({ itemType: 'Found' });
    const resolved = await Item.countDocuments({ status: 'Resolved' });
    res.status(200).json({ success: true, stats: { total, lost, found, resolved } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/items - Report a new Lost/Found item
router.post('/', async (req, res) => {
  try {
    const newItem = await Item.create(req.body);
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/items/:id/status - Update item status (Resolved / Active)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const item = await Item.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/items/:id - Remove an item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
```

##### 4. `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://venkatathanmaie26_db_user:7sXoDVmYjCbw52Jr@cluster0.or7008q.mongodb.net/lost_and_found_db?retryWrites=true&w=majority
```

---

#### FRONTEND

##### 1. `public/index.html` (Core Structure)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campus Lost & Found Portal</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Header / Navigation -->
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <span class="logo-icon">🔍</span>
        <h1>Campus Lost & Found</h1>
      </div>
      <button id="report-btn" class="btn btn-primary">+ Report an Item</button>
    </div>
  </header>

  <!-- Statistics Dashboard -->
  <section class="stats-section">
    <div class="stat-card"><span class="stat-num" id="stat-total">0</span><span class="stat-label">Total Reports</span></div>
    <div class="stat-card stat-lost"><span class="stat-num" id="stat-lost">0</span><span class="stat-label">Lost Items</span></div>
    <div class="stat-card stat-found"><span class="stat-num" id="stat-found">0</span><span class="stat-label">Found Items</span></div>
    <div class="stat-card stat-resolved"><span class="stat-num" id="stat-resolved">0</span><span class="stat-label">Reunited / Resolved</span></div>
  </section>

  <!-- Search & Filter Controls -->
  <section class="filter-section">
    <input type="text" id="search-input" placeholder="Search by item name, description, location...">
    <select id="filter-type">
      <option value="All">All Types</option>
      <option value="Lost">Lost Only</option>
      <option value="Found">Found Only</option>
    </select>
    <select id="filter-category">
      <option value="All">All Categories</option>
      <option value="Electronics">Electronics</option>
      <option value="Documents & IDs">Documents & IDs</option>
      <option value="Wallets & Bags">Wallets & Bags</option>
      <option value="Keys">Keys</option>
      <option value="Books & Stationery">Books & Stationery</option>
      <option value="Clothing & Accessories">Clothing & Accessories</option>
      <option value="Other">Other</option>
    </select>
  </section>

  <!-- Items Feed Grid -->
  <main class="items-grid" id="items-container">
    <!-- Populated dynamically via app.js -->
  </main>

  <script src="app.js"></script>
</body>
</html>
```

##### 2. `public/app.js` (Client-Side Controller)
```javascript
const API_URL = '/api/items';

// DOM Elements
const itemsContainer = document.getElementById('items-container');
const searchInput = document.getElementById('search-input');
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');

// Fetch and Render Items
async function loadItems() {
  try {
    const params = new URLSearchParams();
    if (searchInput.value) params.append('search', searchInput.value.trim());
    if (filterType.value !== 'All') params.append('type', filterType.value);
    if (filterCategory.value !== 'All') params.append('category', filterCategory.value);

    const res = await fetch(`${API_URL}?${params.toString()}`);
    const result = await res.json();
    renderCards(result.data || []);
    loadStats();
  } catch (err) {
    console.error('Failed to load items:', err);
  }
}

// Render Item Cards
function renderCards(items) {
  if (items.length === 0) {
    itemsContainer.innerHTML = '<div class="empty-state">No matching items found.</div>';
    return;
  }

  itemsContainer.innerHTML = items.map(item => `
    <div class="card ${item.itemType.toLowerCase()}">
      <div class="card-header">
        <span class="badge ${item.itemType.toLowerCase()}">${item.itemType}</span>
        <span class="badge category">${item.category}</span>
        <span class="status ${item.status.toLowerCase()}">${item.status}</span>
      </div>
      <h3>${item.itemName}</h3>
      <p class="desc">${item.description}</p>
      <div class="meta">
        <span>📍 ${item.location}</span>
        <span>📅 ${new Date(item.date).toLocaleDateString()}</span>
      </div>
      <div class="contact">
        <strong>Contact:</strong> ${item.contactName} (${item.contactDetails})
      </div>
      <div class="actions">
        ${item.status === 'Active' 
          ? `<button onclick="updateStatus('${item._id}', 'Resolved')">Mark Reunited</button>` 
          : `<button onclick="updateStatus('${item._id}', 'Active')">Reopen</button>`}
        <button class="btn-delete" onclick="deleteItem('${item._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// Load Summary Stats
async function loadStats() {
  try {
    const res = await fetch(`${API_URL}/stats`);
    const data = await res.json();
    if (data.success) {
      document.getElementById('stat-total').innerText = data.stats.total;
      document.getElementById('stat-lost').innerText = data.stats.lost;
      document.getElementById('stat-found').innerText = data.stats.found;
      document.getElementById('stat-resolved').innerText = data.stats.resolved;
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err);
  }
}

// Update Item Status
async function updateStatus(id, newStatus) {
  await fetch(`${API_URL}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  loadItems();
}

// Delete Item
async function deleteItem(id) {
  if (confirm('Are you sure you want to delete this record?')) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadItems();
  }
}

// Event Listeners
searchInput.addEventListener('input', loadItems);
filterType.addEventListener('change', loadItems);
filterCategory.addEventListener('change', loadItems);

window.addEventListener('DOMContentLoaded', loadItems);
```

##### 3. `public/styles.css` (Extract)
```css
:root {
  --primary: #4f46e5;
  --lost-color: #ef4444;
  --found-color: #10b981;
  --background: #f8fafc;
  --card-bg: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border: #e2e8f0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--background);
  color: var(--text-main);
  margin: 0;
  padding: 0;
}

.header {
  background: #ffffff;
  border-bottom: 1px solid var(--border);
  padding: 1rem 2rem;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.stat-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  text-align: center;
}

.stat-num { font-size: 2rem; font-weight: bold; display: block; }
.stat-lost .stat-num { color: var(--lost-color); }
.stat-found .stat-num { color: var(--found-color); }

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto 3rem;
  padding: 0 1rem;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
```

---

### STEPS TO RUN THE PROJECT:

#### Local Setup & Execution:
1. Open a terminal in the project directory (`lost and found portal`).
2. Install all dependencies:
   ```powershell
   npm install
   ```
3. Create your `.env` configuration file with your MongoDB connection:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/lost_and_found_db?retryWrites=true&w=majority
   ```
4. Populate demo records into MongoDB Atlas:
   ```powershell
   npm run seed
   ```
5. Start the development server:
   ```powershell
   npm run dev
   ```
   *(or `npm start`)*
6. Open your web browser and navigate to:
   ```text
   http://localhost:5000
   ```

#### Cloud Deployment (Render & GitHub):
1. Push your latest code changes to GitHub:
   ```powershell
   git add .
   git commit -m "Deploy Lost and Found Portal"
   git push
   ```
2. In [Render Dashboard](https://dashboard.render.com), connect your GitHub repository `venkatathanmaie26-hue/lost-and-found-portal`.
3. Set the Build Command to `npm install` and Start Command to `npm start`.
4. Add the `MONGODB_URI` environment variable with your MongoDB Atlas connection string.
5. Click **Deploy Web Service**.

---

### OUTPUT:

#### 1. Live Deployment & Repository Links
- **GitHub Repository:** [https://github.com/venkatathanmaie26-hue/lost-and-found-portal](https://github.com/venkatathanmaie26-hue/lost-and-found-portal)
- **Live Hosted Application:** [https://lost-and-found-portal-a9t1.onrender.com](https://lost-and-found-portal-a9t1.onrender.com)
- **Live API Health Check:** [https://lost-and-found-portal-a9t1.onrender.com/api/health](https://lost-and-found-portal-a9t1.onrender.com/api/health)

#### 2. Screenshots:
- **[Insert Screenshot 1: Campus Lost & Found Home Page with Live Stats Counter]**  
  *(Take a screenshot of `https://lost-and-found-portal-a9t1.onrender.com` showing the 8 loaded item cards and statistics)*

- **[Insert Screenshot 2: Item Reporting Modal / Form Submission]**  
  *(Take a screenshot of the "+ Report an Item" modal dialog filled with details)*

- **[Insert Screenshot 3: Search and Category Filtering in Action]**  
  *(Take a screenshot filtering by "Electronics" or searching "Charger")*

- **[Insert Screenshot 4: MongoDB Atlas Cloud Database Records]**  
  *(Take a screenshot of your MongoDB Atlas dashboard under `lost_and_found_db` > `items` collection)*

- **[Insert Screenshot 5: Render Web Service Dashboard showing "Live" Status]**  
  *(Take a screenshot of your Render dashboard showing `Deploy succeeded | Live`)*

---

### RESULT:
The Campus Lost and Found Portal web application was successfully designed, developed, and deployed. The single-page responsive user interface communicates seamlessly with the Express.js REST API, performing complete CRUD operations (Create, Read, Update status, Delete), text searches, and category filters. All application records are persistently stored in a cloud MongoDB Atlas cluster, and the application is continuously deployed live on Render.
