import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, Circle, BookOpen, Clock, Tag, ExternalLink, Edit2, Save, X } from 'lucide-react';

const TaskCard = ({ task, onTaskUpdate }) => {
  const isCompleted = task.status === 'completed';
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    time: task.time,
    date: task.date || new Date().toISOString().split('T')[0],
    keyword: task.keyword || ''
  });

  const toggleStatus = async () => {
    try {
      const newStatus = isCompleted ? 'pending' : 'completed';
      await axios.put(`https://schedule-ai.onrender.com/api/tasks/${task._id}`, { status: newStatus });
      onTaskUpdate();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`https://schedule-ai.onrender.com/api/tasks/${task._id}`, editedTask);
      setIsEditing(false);
      onTaskUpdate();
    } catch (error) {
      console.error('Failed to save task edits:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--text-secondary)' }}>
        <div className="flex-col" style={{ gap: '0.75rem' }}>
          <input 
            type="text" 
            value={editedTask.title} 
            onChange={e => setEditedTask({...editedTask, title: e.target.value})}
            placeholder="Task Title"
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={editedTask.time} 
              onChange={e => setEditedTask({...editedTask, time: e.target.value})}
              placeholder="Time (e.g. 9:00 AM)"
              style={{ flex: 1 }}
            />
            <input 
              type="date" 
              value={editedTask.date} 
              onChange={e => setEditedTask({...editedTask, date: e.target.value})}
              style={{ flex: 1, colorScheme: 'dark' }}
            />
            <input 
              type="text" 
              value={editedTask.keyword} 
              onChange={e => setEditedTask({...editedTask, keyword: e.target.value})}
              placeholder="Keyword"
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setIsEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', color: 'var(--text-secondary)' }}>
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ 
      marginBottom: '1rem', 
      opacity: isCompleted ? 0.6 : 1,
      borderLeft: `4px solid ${isCompleted ? '#333' : 'var(--accent-color)'}`
    }}>
      <div className="flex-between" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, textDecoration: isCompleted ? 'line-through' : 'none' }}>
            {task.title}
          </h3>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {task.time}</span>
            {task.keyword && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={14} /> {task.keyword}</span>
            )}
            <span style={{ textTransform: 'capitalize' }}>Repeat: {task.recurrence}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={() => setIsEditing(true)}
            style={{ 
              background: 'transparent', 
              padding: '0.5rem', 
              color: 'var(--text-secondary)'
            }}
            title="Edit Task"
          >
            <Edit2 size={18} />
          </button>
          
          <button 
            onClick={toggleStatus}
            style={{ 
              background: 'transparent', 
              padding: '0.5rem', 
              color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)' 
            }}
          >
            {isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
          </button>
        </div>
      </div>

      {/* Research Section */}
      {(task.researchSummary || (task.researchLinks && task.researchLinks.length > 0)) && (
        <div style={{ 
          marginTop: '1rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.9rem'
        }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0', color: '#e0e0e0' }}>
            <BookOpen size={16} /> Research Insights
          </h4>
          
          {task.researchSummary && <p style={{ color: 'var(--text-secondary)' }}>{task.researchSummary}</p>}
          
          {task.researchLinks && task.researchLinks.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {task.researchLinks.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" 
                   style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                  <ExternalLink size={12} /> {link.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
