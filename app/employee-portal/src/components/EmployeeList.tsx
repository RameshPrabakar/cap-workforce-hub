import React, { useState } from "react";
import { Employee } from "../App";

interface EmployeeListProps {
  employees: Employee[];
  onEmployeeSelect: (employee: Employee) => void;
  onEmployeeDelete: (id: string) => void;
  onNewEmployee: () => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onEmployeeSelect,
  onEmployeeDelete,
  onNewEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Employee>("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.positionTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleSort = (field: keyof Employee) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      onEmployeeDelete(id);
    }
  };

  return (
    <div className="employee-list">
      <div className="list-header">
        <h2>Employees</h2>
        <div className="list-controls">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="btn btn-primary" onClick={onNewEmployee}>
            Add New Employee
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("firstName")} className="sortable">
                Name{" "}
                {sortField === "firstName" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("email")} className="sortable">
                Email{" "}
                {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("departmentName")}
                className="sortable"
              >
                Department{" "}
                {sortField === "departmentName" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("positionTitle")}
                className="sortable"
              >
                Position{" "}
                {sortField === "positionTitle" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("hireDate")} className="sortable">
                Hire Date{" "}
                {sortField === "hireDate" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("salary")} className="sortable">
                Salary{" "}
                {sortField === "salary" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("status")} className="sortable">
                Status{" "}
                {sortField === "status" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((employee) => (
              <tr key={employee.ID}>
                <td>
                  {employee.firstName} {employee.lastName}
                </td>
                <td>{employee.email}</td>
                <td>{employee.departmentName}</td>
                <td>{employee.positionTitle}</td>
                <td>{new Date(employee.hireDate).toLocaleDateString()}</td>
                <td>
                  {employee.salary
                    ? `$${employee.salary.toLocaleString()}`
                    : "N/A"}
                </td>
                <td>
                  <span className={`status ${employee.status.toLowerCase()}`}>
                    {employee.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => onEmployeeSelect(employee)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() =>
                      handleDelete(
                        employee.ID,
                        `${employee.firstName} ${employee.lastName}`
                      )
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedEmployees.length === 0 && (
        <div className="no-results">
          {searchTerm
            ? "No employees found matching your search."
            : "No employees found."}
        </div>
      )}
    </div>
  );
};
