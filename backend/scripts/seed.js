const { User, Product, Transaction } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Sample users data
    const sampleUsers = [
      {
        email: 'supplier1@example.com',
        password: 'supplier123',
        first_name: 'Budi',
        last_name: 'Santoso',
        role: 'supplier',
        status: 'active',
        company_name: 'PT Agro Makmur',
        company_type: 'umkm',
        company_address: 'Jl. Raya Bogor No. 123, Bogor, Jawa Barat',
        phone: '+6281234567890'
      },
      {
        email: 'distributor1@example.com',
        password: 'distributor123',
        first_name: 'Sari',
        last_name: 'Wijaya',
        role: 'distributor',
        status: 'active',
        company_name: 'CV Sari Distribusi',
        company_type: 'umkm',
        company_address: 'Jl. Sudirman No. 456, Jakarta Pusat',
        phone: '+6281234567891'
      },
      {
        email: 'retailer1@example.com',
        password: 'retailer123',
        first_name: 'Andi',
        last_name: 'Prasetyo',
        role: 'retailer',
        status: 'active',
        company_name: 'Toko Andi Jaya',
        company_type: 'umkm',
        company_address: 'Jl. Malioboro No. 789, Yogyakarta',
        phone: '+6281234567892'
      },
      {
        email: 'auditor1@example.com',
        password: 'auditor123',
        first_name: 'Dr. Maria',
        last_name: 'Susanti',
        role: 'auditor',
        status: 'active',
        company_name: 'Lembaga Sertifikasi Nasional',
        company_type: 'corporation',
        company_address: 'Jl. Gatot Subroto No. 321, Jakarta Selatan',
        phone: '+6281234567893'
      }
    ];
    
    // Create sample users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        const user = await User.create(userData);
        createdUsers.push(user);
        console.log(`✅ Created user: ${userData.company_name} (${userData.role})`);
      } else {
        createdUsers.push(existingUser);
        console.log(`ℹ️  User already exists: ${userData.company_name}`);
      }
    }
    
    // Sample products data
    const sampleProducts = [
      {
        name: 'Beras Organik Premium',
        sku: 'RICE-ORG-001',
        description: 'Beras organik berkualitas tinggi dari petani lokal Jawa Barat',
        category: 'Food & Beverage',
        subcategory: 'Grains',
        brand: 'Agro Makmur',
        manufacturer_id: createdUsers[0].id, // Supplier
        base_price: 25000,
        unit: 'kg',
        weight: 1.0,
        origin_country: 'Indonesia',
        origin_location: { city: 'Bogor', province: 'Jawa Barat' },
        certifications: [
          {
            name: 'Sertifikat Organik',
            issuer: 'IFOAM',
            number: 'ORG-2024-001',
            issue_date: '2024-01-15',
            expiry_date: '2025-01-15'
          }
        ],
        sustainability_score: 85,
        carbon_footprint: 1.2,
        recyclability: 'biodegradable'
      },
      {
        name: 'Kopi Arabika Gayo',
        sku: 'COFFEE-GAY-001',
        description: 'Kopi arabika premium dari dataran tinggi Gayo, Aceh',
        category: 'Food & Beverage',
        subcategory: 'Coffee',
        brand: 'Gayo Highland',
        manufacturer_id: createdUsers[0].id, // Supplier
        base_price: 125000,
        unit: 'kg',
        weight: 1.0,
        origin_country: 'Indonesia',
        origin_location: { city: 'Takengon', province: 'Aceh' },
        certifications: [
          {
            name: 'Fair Trade Certified',
            issuer: 'Fair Trade International',
            number: 'FT-2024-GAY-001',
            issue_date: '2024-02-01',
            expiry_date: '2025-02-01'
          }
        ],
        sustainability_score: 92,
        carbon_footprint: 2.8,
        recyclability: 'compostable'
      },
      {
        name: 'Batik Tulis Solo',
        sku: 'BATIK-SOL-001',
        description: 'Batik tulis asli Solo dengan motif tradisional Parang',
        category: 'Textiles',
        subcategory: 'Traditional Clothing',
        brand: 'Batik Nusantara',
        manufacturer_id: createdUsers[0].id, // Supplier
        base_price: 450000,
        unit: 'pcs',
        weight: 0.3,
        origin_country: 'Indonesia',
        origin_location: { city: 'Solo', province: 'Jawa Tengah' },
        certifications: [
          {
            name: 'Warisan Budaya UNESCO',
            issuer: 'UNESCO',
            number: 'WB-2024-BATIK-001',
            issue_date: '2024-03-01',
            expiry_date: '2026-03-01'
          }
        ],
        sustainability_score: 78,
        carbon_footprint: 5.2,
        recyclability: 'recyclable'
      }
    ];
    
    // Create sample products
    const createdProducts = [];
    for (const productData of sampleProducts) {
      const existingProduct = await Product.findOne({ where: { sku: productData.sku } });
      if (!existingProduct) {
        const product = await Product.create(productData);
        await product.generateQRCode();
        product.calculateSustainabilityScore();
        await product.save();
        createdProducts.push(product);
        console.log(`✅ Created product: ${productData.name} (${productData.sku})`);
      } else {
        createdProducts.push(existingProduct);
        console.log(`ℹ️  Product already exists: ${productData.name}`);
      }
    }
    
    // Sample transactions data
    const sampleTransactions = [
      {
        from_user_id: createdUsers[0].id, // Supplier
        to_user_id: createdUsers[1].id,   // Distributor
        product_id: createdProducts[0].id,
        transaction_type: 'transfer',
        quantity: 100,
        unit: 'kg',
        unit_price: 25000,
        total_amount: 2500000,
        status: 'delivered',
        shipping_address: {
          street: 'Jl. Sudirman No. 456',
          city: 'Jakarta Pusat',
          postal_code: '10220',
          country: 'Indonesia'
        },
        estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        notes: 'Pengiriman rutin beras organik bulanan',
        quality_score: 5,
        compliance_status: 'compliant'
      },
      {
        from_user_id: createdUsers[1].id, // Distributor
        to_user_id: createdUsers[2].id,   // Retailer
        product_id: createdProducts[0].id,
        transaction_type: 'purchase',
        quantity: 25,
        unit: 'kg',
        unit_price: 27000,
        total_amount: 675000,
        status: 'in_transit',
        shipping_address: {
          street: 'Jl. Malioboro No. 789',
          city: 'Yogyakarta',
          postal_code: '55271',
          country: 'Indonesia'
        },
        estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        notes: 'Pesanan untuk stok toko bulan ini',
        quality_score: 4,
        compliance_status: 'pending_review'
      },
      {
        from_user_id: createdUsers[0].id, // Supplier
        to_user_id: createdUsers[1].id,   // Distributor
        product_id: createdProducts[1].id,
        transaction_type: 'transfer',
        quantity: 50,
        unit: 'kg',
        unit_price: 125000,
        total_amount: 6250000,
        status: 'verified',
        shipping_address: {
          street: 'Jl. Sudirman No. 456',
          city: 'Jakarta Pusat',
          postal_code: '10220',
          country: 'Indonesia'
        },
        estimated_delivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        actual_delivery: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        notes: 'Kopi premium untuk pasar Jakarta',
        quality_score: 5,
        compliance_status: 'compliant'
      }
    ];
    
    // Create sample transactions
    for (const transactionData of sampleTransactions) {
      const transaction = await Transaction.create(transactionData);
      console.log(`✅ Created transaction: ${transaction.tracking_number}`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Transactions: ${sampleTransactions.length}`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
