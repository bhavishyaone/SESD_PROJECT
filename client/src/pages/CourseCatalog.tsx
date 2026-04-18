import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, Tag } from 'lucide-react';
import api from '../api/axios';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  status: string;
}

const CourseCatalog: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingMap, setEnrollingMap] = useState<Record<string, boolean>>({});
  const [enrolledCourses, setEnrolledCourses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data.data);

        if (user?.role === 'Student') {
          const enrollRes = await api.get('/enrollments');
          const enrollMap: Record<string, boolean> = {};
          enrollRes.data.data.forEach((e: any) => {
            enrollMap[e.courseId] = true;
          });
          setEnrolledCourses(enrollMap);
        }
      } catch (error) {
        console.error("Failed to load courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    setEnrollingMap(prev => ({ ...prev, [courseId]: true }));
    try {
      await api.post('/enrollments', { courseId, studentId: user?._id });
      setEnrolledCourses(prev => ({ ...prev, [courseId]: true }));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrollingMap(prev => ({ ...prev, [courseId]: false }));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Course Catalog</h1>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Discover and enroll in upcoming state-of-the-art modules.</p>
      </div>

      {loading ? (
        <p>Loading catalog...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {courses.map((course) => (
            <div key={course._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '140px', background: 'linear-gradient(135deg, hsla(var(--color-primary), 0.2), hsla(var(--color-secondary), 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--color-primary))', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }}>
                <BookOpen size={48} />
              </div>
              
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{course.title}</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>
                  {course.description}
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={16} /> {course.duration} hrs
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Tag size={16} /> ${course.price}
                  </div>
                </div>

                {user?.role === 'Student' && (
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    disabled={enrolledCourses[course._id] || enrollingMap[course._id]}
                    onClick={() => handleEnroll(course._id)}
                  >
                    {enrolledCourses[course._id] ? 'Enrolled securely' : 
                      enrollingMap[course._id] ? 'Registering...' : 'Enroll Now'}
                  </button>
                )}
                
                {user?.role === 'Instructor' && (
                  <button className="btn btn-surface" style={{ width: '100%' }}>
                    Manage Course
                  </button>
                )}
              </div>
            </div>
          ))}

          {courses.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              No available courses mapped to the catalog yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
