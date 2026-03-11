import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Calendar, LayoutDashboard, Settings } from 'lucide-react';

import ScheduleInput from './components/ScheduleInput';
import TaskCard from './components/TaskCard';
import ProgressTracker from './components/ProgressTracker';
import { initializeFirebase, requestNotificationPermission, onMessageListener } from './firebase';

const Dashboard = ({ tasks, fetchTasks, selectedDate, setSelectedDate }) => (
  <div className="container" style={{ paddingTop: '2rem' }}>
    <div className="flex-between" style={{ marginBottom: '2rem' }}>
      <h2 style={{ margin: 0 }}>Dashboard Overview</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Showing schedule for:</span>
        <input 
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ width: 'auto', padding: '0.5rem', fontWeight: 'bold', border: '1px solid var(--border-color)' }}
        />
      </div>
    </div>
    
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

const Schedule = ({ fetchTasks, clearSchedule, selectedDate }) => (
  <div className="container" style={{ paddingTop: '2rem' }}>
    <div className="flex-between" style={{ marginBottom: '2rem' }}>
      <h2 style={{ margin: 0 }}>Manage Specific Date: <span style={{ color: 'var(--accent-color)' }}>{selectedDate}</span></h2>
      <button 
        onClick={clearSchedule}
        style={{ 
          backgroundColor: '#cf6679', 
          color: '#121212', 
          fontWeight: 'bold',
          padding: '0.5rem 1rem', 
          borderRadius: '4px', 
          border: 'none', 
          cursor: 'pointer' 
        }}
      >
        Clear This Date
      </button>
    </div>
    <ScheduleInput onScheduleAdded={fetchTasks} selectedDate={selectedDate} />
  </div>
);

function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const location = useLocation();

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`https://schedule-ai.onrender.com/api/tasks?date=${selectedDate}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const clearSchedule = async () => {
    if (!window.confirm("Are you sure you want to delete all tasks for this date? This cannot be undone.")) return;
    try {
      await axios.delete(`https://schedule-ai.onrender.com/api/tasks/all/clear?date=${selectedDate}`);
      fetchTasks();
    } catch (error) {
      console.error('Error clearing schedule:', error);
      alert('Failed to clear schedule.');
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
  }, [selectedDate]); // Refetch when the selected date changes

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
          <Route path="/" element={<Dashboard tasks={tasks} fetchTasks={fetchTasks} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />} />
          <Route path="/schedule" element={<Schedule fetchTasks={fetchTasks} clearSchedule={clearSchedule} selectedDate={selectedDate} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
