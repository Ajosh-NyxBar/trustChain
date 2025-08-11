const User = require('./User');
const Product = require('./Product');
const Transaction = require('./Transaction');

// Define associations
User.hasMany(Product, {
  foreignKey: 'manufacturer_id',
  as: 'products'
});

Product.belongsTo(User, {
  foreignKey: 'manufacturer_id',
  as: 'manufacturer'
});

User.hasMany(Transaction, {
  foreignKey: 'from_user_id',
  as: 'sentTransactions'
});

User.hasMany(Transaction, {
  foreignKey: 'to_user_id',
  as: 'receivedTransactions'
});

Transaction.belongsTo(User, {
  foreignKey: 'from_user_id',
  as: 'sender'
});

Transaction.belongsTo(User, {
  foreignKey: 'to_user_id',
  as: 'receiver'
});

Transaction.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

Product.hasMany(Transaction, {
  foreignKey: 'product_id',
  as: 'transactions'
});

module.exports = {
  User,
  Product,
  Transaction
};
