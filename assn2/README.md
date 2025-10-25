# Mini Project Manager

Full-stack project management system with JWT authentication.

## Features

- User registration and login
- JWT token-based authentication
- Create and manage projects
- Add tasks to projects with due dates
- Toggle task completion
- Delete projects and tasks
- Protected routes and authorization

## Technology Stack

**Backend:**
- .NET 9.0 Web API
- JWT Authentication
- In-memory storage
- Password hashing (SHA256)

**Frontend:**
- React 19 with TypeScript
- React Router v6
- Axios for API calls
- LocalStorage for JWT

## Setup & Run

### Backend:
```bash
cd ProjectManagerAPI
dotnet restore
dotnet build
dotnet run
```

API: http://localhost:5123

### Frontend:
```bash
cd project-manager-ui
npm install
npm start
```

App: http://localhost:3000

## API Endpoints

### Auth:
- POST /api/auth/register  
- POST /api/auth/login  

### Projects (Auth Required):
- GET /api/projects  
- POST /api/projects  
- GET /api/projects/{id}  
- DELETE /api/projects/{id}  

### Tasks (Auth Required):
- GET /api/projects/{projectId}/tasks  
- POST /api/projects/{projectId}/tasks  
- PUT /api/tasks/{id}  
- DELETE /api/tasks/{id}  

## Usage
1. Register a new account  
2. Login with credentials  
3. Create projects from dashboard  
4. Click a project to manage tasks  
5. Add/toggle/delete tasks  
6. Delete projects when done  

## Security
- SHA256 password hashing  
- JWT tokens (7-day expiration)  
- Protected API endpoints  
- User data isolation  
