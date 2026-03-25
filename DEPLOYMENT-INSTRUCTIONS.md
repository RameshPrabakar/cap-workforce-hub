# SAP BTP Deployment Setup Guide

## Prerequisites Installation

Since Cloud Foundry CLI needs to be installed manually, please follow these steps:

### 1. Install Cloud Foundry CLI (Manual)

**Option A: Download from Official Website**

1. Go to: https://github.com/cloudfoundry/cli/releases
2. Download the latest Windows installer (.msi or .exe)
3. Run the installer as Administrator
4. Verify installation: Open new PowerShell and run `cf --version`

**Option B: Using PowerShell (Run as Administrator)**

```powershell
# Run PowerShell as Administrator first
Invoke-WebRequest -Uri "https://cli.run.pivotal.io/stable?release=windows64-exe&source=github" -OutFile "cf-cli-installer.exe"
.\cf-cli-installer.exe
```

### 2. Install CF MultiApps Plugin

After CF CLI is installed, run:

```bash
cf install-plugin multiapps
```

## Deployment Process

### Step 1: Login to SAP BTP

```bash
# Replace {region} with your actual region (e.g., eu10, us10, ap10)
cf login -a https://api.cf.{region}.hana.ondemand.com

# Example for EU10 region:
# cf login -a https://api.cf.eu10.hana.ondemand.com
```

### Step 2: Target Your Space

```bash
cf target -o "your-org-name" -s "your-space-name"
```

### Step 3: Build and Deploy

```bash
# Build the application
npm run build

# Build MTA archive
mbt build

# Deploy to SAP BTP
cf deploy mta_archives/employee-management-system_1.0.0.mtar
```

## Alternative: Step-by-Step Service Creation

If you prefer to create services manually:

### 1. Create XSUAA Service

```bash
cf create-service xsuaa application employee-management-xsuaa -c xs-security.json
```

### 2. Create Database Service (Optional for SQLite)

```bash
cf create-service service-manager container employee-management-db
```

### 3. Push Applications Individually

```bash
# Push backend service
cf push employee-management-srv -p gen/srv

# Push application router
cf push employee-management-approuter -p approuter
```

## Verification Steps

### 1. Check Service Status

```bash
cf services
```

### 2. Check Application Status

```bash
cf apps
```

### 3. View Logs

```bash
cf logs employee-management-approuter --recent
cf logs employee-management-srv --recent
```

## Post-Deployment Configuration

### 1. Access SAP BTP Cockpit

- Navigate to your subaccount
- Go to Security → Role Collections

### 2. Create Role Collections

Create these role collections and assign scopes:

**Employee-Basic**

- Employee.Read

**Employee-Manager**

- Employee.Read
- Employee.Write
- Leave.Approve
- Timesheet.Approve

**HR-Administrator**

- Employee.Read
- Employee.Write
- Employee.Delete
- Department.Manage
- Admin
- Reports.View

### 3. Assign Users to Role Collections

- Go to Security → Trust Configuration
- Select your Identity Provider
- Add users and assign appropriate role collections

## Troubleshooting

### Common Issues:

1. **XSUAA Service Creation Failed**

   - Check if xs-security.json is valid
   - Verify you have XSUAA entitlements

2. **Application Won't Start**

   - Check logs: `cf logs app-name --recent`
   - Verify service bindings: `cf env app-name`

3. **Authentication Issues**
   - Verify XSUAA service is bound
   - Check user role assignments in BTP cockpit

### Useful Commands:

```bash
# Restart application
cf restart employee-management-srv

# Check environment variables
cf env employee-management-srv

# View service details
cf service employee-management-xsuaa

# Scale application
cf scale employee-management-srv -i 2 -m 1G
```

## Next Steps After Deployment

1. Test the application URL (from `cf apps` output)
2. Login with your SAP BTP credentials
3. Verify role-based access control
4. Test all application features
5. Monitor application performance and logs

---

**Your application is now ready for SAP BTP deployment!**
**MTA Build Tool is already installed and configured.**
**Just install CF CLI and follow the steps above.**
