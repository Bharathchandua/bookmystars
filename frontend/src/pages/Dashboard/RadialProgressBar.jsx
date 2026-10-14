import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { Check } from "lucide-react";

export default function RadialProgressBar() {
  const [tasks, setTasks] = useState([
    { id: "basic", label: "Basic Information", completed: true },
    { id: "about", label: "About Me", completed: true },
    { id: "experience", label: "Experience", completed: true },
    { id: "skills", label: "Skills", completed: true },
    { id: "media", label: "Media", completed: true },
    { id: "social", label: "Social Links", completed: false }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const percentage = Math.round((completedCount / tasks.length) * 100);

  // SVG parameters
  const size = 135;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="card-widget flex flex-col justify-between h-full">
      <div className="widget-header">
        <h3>Profile Completion</h3>
      </div>

      <div className="flex flex-row items-center gap-3 my-auto w-full">
        {/* Radial Progress SVG ring */}
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              stroke="#FDE4F6"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            {/* Foreground Progress Circle */}
            <circle
              className="text-pink-600 transition-all duration-500 ease-out"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="url(#pinkPurpleGradient)"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
            />
            <defs>
              <linearGradient id="pinkPurpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ee008f" />
                <stop offset="100%" stopColor="#6500d7" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Inner Text display */}
          <div className="absolute flex flex-col items-center justify-center" style={{ textAlign: 'center' }}>
            <span className="font-black text-slate-800 tracking-tight" style={{ fontSize: '32px', lineHeight: '1' }}>{percentage}%</span>
            <span className="text-slate-400 font-bold uppercase mt-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Completed</span>
          </div>
        </div>

        {/* Checklist with Left vertical separator border line */}
        <div 
          className="flex-1 min-w-0 text-left" 
          style={{ 
            borderLeft: '1px solid #cbd5e1', 
            paddingLeft: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex items-center justify-between cursor-pointer group"
              style={{ fontSize: '16px', gap: '8px' }}
            >
              <span 
                className="font-bold text-slate-800 transition-colors duration-150 group-hover:text-pink-600"
                style={{ flex: 1, minWidth: 0, wordBreak: 'break-word', lineHeight: '1.2' }}
              >
                {task.label}
              </span>
              
              <div 
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  border: task.completed ? '2px solid #16a34a' : '2px solid #475569',
                  backgroundColor: task.completed ? '#16a34a' : '#f8fafc',
                  color: '#ffffff',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                {task.completed && <Check size={12} strokeWidth={4} color="#ffffff" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button at bottom */}
      <PagesButton className="w-full mt-4 btn-outline-db">
        Complete Profile
      </PagesButton>
    </div>
  );
}
