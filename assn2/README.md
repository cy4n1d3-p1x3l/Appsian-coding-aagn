# Mini Project Manager – Blue Edition

Full-stack project management system with JWT authentication, task dependencies, and a smart scheduler.

## Features

- User registration and login  
- JWT token-based authentication (7-day tokens)  
- Create, read, and delete projects  
- Create, read, update, and delete tasks within projects  
- **Task Dependencies:** Define which tasks must be completed before others
- **Circular Dependency Prevention:** Prevents creation of cyclic task dependencies
- **Smart Scheduler:** Uses topological sort to recommend efficient task completion order and calculate total estimated hours
- **Responsive UI:** Mobile-friendly design
- **UX Improvements:** Loading indicators and clear feedback

## Technology Stack

**Backend:**
- .NET 8.0+ Minimal API  
- JWT Authentication  
- In-memory storage (for demonstration)  
- SHA256 password hashing  
- Services: `AuthService`, `SchedulingService` (Topological Sort)

**Frontend:**
- React 18+ with TypeScript  
- React Router v6  
- Axios (with interceptors)  
- `react-loader-spinner` (loading indicators)  
- LocalStorage for JWT persistence  

## Setup & Run

### 1. Start the Backend

```bash
# From the /assn2 directory
cd ProjectManagerAPI

# Install dependencies
dotnet restore

# Build and run the API
dotnet run --launch-profile http
```

API will run at: **http://localhost:5123**

---

### 2. Start the Frontend (in a new terminal)

```bash
# From the /assn2 directory
cd project-manager-ui

# Install dependencies
npm install

# Run the React app
npm start
```

Frontend will open at: **http://localhost:3000**

---

## API Endpoints

### Auth
**POST /api/auth/register**  
Body: `{ "username": "user", "password": "password" }`

**POST /api/auth/login**  
Body: `{ "username": "user", "password": "password" }`

---

### Projects (Auth Required)
**GET /api/projects**  
**POST /api/projects**  
Body: `{ "title": "New Project", "description": "..." }`

**GET /api/projects/{id}**  
**DELETE /api/projects/{id}**

---

### Tasks (Auth Required)
**GET /api/projects/{projectId}/tasks**  
**POST /api/projects/{projectId}/tasks**  
Body: `{ "title": "New Task", "dueDate": "...", "estimatedHours": 5, "dependencies": ["guid-of-other-task"] }`

**PUT /api/tasks/{id}**  
Body: `{ "isCompleted": true, ... }`

**DELETE /api/tasks/{id}**

---

### Smart Scheduler (Auth Required)
**POST /api/projects/{projectId}/schedule**  
Runs the scheduler on all existing tasks in the project.  

Returns:  
`{ "recommendedOrder": ["Task A", "Task B"], "totalEstimatedHours": 10 }`  
or an error if a cycle is detected.
