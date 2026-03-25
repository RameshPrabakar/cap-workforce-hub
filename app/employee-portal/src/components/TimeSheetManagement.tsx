import React, { useState } from "react";
import { Employee } from "../App";

interface TimeSheet {
  ID: string;
  employee_ID: string;
  employeeFirstName?: string;
  employeeLastName?: string;
  date: string;
  hoursWorked: number;
  project?: string;
  description?: string;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface TimeSheetManagementProps {
  employees: Employee[];
}

export const TimeSheetManagement: React.FC<TimeSheetManagementProps> = ({
  employees,
}) => {
  const [timeSheets, setTimeSheets] = useState<TimeSheet[]>([
    {
      ID: "1",
      employee_ID: employees[0]?.ID || "1",
      employeeFirstName: employees[0]?.firstName || "John",
      employeeLastName: employees[0]?.lastName || "Doe",
      date: "2024-12-16",
      hoursWorked: 8,
      project: "Project Alpha",
      description: "Development work on main features",
      status: "Submitted",
      submittedAt: "2024-12-16T17:00:00Z",
    },
    {
      ID: "2",
      employee_ID: employees[1]?.ID || "2",
      employeeFirstName: employees[1]?.firstName || "Jane",
      employeeLastName: employees[1]?.lastName || "Smith",
      date: "2024-12-15",
      hoursWorked: 7.5,
      project: "Project Beta",
      description: "Testing and bug fixes",
      status: "Approved",
      approvedBy: "Manager",
      approvedAt: "2024-12-16T09:00:00Z",
    },
    {
      ID: "3",
      employee_ID: employees[0]?.ID || "1",
      employeeFirstName: employees[0]?.firstName || "John",
      employeeLastName: employees[0]?.lastName || "Doe",
      date: "2024-12-14",
      hoursWorked: 8.5,
      project: "Project Alpha",
      description: "Code review and documentation",
      status: "Draft",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [date, setDate] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [project, setProject] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmitTimeSheet = (e: React.FormEvent) => {
    e.preventDefault();

    const employee = employees.find((emp) => emp.ID === selectedEmployee);
    if (!employee) return;

    const newTimeSheet: TimeSheet = {
      ID: Date.now().toString(),
      employee_ID: selectedEmployee,
      employeeFirstName: employee.firstName,
      employeeLastName: employee.lastName,
      date,
      hoursWorked: parseFloat(hoursWorked),
      project,
      description,
      status: "Draft",
    };

    setTimeSheets((prev) => [...prev, newTimeSheet]);

    // Reset form
    setSelectedEmployee("");
    setDate("");
    setHoursWorked("");
    setProject("");
    setDescription("");
    setShowForm(false);
  };

  const handleSubmitForApproval = (id: string) => {
    setTimeSheets((prev) =>
      prev.map((timeSheet) =>
        timeSheet.ID === id
          ? {
              ...timeSheet,
              status: "Submitted" as const,
              submittedAt: new Date().toISOString(),
            }
          : timeSheet
      )
    );
  };

  const handleApproveTimeSheet = (id: string) => {
    setTimeSheets((prev) =>
      prev.map((timeSheet) =>
        timeSheet.ID === id
          ? {
              ...timeSheet,
              status: "Approved" as const,
              approvedBy: "Current User",
              approvedAt: new Date().toISOString(),
            }
          : timeSheet
      )
    );
  };

  const handleRejectTimeSheet = (id: string) => {
    setTimeSheets((prev) =>
      prev.map((timeSheet) =>
        timeSheet.ID === id
          ? {
              ...timeSheet,
              status: "Rejected" as const,
              approvedBy: "Current User",
              approvedAt: new Date().toISOString(),
            }
          : timeSheet
      )
    );
  };

  const handleDeleteTimeSheet = (id: string) => {
    setTimeSheets((prev) => prev.filter((timeSheet) => timeSheet.ID !== id));
  };

  const getTotalHoursForEmployee = (employeeId: string): number => {
    return timeSheets
      .filter(
        (ts) =>
          ts.employee_ID === employeeId &&
          (ts.status === "Approved" || ts.status === "Submitted")
      )
      .reduce((total, ts) => total + ts.hoursWorked, 0);
  };

  const getWeeklyHours = (employeeId: string): number => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return timeSheets
      .filter(
        (ts) =>
          ts.employee_ID === employeeId &&
          new Date(ts.date) >= oneWeekAgo &&
          (ts.status === "Approved" || ts.status === "Submitted")
      )
      .reduce((total, ts) => total + ts.hoursWorked, 0);
  };

  return (
    <div className="timesheet-management">
      <div className="list-header">
        <h2>Time Sheet Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add Time Entry
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Time Entry</h3>
              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitTimeSheet} className="timesheet-form">
              <div className="form-group">
                <label>Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.ID} value={emp.ID}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                    placeholder="8.0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Project</label>
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Project name or code"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief description of work performed..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save as Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="timesheet-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Hours</th>
              <th>Project</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeSheets.map((timeSheet) => (
              <tr key={timeSheet.ID}>
                <td>
                  {timeSheet.employeeFirstName} {timeSheet.employeeLastName}
                </td>
                <td>{new Date(timeSheet.date).toLocaleDateString()}</td>
                <td>{timeSheet.hoursWorked}h</td>
                <td>{timeSheet.project || "-"}</td>
                <td>{timeSheet.description || "-"}</td>
                <td>
                  <span className={`status ${timeSheet.status.toLowerCase()}`}>
                    {timeSheet.status}
                  </span>
                </td>
                <td>
                  {timeSheet.status === "Draft" && (
                    <>
                      <button
                        className="btn btn-small btn-primary"
                        onClick={() => handleSubmitForApproval(timeSheet.ID)}
                      >
                        Submit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDeleteTimeSheet(timeSheet.ID)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {timeSheet.status === "Submitted" && (
                    <>
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => handleApproveTimeSheet(timeSheet.ID)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleRejectTimeSheet(timeSheet.ID)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {(timeSheet.status === "Approved" ||
                    timeSheet.status === "Rejected") && (
                    <span className="approved-info">
                      {timeSheet.status} by {timeSheet.approvedBy}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {timeSheets.length === 0 && (
        <div className="no-results">No time sheets found.</div>
      )}

      <div className="timesheet-summary">
        <h3>Weekly Summary</h3>
        <div className="summary-grid">
          {employees.slice(0, 3).map((employee) => (
            <div key={employee.ID} className="summary-card">
              <h4>
                {employee.firstName} {employee.lastName}
              </h4>
              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-label">This Week:</span>
                  <span className="stat-value">
                    {getWeeklyHours(employee.ID)}h
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total Logged:</span>
                  <span className="stat-value">
                    {getTotalHoursForEmployee(employee.ID)}h
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
