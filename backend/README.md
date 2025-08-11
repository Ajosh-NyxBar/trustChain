# TrustChain Backend

Backend API server for TrustChain - Blockchain Supply Chain Management System.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials and settings
```

4. **Configure PostgreSQL Database:**
```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE trustchain_db;
CREATE USER trustchain_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE trustchain_db TO trustchain_user;
```

5. **Run database migration:**
```bash
npm run migrate
```

6. **Seed sample data (optional):**
```bash
npm run seed
```

7. **Start development server:**
```bash
npm run dev
```

The API server will be running at `http://localhost:3000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Users Management
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/status` - Update user status (Admin only)
- `GET /api/users/stats/summary` - Get user statistics (Admin only)
- `GET /api/users/search/partners` - Search business partners

### Products Management
- `GET /api/products` - Get all products (with filtering)
- `POST /api/products` - Create new product (Supplier/Admin)
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product (Owner/Admin)
- `GET /api/products/verify/:identifier` - Verify product by QR/barcode/SKU
- `GET /api/products/stats/summary` - Get product statistics

### Transactions Management
- `GET /api/transactions` - Get transactions (with filtering)
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id/status` - Update transaction status
- `GET /api/transactions/stats/summary` - Get transaction statistics

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/supply-chain` - Get supply chain analytics
- `GET /api/analytics/performance` - Get performance analytics
- `GET /api/analytics/export` - Export analytics data

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `DELETE /api/upload/:filename` - Delete uploaded file
- `GET /api/upload/info/:filename` - Get file information
- `POST /api/upload/resize` - Resize image file

### Health Check
- `GET /health` - Server health check
- `GET /` - API information

## 🔧 Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trustchain_db
DB_USER=trustchain_user
DB_PASS=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄️ Database Schema

### Users Table
- Basic user information (name, email, phone)
- Role-based access (admin, supplier, distributor, retailer, auditor, consumer)
- Company information (name, address, type, licenses)
- Authentication data (password, tokens, verification status)
- Preferences and metadata

### Products Table
- Product information (name, SKU, description, category)
- Pricing and inventory data
- Origin and location tracking
- Certifications and quality standards
- Sustainability metrics
- Blockchain integration fields

### Transactions Table
- Transaction details (from/to users, product, quantities)
- Status tracking (pending, confirmed, in_transit, delivered, verified)
- Shipping and delivery information
- Quality scores and compliance status
- Blockchain transaction data
- Attachments and metadata

## 🔐 Authentication & Authorization

### JWT Token System
- **Access Token**: Short-lived (7 days default) for API access
- **Refresh Token**: Long-lived (30 days default) for token renewal

### Role-Based Access Control (RBAC)
- **Admin**: Full system access, user management, analytics
- **Supplier**: Product creation, transaction initiation, analytics
- **Distributor**: Transaction management, partner search, analytics
- **Retailer**: Transaction receiving, product verification, basic analytics
- **Auditor**: Read-only access for compliance and audit purposes
- **Consumer**: Product verification, basic transaction history

### Protected Routes
Most API endpoints require authentication. Use the Authorization header:
```
Authorization: Bearer <access_token>
```

## 🔄 Real-time Features (Socket.IO)

### Connection Events
- `connection` - User connects to WebSocket
- `authenticate` - User authenticates socket connection
- `disconnect` - User disconnects

### Real-time Updates
- `transaction_created` - New transaction broadcast
- `transaction_updated` - Transaction status changes
- `product_created` - New product announcements
- `user_registered` - New user registrations
- `user_login`/`user_logout` - User activity tracking

### Custom Events
- `track_transaction` - Subscribe to specific transaction updates
- `send_message` - User-to-user messaging
- `typing_start`/`typing_stop` - Typing indicators
- `subscribe_analytics` - Real-time analytics updates

## 📊 Sample Data

The seeding script creates:

### Sample Users
- **Admin**: admin@trustchain.com (password: admin123)
- **Supplier**: supplier1@example.com (PT Agro Makmur)
- **Distributor**: distributor1@example.com (CV Sari Distribusi)
- **Retailer**: retailer1@example.com (Toko Andi Jaya)
- **Auditor**: auditor1@example.com (Lembaga Sertifikasi Nasional)

### Sample Products
- Beras Organik Premium (RICE-ORG-001)
- Kopi Arabika Gayo (COFFEE-GAY-001)
- Batik Tulis Solo (BATIK-SOL-001)

### Sample Transactions
- Various transaction statuses and types
- Complete supply chain flow examples
- Realistic Indonesian business scenarios

## 🧪 Testing

### Manual API Testing
Use tools like Postman, Insomnia, or curl:

```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "first_name": "Test",
    "last_name": "User",
    "role": "supplier",
    "company_name": "Test Company"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@trustchain.com",
    "password": "admin123"
  }'

# Get transactions (with auth token)
curl -X GET http://localhost:3000/api/transactions \
  -H "Authorization: Bearer <your_access_token>"
```

### Database Testing
```bash
# Check database connection
npm run migrate

# Reset and reseed database
npm run seed
```

## 📈 Performance & Monitoring

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling for concurrent requests
- Query optimization with Sequelize ORM

### API Performance
- Request rate limiting (100 requests per 15 minutes)
- Response compression
- File upload size limits (5MB default)
- Pagination for large datasets

### Logging
- Development: Detailed console logging
- Production: Structured logging with timestamps
- Error tracking and monitoring

## 🔧 Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run database migration
npm run migrate

# Seed sample data
npm run seed

# Run tests (when implemented)
npm test
```

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use environment-specific database

### Database
1. Use managed PostgreSQL service
2. Set up database backups
3. Configure SSL connections
4. Monitor database performance

### Security
1. Keep dependencies updated
2. Use HTTPS everywhere
3. Implement proper logging
4. Set up monitoring and alerts
5. Regular security audits

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**TrustChain Backend** - Powering transparent and secure supply chain management through blockchain technology.
