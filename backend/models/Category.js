import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    public_id: String,
    url: String,
    alt: String
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  meta: {
    title: String,
    description: String,
    keywords: [String]
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Method to get all subcategories
categorySchema.methods.getAllSubcategories = async function() {
  const subcategories = [];
  
  const findChildren = async (parentId) => {
    const children = await this.model('Category').find({ parent: parentId });
    for (const child of children) {
      subcategories.push(child);
      await findChildren(child._id);
    }
  };
  
  await findChildren(this._id);
  return subcategories;
};

// Method to get category tree
categorySchema.methods.getCategoryTree = async function() {
  const populateChildren = async (category) => {
    await category.populate('children');
    for (const child of category.children) {
      await populateChildren(child);
    }
  };
  
  await populateChildren(this);
  return this;
};

// Static method to get all root categories
categorySchema.statics.getRootCategories = function() {
  return this.find({ parent: null, isActive: true }).sort({ sortOrder: 1 });
};

// Static method to get category by slug
categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true });
};

// Index for performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ featured: 1, isActive: 1 });

export default mongoose.model('Category', categorySchema);