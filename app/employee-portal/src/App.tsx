import React, { useState, useEffect } from "react";
import "./App.css";
import {
  EmployeeList,
  EmployeeForm,
  Dashboard,
  DepartmentList,
  LeaveManagement,
  TimeSheetManagement,
  Login,
  Register,
} from "./components";
import { apiService } from "./services/apiService";
import { authService, User } from "./services/authService";
import { RegisterData } from "./components/Register";

export interface Employee {
  ID: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  hireDate: string;
  salary?: number;
  status: string;
  departmentName?: string;
  positionTitle?: string;
  department_ID?: string;
  position_ID?: string;
}

export interface Department {
  ID: string;
  name: string;
  description?: string;
}

export interface Position {
  ID: string;
  title: string;
  description?: string;
  level?: string;
}

function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState(false);

  // App state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on app load
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [employeesData, departmentsData, positionsData] = await Promise.all(
        [
          apiService.getEmployees(),
          apiService.getDepartments(),
          apiService.getPositions(),
        ]
      );

      setEmployees(employeesData);
      setDepartments(departmentsData);
      setPositions(positionsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(
        "Failed to load data. Please check if the backend server is running."
      );

      // Fallback to mock data if API fails
      setEmployees([
        {
          ID: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@company.com",
          phone: "+1-555-0101",
          hireDate: "2023-01-15",
          salary: 75000,
          status: "Active",
          departmentName: "Engineering",
          positionTitle: "Senior Software Engineer",
        },
        {
          ID: "2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@company.com",
          phone: "+1-555-0102",
          hireDate: "2023-02-01",
          salary: 80000,
          status: "Active",
          departmentName: "Engineering",
          positionTitle: "Software Engineer",
        },
      ]);

      setDepartments([
        {
          ID: "1",
          name: "Engineering",
          description: "Software Development and Technology",
        },
        {
          ID: "2",
          name: "Human Resources",
          description: "Employee Relations and Talent Management",
        },
      ]);

      setPositions([
        { ID: "1", title: "Software Engineer", level: "Mid" },
        { ID: "2", title: "Senior Software Engineer", level: "Senior" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Authentication handlers
  const handleLogin = async (username: string, password: string) => {
    setAuthLoading(true);
    setAuthError("");

    try {
      const result = await authService.login(username, password);

      if (result.success && result.user) {
        setCurrentUser(result.user);
        await loadData();
      } else {
        setAuthError(result.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setAuthError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (userData: RegisterData) => {
    setAuthLoading(true);
    setAuthError("");

    try {
      const result = await authService.register(userData);

      if (result.success && result.user) {
        setCurrentUser(result.user);
        await loadData();
      } else {
        setAuthError(
          result.message || "Registration failed. Please try again."
        );
      }
    } catch (err) {
      setAuthError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveTab("dashboard");
    setEmployees([]);
    setDepartments([]);
    setPositions([]);
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleEmployeeSave = async (employee: Employee) => {
    try {
      if (employee.ID) {
        // Update existing employee
        await apiService.updateEmployee(employee.ID, employee);
      } else {
        // Add new employee
        await apiService.createEmployee(employee);
      }
      // Reload data to get the latest changes
      await loadData();
      setShowEmployeeForm(false);
      setSelectedEmployee(null);
    } catch (err) {
      console.error("Error saving employee:", err);
      alert("Failed to save employee. Please try again.");
    }
  };

  const handleEmployeeDelete = async (id: string) => {
    try {
      await apiService.deleteEmployee(id);
      // Reload data to reflect the deletion
      await loadData();
    } catch (err) {
      console.error("Error deleting employee:", err);
      alert("Failed to delete employee. Please try again.");
    }
  };

  const handleNewEmployee = () => {
    setSelectedEmployee(null);
    setShowEmployeeForm(true);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard employees={employees} departments={departments} />;
      case "employees":
        return (
          <div>
            <EmployeeList
              employees={employees}
              onEmployeeSelect={handleEmployeeSelect}
              onEmployeeDelete={handleEmployeeDelete}
              onNewEmployee={handleNewEmployee}
            />
            {showEmployeeForm && (
              <EmployeeForm
                employee={selectedEmployee}
                departments={departments}
                positions={positions}
                onSave={handleEmployeeSave}
                onCancel={() => {
                  setShowEmployeeForm(false);
                  setSelectedEmployee(null);
                }}
              />
            )}
          </div>
        );
      case "departments":
        return <DepartmentList departments={departments} />;
      case "leaves":
        return <LeaveManagement employees={employees} />;
      case "timesheets":
        return <TimeSheetManagement employees={employees} />;
      default:
        return <Dashboard employees={employees} departments={departments} />;
    }
  };

  // Show authentication screens if not logged in
  if (!currentUser) {
    if (authView === "register") {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthView("login")}
          error={authError}
          isLoading={authLoading}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthView("register")}
        error={authError}
        isLoading={authLoading}
      />
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Employee Management System</h1>
          <div className="user-info">
            <span className="welcome-text">
              Welcome, {currentUser.firstName} {currentUser.lastName}
            </span>
            <span className="user-role">({currentUser.role})</span>
            <button
              className="btn btn-secondary btn-small logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
        <nav className="main-nav">
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activeTab === "employees" ? "active" : ""}
            onClick={() => setActiveTab("employees")}
          >
            Employees
          </button>
          <button
            className={activeTab === "departments" ? "active" : ""}
            onClick={() => setActiveTab("departments")}
          >
            Departments
          </button>
          <button
            className={activeTab === "leaves" ? "active" : ""}
            onClick={() => setActiveTab("leaves")}
          >
            Leave Management
          </button>
          <button
            className={activeTab === "timesheets" ? "active" : ""}
            onClick={() => setActiveTab("timesheets")}
          >
            Time Sheets
          </button>
        </nav>
      </header>
      <main className="main-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
            <button onClick={loadData} className="btn btn-primary">
              Retry
            </button>
          </div>
        ) : (
          renderActiveTab()
        )}
      </main>
    </div>
  );
}

export default App;
