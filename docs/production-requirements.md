# Production Requirements & Services Guide

Complete guide for production deployment requirements, CF services, and MTA configuration for the Employee Management System.

## 🏢 SAP BTP Production Requirements

### 1. Subaccount Configuration

#### Essential Entitlements

| Service                                        | Plan        | Quantity | Purpose                 |
| ---------------------------------------------- | ----------- | -------- | ----------------------- |
| **Authorization and Trust Management Service** | application | 1        | XSUAA authentication    |
| **Cloud Foundry Runtime**                      | MEMORY      | 2GB      | Application hosting     |
| **Application Logging Service**                | lite        | 1        | Log management          |
| **Application Autoscaler**                     | standard    | 1        | Auto-scaling (optional) |

#### Optional Production Entitlements

| Service                          | Plan     | Quantity | Purpose                      |
| -------------------------------- | -------- | -------- | ---------------------------- |
| **SAP HANA Cloud**               | hana     | 1        | Production database          |
| **Connectivity Service**         | lite     | 1        | On-premise connectivity      |
| **Destination Service**          | lite     | 1        | External service integration |
| **HTML5 Application Repository** | app-host | 1        | Static content hosting       |

### 2. Cloud Foundry Space Setup

```bash
# Required space configuration
cf create-space employee-management-prod
cf target -s employee-management-prod

# Set space quotas for production
cf set-space-quota employee-management-prod production-quota
```

## 🔧 Required CF Services

### 1. XSUAA Service Configuration

```bash
# Create XSUAA service instance
cf create-service xsuaa application employee-management-xsuaa -c xs-security.json
```

**xs-security.json Configuration:**

```json
{
  "xsappname": "employee-management-system",
  "tenant-mode": "dedicated",
  "scopes": [
    {
      "name": "$XSAPPNAME.Employee.Read",
      "description": "Read employee data"
    },
    {
      "name": "$XSAPPNAME.Employee.Write",
      "description": "Create and update employees"
    },
    {
      "name": "$XSAPPNAME.Employee.Delete",
      "description": "Delete employee records"
    },
    {
      "name": "$XSAPPNAME.Admin",
      "description": "Full administrative access"
    }
  ],
  "role-templates": [
    {
      "name": "Employee-Basic",
      "scope-references": ["$XSAPPNAME.Employee.Read"]
    },
    {
      "name": "Employee-Manager",
      "scope-references": [
        "$XSAPPNAME.Employee.Read",
        "$XSAPPNAME.Employee.Write",
        "$XSAPPNAME.Leave.Approve"
      ]
    },
    {
      "name": "HR-Administrator",
      "scope-references": [
        "$XSAPPNAME.Employee.Read",
        "$XSAPPNAME.Employee.Write",
        "$XSAPPNAME.Employee.Delete",
        "$XSAPPNAME.Admin"
      ]
    }
  ]
}
```

### 2. Database Service Configuration

#### Option A: SQLite (Development/Testing)

```bash
# No additional service required - uses embedded SQLite
```

#### Option B: SAP HANA Cloud (Production Recommended)

```bash
# Create HANA service instance
cf create-service hana hdi-shared employee-management-db

# Wait for service creation
cf service employee-management-db
```

#### Option C: PostgreSQL (Alternative)

```bash
# Create PostgreSQL service (if available)
cf create-service postgresql v9.6-small employee-management-db
```

### 3. Additional Production Services

#### Application Logging

```bash
# Create logging service
cf create-service application-logs lite employee-management-logs
```

#### Application Autoscaler

```bash
# Create autoscaler service
cf create-service autoscaler standard employee-management-autoscaler
```

#### Connectivity (if needed)

```bash
# Create connectivity service for on-premise integration
cf create-service connectivity lite employee-management-connectivity
```

## 📦 MTA Configuration Deep Dive

### Complete mta.yaml for Production

```yaml
_schema-version: "3.1"
ID: employee-management-system
version: 1.0.0
description: "SAP CAP Employee Management System"

parameters:
  enable-parallel-deployments: true

build-parameters:
  before-all:
    - builder: custom
      commands:
        - npm ci --production
        - npx cds build --production

modules:
  # Backend Service Module
  - name: employee-management-srv
    type: nodejs
    path: gen/srv
    parameters:
      buildpack: nodejs_buildpack
      memory: 512M
      instances: 2
      health-check-type: http
      health-check-http-endpoint: /health
    build-parameters:
      builder: npm-ci
    provides:
      - name: srv-api
        properties:
          srv-url: ${default-url}
    requires:
      - name: employee-management-db
      - name: employee-management-xsuaa
      - name: employee-management-logs
    properties:
      NODE_ENV: production
      CDS_LOG_LEVEL: info

  # Application Router Module
  - name: employee-management-approuter
    type: nodejs
    path: approuter
    parameters:
      buildpack: nodejs_buildpack
      memory: 256M
      instances: 2
      keep-existing-routes: true
    build-parameters:
      builder: npm-ci
    requires:
      - name: srv-api
        group: destinations
        properties:
          name: srv-api
          url: ~{srv-url}
          forwardAuthToken: true
      - name: employee-management-xsuaa
      - name: employee-management-logs
    properties:
      SEND_XFRAMEOPTIONS: false
      COOKIES_SAME_SITE: None

  # Database Deployment Module (for HANA)
  - name: employee-management-db-deployer
    type: hdb
    path: gen/db
    parameters:
      buildpack: nodejs_buildpack
    requires:
      - name: employee-management-db

resources:
  # XSUAA Service
  - name: employee-management-xsuaa
    type: org.cloudfoundry.managed-service
    parameters:
      service: xsuaa
      service-plan: application
      path: ./xs-security.json
      config:
        xsappname: employee-management-system-${org}-${space}
        tenant-mode: dedicated

  # Database Service
  - name: employee-management-db
    type: org.cloudfoundry.managed-service
    parameters:
      service: hana
      service-plan: hdi-shared

  # Logging Service
  - name: employee-management-logs
    type: org.cloudfoundry.managed-service
    parameters:
      service: application-logs
      service-plan: lite

  # Autoscaler Service (Optional)
  - name: employee-management-autoscaler
    type: org.cloudfoundry.managed-service
    parameters:
      service: autoscaler
      service-plan: standard
```

## 🔐 Security Configuration for Production

### 1. XSUAA Production Settings

```json
{
  "xsappname": "employee-management-system-prod",
  "tenant-mode": "dedicated",
  "description": "Production Employee Management System",
  "oauth2-configuration": {
    "redirect-uris": [
      "https://employee-management-*.cfapps.eu10.hana.ondemand.com/**"
    ],
    "system-attributes": ["groups", "rolecollections"]
  },
  "attributes": [
    {
      "name": "Department",
      "description": "Employee department for data isolation",
      "valueType": "string"
    },
    {
      "name": "CostCenter",
      "description": "Cost center for budget tracking",
      "valueType": "string"
    }
  ]
}
```

### 2. Role Collection Mapping

| Business Role    | Technical Scopes                             | Use Case              |
| ---------------- | -------------------------------------------- | --------------------- |
| **Employee**     | Employee.Read                                | Basic employee access |
| **Team Lead**    | Employee.Read, Employee.Write, Leave.Approve | Team management       |
| **HR Manager**   | Employee.\*, Department.Manage, Reports.View | HR operations         |
| **System Admin** | Admin                                        | Full system access    |

## 📊 Resource Planning

### Application Resource Allocation

| Component              | Memory | Instances | CPU       | Disk  |
| ---------------------- | ------ | --------- | --------- | ----- |
| **Backend Service**    | 512MB  | 2         | 0.5 vCPU  | 1GB   |
| **Application Router** | 256MB  | 2         | 0.25 vCPU | 512MB |
| **Database Deployer**  | 256MB  | 1         | 0.25 vCPU | 512MB |

### Service Instance Sizing

| Service        | Plan        | Resources         | Cost Impact |
| -------------- | ----------- | ----------------- | ----------- |
| **XSUAA**      | application | Standard          | Low         |
| **HANA Cloud** | hdi-shared  | 2GB               | Medium      |
| **App Logs**   | lite        | 1GB/day           | Low         |
| **Autoscaler** | standard    | Per scaling event | Low         |

## 🚀 Deployment Strategies

### 1. Blue-Green Deployment

```bash
# Deploy to staging environment first
cf deploy mta_archives/employee-management-system_1.0.0.mtar -e deploy-staging.mtaext

# Test staging environment
# Then deploy to production
cf deploy mta_archives/employee-management-system_1.0.0.mtar -e deploy-production.mtaext
```

### 2. Rolling Updates

```yaml
# In mta.yaml
parameters:
  enable-parallel-deployments: true
  no-start: false
  keep-existing-routes: true
```

### 3. Canary Deployment

```bash
# Deploy with reduced instances initially
cf scale employee-management-srv -i 1
# Monitor and gradually increase
cf scale employee-management-srv -i 2
```

## 🔍 Monitoring & Observability

### Application Monitoring

```bash
# Set up health check endpoints
cf set-health-check employee-management-srv http --endpoint /health

# Configure logging
cf set-env employee-management-srv CDS_LOG_LEVEL info
cf set-env employee-management-srv NODE_ENV production
```

### Service Health Checks

```bash
# Check service health
cf service employee-management-xsuaa
cf service employee-management-db

# Monitor service bindings
cf env employee-management-srv
```

## 🔒 Security Hardening

### 1. Network Security

```yaml
# In mta.yaml - network policies
network-policies:
  - source: employee-management-approuter
    destination: employee-management-srv
    protocol: tcp
    ports: 8080
```

### 2. Environment Security

```bash
# Set secure environment variables
cf set-env employee-management-srv SECURE_COOKIES true
cf set-env employee-management-srv SESSION_TIMEOUT 3600
cf set-env employee-management-srv CSRF_PROTECTION true
```

### 3. XSUAA Security

```json
{
  "oauth2-configuration": {
    "token-validity": 3600,
    "refresh-token-validity": 7200,
    "system-attributes": ["groups", "rolecollections"]
  }
}
```

## 📈 Performance Optimization

### Application Tuning

```bash
# Optimize Node.js settings
cf set-env employee-management-srv NODE_OPTIONS "--max-old-space-size=400"
cf set-env employee-management-srv UV_THREADPOOL_SIZE 8

# Enable compression
cf set-env employee-management-approuter COMPRESSION true
```

### Database Optimization

```sql
-- For HANA Cloud
-- Create indexes for frequently queried fields
CREATE INDEX IDX_EMPLOYEE_DEPT ON Employees(department_ID);
CREATE INDEX IDX_TIMESHEET_DATE ON TimeSheets(date);
```

## 🔄 Backup & Recovery

### Database Backup

```bash
# For HANA Cloud - automatic backups are configured
# Verify backup schedule in HANA Cloud Central
```

### Application Backup

```bash
# Export service configurations
cf curl /v2/service_instances > service_instances_backup.json

# Backup XSUAA configuration
cf service-key employee-management-xsuaa xsuaa-key > xsuaa_backup.json
```

## 📋 Production Checklist

### Pre-Deployment

- [ ] All entitlements configured
- [ ] CF space created and configured
- [ ] xs-security.json validated
- [ ] mta.yaml production settings applied
- [ ] Environment variables configured
- [ ] Health check endpoints implemented

### Post-Deployment

- [ ] All services created successfully
- [ ] Applications started and healthy
- [ ] XSUAA role collections created
- [ ] Users assigned to role collections
- [ ] Application accessible via approuter
- [ ] Authentication flow working
- [ ] Role-based access control verified
- [ ] Performance metrics baseline established
- [ ] Monitoring alerts configured

### Security Validation

- [ ] XSUAA authentication working
- [ ] Role-based authorization enforced
- [ ] HTTPS/TLS encryption enabled
- [ ] CSRF protection active
- [ ] Input validation working
- [ ] Audit logging enabled

---

**Your Employee Management System is now production-ready with enterprise-grade security and scalability!** 🚀
