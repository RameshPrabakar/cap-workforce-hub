import React, { useState } from "react";
import { Employee } from "../App";

interface LeaveRequest {
  ID: string;
  employee_ID: string;
  employeeFirstName?: string;
  employeeLastName?: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  approvedAt?: string;
}

interface LeaveManagementProps {
  employees: Employee[];
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({
  employees,
}) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      ID: "1",
      employee_ID: employees[0]?.ID || "1",
      employeeFirstName: employees[0]?.firstName || "John",
      employeeLastName: employees[0]?.lastName || "Doe",
      startDate: "2024-12-25",
      endDate: "2024-12-31",
      type: "Annual",
      reason: "Christmas holidays",
      status: "Pending",
    },
    {
      ID: "2",
      employee_ID: employees[1]?.ID || "2",
      employeeFirstName: employees[1]?.firstName || "Jane",
      employeeLastName: employees[1]?.lastName || "Smith",
      startDate: "2024-11-15",
      endDate: "2024-11-16",
      type: "Sick",
      reason: "Medical appointment",
      status: "Approved",
      approvedBy: "Manager",
      approvedAt: "2024-11-10",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [leaveType, setLeaveType] = useState("Annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();

    const employee = employees.find((emp) => emp.ID === selectedEmployee);
    if (!employee) return;

    const newLeave: LeaveRequest = {
      ID: Date.now().toString(),
      employee_ID: selectedEmployee,
      employeeFirstName: employee.firstName,
      employeeLastName: employee.lastName,
      startDate,
      endDate,
      type: leaveType,
      reason,
      status: "Pending",
    };

    setLeaveRequests((prev) => [...prev, newLeave]);

    // Reset form
    setSelectedEmployee("");
    setLeaveType("Annual");
    setStartDate("");
    setEndDate("");
    setReason("");
    setShowForm(false);
  };

  const handleApproveLeave = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((leave) =>
        leave.ID === id
          ? {
              ...leave,
              status: "Approved" as const,
              approvedBy: "Current User",
              approvedAt: new Date().toISOString(),
            }
          : leave
      )
    );
  };

  const handleRejectLeave = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((leave) =>
        leave.ID === id
          ? {
              ...leave,
              status: "Rejected" as const,
              approvedBy: "Current User",
              approvedAt: new Date().toISOString(),
            }
          : leave
      )
    );
  };

  const calculateDays = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="leave-management">
      <div className="list-header">
        <h2>Leave Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Request Leave
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request Leave</h3>
              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="leave-form">
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
                  <label>Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Personal">Personal Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Paternity">Paternity Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Please provide a reason for your leave request..."
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((leave) => (
              <tr key={leave.ID}>
                <td>
                  {leave.employeeFirstName} {leave.employeeLastName}
                </td>
                <td>{leave.type}</td>
                <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                <td>{calculateDays(leave.startDate, leave.endDate)}</td>
                <td>{leave.reason}</td>
                <td>
                  <span className={`status ${leave.status.toLowerCase()}`}>
                    {leave.status}
                  </span>
                </td>
                <td>
                  {leave.status === "Pending" && (
                    <>
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => handleApproveLeave(leave.ID)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleRejectLeave(leave.ID)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {leave.status !== "Pending" && (
                    <span className="approved-info">
                      {leave.status} by {leave.approvedBy}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leaveRequests.length === 0 && (
        <div className="no-results">No leave requests found.</div>
      )}
    </div>
  );
};
