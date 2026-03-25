const cds = require("@sap/cds");
const { SELECT, INSERT, UPDATE, DELETE } = cds.ql;

module.exports = async (srv) => {
  // Check if we're running in production or with XSUAA
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.CDS_ENV === "production";

  // Skip XSUAA authentication in development mode with mocks
  if (!isProduction) {
    console.log(
      "⚠️  Running in development mode - XSUAA authentication is disabled"
    );
    console.log("📝 Using mock authentication for testing");
    console.log(
      "🔓 Custom authorization handlers disabled - using CDS built-in mock auth"
    );

    // Don't add any custom authentication or authorization in development
    // Let CDS handle everything with its built-in mock authentication
    return;
  }

  try {
    console.log("🔐 Configuring XSUAA authentication for production");

    // Load required modules for XSUAA
    const passport = require("passport");
    const xsenv = require("@sap/xsenv");
    const xssec = require("@sap/xssec");

    // Load XSUAA configuration
    const services = xsenv.getServices({
      xsuaa: { label: "xsuaa" },
    });

    // Configure passport for XSUAA authentication
    if (services.xsuaa) {
      const JWTStrategy = xssec.JWTStrategy;
      passport.use(new JWTStrategy(services.xsuaa));

      // Add authentication middleware
      srv.before("*", (req, res, next) => {
        passport.authenticate("JWT", { session: false })(req, res, next);
      });

      console.log("✅ XSUAA authentication configured successfully");
    } else {
      console.warn(
        "⚠️  XSUAA service not bound - authentication will not work"
      );
    }
  } catch (error) {
    console.error("❌ Error configuring XSUAA authentication:", error.message);
    console.log("💡 Falling back to development mode with mock authentication");

    // Fall back to mock authentication
    srv.before("*", (req) => {
      if (!req.user) {
        req.user = {
          id: "fallback.user@company.com",
          is: (role) => true, // Grant all permissions in fallback mode
          attr: {
            Department: "IT",
            Role: "Admin",
          },
        };
      }
    });
  }

  // Employee Service Handlers
  srv.on("READ", "Employees", async (req) => {
    try {
      // Check user permissions
      if (!req.user || !req.user.is("Employee.Read")) {
        throw new Error("Insufficient permissions to read employee data");
      }

      // Apply data filtering based on user attributes
      const userDepartment = req.user.attr?.Department;
      if (userDepartment && !req.user.is("Admin")) {
        req.query.where({ "department.name": userDepartment });
      }

      return await SELECT.from(req.query);
    } catch (error) {
      req.error(403, error.message);
    }
  });

  srv.on("CREATE", "Employees", async (req) => {
    try {
      if (!req.user || !req.user.is("Employee.Write")) {
        throw new Error("Insufficient permissions to create employees");
      }

      // Add audit information
      req.data.createdBy = req.user.id;
      req.data.createdAt = new Date().toISOString();

      return await INSERT.into("sap.cap.employee.Employees").entries(req.data);
    } catch (error) {
      req.error(403, error.message);
    }
  });

  srv.on("UPDATE", "Employees", async (req) => {
    try {
      if (!req.user || !req.user.is("Employee.Write")) {
        throw new Error("Insufficient permissions to update employees");
      }

      // Add audit information
      req.data.modifiedBy = req.user.id;
      req.data.modifiedAt = new Date().toISOString();

      return await UPDATE("sap.cap.employee.Employees")
        .set(req.data)
        .where({ ID: req.params[0] });
    } catch (error) {
      req.error(403, error.message);
    }
  });

  srv.on("DELETE", "Employees", async (req) => {
    try {
      if (!req.user || !req.user.is("Employee.Delete")) {
        throw new Error("Insufficient permissions to delete employees");
      }

      return await DELETE.from("sap.cap.employee.Employees").where({
        ID: req.params[0],
      });
    } catch (error) {
      req.error(403, error.message);
    }
  });

  // TimeSheet handlers with approval workflow
  srv.on("READ", "TimeSheets", async (req) => {
    try {
      if (!req.user || !req.user.is("Employee.Read")) {
        throw new Error("Insufficient permissions to read timesheets");
      }

      // Employees can only see their own timesheets unless they have admin rights
      if (!req.user.is("Admin") && !req.user.is("Timesheet.Approve")) {
        const employeeId = await getEmployeeIdByUserId(req.user.id);
        if (employeeId) {
          req.query.where({ employee_ID: employeeId });
        }
      }

      return await SELECT.from(req.query);
    } catch (error) {
      req.error(403, error.message);
    }
  });

  srv.on("submitTimeSheet", async (req) => {
    try {
      if (!req.user || !req.user.is("Employee.Write")) {
        throw new Error("Insufficient permissions to submit timesheets");
      }

      const timesheetId = req.params[0];
      if (!timesheetId) {
        throw new Error("Timesheet ID is required");
      }

      await UPDATE("sap.cap.employee.TimeSheets")
        .set({
          status: "Submitted",
          submittedAt: new Date().toISOString(),
          submittedBy: req.user.id,
        })
        .where({ ID: timesheetId });

      return { message: "Timesheet submitted successfully" };
    } catch (error) {
      req.error(400, error.message);
    }
  });

  srv.on("approveTimeSheet", async (req) => {
    try {
      if (!req.user || !req.user.is("Timesheet.Approve")) {
        throw new Error("Insufficient permissions to approve timesheets");
      }

      const timesheetId = req.params[0];
      if (!timesheetId) {
        throw new Error("Timesheet ID is required");
      }

      await UPDATE("sap.cap.employee.TimeSheets")
        .set({
          status: "Approved",
          approvedAt: new Date().toISOString(),
          approvedBy: req.user.id,
        })
        .where({ ID: timesheetId });

      return { message: "Timesheet approved successfully" };
    } catch (error) {
      req.error(400, error.message);
    }
  });

  // Leave management handlers
  srv.on("READ", "Leaves", async (req) => {
    try {
      if (!req.user || !req.user.is("Employee.Read")) {
        throw new Error("Insufficient permissions to read leave requests");
      }

      // Employees can only see their own leave requests unless they have admin rights
      if (!req.user.is("Admin") && !req.user.is("Leave.Approve")) {
        const employeeId = await getEmployeeIdByUserId(req.user.id);
        if (employeeId) {
          req.query.where({ employee_ID: employeeId });
        }
      }

      return await SELECT.from(req.query);
    } catch (error) {
      req.error(403, error.message);
    }
  });

  srv.on("approveLeave", async (req) => {
    try {
      if (!req.user || !req.user.is("Leave.Approve")) {
        throw new Error("Insufficient permissions to approve leave requests");
      }

      const leaveId = req.params[0];
      if (!leaveId) {
        throw new Error("Leave ID is required");
      }

      const { comments } = req.data || {};

      const employeeId = await getEmployeeIdByUserId(req.user.id);
      await UPDATE("sap.cap.employee.Leaves")
        .set({
          status: "Approved",
          approvedAt: new Date().toISOString(),
          approvedBy_ID: employeeId,
          comments: comments,
        })
        .where({ ID: leaveId });

      return { message: "Leave request approved successfully" };
    } catch (error) {
      req.error(400, error.message);
    }
  });

  srv.on("rejectLeave", async (req) => {
    try {
      if (!req.user || !req.user.is("Leave.Approve")) {
        throw new Error("Insufficient permissions to reject leave requests");
      }

      const leaveId = req.params[0];
      if (!leaveId) {
        throw new Error("Leave ID is required");
      }

      const { reason } = req.data || {};

      const employeeId = await getEmployeeIdByUserId(req.user.id);
      await UPDATE("sap.cap.employee.Leaves")
        .set({
          status: "Rejected",
          rejectedAt: new Date().toISOString(),
          rejectedBy_ID: employeeId,
          rejectionReason: reason,
        })
        .where({ ID: leaveId });

      return { message: "Leave request rejected" };
    } catch (error) {
      req.error(400, error.message);
    }
  });

  // Analytics functions
  srv.on("getEmployeeCount", async (req) => {
    try {
      if (!req.user || !req.user.is("Reports.View")) {
        throw new Error("Insufficient permissions to view reports");
      }

      const result = await SELECT.one`count(*) as count`.from(
        "sap.cap.employee.Employees"
      );
      return { count: result?.count || 0 };
    } catch (error) {
      req.error(403, error.message);
    }
  });

  srv.on("getDepartmentStatistics", async (req) => {
    try {
      if (!req.user || !req.user.is("Reports.View")) {
        throw new Error("Insufficient permissions to view reports");
      }

      return await SELECT`
              department.name as departmentName,
              count(*) as employeeCount,
              avg(salary) as averageSalary
          `
        .from("sap.cap.employee.Employees")
        .join("sap.cap.employee.Departments as department")
        .on("department_ID = department.ID")
        .groupBy("department.name");
    } catch (error) {
      req.error(403, error.message);
    }
  });

  srv.on("getLeaveBalance", async (req) => {
    try {
      if (!req.user || !req.user.is("Employee.Read")) {
        throw new Error("Insufficient permissions to view leave balance");
      }

      const { employeeId } = req.data || {};
      if (!employeeId) {
        throw new Error("Employee ID is required");
      }

      // Check if user can access this employee's data
      if (
        !req.user.is("Admin") &&
        (await getEmployeeIdByUserId(req.user.id)) !== employeeId
      ) {
        throw new Error("Can only view your own leave balance");
      }

      // Calculate leave balance (simplified calculation)
      return {
        annualLeave: 25,
        sickLeave: 10,
        personalLeave: 5,
      };
    } catch (error) {
      req.error(403, error.message);
    }
  });

  // Helper function to get employee ID from user ID
  async function getEmployeeIdByUserId(userId) {
    try {
      if (!userId) return null;

      const result = await SELECT.one`ID`
        .from("sap.cap.employee.Employees")
        .where({ email: userId });
      return result?.ID || null;
    } catch (error) {
      console.error("Error getting employee ID:", error);
      return null;
    }
  }
};
