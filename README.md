# Mradul Singhal - Home Assignments

**Email:** [your email here]  
**GitHub:** [your GitHub link here]  
**LinkedIn:** [your LinkedIn link here]  

---

## Assignment 1 – Basic Task Manager

**What I Implemented:**
- Display a list of tasks
- Add new tasks with descriptions
- Mark tasks as completed or uncompleted
- Delete tasks
- Backend: RESTful API using .NET 8 Core with in-memory data storage
- Frontend: React + TypeScript SPA
  - List all tasks
  - UI for adding, toggling completion, and deleting tasks
  - API integration using Axios
  - State management with React Hooks
- Enhancements:
  - Task filtering (All / Completed / Active)
  - Basic styling with Tailwind
  - Tasks persisted in localStorage

---

## Assignment 2 – Mini Project Manager

**What I Implemented:**
- User registration and login using JWT authentication
- Each user can manage multiple projects
- Each project contains multiple tasks
- CRUD operations for projects and tasks
- Backend: REST API using .NET 8 Core + Entity Framework Core
  - In-memory storage or SQLite
  - Input validation with DataAnnotations
  - Separation of concerns using DTOs, services, and models
- Frontend: React + TypeScript
  - Pages: Login/Register, Dashboard (projects), Project Details (tasks)
  - Features:
    - Create and delete projects
    - Add, update, delete tasks
    - Toggle task completion
    - Form validation and error handling
    - JWT stored for authenticated requests
    - Navigation with React Router
- Enhancements:
  - Smart Scheduler API for automatic task planning
  - Mobile-friendly design
  - Deployment: backend on Render, frontend on Vercel
