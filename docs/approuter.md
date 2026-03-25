# SAP BTP Application Router (Approuter)

## Overview

The SAP BTP Application Router is a Node.js application that serves as a single entry point for your multi-target applications (MTA) on the SAP Business Technology Platform. It acts as a reverse proxy that routes requests to different microservices while handling authentication, authorization, and other cross-cutting concerns.

## Key Features

### 1. **Request Routing**

- Routes incoming requests to appropriate backend services
- Supports static content serving
- Handles microservice communication
- Load balancing capabilities

### 2. **Authentication & Authorization**

- Integrates with XSUAA service for user authentication
- Handles OAuth2/JWT token management
- Session management and SSO (Single Sign-On)
- Role-based access control

### 3. **Security**

- CSRF protection
- CORS handling
- Security headers management
- Content Security Policy (CSP)

### 4. **Static Content Serving**

- Serves UI5 applications
- Handles static files (HTML, CSS, JS)
- CDN integration support

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Browser/UI    │───▶│  Application     │───▶│   Backend       │
│   Application   │    │  Router          │    │   Services      │
└─────────────────┘    │  (Approuter)     │    │   (CAP/Java)    │
                       └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │     XSUAA        │
                       │   (Auth Service) │
                       └──────────────────┘
```

## Configuration Files

### 1. **xs-app.json** - Main routing configuration

```json
{
  "welcomeFile": "/index.html",
  "authenticationMethod": "route",
  "routes": [
    {
      "source": "^/employee/(.*)$",
      "target": "/employee/$1",
      "destination": "cap-backend",
      "authenticationType": "xsuaa",
      "scope": "employee.read"
    },
    {
      "source": "^/admin/(.*)$",
      "target": "/admin/$1",
      "destination": "cap-backend",
      "authenticationType": "xsuaa",
      "scope": "admin.write"
    },
    {
      "source": "^/(.*)$",
      "target": "$1",
      "service": "html5-apps-repo-rt",
      "authenticationType": "xsuaa"
    }
  ],
  "logout": {
    "logoutEndpoint": "/logout",
    "logoutPage": "/logout.html"
  }
}
```

### 2. **package.json** - Dependencies and scripts

```json
{
  "name": "approuter",
  "version": "1.0.0",
  "dependencies": {
    "@sap/approuter": "^10.0.0"
  },
  "scripts": {
    "start": "node node_modules/@sap/approuter/approuter.js"
  }
}
```

### 3. **manifest.yml** - Cloud Foundry deployment configuration

```yaml
applications:
  - name: employee-mgmt-approuter
    memory: 256M
    buildpack: nodejs_buildpack
    path: .
    env:
      destinations: >
        [
          {
            "name": "cap-backend",
            "url": "https://employee-mgmt-backend.cfapps.eu10.hana.ondemand.com",
            "forwardAuthToken": true
          }
        ]
    services:
      - employee-mgmt-xsuaa
      - employee-mgmt-html5-repo-runtime
```

## Route Configuration Properties

### **Route Object Properties**

| Property             | Type         | Description                                      |
| -------------------- | ------------ | ------------------------------------------------ |
| `source`             | String       | Regex pattern to match incoming requests         |
| `target`             | String       | Target path for the matched request              |
| `destination`        | String       | Name of the destination service                  |
| `service`            | String       | Platform service to use                          |
| `authenticationType` | String       | Authentication method (`none`, `basic`, `xsuaa`) |
| `scope`              | String/Array | Required OAuth scopes                            |
| `csrfProtection`     | Boolean      | Enable CSRF protection                           |
| `cacheControl`       | String       | HTTP cache control headers                       |

### **Authentication Types**

1. **none** - No authentication required
2. **basic** - Basic HTTP authentication
3. **xsuaa** - OAuth2 with XSUAA service

## Environment Variables

### **Common Environment Variables**

```bash
# Port configuration
PORT=5000

# Authentication
XSUAA_SERVICE_NAME=employee-mgmt-xsuaa

# Destinations
destinations='[{"name":"cap-backend","url":"http://localhost:4004","forwardAuthToken":true}]'

# Session configuration
SESSION_TIMEOUT=30

# Security headers
SEND_XFRAMEOPTIONS_HEADER=false
```

## Advanced Features

### 1. **Custom Middleware**

```javascript
// custom-middleware.js
module.exports = function (req, res, next) {
  // Custom logic here
  console.log("Custom middleware executed");
  next();
};
```

### 2. **Request/Response Transformation**

```json
{
  "source": "^/api/(.*)$",
  "target": "/v1/$1",
  "destination": "backend-service",
  "authenticationType": "xsuaa",
  "replace": {
    "pathSuffixes": ["/old-path"],
    "vars": ["API_VERSION"]
  }
}
```

### 3. **WebSocket Support**

```json
{
  "source": "^/websocket/(.*)$",
  "target": "/ws/$1",
  "destination": "websocket-service",
  "websockets": true
}
```

## Development vs Production

### **Local Development**

```json
{
  "routes": [
    {
      "source": "^/api/(.*)$",
      "target": "http://localhost:4004/$1",
      "authenticationType": "none"
    }
  ]
}
```

### **Cloud Deployment**

```json
{
  "routes": [
    {
      "source": "^/api/(.*)$",
      "target": "/api/$1",
      "destination": "cap-backend",
      "authenticationType": "xsuaa",
      "scope": ["employee.read", "employee.write"]
    }
  ]
}
```

## Security Best Practices

### 1. **Route Security**

- Always use HTTPS in production
- Implement proper authentication for sensitive routes
- Use specific scopes for fine-grained access control
- Enable CSRF protection for state-changing operations

### 2. **Headers Configuration**

```json
{
  "httpHeaders": [
    {
      "name": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "name": "X-Content-Type-Options",
      "value": "nosniff"
    }
  ]
}
```

### 3. **Content Security Policy**

```json
{
  "csp": {
    "policy": {
      "default-src": "'self'",
      "script-src": "'self' 'unsafe-inline'",
      "style-src": "'self' 'unsafe-inline'"
    }
  }
}
```

## Monitoring and Logging

### **Application Logs**

```javascript
// Enable detailed logging
process.env.XS_APP_LOG_LEVEL = "debug";
```

### **Health Check Endpoint**

The approuter automatically provides:

- `/health` - Application health status
- `/metrics` - Application metrics

## Common Use Cases

### 1. **Multi-Tenant Applications**

```json
{
  "source": "^/tenant/([^/]+)/(.*)$",
  "target": "/$2",
  "destination": "backend-service",
  "authenticationType": "xsuaa",
  "identityProvider": "$1"
}
```

### 2. **API Gateway Pattern**

```json
{
  "routes": [
    {
      "source": "^/api/v1/(.*)$",
      "target": "/v1/$1",
      "destination": "service-v1"
    },
    {
      "source": "^/api/v2/(.*)$",
      "target": "/v2/$1",
      "destination": "service-v2"
    }
  ]
}
```

### 3. **Static Content with Authentication**

```json
{
  "source": "^/admin/(.*)$",
  "target": "/admin/$1",
  "service": "html5-apps-repo-rt",
  "authenticationType": "xsuaa",
  "scope": "admin.access"
}
```

## Troubleshooting

### **Common Issues**

1. **Authentication Failures**

   - Check XSUAA service binding
   - Verify scope configurations
   - Check JWT token validity

2. **Routing Issues**

   - Validate regex patterns in routes
   - Check destination configurations
   - Verify service bindings

3. **Performance Issues**
   - Enable caching for static content
   - Optimize route ordering
   - Monitor memory usage

### **Debug Commands**

```bash
# Enable debug logging
export DEBUG=@sap/approuter*

# Check service bindings
cf env your-app-name

# View application logs
cf logs your-app-name --recent
```

## Integration with CAP

### **CAP Backend Integration**

```json
{
  "routes": [
    {
      "source": "^/employee/(.*)$",
      "target": "/employee/$1",
      "destination": "cap-backend",
      "authenticationType": "xsuaa",
      "csrfProtection": false
    },
    {
      "source": "^/admin/(.*)$",
      "target": "/admin/$1",
      "destination": "cap-backend",
      "authenticationType": "xsuaa",
      "scope": "admin.write"
    }
  ]
}
```

### **Destination Configuration**

```javascript
// In approuter environment
destinations = [
  {
    name: "cap-backend",
    url: "https://your-cap-app.cfapps.eu10.hana.ondemand.com",
    forwardAuthToken: true,
    timeout: 30000,
  },
];
```

## Summary

The Application Router is essential for:

- **Single Entry Point**: Unified access to your application landscape
- **Security**: Centralized authentication and authorization
- **Routing**: Intelligent request routing to microservices
- **Integration**: Seamless integration with SAP BTP services
- **Scalability**: Load balancing and performance optimization

It serves as the front door to your SAP BTP applications, providing security, routing, and integration capabilities while maintaining a clean separation of concerns between your UI and backend services.
