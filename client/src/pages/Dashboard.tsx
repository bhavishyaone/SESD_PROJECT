import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle, TrendingUp, Users } from 'lucide-react';
import api from '../api/axios';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ enrollments: 0, completed: 0, activeAssignments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        if (user?.role === 'Student') {
          const response = await api.get('/enrollments');
          const enrolls = response.data.data;
          setStats({ 
            enrollments: enrolls.length || 0,
            completed: enrolls.filter((e: any) => e.progress === 100).length || 0,
            activeAssignments: 2 
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  const StatCard = ({ title, value, icon, gradient }: any) => (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '1rem', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</p>
        <h2 style={{ fontSize: '2rem' }}>{value}</h2>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Overview</h1>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Track your active academic standing and performance.</p>
        </div>
        
        {user?.role === 'Instructor' && (
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = '/courses/new'}
          >
            + Create New Course
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading metrics...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          {user?.role === 'Student' ? (
            <>
              <StatCard title="Active Courses" value={stats.enrollments} icon={<BookOpen size={32} />} gradient="linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))" />
              <StatCard title="Certificates Earned" value={stats.completed} icon={<CheckCircle size={32} />} gradient="linear-gradient(135deg, hsl(var(--color-success)), #2ecc71)" />
              <StatCard title="Pending Assignments" value={stats.activeAssignments} icon={<TrendingUp size={32} />} gradient="linear-gradient(135deg, #f39c12, #f1c40f)" />
            </>
          ) : (
            <>
              <StatCard title="Total Students" value="124" icon={<Users size={32} />} gradient="linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))" />
              <StatCard title="Manageable Courses" value="5" icon={<BookOpen size={32} />} gradient="linear-gradient(135deg, hsl(var(--color-success)), #2ecc71)" />
              <StatCard title="Submissions to Grade" value="12" icon={<TrendingUp size={32} />} gradient="linear-gradient(135deg, #f39c12, #f1c40f)" />
            </>
          )}

        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '1rem', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Activity Charts / Activity tables will populate here in the final phase.</p>
      </div>
      
    </div>
  );
};

export default Dashboard;
