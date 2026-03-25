const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  // Import authentication handlers
  const authHandler = require("./auth-handler");
  await authHandler(this);

  const { Employees, Departments, Positions, TimeSheets, Leaves } =
    this.entities;

  // Employee actions
  this.on("promoteEmployee", "Employees", async (req) => {
    const { ID } = req.params[0];
    const { newPosition, newSalary } = req.data;

    await UPDATE(Employees, ID).with({
      position_ID: newPosition,
      salary: newSalary,
      modifiedAt: new Date().toISOString(),
    });

    return { message: `Employee promoted successfully` };
  });

  this.on("transferEmployee", "Employees", async (req) => {
    const { ID } = req.params[0];
    const { newDepartment } = req.data;

    await UPDATE(Employees, ID).with({
      department_ID: newDepartment,
      modifiedAt: new Date().toISOString(),
    });

    return { message: `Employee transferred successfully` };
  });

  this.on("updateSalary", "Employees", async (req) => {
    const { ID } = req.params[0];
    const { newSalary } = req.data;

    await UPDATE(Employees, ID).with({
      salary: newSalary,
      modifiedAt: new Date().toISOString(),
    });

    return { message: `Salary updated successfully` };
  });

  // TimeSheet actions
  this.on("submitTimeSheet", "TimeSheets", async (req) => {
    const { ID } = req.params[0];

    await UPDATE(TimeSheets, ID).with({
      status: "Submitted",
      modifiedAt: new Date().toISOString(),
    });

    return { message: `Timesheet submitted for approval` };
  });

  this.on("approveTimeSheet", "TimeSheets", async (req) => {
    const { ID } = req.params[0];

    await UPDATE(TimeSheets, ID).with({
      status: "Approved",
      modifiedAt: new Date().toISOString(),
    });

    return { message: `Timesheet approved` };
  });

  // Leave actions
  this.on("approveLeave", "Leaves", async (req) => {
    const { ID } = req.params[0];
    const { comments } = req.data;

    await UPDATE(Leaves, ID).with({
      status: "Approved",
      approvedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    });

    return { message: `Leave request approved` };
  });

  this.on("rejectLeave", "Leaves", async (req) => {
    const { ID } = req.params[0];
    const { reason } = req.data;

    await UPDATE(Leaves, ID).with({
      status: "Rejected",
      modifiedAt: new Date().toISOString(),
    });

    return { message: `Leave request rejected: ${reason}` };
  });

  // Functions
  this.on("getEmployeeCount", async () => {
    const result = await SELECT.from(Employees).columns("count(*) as count");
    return result[0].count;
  });

  this.on("getDepartmentStatistics", async () => {
    const stats = await SELECT.from(Employees)
      .columns([
        "department.name as departmentName",
        "count(*) as employeeCount",
        "avg(salary) as averageSalary",
      ])
      .groupBy("department.name");

    return stats;
  });

  this.on("getLeaveBalance", async (req) => {
    const { employeeId } = req.data;

    // This is a simplified implementation
    // In real scenarios, you'd calculate based on leave policies
    return {
      annualLeave: 20,
      sickLeave: 10,
      personalLeave: 5,
    };
  });

  // Before create/update validations
  this.before("CREATE", "Employees", async (req) => {
    const employee = req.data;

    // Validate email uniqueness
    const existing = await SELECT.one
      .from(Employees)
      .where({ email: employee.email });
    if (existing) {
      req.error(400, `Employee with email ${employee.email} already exists`);
    }

    // Validate hire date
    if (new Date(employee.hireDate) > new Date()) {
      req.error(400, "Hire date cannot be in the future");
    }
  });

  this.before("UPDATE", "Employees", async (req) => {
    const employee = req.data;

    if (employee.email) {
      const existing = await SELECT.one
        .from(Employees)
        .where({ email: employee.email })
        .and({ ID: { "!=": req.params[0].ID } });

      if (existing) {
        req.error(400, `Employee with email ${employee.email} already exists`);
      }
    }
  });

  // After read enrichments
  this.after("READ", "Employees", (results) => {
    if (Array.isArray(results)) {
      results.forEach((employee) => {
        employee.fullName = `${employee.firstName} ${employee.lastName}`;
        employee.yearsOfService =
          new Date().getFullYear() - new Date(employee.hireDate).getFullYear();
      });
    } else if (results) {
      results.fullName = `${results.firstName} ${results.lastName}`;
      results.yearsOfService =
        new Date().getFullYear() - new Date(results.hireDate).getFullYear();
    }
  });
});
