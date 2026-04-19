import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Users, BookOpen, CheckCircle, Award, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const ManageAssignments: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [courseStats, setCourseStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const fetchStats = async () => {
      try {
        const res = await api.get('/courses/instructor/dashboard-stats').catch(() => null);
        if (res?.data?.data) {
          setCourseStats(res.data.data);
          if (res.data.data.length > 0) setExpandedCourse(res.data.data[0].courseId);
        }
      } catch (error) {
        console.error('Failed to load assignment stats', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'Instructor') fetchStats();
    else setLoading(false);
  }, [user, authLoading]);

  if (user?.role === 'Student') return <div className="p-8">Unauthorized</div>;

  const totalAssignments = courseStats.reduce((sum, c) => sum + c.assignments.length, 0);
  const totalSubmitted = courseStats.reduce((sum, c) => sum + c.assignments.reduce((s: number, a: any) => s + a.totalSubmitted, 0), 0);
  const totalPassed = courseStats.reduce((sum, c) => sum + c.assignments.reduce((s: number, a: any) => s + a.totalCorrect, 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div>
        <h1 style={{ marginBottom: '0.5rem' }}>Manage Assignments</h1>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Track per-course enrollment, lecture progress, and assignment completion rates.</p>
      </div>

            {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Courses', value: courseStats.length, icon: <BookOpen size={20} />, color: 'hsl(var(--color-primary))' },
            { label: 'Total Assignments', value: totalAssignments, icon: <ClipboardList size={20} />, color: '#f39c12' },
            { label: 'Total Submitted', value: totalSubmitted, icon: <Users size={20} />, color: 'hsl(var(--color-secondary))' },
            { label: 'Total Passed', value: totalPassed, icon: <Award size={20} />, color: 'hsl(var(--color-success))' },
          ].map((s) => (
            <div key={s.label} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: `${s.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{s.label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

            {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>Loading assignment data...</div>
      ) : courseStats.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
          <ClipboardList size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
          <h3>No courses or assignments yet.</h3>
          <p style={{ marginTop: '0.5rem' }}>Create a course and add assignments to start tracking student progress.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {courseStats.map((course) => {
            const isExpanded = expandedCourse === course.courseId;
            const courseCompletionPct = course.totalEnrolled > 0
              ? Math.round((course.totalCourseCompleted / course.totalEnrolled) * 100)
              : 0;

            return (
              <div key={course.courseId} className="glass-panel" style={{ overflow: 'hidden' }}>

                                <div
                  onClick={() => setExpandedCourse(isExpanded ? null : course.courseId)}
                  style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsla(var(--color-surface), 0.3)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', margin: 0 }}>{course.courseTitle}</h3>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '1rem', background: course.courseStatus === 'published' ? 'hsla(var(--color-success), 0.15)' : 'hsla(40, 90%, 50%, 0.15)', color: course.courseStatus === 'published' ? 'hsl(var(--color-success))' : '#f39c12' }}>
                          {course.courseStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={14} /> {course.totalEnrolled} enrolled</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckCircle size={14} /> {course.totalCourseCompleted} completed course</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><BookOpen size={14} /> {course.totalLectureCompletions} lecture completions</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><ClipboardList size={14} /> {course.assignments.length} assignments</span>
                  </div>
                </div>

                                {isExpanded && (
                  <div style={{ padding: '1.5rem' }}>

                                        <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '0.35rem' }}>
                        <span>Overall Course Completion Rate</span>
                        <span>{courseCompletionPct}%  ({course.totalCourseCompleted} / {course.totalEnrolled} students)</span>
                      </div>
                      <div style={{ height: '8px', background: 'hsla(var(--color-border), 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${courseCompletionPct}%`, background: courseCompletionPct === 100 ? 'hsl(var(--color-success))' : 'hsl(var(--color-primary))', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>

                                        {course.assignments.length === 0 ? (
                      <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>No assignments created for this course yet.</p>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid hsl(var(--color-border))' }}>
                              {['Assignment Title', 'Max Marks', 'Enrolled', 'Submitted', 'Passed (≥50%)', 'Pass Rate'].map(h => (
                                <th key={h} style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'hsl(var(--text-secondary))', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {course.assignments.map((asgn: any) => {
                              const passRate = asgn.totalSubmitted > 0
                                ? Math.round((asgn.totalCorrect / asgn.totalSubmitted) * 100)
                                : 0;
                              const submissionRate = course.totalEnrolled > 0
                                ? Math.round((asgn.totalSubmitted / course.totalEnrolled) * 100)
                                : 0;
                              return (
                                <tr key={asgn.assignmentId} style={{ borderBottom: '1px solid hsla(var(--color-border), 0.4)' }}>
                                  <td style={{ padding: '0.875rem 1rem', fontWeight: 500 }}>{asgn.assignmentTitle}</td>
                                  <td style={{ padding: '0.875rem 1rem', color: 'hsl(var(--text-muted))' }}>{asgn.maxMarks}</td>
                                  <td style={{ padding: '0.875rem 1rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={14} color="hsl(var(--text-muted))" /> {course.totalEnrolled}</span>
                                  </td>
                                  <td style={{ padding: '0.875rem 1rem' }}>
                                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', background: 'hsla(var(--color-primary), 0.1)', color: 'hsl(var(--color-primary))' }}>
                                      {asgn.totalSubmitted} <span style={{ opacity: 0.7 }}>({submissionRate}%)</span>
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.875rem 1rem' }}>
                                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', background: 'hsla(var(--color-success), 0.1)', color: 'hsl(var(--color-success))' }}>
                                      ✓ {asgn.totalCorrect}
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.875rem 1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: passRate >= 60 ? 'hsl(var(--color-success))' : passRate >= 30 ? '#f39c12' : '#ef4444' }}>{passRate}%</span>
                                      <div style={{ width: '80px', height: '4px', background: 'hsla(var(--color-border), 0.5)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${passRate}%`, background: passRate >= 60 ? 'hsl(var(--color-success))' : passRate >= 30 ? '#f39c12' : '#ef4444' }} />
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageAssignments;
