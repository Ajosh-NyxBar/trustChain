@echo off
setlocal EnableDelayedExpansion

echo 🚀 Setting up TrustChain - Blockchain Supply Chain Management System
echo ==================================================================

REM Check Node.js
echo 📋 Checking prerequisites...
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js !NODE_VERSION! detected

REM Check npm
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm !NPM_VERSION! detected

REM Check git
git --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Git is not installed. Please install Git and try again.
    pause
    exit /b 1
)

echo ✅ Git is available

REM Install root dependencies
echo.
echo 📦 Installing root dependencies...
npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo.
echo 🎨 Setting up frontend...
cd frontend
if not exist "package.json" (
    echo ❌ Frontend package.json not found
    pause
    exit /b 1
)

npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

REM Install backend dependencies
echo.
echo ⚙️ Setting up backend...
cd ..\backend
if not exist "package.json" (
    echo ❌ Backend package.json not found
    pause
    exit /b 1
)

npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

REM Install blockchain dependencies
echo.
echo 🔗 Setting up blockchain...
cd ..\blockchain
if not exist "package.json" (
    echo ❌ Blockchain package.json not found
    pause
    exit /b 1
)

npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install blockchain dependencies
    pause
    exit /b 1
)
echo ✅ Blockchain dependencies installed

REM Setup environment files
echo.
echo 🔧 Setting up environment files...
cd ..

if not exist "blockchain\.env" (
    copy "blockchain\.env.example" "blockchain\.env" >nul
    echo ✅ Blockchain .env file created
) else (
    echo ⚠️ Blockchain .env file already exists
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env" >nul
    echo ✅ Frontend .env file created
) else (
    echo ⚠️ Frontend .env file already exists
)

if not exist "backend\.env" (
    echo NODE_ENV=development> backend\.env
    echo PORT=3001>> backend\.env
    echo DB_URL=mongodb://localhost:27017/trustchain>> backend\.env
    echo JWT_SECRET=your_jwt_secret_here>> backend\.env
    echo CORS_ORIGIN=http://localhost:5173>> backend\.env
    echo ✅ Backend .env file created
) else (
    echo ⚠️ Backend .env file already exists
)

REM Compile smart contracts
echo.
echo ⚡ Compiling smart contracts...
cd blockchain
npm run compile
if %ERRORLEVEL% neq 0 (
    echo ❌ Smart contract compilation failed
    pause
    exit /b 1
)
echo ✅ Smart contracts compiled successfully

cd ..

echo.
echo 🎉 TrustChain setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Configure your environment files:
echo    - blockchain\.env (add your private key for testnet deployment)
echo    - frontend\.env (add IPFS credentials)
echo    - backend\.env (configure database connection)
echo.
echo 2. To start development:
echo    npm run dev
echo.
echo 3. To deploy to Mumbai testnet:
echo    cd blockchain && npm run deploy:mumbai
echo.
echo 📚 Documentation:
echo    - Frontend: .\frontend\README.md
echo    - Backend: .\backend\README.md
echo    - Blockchain: .\blockchain\README.md
echo.
echo 🔗 Quick commands:
echo    npm run dev               # Start all services
echo    npm run dev:frontend      # Start frontend only
echo    npm run dev:backend       # Start backend only
echo    npm run dev:blockchain    # Start blockchain node only
echo    npm run deploy:contracts  # Deploy smart contracts
echo    npm run test              # Run all tests
echo.
echo Happy coding! 🚀
echo.
pause
