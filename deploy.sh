#!/bin/bash

# SAP BTP Deployment Script for Employee Management System

echo "🚀 Starting SAP BTP Deployment for Employee Management System"

# Check if CF CLI is installed
if ! command -v cf &> /dev/null; then
    echo "❌ Cloud Foundry CLI not found. Please install it first."
    echo "Download from: https://docs.cloudfoundry.org/cf-cli/install-go-cli.html"
    exit 1
fi

# Check if MTA Build Tool is installed
if ! command -v mbt &> /dev/null; then
    echo "❌ MTA Build Tool not found. Installing..."
    npm install -g mbt
fi

# Check if user is logged in to CF
if ! cf target &> /dev/null; then
    echo "❌ Not logged in to Cloud Foundry. Please login first:"
    echo "cf login -a https://api.cf.{region}.hana.ondemand.com"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Build the application
echo "🔨 Building the application..."
npm ci
npm run build

# Build MTA
echo "📦 Building MTA archive..."
mbt build

# Deploy to SAP BTP
echo "🚀 Deploying to SAP BTP..."
cf deploy mta_archives/employee-management-system_1.0.0.mtar

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check application status: cf apps"
echo "2. View logs: cf logs employee-management-approuter --recent"
echo "3. Access your application via the route displayed above"
echo ""
echo "🔒 XSUAA Configuration:"
echo "- XSUAA service instance: employee-management-xsuaa"
echo "- Security roles are defined in xs-security.json"
echo "- Users need to be assigned roles in SAP BTP cockpit"
