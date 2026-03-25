# XSUAA (Extended Services for User Account and Authentication)

## Overview

XSUAA is SAP's cloud-native identity and access management service that provides comprehensive authentication and authorization capabilities for applications running on SAP Business Technology Platform (BTP). It serves as the backbone for securing multi-tenant cloud applications.

## What is XSUAA?

XSUAA stands for **Extended Services for User Account and Authentication**. It's a platform service that:

- Manages user authentication (who you are)
- Handles authorization (what you can do)
- Supports multi-tenancy
- Provides OAuth 2.0 and JWT token-based security
- Integrates with various identity providers
- Manages application security descriptors

## Key Concepts

### 1. Authentication vs Authorization

**Authentication**: Verifying the identity of a user

- Username/password login
- SSO (Single Sign-On)
- Multi-factor authentication
- Identity provider integration

**Authorization**: Determining what an authenticated user can access

- Role-based access control (RBAC)
- Scope-based permissions
- Attribute-based access control (ABAC)

### 2. OAuth 2.0 Flow

XSUAA implements OAuth 2.0 authorization framework:

```
Client App → XSUAA → Identity Provider → User Login → Token → Client App
```

1. Client requests authorization
2. User is redirected to login
3. XSUAA validates credentials
4. Access token is issued
5. Client uses token for API calls

### 3. JWT Tokens

XSUAA issues JSON Web Tokens (JWT) containing:

- User information
- Granted scopes
- Token expiration
- Tenant information
- Custom attributes

## XSUAA Components

### 1. Security Descriptor (xs-security.json)

The `xs-security.json` file defines your application's security model:

```json
{
  "xsappname": "employee-management",
  "tenant-mode": "dedicated",
  "description": "Employee Management System Security",
  "scopes": [
    {
      "name": "$XSAPPNAME.Employee.Read",
      "description": "Read employee data"
    },
    {
      "name": "$XSAPPNAME.Employee.Write",
      "description": "Write employee data"
    },
    {
      "name": "$XSAPPNAME.Admin",
      "description": "Administrative access"
    }
  ],
  "attributes": [
    {
      "name": "Department",
      "description": "Employee department",
      "valueType": "string"
    }
  ],
  "role-templates": [
    {
      "name": "Employee",
      "description": "Employee role",
      "scope-references": ["$XSAPPNAME.Employee.Read"],
      "attribute-references": ["Department"]
    },
    {
      "name": "Manager",
      "description": "Manager role",
      "scope-references": [
        "$XSAPPNAME.Employee.Read",
        "$XSAPPNAME.Employee.Write"
      ]
    },
    {
      "name": "Admin",
      "description": "Administrator role",
      "scope-references": [
        "$XSAPPNAME.Employee.Read",
        "$XSAPPNAME.Employee.Write",
        "$XSAPPNAME.Admin"
      ]
    }
  ],
  "oauth2-configuration": {
    "token-validity": 3600,
    "refresh-token-validity": 86400,
    "redirect-uris": ["https://your-app.cfapps.sap.hana.ondemand.com/**"]
  }
}
```

### 2. Role Collections

Role collections group role templates and are assigned to users:

- **Employee Collection**: Contains Employee role template
- **Manager Collection**: Contains Manager role template
- **Admin Collection**: Contains Admin role template

### 3. Trust Configuration

XSUAA can trust external identity providers:

- SAP Identity Authentication Service (IAS)
- Active Directory
- LDAP
- Custom SAML/OpenID Connect providers

## Integration with SAP CAP

### 1. Package Dependencies

```json
{
  "dependencies": {
    "@sap/xssec": "^3.2.13",
    "@sap/audit-logging": "^5.6.1",
    "passport": "^0.6.0"
  }
}
```

### 2. CDS Security Annotations

```cds
// srv/employee-service.cds
using { sap.cap.employee as db } from '../db/schema';

@requires: 'authenticated-user'
service EmployeeService {

  @requires: 'Employee.Read'
  entity Employees as projection on db.Employees;

  @requires: 'Employee.Write'
  @restrict: [
    { grant: 'READ', to: 'Employee.Read' },
    { grant: ['CREATE', 'UPDATE'], to: 'Employee.Write' },
    { grant: 'DELETE', to: 'Admin' }
  ]
  entity EmployeeActions as projection on db.Employees;

  @requires: 'Admin'
  entity Departments as projection on db.Departments;
}
```

### 3. Authentication Middleware

```javascript
// srv/employee-service.js
const cds = require("@sap/cds");

module.exports = class EmployeeService extends cds.ApplicationService {
  async init() {
    // Authentication check
    this.before("*", (req) => {
      if (!req.user) {
        req.reject(401, "Authentication required");
      }
    });

    // Authorization check
    this.before(["CREATE", "UPDATE"], "Employees", (req) => {
      if (!req.user.is("Employee.Write")) {
        req.reject(403, "Insufficient privileges");
      }
    });

    // Attribute-based access control
    this.after("READ", "Employees", (results, req) => {
      const userDept = req.user.attr.Department;
      if (userDept && !req.user.is("Admin")) {
        return results.filter((emp) => emp.department === userDept);
      }
      return results;
    });

    return super.init();
  }
};
```

## Deployment and Configuration

### 1. Manifest.yml

```yaml
applications:
  - name: employee-management
    memory: 512M
    buildpack: nodejs_buildpack
    path: .
    services:
      - employee-management-xsuaa
      - employee-management-db
    env:
      NODE_ENV: production
```

### 2. MTA Descriptor (mta.yaml)

```yaml
ID: employee-management
version: 1.0.0

modules:
  - name: employee-management-srv
    type: nodejs
    path: .
    requires:
      - name: employee-management-xsuaa
      - name: employee-management-db
    provides:
      - name: srv-api
        properties:
          srv-url: ${default-url}

  - name: employee-management-app
    type: approuter.nodejs
    path: app/
    requires:
      - name: srv-api
        group: destinations
        properties:
          name: srv-api
          url: ~{srv-url}
          forwardAuthToken: true
      - name: employee-management-xsuaa

resources:
  - name: employee-management-xsuaa
    type: org.cloudfoundry.managed-service
    parameters:
      service: xsuaa
      service-plan: application
      path: ./xs-security.json

  - name: employee-management-db
    type: com.sap.xs.hdi-container
    parameters:
      service: hana
      service-plan: hdi-shared
```

### 3. XSUAA Service Instance Creation

```bash
# Create XSUAA service instance
cf create-service xsuaa application employee-management-xsuaa -c xs-security.json

# Update existing service
cf update-service employee-management-xsuaa -c xs-security.json

# Check service status
cf service employee-management-xsuaa
```

## Frontend Integration

### 1. Token Retrieval

```javascript
// Frontend: Getting JWT token
const token = window.location.hash
  .substr(1)
  .split("&")
  .find((item) => item.startsWith("access_token="))
  ?.split("=")[1];

// Store token for API calls
localStorage.setItem("jwt_token", token);
```

### 2. API Calls with Token

```javascript
// Include JWT token in API requests
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem("jwt_token");

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    window.location.href = "/login";
    return;
  }

  return response.json();
};
```

## User Management

### 1. Role Assignment

In BTP Cockpit:

1. Navigate to Security → Users
2. Select user
3. Assign role collections
4. Configure attributes (if needed)

### 2. Programmatic User Info

```javascript
// Get user information in service
const userInfo = req.user;
console.log("User ID:", userInfo.id);
console.log("User roles:", userInfo.roles);
console.log("User attributes:", userInfo.attr);
console.log("Tenant:", userInfo.tenant);
```

## Multi-Tenancy Support

### 1. Tenant-Aware Services

```javascript
// Automatic tenant isolation
service.before("*", (req) => {
  const tenant = req.user.tenant;
  // CAP automatically filters data by tenant
});
```

### 2. Tenant-Specific Configuration

```json
{
  "tenant-mode": "shared",
  "scopes": [
    {
      "name": "$XSAPPNAME.Callback",
      "description": "Tenant provisioning callback",
      "grant-as-authority-to-apps": ["$XSSERVICENAME(tenant-onboarding)"]
    }
  ]
}
```

## Security Best Practices

### 1. Token Validation

- Always validate JWT signatures
- Check token expiration
- Verify audience and issuer
- Implement proper error handling

### 2. Scope Management

- Use principle of least privilege
- Define granular scopes
- Regular access reviews
- Implement scope inheritance carefully

### 3. Attribute-Based Access

- Use attributes for fine-grained control
- Validate attribute values
- Consider performance implications
- Document attribute usage

## Troubleshooting

### Common Issues

1. **Token Expired**

   - Implement token refresh logic
   - Handle 401 responses gracefully
   - Configure appropriate token validity

2. **Missing Scopes**

   - Check role template assignments
   - Verify role collection configuration
   - Review scope definitions

3. **Multi-tenant Issues**
   - Verify tenant isolation
   - Check subdomain routing
   - Validate tenant-specific data

### Debugging Tools

```javascript
// Enable XSUAA debugging
process.env.DEBUG = "xssec:*";

// Log token content (development only)
const jwt = require("jsonwebtoken");
const decoded = jwt.decode(token, { complete: true });
console.log("Token payload:", decoded.payload);
```

## Migration from UAA

If migrating from Cloud Foundry UAA:

1. Update service bindings
2. Modify security descriptors
3. Update authentication middleware
4. Test role mappings
5. Validate token formats

## Conclusion

XSUAA provides enterprise-grade security for SAP BTP applications with:

- Robust authentication mechanisms
- Flexible authorization models
- Multi-tenancy support
- Integration with various identity providers
- Comprehensive audit logging

For production deployments, ensure proper configuration of:

- Security descriptors
- Role assignments
- Token validity periods
- Trust relationships
- Monitoring and logging

## Additional Resources

- [SAP XSUAA Documentation](https://help.sap.com/docs/btp/sap-business-technology-platform/what-is-sap-authorization-and-trust-management-service)
- [CAP Security Guide](https://cap.cloud.sap/docs/guides/security/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [JWT.io Token Debugger](https://jwt.io/)
