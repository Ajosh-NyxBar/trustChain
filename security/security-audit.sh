#!/bin/bash

# TrustChain Security Audit Script
# This script performs comprehensive security checks

echo "🔒 TrustChain Security Audit Starting..."
echo "=====================================\n"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize counters
CRITICAL_ISSUES=0
HIGH_ISSUES=0
MEDIUM_ISSUES=0
LOW_ISSUES=0

# Function to log issues
log_issue() {
    local severity=$1
    local message=$2
    
    case $severity in
        "CRITICAL")
            echo -e "${RED}[CRITICAL]${NC} $message"
            ((CRITICAL_ISSUES++))
            ;;
        "HIGH")
            echo -e "${RED}[HIGH]${NC} $message"
            ((HIGH_ISSUES++))
            ;;
        "MEDIUM")
            echo -e "${YELLOW}[MEDIUM]${NC} $message"
            ((MEDIUM_ISSUES++))
            ;;
        "LOW")
            echo -e "${YELLOW}[LOW]${NC} $message"
            ((LOW_ISSUES++))
            ;;
        "PASS")
            echo -e "${GREEN}[PASS]${NC} $message"
            ;;
    esac
}

# Check if required tools are installed
echo "🔧 Checking required tools..."
command -v npm >/dev/null 2>&1 || { log_issue "CRITICAL" "npm is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { log_issue "CRITICAL" "node is required but not installed."; exit 1; }
log_issue "PASS" "Required tools are installed"

# 1. NPM Security Audit
echo "\n📦 Running NPM Security Audit..."
echo "--------------------------------"

cd frontend
if npm audit --audit-level high; then
    log_issue "PASS" "Frontend NPM packages are secure"
else
    log_issue "HIGH" "Frontend NPM packages have security vulnerabilities"
fi

cd ../backend
if npm audit --audit-level high; then
    log_issue "PASS" "Backend NPM packages are secure"
else
    log_issue "HIGH" "Backend NPM packages have security vulnerabilities"
fi

cd ../blockchain
if npm audit --audit-level high; then
    log_issue "PASS" "Blockchain NPM packages are secure"
else
    log_issue "HIGH" "Blockchain NPM packages have security vulnerabilities"
fi

cd ..

# 2. Environment Variables Check
echo "\n🔐 Checking Environment Variables..."
echo "-----------------------------------"

# Check for sensitive data in .env files
if find . -name ".env*" -type f -exec grep -l "password\|secret\|key" {} \;; then
    log_issue "MEDIUM" "Potential sensitive data found in .env files"
else
    log_issue "PASS" "No obvious sensitive data in .env files"
fi

# Check for hardcoded secrets in code
if grep -r --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" "password\|secret\|api_key\|private_key" --exclude-dir=node_modules .; then
    log_issue "HIGH" "Potential hardcoded secrets found in source code"
else
    log_issue "PASS" "No hardcoded secrets found in source code"
fi

# 3. File Permissions Check
echo "\n📁 Checking File Permissions..."
echo "-------------------------------"

# Check for world-writable files
if find . -type f -perm -o+w -not -path "./node_modules/*" -not -path "./.git/*"; then
    log_issue "MEDIUM" "World-writable files found"
else
    log_issue "PASS" "No world-writable files found"
fi

# 4. Docker Security Check
echo "\n🐳 Checking Docker Configuration..."
echo "----------------------------------"

# Check for root user in Dockerfiles
if grep -r "USER root" */Dockerfile 2>/dev/null; then
    log_issue "MEDIUM" "Docker containers running as root user"
else
    log_issue "PASS" "Docker containers not running as root"
fi

# Check for exposed ports
if grep -r "EXPOSE" */Dockerfile 2>/dev/null | grep -v "80\|443\|3000"; then
    log_issue "LOW" "Non-standard ports exposed in Docker"
fi

# 5. SSL/TLS Configuration Check
echo "\n🔒 Checking SSL/TLS Configuration..."
echo "-----------------------------------"

# Check nginx configuration for SSL
if [ -f "frontend/nginx.conf" ]; then
    if grep -q "ssl" frontend/nginx.conf; then
        log_issue "PASS" "SSL configuration found in nginx"
    else
        log_issue "HIGH" "No SSL configuration found in nginx"
    fi
fi

# 6. Database Security Check
echo "\n🗄️ Checking Database Security..."
echo "--------------------------------"

# Check for SQL injection patterns
if grep -r --include="*.js" "req\.query\|req\.params" backend/ | grep -v "express-validator\|joi"; then
    log_issue "HIGH" "Potential SQL injection vulnerabilities found"
else
    log_issue "PASS" "No obvious SQL injection vulnerabilities"
fi

# 7. Authentication & Authorization Check
echo "\n🔑 Checking Authentication & Authorization..."
echo "--------------------------------------------"

# Check for JWT secret
if grep -r "JWT_SECRET" . --include="*.js" --include="*.env*"; then
    log_issue "PASS" "JWT secret configuration found"
else
    log_issue "CRITICAL" "No JWT secret configuration found"
fi

# Check for authentication middleware
if grep -r "authMiddleware\|authenticate" backend/; then
    log_issue "PASS" "Authentication middleware found"
else
    log_issue "HIGH" "No authentication middleware found"
fi

# 8. Input Validation Check
echo "\n✅ Checking Input Validation..."
echo "------------------------------"

# Check for input validation
if grep -r "express-validator\|joi" backend/; then
    log_issue "PASS" "Input validation found"
else
    log_issue "HIGH" "No input validation found"
fi

# 9. CORS Configuration Check
echo "\n🌐 Checking CORS Configuration..."
echo "--------------------------------"

if grep -r "cors" backend/; then
    log_issue "PASS" "CORS configuration found"
else
    log_issue "MEDIUM" "No CORS configuration found"
fi

# 10. Rate Limiting Check
echo "\n⏱️ Checking Rate Limiting..."
echo "----------------------------"

if grep -r "rate-limit\|rateLimit" backend/; then
    log_issue "PASS" "Rate limiting found"
else
    log_issue "MEDIUM" "No rate limiting found"
fi

# 11. Smart Contract Security (if mythx is available)
echo "\n⛓️ Checking Smart Contract Security..."
echo "-------------------------------------"

cd blockchain
if command -v mythx >/dev/null 2>&1; then
    if mythx analyze contracts/; then
        log_issue "PASS" "Smart contracts passed security analysis"
    else
        log_issue "HIGH" "Smart contracts have security issues"
    fi
else
    log_issue "LOW" "MythX not available for smart contract analysis"
fi

cd ..

# 12. Check for common vulnerabilities
echo "\n🔍 Checking for Common Vulnerabilities..."
echo "----------------------------------------"

# Check for eval() usage
if grep -r "eval(" --include="*.js" --include="*.jsx" --exclude-dir=node_modules .; then
    log_issue "HIGH" "eval() usage found - potential code injection risk"
else
    log_issue "PASS" "No eval() usage found"
fi

# Check for innerHTML usage
if grep -r "innerHTML" --include="*.js" --include="*.jsx" --exclude-dir=node_modules .; then
    log_issue "MEDIUM" "innerHTML usage found - potential XSS risk"
fi

# Summary
echo "\n📊 Security Audit Summary"
echo "========================="
echo -e "Critical Issues: ${RED}$CRITICAL_ISSUES${NC}"
echo -e "High Issues: ${RED}$HIGH_ISSUES${NC}"
echo -e "Medium Issues: ${YELLOW}$MEDIUM_ISSUES${NC}"
echo -e "Low Issues: ${YELLOW}$LOW_ISSUES${NC}"

# Overall assessment
TOTAL_HIGH_CRITICAL=$((CRITICAL_ISSUES + HIGH_ISSUES))

if [ $TOTAL_HIGH_CRITICAL -eq 0 ]; then
    echo -e "\n${GREEN}✅ Security audit passed! No critical or high-severity issues found.${NC}"
    exit 0
elif [ $TOTAL_HIGH_CRITICAL -le 2 ]; then
    echo -e "\n${YELLOW}⚠️ Security audit found some issues that should be addressed.${NC}"
    exit 1
else
    echo -e "\n${RED}❌ Security audit failed! Critical issues must be fixed before production deployment.${NC}"
    exit 2
fi
