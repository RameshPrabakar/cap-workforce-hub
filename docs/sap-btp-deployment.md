# SAP BTP Deployment Guide for Employee Management System

This guide provides step-by-step instructions to deploy the Employee Management System to SAP BTP with XSUAA authentication.

## Prerequisites

### 1. SAP BTP Account Setup

- Access to SAP BTP subaccount with Cloud Foundry environment enabled
- Business Application Studio or local development environment
- Required entitlements:
  - Cloud Foundry Runtime
  - Authorization and Trust Management Service (XSUAA)
  - SAP HANA Cloud (optional, for production database)

### 2. Development Tools

- Node.js 18 or higher
- Cloud Foundry CLI: `https://docs.cloudfoundry.org/cf-cli/`
- MTA Build Tool: `npm install -g mbt`
- MultiApps CF CLI Plugin: `cf install-plugin multiapps`

## Deployment Steps

### Step 1: Prepare Your Environment

1. **Clone and setup the project:**

   ```bash
   git clone <your-repository>
   cd employee-management-system
   npm install
   ```

2. **Login to Cloud Foundry:**

   ```bash
   cf login -a https://api.cf.{region}.hana.ondemand.com
   ```

   Replace `{region}` with your actual region (e.g., `eu10`, `us10`)

3. **Target your space:**
   ```bash
   cf target -o <your-org> -s <your-space>
   ```

### Step 2: Build the Application

1. **Build React frontend:**

   ```bash
   cd app/employee-portal
   npm install
   npm run build
   cd ../..
   ```

2. **Build CAP backend:**
   ```bash
   npm run build
   ```

### Step 3: Deploy to SAP BTP

#### Option A: Using MTA (Recommended)

1. **Build MTA archive:**

   ```bash
   mbt build
   ```

2. **Deploy the MTA:**
   ```bash
   cf deploy mta_archives/employee-management-system_1.0.0.mtar
   ```

#### Option B: Using Scripts

**Windows:**

```cmd
deploy.bat
```

**Linux/Mac:**

```bash
chmod +x deploy.sh
./deploy.sh
```

### Step 4: Configure XSUAA and User Roles

1. **Access SAP BTP Cockpit:**

   - Navigate to your subaccount
   - Go to Security → Role Collections

2. **Create Role Collections:**

   ```
   Employee-Basic: Employee.Read
   Employee-Manager: Employee.Read, Employee.Write, Leave.Approve, Timesheet.Approve
   HR-Administrator: Employee.Read, Employee.Write, Employee.Delete, Department.Manage, Admin, Reports.View
   ```

3. **Assign Users to Role Collections:**
   - Go to Security → Trust Configuration
   - Select your Identity Provider
   - Add users and assign appropriate role collections

### Step 5: Access Your Application

1. **Get application URL:**

   ```bash
   cf apps
   ```

2. **Access the application:**
   - Open the URL for `employee-management-approuter`
   - You will be redirected to the login page
   - Use your SAP BTP user credentials

## Configuration Files Overview

### Core Files

- `xs-security.json` - XSUAA security configuration
- `mta.yaml` - Multi-target application descriptor
- `manifest.yml` - Cloud Foundry deployment manifest
- `approuter/xs-app.json` - Application router configuration

### Service Files

- `srv/employee-service.cds` - Service definitions with security annotations
- `srv/auth-handler.js` - Authentication and authorization logic
- `srv/employee-service.js` - Business logic implementation

## Security Configuration

### XSUAA Scopes and Roles

| Scope               | Description                | Role Collections                                   |
| ------------------- | -------------------------- | -------------------------------------------------- |
| `Employee.Read`     | Read employee data         | Employee-Basic, Employee-Manager, HR-Administrator |
| `Employee.Write`    | Create/update employees    | Employee-Manager, HR-Administrator                 |
| `Employee.Delete`   | Delete employees           | HR-Administrator                                   |
| `Department.Manage` | Manage departments         | HR-Administrator                                   |
| `Leave.Approve`     | Approve leave requests     | Employee-Manager, HR-Administrator                 |
| `Timesheet.Approve` | Approve timesheets         | Employee-Manager, HR-Administrator                 |
| `Reports.View`      | View analytics reports     | HR-Administrator                                   |
| `Admin`             | Full administrative access | HR-Administrator                                   |

### User Attributes

- `Department` - Used for data isolation
- `CostCenter` - Used for budget tracking

## Troubleshooting

### Common Issues

1. **Authentication Failed:**

   - Check XSUAA service binding
   - Verify xs-security.json configuration
   - Ensure user has correct role assignments

2. **403 Forbidden Errors:**

   - Check user role assignments in BTP cockpit
   - Verify service annotations in CDS files
   - Check auth-handler.js logic

3. **Application Not Starting:**
   - Check application logs: `cf logs <app-name> --recent`
   - Verify environment variables
   - Check service bindings

### Useful Commands

```bash
# Check application status
cf apps

# View logs
cf logs employee-management-srv --recent
cf logs employee-management-approuter --recent

# Check service instances
cf services

# Restart application
cf restart employee-management-srv

# Check environment variables
cf env employee-management-srv
```

## Environment Variables

### Production Environment

- `NODE_ENV=production`
- `CDS_LOG_LEVEL=info`
- XSUAA credentials (automatically bound)

### Local Development with XSUAA

1. Copy `.env.production` to `.env`
2. Update XSUAA credentials from service key
3. Run: `cds run --profile production`

## Maintenance

### Updating the Application

1. Make changes to code
2. Build: `npm run build`
3. Rebuild MTA: `mbt build`
4. Redeploy: `cf deploy mta_archives/employee-management-system_1.0.0.mtar`

### Scaling

```bash
# Scale approuter
cf scale employee-management-approuter -i 2

# Scale backend service
cf scale employee-management-srv -i 2 -m 1G
```

## Support and Resources

- [SAP CAP Documentation](https://cap.cloud.sap/)
- [XSUAA Documentation](https://help.sap.com/viewer/4505d0bdaf4948449b7f7379d24d0f0d/2.0.05/en-US)
- [SAP BTP Documentation](https://help.sap.com/viewer/product/BTP/Cloud)
- [Application Router Documentation](https://help.sap.com/viewer/4505d0bdaf4948449b7f7379d24d0f0d/2.0.05/en-US/01c5f9ba7d6847aaaf069d153b981b51.html)
