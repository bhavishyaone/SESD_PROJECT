import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle, TrendingUp, Users, ArrowRight, Trash2, ClipboardList, Award, AlertTriangle, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ enrollments: 0, completed: 0, activeAssignments: 0 });
  const [activeCoursesList, setActiveCoursesList] = useState<any[]>([]);
  const [certificatesList, setCertificatesList] = useState<any[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (authLoading) return;
    try {
      if (user?.role === 'Student') {
        const response = await api.get('/enrollments').catch(() => null);
        const certResponse = await api.get('/certificates').catch(() => null);
        const enrolls = response?.data?.data || [];
        const certs = certResponse?.data?.data || [];
        const activeEnrolls = enrolls.filter((e: any) => e.progress < 100);
        setActiveCoursesList(activeEnrolls);
        setCertificatesList(certs.filter((c: any) => c.studentId?._id === user._id || c.studentId === user._id));
        setStats({
          enrollments: enrolls.length,
          completed: enrolls.filter((e: any) => e.progress === 100).length,
          activeAssignments: activeEnrolls.length,
        });
      } else if (user?.role === 'Instructor') {
        const statsRes = await api.get('/courses/instructor/dashboard-stats').catch(() => null);
        const courseData: any[] = statsRes?.data?.data || [];
        setInstructorCourses(courseData);
        const totalEnrolled = courseData.reduce((sum, c) => sum + c.totalEnrolled, 0);
        const totalCompleted = courseData.reduce((sum, c) => sum + c.totalCourseCompleted, 0);
        const totalAssignments = courseData.reduce((sum, c) => sum + c.assignments.length, 0);
        setStats({ enrollments: totalEnrolled, completed: totalCompleted, activeAssignments: totalAssignments });
      }
    } catch (error) {
      console.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const handleDeleteCourse = async (courseId: string) => {
    setDeletingId(courseId);
    try {
      await api.delete(`/courses/${courseId}`);
      setInstructorCourses(prev => prev.filter(c => c.courseId !== courseId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeletingId(null);
    }
  };

  const StatCard = ({ title, value, icon, gradient }: any) => (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '1rem', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
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

            {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '420px', width: '90%', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Delete Course?</h2>
            <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '1.5rem' }}>
              Permanently delete <strong>"{confirmDelete.title}"</strong>? This will also remove all modules, lessons, and assignments. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn"
                style={{ background: '#ef4444', color: 'white' }}
                onClick={() => handleDeleteCourse(confirmDelete.id)}
                disabled={!!deletingId}
              >
                {deletingId === confirmDelete.id ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Overview</h1>
          <p style={{ color: 'hsl(var(--text-muted))' }}>
            {user?.role === 'Instructor'
              ? 'Manage your courses, track student performance and analytics.'
              : 'Track your active academic standing and performance.'}
          </p>
        </div>
        {user?.role === 'Instructor' && (
          <button className="btn btn-primary" onClick={() => window.location.href = '/courses/new'}>
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
              <StatCard title="Total Students Enrolled" value={stats.enrollments} icon={<Users size={32} />} gradient="linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))" />
              <StatCard title="Course Completions" value={stats.completed} icon={<Award size={32} />} gradient="linear-gradient(135deg, hsl(var(--color-success)), #2ecc71)" />
              <StatCard title="Total Assignments" value={stats.activeAssignments} icon={<ClipboardList size={32} />} gradient="linear-gradient(135deg, #f39c12, #f1c40f)" />
            </>
          )}
        </div>
      )}

            {user?.role === 'Student' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="hsl(var(--color-primary))" /> Active Courses
            </h3>
            {activeCoursesList.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>No active courses.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeCoursesList.map((enr, i) => {
                  const courseId = enr.courseId?._id || enr.courseId;
                  return (
                    <li key={i} onClick={() => navigate(`/course/${courseId}/play`)} className="glass-card hover-grow"
                      style={{ background: 'hsla(var(--color-surface), 0.5)', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid hsla(var(--color-primary), 0.3)', borderLeft: '4px solid hsl(var(--color-primary))', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{enr.courseId?.title || `Course ${enr.courseId}`}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Progress: {enr.progress}%</p>
                      </div>
                      <ArrowRight size={16} color="hsl(var(--text-muted))" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} color="hsl(var(--color-success))" /> Earned Certificates
            </h3>
            {certificatesList.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>No certificates earned yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {certificatesList.map((cert, i) => (
                  <li key={i} onClick={() => navigate('/certificates')} className="glass-card hover-grow"
                    style={{ background: 'hsla(var(--color-surface), 0.5)', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid hsla(var(--color-success), 0.3)', borderLeft: '4px solid hsl(var(--color-success))', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{cert.courseId?.title || `Course ${cert.courseId}`}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                    </div>
                    <ArrowRight size={16} color="hsl(var(--text-muted))" />
                  </li>
                ))}
              </ul>
            )}
          </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#f39c12" /> Pending Assignments
            </h3>
            {activeCoursesList.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>No pending coursework.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeCoursesList.map((enr, i) => {
                  const courseId = enr.courseId?._id || enr.courseId;
                  return (
                    <li key={i} onClick={() => navigate(`/course/${courseId}/play`)} className="glass-card hover-grow"
                      style={{ background: 'hsla(var(--color-surface), 0.5)', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid hsla(40, 90%, 50%, 0.3)', borderLeft: '4px solid #f39c12', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Complete Coursework for:</h4>
                        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>{enr.courseId?.title}</p>
                      </div>
                      <ArrowRight size={16} color="hsl(var(--text-muted))" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

        </div>
      )}

            {user?.role === 'Instructor' && !loading && (
        <div style={{ marginTop: '1rem' }}>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>Your Courses</h2>
          {instructorCourses.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              <BookOpen size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
              <h3>No courses yet</h3>
              <p style={{ marginTop: '0.5rem' }}>Create your first course to start tracking student analytics.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
              {instructorCourses.map((course) => {
                const completionPct = course.totalEnrolled > 0
                  ? Math.round((course.totalCourseCompleted / course.totalEnrolled) * 100)
                  : 0;
                return (
                  <div key={course.courseId} className="glass-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: course.courseStatus === 'published' ? 'linear-gradient(90deg, hsl(var(--color-success)), #2ecc71)' : 'linear-gradient(90deg, #f39c12, #f1c40f)' }} />

                    <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ flex: 1, marginRight: '1rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: course.courseStatus === 'published' ? 'hsla(var(--color-success), 0.15)' : 'hsla(40, 90%, 50%, 0.15)', color: course.courseStatus === 'published' ? 'hsl(var(--color-success))' : '#f39c12', marginBottom: '0.5rem', display: 'inline-block' }}>
                            {course.courseStatus}
                          </span>
                          <h3 style={{ fontSize: '1.1rem', lineHeight: 1.3 }}>{course.courseTitle}</h3>
                        </div>
                        <button
                          onClick={() => setConfirmDelete({ id: course.courseId, title: course.courseTitle })}
                          style={{ background: 'hsla(0, 84%, 60%, 0.1)', border: '1px solid hsla(0, 84%, 60%, 0.25)', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                          title="Delete Course"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        {[
                          { label: 'Students Enrolled', value: course.totalEnrolled, icon: <Users size={14} /> },
                          { label: 'Course Completions', value: course.totalCourseCompleted, icon: <CheckCircle size={14} /> },
                          { label: 'Videos Watched', value: course.totalVideoWatched || 0, icon: <PlayCircle size={14} /> },
                          { label: 'Notes DLs', value: course.totalNotesDownloaded || 0, icon: <FileText size={14} /> },
                          { label: 'Lesson Completions', value: course.totalLectureCompletions, icon: <BookOpen size={14} /> },
                          { label: 'Quiz Drafts', value: course.totalQuizAttempted || 0, icon: <HelpCircle size={14} /> },
                        ].map((stat) => (
                          <div key={stat.label} style={{ background: 'hsla(var(--color-surface), 0.5)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid hsla(var(--color-border), 0.5)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'hsl(var(--text-muted))', fontSize: '0.7rem', marginBottom: '0.25rem' }}>{stat.icon} {stat.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                          </div>
                        ))}
                      </div>

                                            <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '0.35rem' }}>
                          <span>Overall Completion</span>
                          <span>{completionPct}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'hsla(var(--color-border), 0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${completionPct}%`, background: completionPct === 100 ? 'hsl(var(--color-success))' : 'hsl(var(--color-primary))', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    </div>

                                        {course.assignments.length > 0 && (
                      <div style={{ borderTop: '1px solid hsla(var(--color-border), 0.5)', padding: '1rem 1.5rem' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Assignments</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {course.assignments.map((asgn: any) => (
                            <div key={asgn.assignmentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsla(var(--color-surface), 0.4)', padding: '0.6rem 0.75rem', borderRadius: '0.4rem' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 500, flex: 1, marginRight: '0.5rem' }}>{asgn.assignmentTitle}</span>
                              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap' }}>
                                <span>{asgn.totalSubmitted} submitted</span>
                                <span style={{ color: 'hsl(var(--color-success))' }}>✓ {asgn.totalCorrect} passed</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Dashboard;
