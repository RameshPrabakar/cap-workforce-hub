import React, { useState, useEffect } from "react";
import { Employee, Department, Position } from "../App";

interface EmployeeFormProps {
  employee: Employee | null;
  departments: Department[];
  positions: Position[];
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  departments,
  positions,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    hireDate: "",
    salary: 0,
    status: "Active",
    department_ID: "",
    position_ID: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
    }
  }, [employee]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salary" ? (value ? parseFloat(value) : 0) : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.hireDate) {
      newErrors.hireDate = "Hire date is required";
    }

    if (formData.dateOfBirth && formData.hireDate) {
      const birthDate = new Date(formData.dateOfBirth);
      const hireDate = new Date(formData.hireDate);
      const age = hireDate.getFullYear() - birthDate.getFullYear();

      if (age < 16) {
        newErrors.dateOfBirth =
          "Employee must be at least 16 years old at hire date";
      }
    }

    if (formData.hireDate) {
      const hireDate = new Date(formData.hireDate);
      const today = new Date();

      if (hireDate > today) {
        newErrors.hireDate = "Hire date cannot be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const selectedDepartment = departments.find(
        (d) => d.ID === formData.department_ID
      );
      const selectedPosition = positions.find(
        (p) => p.ID === formData.position_ID
      );

      const employeeData = {
        ...formData,
        ID: formData.ID || Math.random().toString(36).substr(2, 9), // Generate ID for new employees
        departmentName: selectedDepartment?.name,
        positionTitle: selectedPosition?.title,
      } as Employee;

      onSave(employeeData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{employee ? "Edit Employee" : "Add New Employee"}</h3>
          <button className="close-button" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                className={errors.firstName ? "error" : ""}
              />
              {errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                className={errors.lastName ? "error" : ""}
              />
              {errors.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth || ""}
                onChange={handleChange}
                className={errors.dateOfBirth ? "error" : ""}
              />
              {errors.dateOfBirth && (
                <span className="error-message">{errors.dateOfBirth}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="hireDate">Hire Date *</label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={formData.hireDate || ""}
                onChange={handleChange}
                className={errors.hireDate ? "error" : ""}
              />
              {errors.hireDate && (
                <span className="error-message">{errors.hireDate}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department_ID">Department</label>
              <select
                id="department_ID"
                name="department_ID"
                value={formData.department_ID || ""}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.ID} value={dept.ID}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="position_ID">Position</label>
              <select
                id="position_ID"
                name="position_ID"
                value={formData.position_ID || ""}
                onChange={handleChange}
              >
                <option value="">Select Position</option>
                {positions.map((pos) => (
                  <option key={pos.ID} value={pos.ID}>
                    {pos.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary || ""}
                onChange={handleChange}
                min="0"
                step="1000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status || "Active"}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {employee ? "Update Employee" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
