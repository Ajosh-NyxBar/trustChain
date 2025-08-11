# TrustChain Production Deployment Guide

## Overview

TrustChain is a blockchain-based supply chain management system that provides transparency, traceability, and authenticity verification for products throughout their lifecycle.

## Prerequisites

- AWS Account with appropriate permissions
- Docker installed
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- MetaMask or Web3 wallet

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/your-org/trustchain.git
cd trustchain
npm run install:all
```

### 2. Environment Configuration

Copy the environment files:
```bash
cp .env.production.example .env.production
cp frontend/.env.production.example frontend/.env.production
```

Update the environment variables with your production values.

### 3. Database Setup

```bash
# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

### 4. Build and Deploy

```bash
# Build all components
npm run build

# Deploy using Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to AWS using provided CloudFormation templates
```

## Production Deployment Options

### Option 1: AWS ECS with ALB

1. **Infrastructure Setup**:
   ```bash
   aws cloudformation create-stack \
     --stack-name trustchain-infrastructure \
     --template-body file://infrastructure/cloudformation-template.json \
     --parameters ParameterKey=Environment,ParameterValue=production \
     --capabilities CAPABILITY_IAM
   ```

2. **Deploy Application**:
   - Use the provided GitHub Actions workflows
   - Configure secrets in GitHub repository settings
   - Push to main branch to trigger deployment

### Option 2: Docker Compose

1. **Server Setup**:
   ```bash
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo pip3 install docker-compose
   ```

2. **Deploy**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Option 3: Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

## Configuration

### Database Configuration

```env
DATABASE_URL=postgres://user:password@host:5432/trustchain_prod
DB_SSL=true
DB_POOL_MIN=5
DB_POOL_MAX=20
```

### Redis Configuration

```env
REDIS_URL=redis://redis-cluster:6379
REDIS_PASSWORD=your_redis_password
REDIS_TTL=3600
```

### Blockchain Configuration

```env
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your-key
PRIVATE_KEY=your_deployer_private_key
CONTRACT_ADDRESS_SUPPLY_CHAIN=0x...
CONTRACT_ADDRESS_NFT=0x...
```

## Security Considerations

### SSL/TLS Setup

1. **Obtain SSL Certificate**:
   ```bash
   # Using Let's Encrypt
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Configure HTTPS Redirect**:
   - Update nginx configuration
   - Set HTTPS-only cookies
   - Enable HSTS headers

### Environment Security

- Never commit `.env` files to version control
- Use AWS Secrets Manager or similar for production secrets
- Rotate keys and passwords regularly
- Enable audit logging

### Network Security

- Configure VPC with private subnets for databases
- Use security groups to restrict access
- Enable WAF for additional protection
- Configure DDoS protection

## Monitoring and Logging

### Application Monitoring

```bash
# Health checks
curl https://api.yourdomain.com/health

# Metrics endpoints
curl https://api.yourdomain.com/metrics
```

### Log Aggregation

- Configure CloudWatch Logs for AWS
- Use ELK stack for comprehensive logging
- Set up alerts for critical errors

### Performance Monitoring

- Monitor database performance
- Track API response times
- Monitor blockchain transaction costs
- Set up uptime monitoring

## Backup and Recovery

### Database Backups

```bash
# Automated daily backups
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d).sql
```

### File Uploads Backup

```bash
# Sync uploads to S3
aws s3 sync uploads/ s3://trustchain-backups/uploads/
```

### Disaster Recovery

1. **RTO (Recovery Time Objective)**: < 4 hours
2. **RPO (Recovery Point Objective)**: < 1 hour
3. **Backup frequency**: Daily with transaction log backups every 15 minutes

## Scaling Considerations

### Horizontal Scaling

- Use Application Load Balancer for multiple backend instances
- Implement Redis clustering for cache scaling
- Consider read replicas for database scaling

### Performance Optimization

- Enable Redis caching for frequently accessed data
- Optimize database queries with proper indexing
- Use CDN for static assets
- Implement connection pooling

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   ```bash
   # Check database connectivity
   pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER
   ```

2. **Redis Connection Issues**:
   ```bash
   # Test Redis connection
   redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
   ```

3. **Blockchain Connection Issues**:
   ```bash
   # Test RPC connection
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     $POLYGON_RPC_URL
   ```

### Performance Issues

- Check database slow query logs
- Monitor memory and CPU usage
- Analyze network latency
- Review cache hit rates

## Maintenance

### Regular Tasks

- **Daily**: Monitor logs and metrics
- **Weekly**: Review security alerts
- **Monthly**: Update dependencies and patches
- **Quarterly**: Security audit and penetration testing

### Update Procedures

1. **Test in staging environment**
2. **Create database backup**
3. **Deploy with blue-green strategy**
4. **Monitor for issues**
5. **Rollback if necessary**

## Support and Documentation

- **API Documentation**: https://api.yourdomain.com/docs
- **User Manual**: https://docs.yourdomain.com
- **Issue Tracking**: GitHub Issues
- **Security Reports**: security@yourdomain.com

## License and Compliance

- MIT License
- GDPR compliant (EU users)
- SOC 2 Type II certified
- Regular security audits
