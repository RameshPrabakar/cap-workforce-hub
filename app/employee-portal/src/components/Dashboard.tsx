import React from "react";
import { Employee, Department } from "../App";

interface DashboardProps {
  employees: Employee[];
  departments: Department[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  employees,
  departments,
}) => {
  const activeEmployees = employees.filter((emp) => emp.status === "Active");
  const totalSalary = employees.reduce(
    (sum, emp) => sum + (emp.salary || 0),
    0
  );
  const averageSalary =
    employees.length > 0 ? totalSalary / employees.length : 0;

  const departmentStats = departments.map((dept) => {
    const deptEmployees = employees.filter(
      (emp) => emp.departmentName === dept.name
    );
    return {
      name: dept.name,
      count: deptEmployees.length,
      averageSalary:
        deptEmployees.length > 0
          ? deptEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0) /
            deptEmployees.length
          : 0,
    };
  });

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <div className="stat-number">{employees.length}</div>
        </div>

        <div className="stat-card">
          <h3>Active Employees</h3>
          <div className="stat-number">{activeEmployees.length}</div>
        </div>

        <div className="stat-card">
          <h3>Departments</h3>
          <div className="stat-number">{departments.length}</div>
        </div>

        <div className="stat-card">
          <h3>Average Salary</h3>
          <div className="stat-number">${averageSalary.toLocaleString()}</div>
        </div>
      </div>

      <div className="department-stats">
        <h3>Department Statistics</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Employee Count</th>
                <th>Average Salary</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((dept) => (
                <tr key={dept.name}>
                  <td>{dept.name}</td>
                  <td>{dept.count}</td>
                  <td>${dept.averageSalary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="recent-hires">
        <h3>Recent Hires (Last 6 months)</h3>
        <div className="recent-hires-list">
          {employees
            .filter((emp) => {
              const hireDate = new Date(emp.hireDate);
              const sixMonthsAgo = new Date();
              sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
              return hireDate >= sixMonthsAgo;
            })
            .slice(0, 5)
            .map((emp) => (
              <div key={emp.ID} className="recent-hire-card">
                <div className="employee-name">
                  {emp.firstName} {emp.lastName}
                </div>
                <div className="employee-details">
                  {emp.positionTitle} • {emp.departmentName}
                </div>
                <div className="hire-date">
                  Hired: {new Date(emp.hireDate).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
