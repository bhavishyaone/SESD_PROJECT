import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Play, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const MyEnrollments: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const fetchEnrollments = async () => {
      try {
        const response = await api.get('/enrollments');
        let data = response.data.data;
        if (Array.isArray(data)) {
          const myEnrollments = data.filter((e: any) => e.studentId === user?._id || e.studentId?._id === user?._id);
          setEnrollments(myEnrollments);
        } else {
          setEnrollments([]);
        }
      } catch (error) {
        console.error("Failed to load enrollments", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'Student') {
      fetchEnrollments();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading) return <p>Loading enrollments...</p>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>My Enrollments</h1>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Track your active progress and jump directly into your current modules.</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
          <h3>No Active Enrollments</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>You haven't enrolled in any courses yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/courses')}>Browse Catalog</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {enrollments.map((enr) => (
            <div key={enr._id} className="hover-grow" style={{ background: 'hsla(var(--color-surface-hover), 0.5)', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 'var(--radius-lg)', border: '2px solid hsla(228, 85%, 63%, 0.4)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '1rem', background: enr.status === 'completed' ? 'hsla(var(--color-success), 0.1)' : 'hsla(var(--color-primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: enr.status === 'completed' ? 'hsl(var(--color-success))' : 'hsl(var(--color-primary))' }}>
                  {enr.status === 'completed' ? <CheckCircle size={28} /> : <BookOpen size={28} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem' }}>{enr.courseId?.title || `Course ID: ${enr.courseId}`}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>
                    <span>Enrolled: {new Date(enr.enrolledAt || enr.createdAt).toLocaleDateString()}</span>
                    <span>• Status: <span style={{ color: enr.status === 'completed' ? 'hsl(var(--color-success))' : 'hsl(var(--color-primary))', fontWeight: enr.status === 'completed' ? 'bold' : 'normal' }}>{enr.status === 'completed' ? 'Completed' : 'Active'} - {enr.progress}%</span></span>
                  </div>
                </div>
              </div>
              
              <button 
                className={enr.status === 'completed' ? "btn btn-outline" : "btn btn-primary"}
                style={enr.status === 'completed' ? { borderColor: 'hsl(var(--color-success))', color: 'hsl(var(--color-success))' } : {}}
                onClick={() => navigate(`/course/${enr.courseId?._id || enr.courseId}/play`)}
              >
                {enr.status === 'completed' ? <><CheckCircle size={18} /> Review Course</> : <><Play size={18} /> Resume Course</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;
