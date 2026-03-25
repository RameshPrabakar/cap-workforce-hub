namespace sap.cap.employee;

using { cuid, managed } from '@sap/cds/common';

entity Departments : cuid, managed {
    name        : String(100) not null;
    description : String(500);
    manager     : Association to Employees;
    employees   : Composition of many Employees on employees.department = $self;
}

entity Positions : cuid, managed {
    title       : String(100) not null;
    description : String(500);
    level       : String(20);
    employees   : Composition of many Employees on employees.position = $self;
}

entity Employees : cuid, managed {
    firstName    : String(50) not null;
    lastName     : String(50) not null;
    email        : String(100) not null;
    phone        : String(20);
    dateOfBirth  : Date;
    hireDate     : Date not null;
    salary       : Decimal(10,2);
    status       : String(20) default 'Active';
    department   : Association to Departments;
    position     : Association to Positions;
    manager      : Association to Employees;
    subordinates : Composition of many Employees on subordinates.manager = $self;
    address      : Composition of one Addresses;
}

entity Addresses : cuid {
    street      : String(200);
    city        : String(100);
    state       : String(50);
    postalCode  : String(20);
    country     : String(50);
    employee    : Association to Employees;
}

entity TimeSheets : cuid, managed {
    employee    : Association to Employees not null;
    date        : Date not null;
    hoursWorked : Decimal(4,2) not null;
    project     : String(100);
    description : String(500);
    status      : String(20) default 'Draft';
}

entity Leaves : cuid, managed {
    employee    : Association to Employees not null;
    startDate   : Date not null;
    endDate     : Date not null;
    type        : String(30) not null; // Annual, Sick, Personal, etc.
    reason      : String(500);
    status      : String(20) default 'Pending'; // Pending, Approved, Rejected
    approvedBy  : Association to Employees;
    approvedAt  : DateTime;
}
