# Employee Management System - SAP CAP with XSUAA

A full-stack Employee Management System built with SAP CAP (Cloud Application Programming) backend and React.js frontend, featuring XSUAA authentication and role-based authorization.

## 🚀 Features

- **Full XSUAA Integration**: Enterprise-grade authentication and authorization
- **Role-Based Access Control**: Admin, Manager, and Employee roles with granular permissions
- **Modern React Frontend**: TypeScript, responsive design, authentication UI
- **SAP CAP Backend**: OData services, business logic, data validation
- **Application Router**: Centralized authentication and routing
- **Production Ready**: Complete SAP BTP deployment configuration

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React.js      │    │  Application     │    │   SAP CAP       │
│   Frontend      │◄──►│    Router        │◄──►│   Backend       │
│   (TypeScript)  │    │   (Approuter)    │    │   (Node.js)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     XSUAA       │
                    │  Authentication │
                    └─────────────────┘
```

## 📁 Project Structure

```
employee-management-system/
├── app/employee-portal/     # React.js Frontend
├── approuter/              # SAP Application Router
├── db/                    # Database schema and data
├── srv/                   # CAP services and business logic
├── docs/                  # Documentation
├── xs-security.json       # XSUAA security configuration
├── mta.yaml              # Multi-target application descriptor
└── package.json          # Node.js dependencies
```

## 🔐 Security Features

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

### Role Collections

- **Employee-Basic**: Basic employee access (read-only)
- **Employee-Manager**: Manager access (approve requests, manage team)
- **HR-Administrator**: Full administrative access

## 🛠️ Development Setup

### Prerequisites

- Node.js 23+
- SAP CAP CLI: `npm install -g @sap/cds-dk`

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd employee-management-system

# Install dependencies
npm install
cd app/employee-portal && npm install && cd ../..

# Start development server
npm run dev
```

Access the application at: http://localhost:4004

### Development Credentials

- **Admin**: username: `admin`, password: `admin`
- **Manager**: username: `manager`, password: `manager`
- **Employee**: username: `employee`, password: `employee`

## 🚀 SAP BTP Deployment

### Prerequisites for Production Deployment

- SAP BTP subaccount with Cloud Foundry enabled
- Required entitlements:
  - Authorization and Trust Management Service (XSUAA)
  - Cloud Foundry Runtime
  - SAP HANA Cloud (optional)

### Deployment Methods

#### Option 1: SAP Business Application Studio (Recommended)

1. Open SAP BAS in your SAP BTP subaccount
2. Clone this repository
3. Follow the [SAP BAS Deployment Guide](docs/sap-bas-deployment.md)

#### Option 2: Local with CF CLI

1. Install Cloud Foundry CLI
2. Follow the [Local Deployment Guide](docs/local-deployment.md)

## 📖 Documentation

- [SAP BAS Deployment Guide](docs/sap-bas-deployment.md) - Complete guide for BAS deployment
- [Local Deployment Guide](docs/local-deployment.md) - Deploy from local environment
- [XSUAA Configuration](docs/xsuaa.md) - Authentication and authorization setup
- [Application Router Guide](docs/approuter.md) - Routing and security concepts
- [API Documentation](docs/api-documentation.md) - Backend API reference

## 🧪 Testing

### Frontend Testing

```bash
cd app/employee-portal
npm test
```

### Backend Testing

```bash
npm test
```

## 📊 API Endpoints

### Employee Service (`/employee`)

- `GET /Employees` - List all employees
- `POST /Employees` - Create new employee
- `PATCH /Employees({id})` - Update employee
- `DELETE /Employees({id})` - Delete employee

### Admin Service (`/admin`) - Admin only

- Full CRUD access to all entities
- Payroll generation functions
- System administration

## 🔧 Configuration

### Environment Variables

- `NODE_ENV` - Environment (development/production)
- `CDS_LOG_LEVEL` - Logging level (info/debug/error)
- XSUAA credentials (auto-bound in SAP BTP)

### Database

- **Development**: SQLite
- **Production**: SAP HANA Cloud (recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:

1. Check the [Documentation](docs/)
2. Open an [Issue](../../issues)
3. Review [SAP CAP Documentation](https://cap.cloud.sap/)

## 🏢 Enterprise Features

- ✅ XSUAA Authentication & Authorization
- ✅ Role-based Access Control
- ✅ Audit Logging
- ✅ Data Isolation by Department
- ✅ Approval Workflows
- ✅ Scalable Architecture
- ✅ Production-ready Configuration

---

**Built with ❤️ using SAP CAP and React.js**
