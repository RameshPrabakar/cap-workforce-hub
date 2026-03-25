#!/bin/bash

# GitHub Repository Setup Script for Employee Management System

echo "🚀 Setting up GitHub repository for Employee Management System..."

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files to git
echo "📝 Adding files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "🎉 Initial commit: Employee Management System with XSUAA

✨ Features:
- SAP CAP backend with OData services
- React.js frontend with TypeScript
- XSUAA authentication and authorization
- Application Router for security
- Role-based access control
- Complete SAP BTP deployment configuration

🏗️ Architecture:
- Backend: SAP CAP with Node.js
- Frontend: React.js with TypeScript
- Authentication: XSUAA + Application Router
- Database: SQLite (dev) / HANA Cloud (prod)

🔐 Security:
- Enterprise-grade XSUAA authentication
- Role-based authorization (Admin, Manager, Employee)
- Data isolation by department
- Audit logging and approval workflows

🚀 Deployment:
- SAP Business Application Studio ready
- MTA configuration for SAP BTP
- Production-ready with documentation
- CI/CD pipeline ready"

echo ""
echo "🔗 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Copy the repository URL"
echo "3. Run the following commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/employee-management-system.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Then clone in SAP BAS:"
echo "   git clone https://github.com/YOUR_USERNAME/employee-management-system.git"
echo ""
echo "📖 Documentation available in docs/ folder:"
echo "   - docs/sap-bas-deployment.md"
echo "   - docs/production-requirements.md"
echo "   - docs/xsuaa.md"
echo "   - docs/approuter.md"
echo ""
echo "✨ Your Employee Management System is ready for GitHub and SAP BTP deployment!"
