<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# SAP CAP Employee Management System

This is an SAP CAP (Cloud Application Programming) project with a React.js frontend for employee management.

## Project Structure

- `/db` - Database layer with CDS models for employee management system
- `/srv` - Service layer with OData services and business logic
- `/app/employee-portal` - React.js frontend application

## Key Technologies

- SAP CAP with Node.js runtime
- CDS (Core Data Services) for data modeling
- React.js with TypeScript for frontend
- SQLite for development database

## Database Schema

The employee management system includes:

- Employees with personal and professional information
- Departments for organizational structure
- Positions for job roles and levels
- Time sheets for tracking work hours
- Leave management for time-off requests
- Addresses for employee contact information

## Services

- EmployeeService: Main service for employee operations with CRUD operations and business actions
- AdminService: Administrative functions requiring elevated permissions

## Development Guidelines

- Use CDS annotations for service definitions
- Implement business logic in service handlers
- Follow TypeScript best practices in React components
- Use modern CSS with flexbox/grid for responsive design
- Maintain separation of concerns between layers
