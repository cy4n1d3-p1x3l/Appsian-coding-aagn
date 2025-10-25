# TaskFlow Studio

Full-stack application for managing projects (Flows) and tasks (Action Items) with JWT authentication.

## Features

- User registration and login
- JWT token-based authentication
- Create and manage Flows (Projects)
- Add Action Items (Tasks) to Flows with target dates
- Toggle task completion
- Delete Flows and Action Items
- Protected routes and authorization

## Technology Stack

*Backend: (FlowAPI)*
- .NET 9.0 Web API
- JWT Authentication
- In-memory storage (for simplicity)
- Password hashing (SHA256)

*Frontend: (taskflow-studio-ui)*
- React 19 with TypeScript
- React Router v6
- Axios for API calls
- LocalStorage for JWT

## Setup & Run

### Backend: (FlowAPI)
bash
cd FlowAPI
dotnet restore
dotnet build
dotnet run --launch-profile http


API: http://localhost:5124

### Frontend: (taskflow-studio-ui)
bash
cd taskflow-studio-ui
npm install
npm start


App: http://localhost:3000

## API Endpoints

### Auth:
- POST /api/auth/register  
- POST /api/auth/login  

### Flows (Auth Required):
- GET /api/projects  
- POST /api/projects  
- GET /api/projects/{id}  
- DELETE /api/projects/{id}  

### Action Items (Auth Required):
- GET /api/projects/{projectId}/tasks  
- POST /api/projects/{projectId}/tasks  
- PUT /api/tasks/{id}  
- DELETE /api/tasks/{id}  

## Usage
1. Register a new account  
2. Login with credentials  
3. Create new Flows from the studio page  
4. Click a Flow to manage Action Items (tasks)  
5. Add/toggle/delete Action Items  
6. Delete Flows when complete  

## Security
- SHA256 password hashing  
- JWT tokens (7-day expiration)  
- Protected API endpoints  
- User data isolation  
