# SAP BAS Deployment Guide - Employee Management System

Complete guide for deploying the Employee Management System from SAP Business Application Studio to SAP BTP.

## 📋 Prerequisites

### SAP BTP Subaccount Requirements

- ✅ Cloud Foundry environment enabled
- ✅ SAP Business Application Studio subscription
- ✅ Required service entitlements:
  - Authorization and Trust Management Service (XSUAA) - Application plan
  - Cloud Foundry Runtime
  - SAP HANA Cloud (optional, for production database)

### User Permissions

- Space Developer role in Cloud Foundry space
- Subaccount Administrator (for service creation)

## 🚀 Step-by-Step Deployment

### Step 1: Access SAP Business Application Studio

1. **Open SAP BTP Cockpit**

   - Navigate to your subaccount
   - Go to Services → Instances and Subscriptions
   - Click on SAP Business Application Studio

2. **Create Development Space**
   - Click "Create Dev Space"
   - Name: `employee-management-dev`
   - Type: **Full Stack Cloud Application**
   - Additional SAP Extensions:
     - ✅ MTA Tools
     - ✅ Cloud Foundry Tools
     - ✅ HTML5 Application Template

### Step 2: Clone Repository in SAP BAS

```bash
# Open terminal in SAP BAS
git clone https://github.com/your-username/employee-management-system.git
cd employee-management-system
```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd app/employee-portal
npm install
cd ../..

# Install approuter dependencies
cd approuter
npm install
cd ..
```

### Step 4: Build the Application

```bash
# Build React frontend
npm run build:react

# Build CAP backend for production
cds build --production
```

### Step 5: Login to Cloud Foundry

```bash
# Login to CF (replace region with your actual region)
cf login -a https://api.cf.eu10.hana.ondemand.com

# Select your organization and space
cf target -o "your-org" -s "your-space"
```

### Step 6: Create Required Services

#### 6.1 Create XSUAA Service Instance

```bash
# Create XSUAA service with security configuration
cf create-service xsuaa application employee-management-xsuaa -c xs-security.json
```

#### 6.2 Create Database Service (Optional)

For SQLite (Development):

```bash
# No additional service needed - uses local SQLite
```

For SAP HANA Cloud (Production):

```bash
# Create HANA service instance
cf create-service hana hdi-shared employee-management-db
```

#### 6.3 Verify Service Creation

```bash
# Check service status
cf services

# Wait until services show "create succeeded"
```

### Step 7: Deploy Using MTA

#### 7.1 Build MTA Archive

```bash
# Install MTA Build Tool if not available
npm install -g mbt

# Build MTA archive
mbt build
```

#### 7.2 Deploy MTA

```bash
# Deploy the built archive
cf deploy mta_archives/employee-management-system_1.0.0.mtar
```

### Step 8: Verify Deployment

```bash
# Check application status
cf apps

# View application logs
cf logs employee-management-approuter --recent
cf logs employee-management-srv --recent
```

## 🔧 Post-Deployment Configuration

### Step 1: Configure XSUAA Role Collections

1. **Access SAP BTP Cockpit**

   - Navigate to Security → Role Collections

2. **Create Role Collections:**

   **Employee-Basic:**

   ```
   Roles:
   - employee-management-system!t123456.Employee.Read
   ```

   **Employee-Manager:**

   ```
   Roles:
   - employee-management-system!t123456.Employee.Read
   - employee-management-system!t123456.Employee.Write
   - employee-management-system!t123456.Leave.Approve
   - employee-management-system!t123456.Timesheet.Approve
   ```

   **HR-Administrator:**

   ```
   Roles:
   - employee-management-system!t123456.Employee.Read
   - employee-management-system!t123456.Employee.Write
   - employee-management-system!t123456.Employee.Delete
   - employee-management-system!t123456.Department.Manage
   - employee-management-system!t123456.Admin
   - employee-management-system!t123456.Reports.View
   ```

### Step 2: Assign Users to Role Collections

1. **Navigate to Security → Trust Configuration**
2. **Select your Identity Provider** (Default identity provider or custom IDP)
3. **Add Users:**
   - Enter user email
   - Assign appropriate role collections
   - Save assignments

### Step 3: Test Application Access

1. **Get Application URL:**

   ```bash
   cf apps
   # Look for employee-management-approuter URL
   ```

2. **Access Application:**
   - Open the approuter URL in browser
   - You should be redirected to SAP login page
   - Login with assigned user credentials
   - Verify role-based access control

## 🛠️ Production Configuration

### Environment Variables

Set these in SAP BTP Cockpit or via CF CLI:

```bash
# Set production environment
cf set-env employee-management-srv NODE_ENV production
cf set-env employee-management-srv CDS_LOG_LEVEL info

# Restart applications
cf restart employee-management-srv
cf restart employee-management-approuter
```

### Database Migration (For HANA)

If using SAP HANA Cloud:

```bash
# Deploy database artifacts
cds deploy --to hana:employee-management-db
```

### Scaling Applications

```bash
# Scale approuter
cf scale employee-management-approuter -i 2

# Scale backend service
cf scale employee-management-srv -i 2 -m 1G
```

## 🔍 Monitoring and Troubleshooting

### View Application Logs

```bash
# Real-time logs
cf logs employee-management-approuter
cf logs employee-management-srv

# Recent logs
cf logs employee-management-approuter --recent
cf logs employee-management-srv --recent
```

### Check Service Bindings

```bash
# View environment variables
cf env employee-management-srv
cf env employee-management-approuter

# Check service details
cf service employee-management-xsuaa
```

### Common Issues and Solutions

#### 1. XSUAA Authentication Fails

```bash
# Check XSUAA service status
cf service employee-management-xsuaa

# Verify xs-security.json configuration
cat xs-security.json

# Recreate service if needed
cf delete-service employee-management-xsuaa
cf create-service xsuaa application employee-management-xsuaa -c xs-security.json
```

#### 2. Application Won't Start

```bash
# Check logs for errors
cf logs employee-management-srv --recent

# Verify service bindings
cf services

# Restart application
cf restart employee-management-srv
```

#### 3. Role Assignment Issues

- Verify role collections are created correctly
- Check user assignments in BTP cockpit
- Ensure XSUAA service includes all required scopes

## 📊 Service Management Commands

### Useful CF Commands

```bash
# Application management
cf apps                              # List all applications
cf app employee-management-srv       # App details
cf restart employee-management-srv   # Restart application
cf stop employee-management-srv      # Stop application
cf start employee-management-srv     # Start application

# Service management
cf services                          # List all services
cf service employee-management-xsuaa # Service details
cf update-service employee-management-xsuaa -c xs-security.json  # Update service

# Environment management
cf env employee-management-srv       # Show environment variables
cf set-env employee-management-srv KEY VALUE  # Set environment variable
cf unset-env employee-management-srv KEY      # Remove environment variable

# Log management
cf logs employee-management-srv      # Stream logs
cf logs employee-management-srv --recent  # Recent logs
```

## 🔄 Updates and Maintenance

### Updating the Application

1. **Make changes in SAP BAS**
2. **Build and deploy:**
   ```bash
   npm run build
   mbt build
   cf deploy mta_archives/employee-management-system_1.0.0.mtar
   ```

### Updating XSUAA Configuration

```bash
# Update xs-security.json file
# Then update the service
cf update-service employee-management-xsuaa -c xs-security.json
```

## 🎯 Success Criteria

After successful deployment, you should have:

- ✅ Applications running (`cf apps` shows all apps as "started")
- ✅ Services created and bound (`cf services` shows "create succeeded")
- ✅ XSUAA authentication working (login redirects to SAP IDP)
- ✅ Role-based access control functioning
- ✅ All application features accessible based on user roles

## 📞 Support

If you encounter issues:

1. **Check the logs first:** `cf logs <app-name> --recent`
2. **Verify service status:** `cf services`
3. **Check SAP BTP Cockpit** for service health
4. **Review role assignments** in Security section
5. **Consult SAP Help Portal** for specific error messages

---

**Your Employee Management System is now successfully deployed to SAP BTP with enterprise-grade security!** 🎉
