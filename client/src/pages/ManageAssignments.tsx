import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const ManageAssignments: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingMarks, setGradingMarks] = useState<Record<string, number>>({});
  const [gradingState, setGradingState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get('/assignments/submissions').catch(() => null);
        if (res && res.data.data) {
           setSubmissions(res.data.data);
        } else {
           setSubmissions([]);
        }
      } catch (error) {
        console.error("Failed to load submissions", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'Instructor') {
      fetchSubmissions();
    }
  }, [user]);

  const handleGrade = async (submissionId: string) => {
    const marks = gradingMarks[submissionId] || 0;
    setGradingState(prev => ({ ...prev, [submissionId]: true }));
    try {
      await api.post(`/assignments/grade`, {
        submissionId,
        marks,
        type: 'percentage'
      });
      setSubmissions(prev => prev.map(sub => sub._id === submissionId ? { ...sub, status: 'graded', marks } : sub));
    } catch (err) {
      alert('Failed to evaluate grade.');
    } finally {
      setGradingState(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  if (user?.role === 'Student') return <div className="p-8">Unauthorized</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Submissions Dashboard</h1>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Evaluate and grade pending learner uploads for your modules.</p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'hsla(var(--color-surface), 0.5)', borderBottom: '1px solid hsl(var(--color-border))' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Student Reference</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Assignment Data</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>File Resource</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'hsl(var(--text-secondary))', fontSize: '0.875rem', textAlign: 'right' }}>Evaluation</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Syncing datagrid...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                <ClipboardList size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                No pending assignment submissions detected.
              </td></tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub._id} style={{ borderBottom: '1px solid hsla(var(--color-border), 0.5)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{sub.studentId?.name || sub.studentId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>ID: {sub.studentId?._id || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    {sub.assignmentId?.title || sub.assignmentId}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <a href={sub.content} target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--color-primary))', fontSize: '0.875rem', textDecoration: 'none' }}>
                      View Project Resource
                    </a>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 500,
                      background: sub.status === 'graded' ? 'hsla(var(--color-success), 0.1)' : 'hsla(var(--color-primary), 0.1)',
                      color: sub.status === 'graded' ? 'hsl(var(--color-success))' : 'hsl(var(--color-primary))'
                    }}>
                      {sub.status === 'graded' ? 'Graded' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {sub.status === 'graded' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', color: 'hsl(var(--color-success))', fontWeight: 500 }}>
                        <CheckCircle size={16} /> {sub.marks} / {sub.assignmentId?.maxMarks || 100}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <input 
                          type="number" 
                          placeholder="0"
                          min="0"
                          max={sub.assignmentId?.maxMarks || 100}
                          className="input-base"
                          style={{ width: '80px', padding: '0.5rem' }}
                          value={gradingMarks[sub._id] || ''}
                          onChange={(e) => setGradingMarks(prev => ({ ...prev, [sub._id]: Number(e.target.value) }))}
                        />
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.5rem 1rem' }}
                          disabled={gradingState[sub._id]}
                          onClick={() => handleGrade(sub._id)}
                        >
                          {gradingState[sub._id] ? '...' : 'Issue'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ManageAssignments;
