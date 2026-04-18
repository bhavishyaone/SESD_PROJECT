import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Share2, Download } from 'lucide-react';
import api from '../api/axios';

const MyCertificates: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await api.get('/certificates/generate').catch(() => null); 
        if (!res) {
            setCertificates([]); 
        }
        const response = await api.get('/certificates').catch(() => null);
        if (response && response.data.data) {
           const studentCerts = response.data.data.filter((c: any) => c.studentId === user?._id || c.studentId?._id === user?._id);
           setCertificates(studentCerts);
        }
      } catch (error) {
        console.error("Failed to load certificates", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'Student') {
      fetchCertificates();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <p>Loading certificates...</p>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>My Certificates</h1>
        <p style={{ color: 'hsl(var(--text-muted))' }}>View and share your successfully earned course certificates.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
          <Award size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>No Certificates Earned Yet</h3>
          <p style={{ marginTop: '0.5rem' }}>Complete a course and submit the final assignment to unlock your first certificate.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {certificates.map((cert) => (
            <div key={cert._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))' }} />
              
              <div style={{ padding: '2rem', flex: 1, textAlign: 'center', borderBottom: '1px dashed hsla(var(--color-border), 0.5)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsla(var(--color-success), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--color-success))', margin: '0 auto 1.5rem auto' }}>
                  <Award size={40} />
                </div>
                <h4 style={{ color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Certificate of Completion</h4>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', lineHeight: 1.3 }}>
                   {cert.courseId?.title || `Course ${cert.courseId}`}
                </h2>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>
                  Awarded to <strong style={{ color: 'hsl(var(--text-primary))' }}>{user?.name}</strong>
                </p>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  ID: {cert._id.substring(0, 8).toUpperCase()} • {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
              </div>

              <div style={{ padding: '1rem', display: 'flex', gap: '0.5rem', background: 'hsla(var(--color-surface), 0.3)' }}>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.875rem' }}>
                  <Download size={16} /> Download PDF
                </button>
                <button className="btn btn-surface" style={{ flex: 1, fontSize: '0.875rem' }}>
                  <Share2 size={16} /> Share
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
