# SAP CAP Employee Management System

A comprehensive employee management system built with SAP CAP (Cloud Application Programming) and React.js.

## 🚀 Features

- **Employee Management**: Complete CRUD operations for employee data
- **Department Structure**: Organize employees by departments
- **Position Management**: Define job roles and levels
- **Time Tracking**: Time sheet management with approval workflow
- **Leave Management**: Request and approve employee leave
- **Dashboard Analytics**: Real-time statistics and insights
- **Modern UI**: Responsive React.js frontend with TypeScript

## 📸 Screenshots

### Dashboard Overview

![Dashboard](./images/Dashboard.png)
_Main dashboard showing employee statistics and department analytics_

### Employee Management

![Employee List](./images/Employee-list.png)
_Employee listing with search, filtering, and CRUD operations_

### Authentication

![Login Screen](./images/Login.png)
_Secure login interface with mock authentication for development_

![Registration](./images/Registration.png)
_User registration form for new employees_

## 🏗️ Architecture

### Backend (SAP CAP)

- **Database Layer** (`/db`): CDS models defining the data schema
- **Service Layer** (`/srv`): OData services with business logic
- **Runtime**: Node.js with SQLite for development

### Frontend (React.js)

- **Technology**: React.js with TypeScript
- **Styling**: Modern CSS with responsive design
- **Components**: Modular component architecture

## 📊 Database Schema

```
Employees
├── Personal Information (name, email, phone, DOB)
├── Employment Details (hire date, salary, status)
├── Department (association)
├── Position (association)
├── Manager (self-association)
└── Address (composition)

Departments
├── Name and Description
├── Manager (association to Employee)
└── Employees (composition)

TimeSheets
├── Employee (association)
├── Date and Hours Worked
├── Project and Description
└── Status (Draft/Submitted/Approved)

Leaves
├── Employee (association)
├── Date Range (start/end)
├── Type and Reason
├── Status (Pending/Approved/Rejected)
└── Approval Details
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Backend Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the CAP server:

   ```bash
   npm run watch
   ```

3. The server will start on http://localhost:4004

### Frontend Setup

1. Navigate to the React app:

   ```bash
   cd app/employee-portal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. The frontend will open on http://localhost:3000

## 📋 Available Scripts

### Backend

- `npm start` - Start the production server
- `npm run watch` - Start development server with hot reload
- `npm run build` - Build the project
- `npm run deploy` - Deploy database changes

### Frontend

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🎯 Key Features

### Employee Management

- Add, edit, and delete employees
- Comprehensive employee profiles
- Search and filter capabilities
- Sortable employee lists

### Dashboard Analytics

- Real-time employee statistics
- Department-wise analysis
- Recent hires tracking
- Salary analytics

### Time & Leave Management

- Time sheet entry and approval
- Leave request workflow
- Status tracking
- Manager approval system

### Responsive Design

- Mobile-friendly interface
- Modern UI components
- Intuitive navigation
- Professional styling

## 🔧 Configuration

### Database Configuration

The project uses SQLite for development. For production, update the `package.json` cds configuration:

```json
{
  "cds": {
    "requires": {
      "db": {
        "kind": "hana-cloud",
        "credentials": {...}
      }
    }
  }
}
```

### Service Configuration

Services are automatically exposed as OData endpoints:

- Employee Service: `/employee`
- Admin Service: `/admin`

## 📝 API Endpoints

### Employee Service

- `GET /employee/Employees` - List all employees
- `POST /employee/Employees` - Create new employee
- `PUT /employee/Employees(ID)` - Update employee
- `DELETE /employee/Employees(ID)` - Delete employee

### Custom Actions

- `POST /employee/Employees(ID)/promoteEmployee` - Promote employee
- `POST /employee/Employees(ID)/transferEmployee` - Transfer to department
- `POST /employee/TimeSheets(ID)/submitTimeSheet` - Submit timesheet

## 🚀 Deployment

### SAP Business Technology Platform

1. Build the project:

   ```bash
   npm run build
   ```

2. Deploy using MTA or CF CLI:
   ```bash
   cf push
   ```

### Local Production

1. Build both backend and frontend
2. Serve the built files using a web server
3. Configure database connection for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Getting Started

1. Clone this repository
2. Follow the setup instructions above
3. Start both backend and frontend servers
4. Open http://localhost:3000 to access the application
5. Begin managing your employees!

---

Built with ❤️ using SAP CAP and React.js
