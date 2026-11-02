const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Item = require('../models/Item');

// Helper to check if MongoDB is active and connected
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// Initial realistic college campus demo dataset (available immediately in both DB and local mode)
let memoryItems = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    itemName: 'HP Pavilion Laptop Charger (65W Blue Pin)',
    itemType: 'Lost',
    category: 'Electronics',
    description: 'Black HP laptop charger left plugged in near station 14 during afternoon DBMS laboratory.',
    location: 'Computer Lab 3, Department Block B',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    contactName: 'Rahul Sharma (CSE-3rd Year)',
    contactDetails: 'rahul.sharma@college.edu | +91 98765 43210',
    status: 'Active',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    itemName: 'College Student Identity Card (Roll: CS2024-042)',
    itemType: 'Found',
    category: 'Documents & IDs',
    description: 'Blue lanyard identity card belonging to Priya Verma, Department of Computer Science & Engineering.',
    location: 'Central Library, Reference Section Table 4',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    contactName: 'Library Circulation Desk',
    contactDetails: 'library@college.edu | Intercom: 402',
    status: 'Active',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    itemName: 'Brown Leather Titan Wallet',
    itemType: 'Lost',
    category: 'Wallets & Bags',
    description: 'Contains college transport bus pass, student debit card, and driver license. Kindly return!',
    location: 'College Cafeteria, Table near Juice Counter',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    contactName: 'Amit Patel',
    contactDetails: 'amit.patel@gmail.com | +91 91234 56789',
    status: 'Active',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    itemName: 'Honda Bike Key with Avengers Metal Keychain',
    itemType: 'Found',
    category: 'Keys',
    description: 'Found black ignition key with small silver padlock key on an Avengers circular metal ring.',
    location: 'Main Campus Two-Wheeler Parking near Gate 2',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    contactName: 'Campus Security Office',
    contactDetails: 'security.gate2@college.edu | Intercom: 101',
    status: 'Active',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    itemName: 'Engineering Mathematics-II Spiral Notebook',
    itemType: 'Lost',
    category: 'Books & Stationery',
    description: 'Classmate 200-page notebook with green spine, contains all Fourier transform problem sheets.',
    location: 'Auditorium Hall, 3rd Row Right Wing',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    contactName: 'Sneha Rao',
    contactDetails: 'sneha.rao@college.edu | +91 98888 77766',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    itemName: 'boAt Rockerz 255 Pro+ Wireless Neckband',
    itemType: 'Found',
    category: 'Electronics',
    description: 'Teal green magnetic bluetooth neckband found on the stone bench under the tree.',
    location: 'Sports Ground Pavilion',
    date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    contactName: 'Karan Singh',
    contactDetails: 'karan.s@college.edu | +91 97777 22211',
    status: 'Active',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * @route   GET /api/items/stats
 * @desc    Get dashboard statistics (total, lost, found, resolved, active)
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    if (isDbConnected()) {
      const [total, lost, found, resolved, active] = await Promise.all([
        Item.countDocuments(),
        Item.countDocuments({ itemType: 'Lost' }),
        Item.countDocuments({ itemType: 'Found' }),
        Item.countDocuments({ status: 'Resolved' }),
        Item.countDocuments({ status: 'Active' })
      ]);

      return res.status(200).json({
        success: true,
        source: 'MongoDB',
        data: { total, lost, found, resolved, active }
      });
    }

    // In-memory fallback
    const total = memoryItems.length;
    const lost = memoryItems.filter((i) => i.itemType === 'Lost').length;
    const found = memoryItems.filter((i) => i.itemType === 'Found').length;
    const resolved = memoryItems.filter((i) => i.status === 'Resolved').length;
    const active = memoryItems.filter((i) => i.status === 'Active').length;

    res.status(200).json({
      success: true,
      source: 'MemoryFallback',
      data: { total, lost, found, resolved, active }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/items
 * @desc    Get all items with optional search, category, type, status, and sorting filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { search, type, category, status, sortBy, limit } = req.query;

    if (isDbConnected()) {
      const query = {};

      if (type && ['Lost', 'Found'].includes(type)) {
        query.itemType = type;
      }

      if (category && category !== 'All') {
        query.category = category;
      }

      if (status && ['Active', 'Resolved'].includes(status)) {
        query.status = status;
      }

      if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { itemName: { $regex: regex } },
          { description: { $regex: regex } },
          { location: { $regex: regex } }
        ];
      }

      let sort = { createdAt: -1 };
      if (sortBy === 'oldest') sort = { createdAt: 1 };
      else if (sortBy === 'name') sort = { itemName: 1 };

      let itemsQuery = Item.find(query).sort(sort);
      if (limit && !isNaN(parseInt(limit, 10))) {
        itemsQuery = itemsQuery.limit(parseInt(limit, 10));
      }

      const items = await itemsQuery.exec();

      return res.status(200).json({
        success: true,
        source: 'MongoDB',
        count: items.length,
        data: items
      });
    }

    // In-memory fallback
    let filtered = [...memoryItems];

    if (type && ['Lost', 'Found'].includes(type)) {
      filtered = filtered.filter((i) => i.itemType === type);
    }

    if (category && category !== 'All') {
      filtered = filtered.filter((i) => i.category === category);
    }

    if (status && ['Active', 'Resolved'].includes(status)) {
      filtered = filtered.filter((i) => i.status === status);
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (i) =>
          (i.itemName && i.itemName.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.location && i.location.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.itemName.localeCompare(b.itemName));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (limit && !isNaN(parseInt(limit, 10))) {
      filtered = filtered.slice(0, parseInt(limit, 10));
    }

    res.status(200).json({
      success: true,
      source: 'MemoryFallback',
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/items/:id
 * @desc    Get a single item by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item ID format'
        });
      }

      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: item
      });
    }

    // In-memory fallback
    const item = memoryItems.find((i) => i._id.toString() === id.toString());
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve item',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/items
 * @desc    Add a new item report (Lost or Found)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const {
      itemName,
      itemType,
      category,
      description,
      location,
      date,
      contactName,
      contactDetails
    } = req.body;

    if (
      !itemName ||
      !itemType ||
      !category ||
      !description ||
      !location ||
      !contactName ||
      !contactDetails
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (isDbConnected()) {
      const newItem = new Item({
        itemName: itemName.trim(),
        itemType,
        category,
        description: description.trim(),
        location: location.trim(),
        date: date ? new Date(date) : new Date(),
        contactName: contactName.trim(),
        contactDetails: contactDetails.trim(),
        status: 'Active'
      });

      const savedItem = await newItem.save();

      return res.status(201).json({
        success: true,
        message: `${itemType} item reported successfully!`,
        data: savedItem
      });
    }

    // In-memory fallback
    const newItem = {
      _id: new mongoose.Types.ObjectId().toString(),
      itemName: itemName.trim(),
      itemType,
      category,
      description: description.trim(),
      location: location.trim(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      contactName: contactName.trim(),
      contactDetails: contactDetails.trim(),
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryItems.unshift(newItem);

    res.status(201).json({
      success: true,
      message: `${itemType} item reported successfully!`,
      data: newItem
    });
  } catch (error) {
    console.error('Error creating item:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create item report',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/items/:id
 * @desc    Update an existing item report or toggle status (Active / Resolved)
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item ID format'
        });
      }

      const existingItem = await Item.findById(id);
      if (!existingItem) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      const updates = req.body;
      const allowedUpdates = [
        'itemName',
        'itemType',
        'category',
        'description',
        'location',
        'date',
        'contactName',
        'contactDetails',
        'status'
      ];

      allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
          existingItem[field] = updates[field];
        }
      });

      const updatedItem = await existingItem.save();

      return res.status(200).json({
        success: true,
        message: 'Item updated successfully',
        data: updatedItem
      });
    }

    // In-memory fallback
    const index = memoryItems.findIndex((i) => i._id.toString() === id.toString());
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const updates = req.body;
    const item = memoryItems[index];

    if (updates.status !== undefined) item.status = updates.status;
    if (updates.itemName !== undefined) item.itemName = updates.itemName;
    if (updates.itemType !== undefined) item.itemType = updates.itemType;
    if (updates.category !== undefined) item.category = updates.category;
    if (updates.description !== undefined) item.description = updates.description;
    if (updates.location !== undefined) item.location = updates.location;
    if (updates.contactName !== undefined) item.contactName = updates.contactName;
    if (updates.contactDetails !== undefined) item.contactDetails = updates.contactDetails;
    item.updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete an item report
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item ID format'
        });
      }

      const item = await Item.findByIdAndDelete(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Item deleted successfully',
        data: { id: item._id }
      });
    }

    // In-memory fallback
    const index = memoryItems.findIndex((i) => i._id.toString() === id.toString());
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const deleted = memoryItems.splice(index, 1)[0];

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      data: { id: deleted._id }
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/items/seed
 * @desc    Seed sample college items for demonstration/testing
 * @access  Public
 */
router.post('/seed', async (req, res) => {
  try {
    const sampleItems = [
      {
        itemName: 'HP Pavilion Laptop Charger (65W Blue Pin)',
        itemType: 'Lost',
        category: 'Electronics',
        description: 'Black HP laptop charger left plugged in near station 14 during afternoon DBMS laboratory.',
        location: 'Computer Lab 3, Department Block B',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        contactName: 'Rahul Sharma (CSE-3rd Year)',
        contactDetails: 'rahul.sharma@college.edu | +91 98765 43210',
        status: 'Active'
      },
      {
        itemName: 'College Student Identity Card (Roll: CS2024-042)',
        itemType: 'Found',
        category: 'Documents & IDs',
        description: 'Blue lanyard identity card belonging to Priya Verma, Department of Computer Science & Engineering.',
        location: 'Central Library, Reference Section Table 4',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000),
        contactName: 'Library Circulation Desk',
        contactDetails: 'library@college.edu | Intercom: 402',
        status: 'Active'
      },
      {
        itemName: 'Brown Leather Titan Wallet',
        itemType: 'Lost',
        category: 'Wallets & Bags',
        description: 'Contains college transport bus pass, student debit card, and driver license. Kindly return!',
        location: 'College Cafeteria, Table near Juice Counter',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        contactName: 'Amit Patel',
        contactDetails: 'amit.patel@gmail.com | +91 91234 56789',
        status: 'Active'
      },
      {
        itemName: 'Honda Bike Key with Avengers Metal Keychain',
        itemType: 'Found',
        category: 'Keys',
        description: 'Found black ignition key with small silver padlock key on an Avengers circular metal ring.',
        location: 'Main Campus Two-Wheeler Parking near Gate 2',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000),
        contactName: 'Campus Security Office',
        contactDetails: 'security.gate2@college.edu | Intercom: 101',
        status: 'Active'
      },
      {
        itemName: 'Engineering Mathematics-II Spiral Notebook',
        itemType: 'Lost',
        category: 'Books & Stationery',
        description: 'Classmate 200-page notebook with green spine, contains all Fourier transform problem sheets.',
        location: 'Auditorium Hall, 3rd Row Right Wing',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        contactName: 'Sneha Rao',
        contactDetails: 'sneha.rao@college.edu | +91 98888 77766',
        status: 'Resolved'
      },
      {
        itemName: 'boAt Rockerz 255 Pro+ Wireless Neckband',
        itemType: 'Found',
        category: 'Electronics',
        description: 'Teal green magnetic bluetooth neckband found on the stone bench under the tree.',
        location: 'Sports Ground Pavilion',
        date: new Date(Date.now() - 18 * 60 * 60 * 1000),
        contactName: 'Karan Singh',
        contactDetails: 'karan.s@college.edu | +91 97777 22211',
        status: 'Active'
      }
    ];

    if (isDbConnected()) {
      const count = await Item.countDocuments();
      if (count > 0 && req.query.force !== 'true') {
        return res.status(200).json({
          success: true,
          message: `Database already has ${count} items. Pass ?force=true to seed anyway.`,
          data: { existingCount: count }
        });
      }

      const inserted = await Item.insertMany(sampleItems);
      return res.status(201).json({
        success: true,
        message: `Successfully seeded ${inserted.length} sample college items into MongoDB!`,
        data: inserted
      });
    }

    // In-memory fallback
    memoryItems = sampleItems.map((item) => ({
      _id: new mongoose.Types.ObjectId().toString(),
      ...item,
      date: item.date.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${memoryItems.length} sample college items into live session!`,
      data: memoryItems
    });
  } catch (error) {
    console.error('Error seeding items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed sample items',
      error: error.message
    });
  }
});

module.exports = router;
