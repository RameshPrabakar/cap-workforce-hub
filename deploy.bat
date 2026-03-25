@echo off
REM SAP BTP Deployment Script for Employee Management System (Windows)

echo 🚀 Starting SAP BTP Deployment for Employee Management System

REM Check if CF CLI is installed
cf --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Cloud Foundry CLI not found. Please install it first.
    echo Download from: https://docs.cloudfoundry.org/cf-cli/install-go-cli.html
    pause
    exit /b 1
)

REM Check if MTA Build Tool is installed
mbt --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MTA Build Tool not found. Installing...
    npm install -g mbt
)

REM Check if user is logged in to CF
cf target >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Not logged in to Cloud Foundry. Please login first:
    echo cf login -a https://api.cf.{region}.hana.ondemand.com
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Build the application
echo 🔨 Building the application...
npm ci
npm run build

REM Build MTA
echo 📦 Building MTA archive...
mbt build

REM Deploy to SAP BTP
echo 🚀 Deploying to SAP BTP...
cf deploy mta_archives/employee-management-system_1.0.0.mtar

echo ✅ Deployment completed!
echo.
echo 📋 Next steps:
echo 1. Check application status: cf apps
echo 2. View logs: cf logs employee-management-approuter --recent
echo 3. Access your application via the route displayed above
echo.
echo 🔒 XSUAA Configuration:
echo - XSUAA service instance: employee-management-xsuaa
echo - Security roles are defined in xs-security.json
echo - Users need to be assigned roles in SAP BTP cockpit

pause
