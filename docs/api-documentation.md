# API Documentation - Employee Management System

Complete API reference for the Employee Management System backend services.

## 🔐 Authentication

All API endpoints require XSUAA authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

## 📊 Base URLs

- **Development**: `http://localhost:4004`
- **Production**: `https://your-approuter-url.cfapps.region.hana.ondemand.com`

## 🏢 Employee Service (`/employee`)

### Employees

#### GET /employee/Employees

Get list of all employees (with role-based filtering).

**Required Role**: `Employee.Read`

**Response**:

```json
{
  "value": [
    {
      "ID": "1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "hireDate": "2023-01-15",
      "salary": 75000,
      "status": "Active",
      "departmentName": "Engineering",
      "positionTitle": "Senior Developer"
    }
  ]
}
```

#### GET /employee/Employees('{id}')

Get specific employee by ID.

**Required Role**: `Employee.Read`

#### POST /employee/Employees

Create new employee.

**Required Role**: `Employee.Write`

**Request Body**:

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "hireDate": "2024-01-01",
  "salary": 80000,
  "status": "Active",
  "department_ID": "dept-1",
  "position_ID": "pos-1"
}
```

#### PATCH /employee/Employees('{id}')

Update existing employee.

**Required Role**: `Employee.Write`

#### DELETE /employee/Employees('{id}')

Delete employee.

**Required Role**: `Employee.Delete`

### Employee Actions

#### POST /employee/Employees('{id}')/promoteEmployee

Promote an employee to new position.

**Required Role**: `Employee.Write`

**Request Body**:

```json
{
  "newPosition": "pos-2",
  "newSalary": 90000
}
```

#### POST /employee/Employees('{id}')/transferEmployee

Transfer employee to different department.

**Required Role**: `Department.Manage`

**Request Body**:

```json
{
  "newDepartment": "dept-2"
}
```

#### POST /employee/Employees('{id}')/updateSalary

Update employee salary.

**Required Role**: `Employee.Write`

**Request Body**:

```json
{
  "newSalary": 85000
}
```

### Departments

#### GET /employee/Departments

Get list of all departments.

**Required Role**: `Employee.Read`

**Response**:

```json
{
  "value": [
    {
      "ID": "dept-1",
      "name": "Engineering",
      "description": "Software Development Team"
    }
  ]
}
```

### Positions

#### GET /employee/Positions

Get list of all positions.

**Required Role**: `Employee.Read`

**Response**:

```json
{
  "value": [
    {
      "ID": "pos-1",
      "title": "Senior Developer",
      "description": "Senior Software Developer",
      "level": "Senior"
    }
  ]
}
```

### Time Sheets

#### GET /employee/TimeSheets

Get time sheets (filtered by user role).

**Required Role**: `Employee.Read`

**Response**:

```json
{
  "value": [
    {
      "ID": "ts-1",
      "employee_ID": "emp-1",
      "date": "2024-01-15",
      "hoursWorked": 8.0,
      "description": "Regular work day",
      "status": "Submitted",
      "employeeFirstName": "John",
      "employeeLastName": "Doe"
    }
  ]
}
```

#### POST /employee/TimeSheets

Create new time sheet entry.

**Required Role**: `Employee.Write`

#### POST /employee/TimeSheets('{id}')/submitTimeSheet

Submit time sheet for approval.

**Required Role**: `Employee.Write`

#### POST /employee/TimeSheets('{id}')/approveTimeSheet

Approve time sheet.

**Required Role**: `Timesheet.Approve`

### Leave Management

#### GET /employee/Leaves

Get leave requests (filtered by user role).

**Required Role**: `Employee.Read`

#### POST /employee/Leaves

Create new leave request.

**Required Role**: `Employee.Write`

**Request Body**:

```json
{
  "employee_ID": "emp-1",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "type": "Vacation",
  "reason": "Family vacation"
}
```

#### POST /employee/Leaves('{id}')/approveLeave

Approve leave request.

**Required Role**: `Leave.Approve`

**Request Body**:

```json
{
  "comments": "Approved for vacation time"
}
```

#### POST /employee/Leaves('{id}')/rejectLeave

Reject leave request.

**Required Role**: `Leave.Approve`

**Request Body**:

```json
{
  "reason": "Insufficient leave balance"
}
```

### Analytics Functions

#### GET /employee/getEmployeeCount()

Get total employee count.

**Required Role**: `Reports.View`

**Response**:

```json
{
  "value": 150
}
```

#### GET /employee/getDepartmentStatistics()

Get department statistics.

**Required Role**: `Reports.View`

**Response**:

```json
{
  "value": [
    {
      "departmentName": "Engineering",
      "employeeCount": 50,
      "averageSalary": 82000.0
    }
  ]
}
```

#### GET /employee/getLeaveBalance(employeeId='{id}')

Get leave balance for specific employee.

**Required Role**: `Employee.Read`

**Response**:

```json
{
  "value": {
    "annualLeave": 15,
    "sickLeave": 8,
    "personalLeave": 3
  }
}
```

## 🔧 Admin Service (`/admin`)

### Overview

Full administrative access to all entities. Requires `Admin` role.

### Endpoints

All CRUD operations available for:

- `/admin/Employees`
- `/admin/Departments`
- `/admin/Positions`
- `/admin/TimeSheets`
- `/admin/Leaves`
- `/admin/Addresses`

### Admin Functions

#### GET /admin/generatePayroll(period='{period}')

Generate payroll report for specified period.

**Required Role**: `Admin`

**Response**:

```json
{
  "value": [
    {
      "employeeId": "emp-1",
      "fullName": "John Doe",
      "department": "Engineering",
      "baseSalary": 75000.0,
      "totalHours": 160.0,
      "grossPay": 6250.0
    }
  ]
}
```

## 🔒 Security Model

### Role-Based Access Control

| Endpoint Pattern             | Employee.Read | Employee.Write | Employee.Delete | Admin |
| ---------------------------- | ------------- | -------------- | --------------- | ----- |
| `GET /employee/*`            | ✅            | ✅             | ✅              | ✅    |
| `POST /employee/Employees`   | ❌            | ✅             | ✅              | ✅    |
| `PATCH /employee/Employees`  | ❌            | ✅             | ✅              | ✅    |
| `DELETE /employee/Employees` | ❌            | ❌             | ✅              | ✅    |
| `POST /employee/*/actions`   | ❌            | ✅\*           | ✅              | ✅    |
| `GET /admin/*`               | ❌            | ❌             | ❌              | ✅    |

\*Some actions require specific roles (e.g., `Leave.Approve`, `Department.Manage`)

### Data Filtering

- **Employees**: Can only see colleagues in same department (unless Admin)
- **TimeSheets**: Can only see own timesheets (unless Manager/Admin)
- **Leaves**: Can only see own leave requests (unless Manager/Admin)
- **Managers**: Can see and approve for their department
- **Admins**: Can see all data across departments

## 📝 Error Responses

### Authentication Errors

```json
{
  "error": {
    "code": "401",
    "message": "Unauthorized - Invalid or missing JWT token"
  }
}
```

### Authorization Errors

```json
{
  "error": {
    "code": "403",
    "message": "Forbidden - Insufficient permissions"
  }
}
```

### Validation Errors

```json
{
  "error": {
    "code": "400",
    "message": "Bad Request",
    "details": [
      {
        "property": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Not Found Errors

```json
{
  "error": {
    "code": "404",
    "message": "Entity not found"
  }
}
```

## 🧪 Testing the API

### Using curl

```bash
# Get JWT token (in real environment, this comes from XSUAA)
TOKEN="your-jwt-token-here"

# Get employees
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     https://your-app.cfapps.region.hana.ondemand.com/employee/Employees

# Create employee
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Jane","lastName":"Smith","email":"jane@company.com"}' \
     https://your-app.cfapps.region.hana.ondemand.com/employee/Employees
```

### Using Postman

1. Set Authorization to "Bearer Token"
2. Add your JWT token
3. Set Content-Type to "application/json"
4. Use the endpoints documented above

## 📊 OData Features Supported

- **$select**: Choose specific fields
- **$filter**: Filter results
- **$orderby**: Sort results
- **$top**: Limit number of results
- **$skip**: Skip number of results
- **$count**: Get total count
- **$expand**: Include related entities (where configured)

### Example OData Queries

```http
GET /employee/Employees?$select=firstName,lastName,email
GET /employee/Employees?$filter=departmentName eq 'Engineering'
GET /employee/Employees?$orderby=lastName asc
GET /employee/Employees?$top=10&$skip=20
GET /employee/TimeSheets?$filter=date ge 2024-01-01
```

## 🔄 Audit Trail

All CUD operations automatically include:

- `createdBy` / `modifiedBy`: User ID from JWT token
- `createdAt` / `modifiedAt`: Timestamp of operation
- Additional audit fields for approvals and status changes

---

**This API provides enterprise-grade security, role-based access control, and comprehensive employee management capabilities.** 🚀
