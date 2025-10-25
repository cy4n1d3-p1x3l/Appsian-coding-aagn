import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TaskItem } from './types';
import './App.css';

const BASE_API_URL = 'http://localhost:5123/api/tasks';

function App() {
  const [taskList, setTaskList] = useState<TaskItem[]>([]);
  const [taskInput, setTaskInput] = useState("");

  useEffect(() => { 
    loadTasksFromServer(); 
  }, []);

  const loadTasksFromServer = async () => {
    const result = await axios.get(BASE_API_URL);
    setTaskList(result.data);
  };

  const handleTaskSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskInput.trim()) return;
    const result = await axios.post(BASE_API_URL, { description: taskInput });
    setTaskList([...taskList, result.data]);
    setTaskInput("");
  };

  const toggleTaskStatus = async (taskItem: TaskItem) => {
    await axios.put(`${BASE_API_URL}/${taskItem.id}`, { isCompleted: !taskItem.isCompleted });
    setTaskList(taskList.map(item => item.id === taskItem.id ? { ...item, isCompleted: !item.isCompleted } : item));
  };

  const removeTask = async (taskId: string) => {
    await axios.delete(`${BASE_API_URL}/${taskId}`);
    setTaskList(taskList.filter(item => item.id !== taskId));
  };

  return (
    <div className="main-wrapper">
      <div className="task-card">
        <h1>📋 Task Organizer</h1>
        <form onSubmit={handleTaskSubmit} className="input-section">
          <input 
            type="text" 
            value={taskInput} 
            onChange={(e) => setTaskInput(e.target.value)} 
            placeholder="What needs to be done?" 
            className="task-input"
          />
          <button type="submit" className="add-btn">Add</button>
        </form>
        <div className="task-list">
          {taskList.length === 0 ? (
            <p className="empty-message">No tasks yet. Add one to get started!</p>
          ) : (
            <ul>
              {taskList.map(taskItem => (
                <li key={taskItem.id} className={taskItem.isCompleted ? 'done' : 'pending'}>
                  <span onClick={() => toggleTaskStatus(taskItem)} className="task-text">
                    {taskItem.description}
                  </span>
                  <button onClick={() => removeTask(taskItem.id)} className="remove-btn">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
