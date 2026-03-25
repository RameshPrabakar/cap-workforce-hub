import React from "react";
import { Department } from "../App";

interface DepartmentListProps {
  departments: Department[];
}

export const DepartmentList: React.FC<DepartmentListProps> = ({
  departments,
}) => {
  return (
    <div className="department-list">
      <div className="list-header">
        <h2>Departments</h2>
        <button className="btn btn-primary">Add New Department</button>
      </div>

      <div className="departments-grid">
        {departments.map((department) => (
          <div key={department.ID} className="department-card">
            <div className="department-header">
              <h3>{department.name}</h3>
              <div className="department-actions">
                <button className="btn btn-small btn-secondary">Edit</button>
                <button className="btn btn-small btn-danger">Delete</button>
              </div>
            </div>
            <p className="department-description">
              {department.description || "No description available"}
            </p>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="no-results">
          No departments found. Add your first department to get started.
        </div>
      )}
    </div>
  );
};
