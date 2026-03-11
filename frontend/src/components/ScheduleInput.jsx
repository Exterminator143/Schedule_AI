import React, { useState } from 'react';
import axios from 'axios';
import { Send, Loader2 } from 'lucide-react';

const ScheduleInput = ({ onScheduleAdded }) => {
  const [scheduleText, setScheduleText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleText.trim()) return;

    setLoading(true);
    setMessage('');
    
    try {
      // Pointing to expected local backend
      const response = await axios.post('https://schedule-ai.onrender.com/api/tasks/parse-schedule', { scheduleText });
      setMessage(response.data.message || 'Schedule parsed successfully!');
      setScheduleText('');
      if (onScheduleAdded) onScheduleAdded();
    } catch (error) {
      console.error('Submission error:', error);
      setMessage('Failed to parse schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Send size={20} /> Input AI Schedule
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Paste your raw schedule text below. The AI will parse it into manageable tasks and fetch related research.
      </p>
      
      <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '1rem' }}>
        <textarea 
          rows={6}
          placeholder="e.g., At 9:00 AM I need to Study AI Ethics, then at 11:00 AM code a React app..."
          value={scheduleText}
          onChange={(e) => setScheduleText(e.target.value)}
        />
        
        <div className="flex-between">
          <span style={{ fontSize: '0.9rem', color: message.includes('Failed') ? '#ff6b6b' : '#51cf66' }}>
            {message}
          </span>
          <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {loading ? <Loader2 size={16} className="lucide-spin" /> : 'Parse Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleInput;
