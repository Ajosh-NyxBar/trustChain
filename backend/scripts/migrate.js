const sequelize = require('../config/database');
const { User, Product, Transaction } = require('../models');

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database models synchronized successfully.');
    
    // Check if admin user exists, create if not
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      const adminUser = await User.create({
        email: 'admin@trustchain.com',
        password: 'admin123',
        first_name: 'Admin',
        last_name: 'TrustChain',
        role: 'admin',
        status: 'active',
        company_name: 'TrustChain Platform',
        company_type: 'corporation',
        email_verified: true
      });
      
      console.log('✅ Admin user created successfully.');
      console.log('📧 Admin credentials:');
      console.log('   Email: admin@trustchain.com');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists.');
    }
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;
