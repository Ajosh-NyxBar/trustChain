const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      len: [10, 15]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'supplier', 'distributor', 'retailer', 'auditor', 'consumer'),
    allowNull: false,
    defaultValue: 'consumer'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'suspended'),
    defaultValue: 'pending'
  },
  company_name: {
    type: DataTypes.STRING,
    validate: {
      len: [2, 100]
    }
  },
  company_address: {
    type: DataTypes.TEXT
  },
  company_type: {
    type: DataTypes.ENUM('umkm', 'corporation', 'cooperative', 'individual'),
    defaultValue: 'individual'
  },
  business_license: {
    type: DataTypes.STRING
  },
  tax_id: {
    type: DataTypes.STRING
  },
  wallet_address: {
    type: DataTypes.STRING,
    validate: {
      len: [42, 42] // Ethereum address length
    }
  },
  profile_image: {
    type: DataTypes.STRING
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_verification_token: {
    type: DataTypes.STRING
  },
  password_reset_token: {
    type: DataTypes.STRING
  },
  password_reset_expires: {
    type: DataTypes.DATE
  },
  last_login: {
    type: DataTypes.DATE
  },
  login_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      language: 'id',
      timezone: 'Asia/Jakarta',
      theme: 'light'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['status']
    },
    {
      fields: ['company_name']
    }
  ]
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getPublicProfile = function() {
  const { password, email_verification_token, password_reset_token, ...publicProfile } = this.toJSON();
  return publicProfile;
};

User.prototype.updateLastLogin = async function() {
  this.last_login = new Date();
  this.login_count += 1;
  return this.save();
};

module.exports = User;
