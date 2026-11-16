import PagesButton from "../common/PagesButton";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserProfile } from "../../features/bms/api/profile/profileApi";
import { getMyWorkExperiences } from "../../features/bms/api/profile/workExperienceApi";
import { getUserSkills } from "../../features/bms/api/profile/skillsApi";
import { getMyPortfolio } from "../../features/bms/api/media/portfolioApi";
import { getStoredUser } from "../../features/bms/api/auth/authApi";

export default function RadialProgressBar() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([
    { id: "basic", label: "Basic Information", completed: false, path: "/profile?tab=overview" },
    { id: "about", label: "About Me", completed: false, path: "/profile?tab=overview" },
    { id: "experience", label: "Experience", completed: false, path: "/profile?tab=experience" },
    { id: "skills", label: "Skills", completed: false, path: "/profile?tab=skills" },
    { id: "media", label: "Media", completed: false, path: "/my-media" },
    { id: "social", label: "Social Links", completed: false, path: "/profile?tab=overview" }
  ]);

  useEffect(() => {
    async function evaluateProfileCompletion() {
      try {
        const user = getStoredUser();
        const [profileRes, expRes, photosRes] = await Promise.all([
          getCurrentUserProfile().catch(() => null),
          getMyWorkExperiences().catch(() => []),
          getMyPortfolio().catch(() => [])
        ]);

        const p = profileRes || {};
        const skillsRes = user?.id ? getUserSkills(user.id) : [];
        const basicCompleted = Boolean(user?.fullName && user?.email && (user?.location || p.location));
        const aboutCompleted = Boolean(p.about && typeof p.about === "string" && p.about.trim().length > 20);
        const expCompleted = Array.isArray(expRes) && expRes.length > 0;
        const skillsCompleted = (Array.isArray(skillsRes) && skillsRes.length > 0) || (Array.isArray(p.skills) ? p.skills.length > 0 : (typeof p.skills === "string" && p.skills.trim().length > 0));
        const mediaCompleted = Array.isArray(photosRes) && photosRes.length > 0;
        const socialCompleted = Boolean(p.instagram || p.youtube || p.website || p.imdb);

        setTasks([
          { id: "basic", label: "Basic Information", completed: basicCompleted, path: "/profile?tab=overview" },
          { id: "about", label: "About Me", completed: aboutCompleted, path: "/profile?tab=overview" },
          { id: "experience", label: "Experience", completed: expCompleted, path: "/profile?tab=experience" },
          { id: "skills", label: "Skills", completed: skillsCompleted, path: "/profile?tab=skills" },
          { id: "media", label: "Media", completed: mediaCompleted, path: "/my-media" },
          { id: "social", label: "Social Links", completed: socialCompleted, path: "/profile?tab=overview" }
        ]);
      } catch (e) {
        console.warn("Could not evaluate dynamic profile completion:", e);
      }
    }

    evaluateProfileCompletion();

    const handleProfileUpdate = () => evaluateProfileCompletion();
    window.addEventListener("profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("profile_updated", handleProfileUpdate);
  }, []);

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
              onClick={() => navigate(task.path)}
              className="flex items-center justify-between cursor-pointer group"
              style={{ fontSize: '16px', gap: '8px' }}
              title={`Click to edit ${task.label}`}
            >
              <span 
                className={`font-bold transition-colors duration-150 ${task.completed ? "text-slate-800" : "text-slate-500"} group-hover:text-pink-600`}
                style={{ flex: 1, minWidth: 0, wordBreak: 'break-word', lineHeight: '1.2' }}
              >
                {task.label}
              </span>
              
              <div 
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  border: task.completed ? '2px solid #16a34a' : '2px solid #94a3b8',
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
      <PagesButton
        onClick={() => navigate("/profile")}
        className="w-full mt-4 btn-outline-db"
      >
        Complete Profile
      </PagesButton>
    </div>
  );
}
