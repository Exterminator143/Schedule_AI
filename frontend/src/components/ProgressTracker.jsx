import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, TrendingUp, Sparkles, PlusCircle } from 'lucide-react';

const ProgressTracker = ({ tasks }) => {
  const [stats, setStats] = useState({ streak: 0 });
  const [dailySummary, setDailySummary] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [tasks]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculateAIInsights = async () => {
    setLoadingAI(true);
    try {
      const summaryRes = await axios.get('http://localhost:5000/api/tasks/daily-summary');
      setDailySummary(summaryRes.data.summary);

      const suggestRes = await axios.get('http://localhost:5000/api/tasks/suggestions');
      setSuggestions(suggestRes.data.suggestions);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;
  const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Target size={20} /> Daily Progress
          </h3>
          
          <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${progressPercent}%`, 
              backgroundColor: 'var(--accent-color)',
              transition: 'width 0.5s ease-out'
            }}></div>
          </div>
          
          <div className="flex-between" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>{progressPercent}% Completed</span>
            <span>{stats.streak} Day Streak 🔥</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div className="flex-col" style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{total}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Tasks</span>
          </div>
          <div className="flex-col" style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#51cf66' }}>{completed}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Completed</span>
          </div>
          <div className="flex-col" style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#ff6b6b' }}>{pending}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending</span>
          </div>
        </div>
      </div>

      {/* AI Smart Insights Section */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Sparkles size={18} color="var(--accent-color)" /> Smart Insights
          </h3>
          <button 
            onClick={calculateAIInsights} 
            disabled={loadingAI}
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'var(--bg-main)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
          >
            {loadingAI ? 'Calculating...' : 'Generate New Insights'}
          </button>
        </div>

        {dailySummary && (
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '6px' }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily Summary</strong>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>"{dailySummary}"</p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div>
            <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Suggested Next Tasks</strong>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {suggestions.map((sg, idx) => (
                <div key={idx} style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                  <PlusCircle size={16} color="var(--text-secondary)" />
                  <div className="flex-col">
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{sg.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sg.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
