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

export interface TimeSheet {
  ID: string;
  employee_ID: string;
  date: string;
  hoursWorked: number;
  description?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  employeeFirstName?: string;
  employeeLastName?: string;
}

export interface Leave {
  ID: string;
  employee_ID: string;
  startDate: string;
  endDate: string;
  type: 'Vacation' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity';
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
  employeeFirstName?: string;
  employeeLastName?: string;
}

class ApiService {
  private baseUrl = '/employee';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.value || data;
  }

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return this.request<Employee[]>('/Employees');
  }

  async getEmployee(id: string): Promise<Employee> {
    return this.request<Employee>(`/Employees(${id})`);
  }

  async createEmployee(employee: Omit<Employee, 'ID'>): Promise<Employee> {
    return this.request<Employee>('/Employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    return this.request<Employee>(`/Employees(${id})`, {
      method: 'PATCH',
      body: JSON.stringify(employee),
    });
  }

  async deleteEmployee(id: string): Promise<void> {
    await this.request(`/Employees(${id})`, {
      method: 'DELETE',
    });
  }

  // Department operations
  async getDepartments(): Promise<Department[]> {
    return this.request<Department[]>('/Departments');
  }

  async createDepartment(department: Omit<Department, 'ID'>): Promise<Department> {
    return this.request<Department>('/Departments', {
      method: 'POST',
      body: JSON.stringify(department),
    });
  }

  // Position operations
  async getPositions(): Promise<Position[]> {
    return this.request<Position[]>('/Positions');
  }

  // TimeSheet operations
  async getTimeSheets(employeeId?: string): Promise<TimeSheet[]> {
    const filter = employeeId ? `?$filter=employee_ID eq '${employeeId}'` : '';
    return this.request<TimeSheet[]>(`/TimeSheets${filter}`);
  }

  async createTimeSheet(timeSheet: Omit<TimeSheet, 'ID'>): Promise<TimeSheet> {
    return this.request<TimeSheet>('/TimeSheets', {
      method: 'POST',
      body: JSON.stringify(timeSheet),
    });
  }

  async updateTimeSheet(id: string, timeSheet: Partial<TimeSheet>): Promise<TimeSheet> {
    return this.request<TimeSheet>(`/TimeSheets(${id})`, {
      method: 'PATCH',
      body: JSON.stringify(timeSheet),
    });
  }

  // Leave operations
  async getLeaves(employeeId?: string): Promise<Leave[]> {
    const filter = employeeId ? `?$filter=employee_ID eq '${employeeId}'` : '';
    return this.request<Leave[]>(`/Leaves${filter}`);
  }

  async createLeave(leave: Omit<Leave, 'ID'>): Promise<Leave> {
    return this.request<Leave>('/Leaves', {
      method: 'POST',
      body: JSON.stringify(leave),
    });
  }

  async updateLeave(id: string, leave: Partial<Leave>): Promise<Leave> {
    return this.request<Leave>(`/Leaves(${id})`, {
      method: 'PATCH',
      body: JSON.stringify(leave),
    });
  }

  // Business Actions
  async promoteEmployee(employeeId: string, newPositionId: string): Promise<void> {
    await this.request(`/promoteEmployee`, {
      method: 'POST',
      body: JSON.stringify({ employeeID: employeeId, newPositionID: newPositionId }),
    });
  }

  async transferEmployee(employeeId: string, newDepartmentId: string): Promise<void> {
    await this.request(`/transferEmployee`, {
      method: 'POST',
      body: JSON.stringify({ employeeID: employeeId, newDepartmentID: newDepartmentId }),
    });
  }

  async updateSalary(employeeId: string, newSalary: number): Promise<void> {
    await this.request(`/updateSalary`, {
      method: 'POST',
      body: JSON.stringify({ employeeID: employeeId, newSalary }),
    });
  }

  // Analytics
  async getDepartmentStats(): Promise<any[]> {
    return this.request<any[]>('/getDepartmentStats()');
  }

  async getAverageSalaryByDepartment(): Promise<any[]> {
    return this.request<any[]>('/getAverageSalaryByDepartment()');
  }
}

export const apiService = new ApiService();
