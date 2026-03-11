import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Calendar, LayoutDashboard, Settings } from 'lucide-react';

import ScheduleInput from './components/ScheduleInput';
import TaskCard from './components/TaskCard';
import ProgressTracker from './components/ProgressTracker';
import { initializeFirebase, requestNotificationPermission, onMessageListener } from './firebase';

const Dashboard = ({ tasks, fetchTasks }) => (
  <div className="container" style={{ paddingTop: '2rem' }}>
    <h2 style={{ marginBottom: '2rem' }}>Dashboard Overview</h2>
    
    <ProgressTracker tasks={tasks} />

    <div className="flex-col" style={{ gap: '1rem' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Your Tasks</h3>
      {tasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No tasks yet. Head over to the Manage tab to add your schedule.</p>
        </div>
      ) : (
        tasks.map(task => (
          <TaskCard key={task._id} task={task} onTaskUpdate={fetchTasks} />
        ))
      )}
    </div>
  </div>
);

const Schedule = ({ fetchTasks }) => (
  <div className="container" style={{ paddingTop: '2rem' }}>
    <h2 style={{ marginBottom: '2rem' }}>Manage Your AI Schedule</h2>
    <ScheduleInput onScheduleAdded={fetchTasks} />
  </div>
);

function App() {
  const [tasks, setTasks] = useState([]);
  const location = useLocation();

  const fetchTasks = async () => {
    try {
      const response = await axios.get('https://schedule-ai.onrender.com/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    // Initialize standard Firebase Messaging setup
    initializeFirebase();
    requestNotificationPermission();

    // Listen to foreground messages
    const listenForMessages = async () => {
      try {
        const payload = await onMessageListener();
        console.log('Foreground Push Received:', payload);
        // You can replace this with a proper Toast UI later
        alert(`🔔 New Notification: ${payload.notification?.title}\n${payload.notification?.body}`);
      } catch (err) {
        console.log('Failed to listen for messages: ', err);
      }
    };
    
    listenForMessages();
  }, []);

  return (
    <div className="flex-col" style={{ minHeight: '100vh' }}>
      <header style={{ 
        backgroundColor: 'var(--bg-surface)', 
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div className="flex-between" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={24} color="var(--accent-color)" />
            AI Schedule
          </h1>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <Link 
              to="/" 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                color: location.pathname === '/' ? 'var(--accent-color)' : 'var(--text-secondary)'
              }}
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link 
              to="/schedule" 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                color: location.pathname === '/schedule' ? 'var(--accent-color)' : 'var(--text-secondary)' 
              }}
            >
              <Settings size={18} /> Manage
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Dashboard tasks={tasks} fetchTasks={fetchTasks} />} />
          <Route path="/schedule" element={<Schedule fetchTasks={fetchTasks} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
