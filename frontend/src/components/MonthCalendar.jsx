import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MonthCalendar = ({ selectedDate, onSelectDate }) => {
  // Parse the selected date or use today to initialize the viewed month
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  
  // State for the currently viewed month (ignores day part for navigation)
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Determine if a calendar square matches the universally selected date
  const isSelected = (day) => {
    if (!selectedDate) return false;
    const sDate = new Date(selectedDate);
    // JS dates can have timezone offsets, so format safely:
    const clickedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return clickedDateStr === selectedDate;
  };
  
  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const handleDateClick = (day) => {
    // Format to YYYY-MM-DD
    const newDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelectDate(newDateStr);
  };

  // Generate calendar grid
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots = [...blanks, ...days];
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem 2rem' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0 }}>{monthNames[month]} {year}</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handlePrevMonth} style={{ background: 'var(--bg-main)', color: 'var(--text-primary)', padding: '0.4rem' }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} style={{ background: 'var(--bg-main)', color: 'var(--text-primary)', padding: '0.4rem' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
        {daysOfWeek.map(day => (
          <div key={day} style={{ fontWeight: 'bold', color: 'var(--text-secondary)', paddingBottom: '0.5rem' }}>
            {day}
          </div>
        ))}
        
        {totalSlots.map((day, index) => {
          if (day === null) return <div key={`blank-${index}`} />;
          
          const selected = isSelected(day);
          const current = isToday(day);
          
          return (
            <div 
              key={day} 
              onClick={() => handleDateClick(day)}
              style={{
                cursor: 'pointer',
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: selected 
                  ? 'var(--accent-color)' 
                  : (current ? 'var(--bg-main)' : 'transparent'),
                color: selected 
                  ? '#121212' 
                  : 'var(--text-primary)',
                fontWeight: selected ? 'bold' : 'normal',
                border: current && !selected ? '1px solid var(--accent-color)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!selected) e.currentTarget.style.backgroundColor = 'var(--bg-main)';
              }}
              onMouseLeave={(e) => {
                if (!selected) e.currentTarget.style.backgroundColor = current ? 'var(--bg-main)' : 'transparent';
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
