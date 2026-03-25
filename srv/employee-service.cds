using {sap.cap.employee as employee} from '../db/schema';

// Employee Service with XSUAA Security Integration
// @requires: 'authenticated-user'
service EmployeeService @(path: '/employee') {

    // Read-only entities for reference data
    @readonly
    @restrict: [{
        grant: 'READ',
        to   : 'Employee.Read'
    }]
    entity Departments as projection on employee.Departments;

    @readonly
    @restrict: [{
        grant: 'READ',
        to   : 'Employee.Read'
    }]
    entity Positions   as projection on employee.Positions;

            // Main employee entity with role-based access control
    @restrict        : [
        {
            grant: 'READ',
            to   : 'Employee.Read'
        },
        {
            grant: [
                'CREATE',
                'UPDATE'
            ],
            to   : 'Employee.Write'
        },
        {
            grant: 'DELETE',
            to   : 'Employee.Delete'
        }
    ]
    entity Employees   as
        projection on employee.Employees {
            *,
            department.name   as departmentName,
            position.title    as positionTitle,
            manager.firstName as managerFirstName,
            manager.lastName  as managerLastName
        }
        actions {
            @requires: 'Employee.Write'
            action promoteEmployee(newPosition : String(100), newSalary : Decimal(10, 2));

            @requires: 'Department.Manage'
            action transferEmployee(newDepartment : String(100));

            @requires: 'Employee.Write'
            action updateSalary(newSalary : Decimal(10, 2));
        };

    // Address management with restricted access
    @restrict: [
        {
            grant: 'READ',
            to   : 'Employee.Read'
        },
        {
            grant: [
                'CREATE',
                'UPDATE',
                'DELETE'
            ],
            to   : 'Employee.Write'
        }
    ]
    entity Addresses   as projection on employee.Addresses;

            // Time tracking with approval workflow
    @restrict        : [
        {
            grant: 'READ',
            to   : 'Employee.Read'
        },
        {
            grant: [
                'CREATE',
                'UPDATE'
            ],
            to   : 'Employee.Write'
        },
        {
            grant: 'DELETE',
            to   : 'Employee.Delete'
        }
    ]
    entity TimeSheets  as
        projection on employee.TimeSheets {
            *,
            employee.firstName as employeeFirstName,
            employee.lastName  as employeeLastName
        }
        actions {
            @requires: 'Employee.Write'
            action submitTimeSheet();

            @requires: 'Timesheet.Approve'
            action approveTimeSheet();
        };

            // Leave management with hierarchical approval
    @restrict        : [
        {
            grant: 'READ',
            to   : 'Employee.Read'
        },
        {
            grant: [
                'CREATE',
                'UPDATE'
            ],
            to   : 'Employee.Write'
        },
        {
            grant: 'DELETE',
            to   : 'Employee.Delete'
        }
    ]
    entity Leaves      as
        projection on employee.Leaves {
            *,
            employee.firstName   as employeeFirstName,
            employee.lastName    as employeeLastName,
            approvedBy.firstName as approverFirstName,
            approvedBy.lastName  as approverLastName
        }
        actions {
            @requires: 'Leave.Approve'
            action approveLeave(comments : String(500));

            @requires: 'Leave.Approve'
            action rejectLeave(reason : String(500));
        };

    // Analytics and reporting functions with role restrictions
    @requires: 'Reports.View'
    function getEmployeeCount()                   returns Integer;

    @requires: 'Reports.View'
    function getDepartmentStatistics()            returns array of {
        departmentName : String;
        employeeCount  : Integer;
        averageSalary  : Decimal(10, 2);
    };

    @requires: 'Employee.Read'
    function getLeaveBalance(employeeId : String) returns {
        annualLeave   : Integer;
        sickLeave     : Integer;
        personalLeave : Integer;
    };
}

// Admin service for HR operations - Full administrative access required
@requires: 'Admin'
service AdminService @(path: '/admin') {

    entity Departments as projection on employee.Departments;
    entity Positions   as projection on employee.Positions;
    entity Employees   as projection on employee.Employees;
    entity Addresses   as projection on employee.Addresses;
    entity TimeSheets  as projection on employee.TimeSheets;
    entity Leaves      as projection on employee.Leaves;

    // Admin-only functions
    function generatePayroll(period : String)     returns array of {
        employeeId : String;
        fullName   : String;
        department : String;
        baseSalary : Decimal(10, 2);
        totalHours : Decimal(4, 2);
        grossPay   : Decimal(10, 2);
    };
}
