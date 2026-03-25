import { RegisterData } from '../components/Register';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  // Mock users for demo purposes
  private mockUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@company.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    },
    {
      id: '2',
      username: 'manager',
      email: 'manager@company.com',
      firstName: 'Manager',
      lastName: 'User',
      role: 'manager',
      isActive: true
    },
    {
      id: '3',
      username: 'employee',
      email: 'employee@company.com',
      firstName: 'Employee',
      lastName: 'User',
      role: 'employee',
      isActive: true
    }
  ];

  // Mock passwords for demo
  private mockPasswords: Record<string, string> = {
    'admin': 'admin',
    'manager': 'manager',
    'employee': 'employee'
  };

  constructor() {
    // Check for existing session
    this.loadSession();
  }

  private loadSession(): void {
    try {
      const savedUser = localStorage.getItem('currentUser');
      const savedToken = localStorage.getItem('authToken');
      
      if (savedUser && savedToken) {
        this.currentUser = JSON.parse(savedUser);
        this.token = savedToken;
      }
    } catch (error) {
      console.error('Error loading session:', error);
      this.clearSession();
    }
  }

  private saveSession(user: User, token: string): void {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      this.currentUser = user;
      this.token = token;
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  private clearSession(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUser = null;
    this.token = null;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.mockUsers.find(u => 
      u.username === username || u.email === username
    );

    if (!user) {
      return {
        success: false,
        message: 'User not found. Please check your username or email.'
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      };
    }

    const expectedPassword = this.mockPasswords[user.username];
    if (password !== expectedPassword) {
      return {
        success: false,
        message: 'Invalid password. Please try again.'
      };
    }

    // Generate a mock token
    const token = `mock-token-${user.id}-${Date.now()}`;
    
    this.saveSession(user, token);

    return {
      success: true,
      user,
      token,
      message: 'Login successful!'
    };
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if username already exists
    const existingUserByUsername = this.mockUsers.find(u => 
      u.username.toLowerCase() === userData.username.toLowerCase()
    );

    if (existingUserByUsername) {
      return {
        success: false,
        message: 'Username already exists. Please choose a different username.'
      };
    }

    // Check if email already exists
    const existingUserByEmail = this.mockUsers.find(u => 
      u.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (existingUserByEmail) {
      return {
        success: false,
        message: 'Email address already registered. Please use a different email or sign in.'
      };
    }

    // Create new user
    const newUser: User = {
      id: (this.mockUsers.length + 1).toString(),
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: 'employee', // Default role for new registrations
      isActive: true
    };

    // Add to mock users
    this.mockUsers.push(newUser);
    this.mockPasswords[newUser.username] = userData.password;

    // Generate a mock token
    const token = `mock-token-${newUser.id}-${Date.now()}`;
    
    this.saveSession(newUser, token);

    return {
      success: true,
      user: newUser,
      token,
      message: 'Account created successfully! Welcome to the Employee Management System.'
    };
  }

  logout(): void {
    this.clearSession();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  hasRole(role: 'admin' | 'manager' | 'employee'): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: ('admin' | 'manager' | 'employee')[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
  }
}

export const authService = new AuthService();
