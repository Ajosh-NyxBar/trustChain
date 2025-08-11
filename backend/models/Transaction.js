const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transaction_hash: {
    type: DataTypes.STRING,
    comment: 'Blockchain transaction hash'
  },
  from_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  to_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  transaction_type: {
    type: DataTypes.ENUM('transfer', 'purchase', 'verification', 'audit'),
    allowNull: false,
    defaultValue: 'transfer'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_transit', 'delivered', 'verified', 'rejected', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pcs'
  },
  unit_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  total_amount: {
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
  shipping_address: {
    type: DataTypes.JSONB,
    validate: {
      isValidAddress(value) {
        if (value && (!value.street || !value.city || !value.postal_code)) {
          throw new Error('Complete address required');
        }
      }
    }
  },
  estimated_delivery: {
    type: DataTypes.DATE
  },
  actual_delivery: {
    type: DataTypes.DATE
  },
  tracking_number: {
    type: DataTypes.STRING
  },
  carrier: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  },
  quality_score: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  compliance_status: {
    type: DataTypes.ENUM('compliant', 'non_compliant', 'pending_review'),
    defaultValue: 'pending_review'
  },
  blockchain_confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  confirmation_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  gas_fee: {
    type: DataTypes.DECIMAL(18, 8),
    comment: 'Gas fee in ETH or MATIC'
  },
  block_number: {
    type: DataTypes.BIGINT
  },
  smart_contract_address: {
    type: DataTypes.STRING
  },
  digital_signature: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'transactions',
  indexes: [
    {
      unique: true,
      fields: ['transaction_hash']
    },
    {
      fields: ['from_user_id']
    },
    {
      fields: ['to_user_id']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['transaction_type']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['blockchain_confirmed']
    }
  ]
});

// Instance methods
Transaction.prototype.calculateTotalAmount = function() {
  this.total_amount = this.quantity * this.unit_price;
  return this.total_amount;
};

Transaction.prototype.updateStatus = async function(newStatus, notes = null) {
  this.status = newStatus;
  if (notes) {
    this.notes = notes;
  }
  
  // Set delivery date if status is delivered
  if (newStatus === 'delivered' && !this.actual_delivery) {
    this.actual_delivery = new Date();
  }
  
  return this.save();
};

Transaction.prototype.addAttachment = async function(attachment) {
  const attachments = this.attachments || [];
  attachments.push({
    id: require('uuid').v4(),
    filename: attachment.filename,
    path: attachment.path,
    mimetype: attachment.mimetype,
    size: attachment.size,
    uploaded_at: new Date()
  });
  this.attachments = attachments;
  return this.save();
};

module.exports = Transaction;
