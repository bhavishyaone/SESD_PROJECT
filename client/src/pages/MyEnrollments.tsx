import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Play } from 'lucide-react';
import api from '../api/axios';

const MyEnrollments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await api.get('/enrollments');
        // Simple map simulation: depending on precise backend mapping, 
        // backend should theoretically return enrollments specific to student based on JWT if mounted properly, 
        // or we filter them based on the student payload.
        let data = response.data.data;
        if (Array.isArray(data)) {
          // If the backend returns all, filter locally. Otherwise it's already filtered.
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
  }, [user]);

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
            <div key={enr._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '1rem', background: 'hsla(var(--color-primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--color-primary))' }}>
                  <BookOpen size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem' }}>{enr.courseId?.title || `Course ID: ${enr.courseId}`}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>
                    <span>Enrolled: {new Date(enr.enrolledAt || enr.createdAt).toLocaleDateString()}</span>
                    <span>• Status: <span style={{ color: enr.status === 'active' ? 'hsl(var(--color-success))' : 'hsl(var(--text-muted))' }}>{enr.status}</span></span>
                  </div>
                </div>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/course/${enr.courseId?._id || enr.courseId}/play`)}
              >
                <Play size={18} /> Resume Course
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;
