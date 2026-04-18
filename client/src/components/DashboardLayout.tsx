import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, GraduationCap, LogOut, FileText, Award } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    ...(user?.role === 'Student' ? [
      { name: 'Enrollments', path: '/enrollments', icon: <GraduationCap size={20} /> },
      { name: 'Certificates', path: '/certificates', icon: <Award size={20} /> }
    ] : [
      { name: 'Manage Assignments', path: '/manage-assignments', icon: <FileText size={20} /> }
    ])
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--color-background))' }}>
      
      <aside className="glass-panel" style={{ width: '250px', display: 'flex', flexDirection: 'column', borderRight: '1px solid hsl(var(--color-border))', borderRadius: 0 }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid hsla(var(--color-border), 0.5)' }}>
          <h2 style={{ background: 'linear-gradient(90deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SESD LMS
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>{user?.role} Portal</p>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className="btn"
                style={{ 
                  justifyContent: 'flex-start', 
                  background: isActive ? 'hsla(var(--color-primary), 0.15)' : 'transparent',
                  color: isActive ? 'hsl(var(--color-primary))' : 'hsl(var(--text-secondary))',
                }}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid hsla(var(--color-border), 0.5)' }}>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', color: 'hsl(var(--color-danger))' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid hsla(var(--color-border), 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 500 }}>Welcome, {user?.name}</h3>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'hsl(var(--color-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.name.charAt(0)}
          </div>
        </header>

        <div style={{ padding: '2.5rem', flex: 1 }}>
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
