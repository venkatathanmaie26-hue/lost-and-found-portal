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
      required: [true, 'Contact details (phone or email) are required'],
      trim: true,
      maxlength: [150, 'Contact details cannot exceed 150 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Resolved'],
        message: 'Status must be either Active or Resolved'
      },
      default: 'Active'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Text index to allow rapid and flexible text searching across name, description, and location
itemSchema.index({
  itemName: 'text',
  description: 'text',
  location: 'text'
});

// Compound index for frequent filtering
itemSchema.index({ itemType: 1, category: 1, status: 1 });
itemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
