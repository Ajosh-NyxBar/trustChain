const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      len: [3, 50]
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 200]
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  subcategory: {
    type: DataTypes.STRING
  },
  brand: {
    type: DataTypes.STRING
  },
  manufacturer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  origin_country: {
    type: DataTypes.STRING,
    defaultValue: 'Indonesia'
  },
  origin_location: {
    type: DataTypes.JSONB,
    comment: 'Detailed origin location with coordinates'
  },
  base_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'IDR'
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pcs'
  },
  weight: {
    type: DataTypes.DECIMAL(10, 3),
    comment: 'Weight in kg'
  },
  dimensions: {
    type: DataTypes.JSONB,
    comment: 'Length, width, height in cm'
  },
  barcode: {
    type: DataTypes.STRING,
    unique: true
  },
  qr_code: {
    type: DataTypes.STRING,
    unique: true
  },
  batch_number: {
    type: DataTypes.STRING
  },
  production_date: {
    type: DataTypes.DATE
  },
  expiry_date: {
    type: DataTypes.DATE
  },
  shelf_life: {
    type: DataTypes.INTEGER,
    comment: 'Shelf life in days'
  },
  storage_conditions: {
    type: DataTypes.JSONB,
    defaultValue: {
      temperature: null,
      humidity: null,
      special_requirements: []
    }
  },
  certifications: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of certification objects'
  },
  quality_standards: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  ingredients: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'For food products'
  },
  nutritional_info: {
    type: DataTypes.JSONB,
    comment: 'Nutritional information for food products'
  },
  safety_warnings: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  sustainability_score: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 100
    }
  },
  carbon_footprint: {
    type: DataTypes.DECIMAL(10, 3),
    comment: 'CO2 equivalent in kg'
  },
  recyclability: {
    type: DataTypes.ENUM('recyclable', 'biodegradable', 'compostable', 'non_recyclable'),
    defaultValue: 'non_recyclable'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'discontinued', 'recalled'),
    defaultValue: 'active'
  },
  blockchain_registered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  blockchain_hash: {
    type: DataTypes.STRING,
    unique: true
  },
  smart_contract_address: {
    type: DataTypes.STRING
  },
  token_id: {
    type: DataTypes.STRING,
    comment: 'NFT token ID for product authenticity'
  },
  images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'products',
  indexes: [
    {
      unique: true,
      fields: ['sku']
    },
    {
      unique: true,
      fields: ['barcode']
    },
    {
      unique: true,
      fields: ['qr_code']
    },
    {
      fields: ['manufacturer_id']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['blockchain_registered']
    },
    {
      fields: ['name']
    }
  ]
});

// Instance methods
Product.prototype.generateQRCode = async function() {
  if (!this.qr_code) {
    this.qr_code = `TC-${this.id}-${Date.now()}`;
    return this.save();
  }
  return this.qr_code;
};

Product.prototype.addImage = async function(image) {
  const images = this.images || [];
  images.push({
    id: require('uuid').v4(),
    filename: image.filename,
    path: image.path,
    mimetype: image.mimetype,
    size: image.size,
    is_primary: images.length === 0,
    uploaded_at: new Date()
  });
  this.images = images;
  return this.save();
};

Product.prototype.addCertification = async function(certification) {
  const certifications = this.certifications || [];
  certifications.push({
    id: require('uuid').v4(),
    name: certification.name,
    issuer: certification.issuer,
    number: certification.number,
    issue_date: certification.issue_date,
    expiry_date: certification.expiry_date,
    document_path: certification.document_path,
    verified: false,
    added_at: new Date()
  });
  this.certifications = certifications;
  return this.save();
};

Product.prototype.calculateSustainabilityScore = function() {
  let score = 0;
  
  // Base score from carbon footprint (lower is better)
  if (this.carbon_footprint) {
    score += Math.max(0, 50 - (this.carbon_footprint * 5));
  }
  
  // Recyclability bonus
  const recyclabilityScores = {
    'compostable': 30,
    'biodegradable': 25,
    'recyclable': 20,
    'non_recyclable': 0
  };
  score += recyclabilityScores[this.recyclability] || 0;
  
  // Certification bonus
  if (this.certifications && this.certifications.length > 0) {
    score += Math.min(20, this.certifications.length * 5);
  }
  
  this.sustainability_score = Math.min(100, Math.max(0, score));
  return this.sustainability_score;
};

module.exports = Product;
