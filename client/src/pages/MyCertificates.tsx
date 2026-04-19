import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Share2, Download } from 'lucide-react';
import api from '../api/axios';

const MyCertificates: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewCert, setViewCert] = useState<{ cert: any, mode: 'print' | 'view' } | null>(null);

  const handleAction = (cert: any, mode: 'print' | 'view') => {
    setViewCert({ cert, mode });
    if (mode === 'print') {
        setTimeout(() => {
          window.print();
          setViewCert(null);
        }, 200);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    const fetchCertificates = async () => {
      try {
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
  }, [user, authLoading]);

  if (loading) return <p>Loading certificates...</p>;

  return (
    <>
      {viewCert && (
        <div className="print-certificate-container" style={{ width: '100%', height: '100%', minHeight: '100vh', padding: '1.5rem', background: '#ffffff', color: '#000000', fontFamily: 'Georgia, serif', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', pageBreakInside: 'avoid' }}>
          
          {viewCert.mode === 'view' && (
             <button 
                onClick={() => setViewCert(null)} 
                className="btn btn-primary no-print" 
                style={{ position: 'absolute', top: '1rem', right: '1.5rem', zIndex: 100 }}
             >
                Close View
             </button>
          )}

          <div style={{ border: '12px double #1e3a8a', padding: '2.5rem', height: 'calc(100vh - 3rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
            <Award size={80} color="#1e3a8a" style={{ marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '2.5rem', color: '#1e3a8a', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Certificate of Completion</h1>
            <p style={{ fontSize: '1.25rem', color: '#4b5563', margin: '0 0 1.5rem 0' }}>This is to certify and acknowledge that</p>
            <h2 style={{ fontSize: '2rem', color: '#111827', margin: '0 0 1.5rem 0', borderBottom: '2px solid #d1d5db', paddingBottom: '0.5rem', display: 'inline-block', minWidth: '400px' }}>{user?.name}</h2>
            <p style={{ fontSize: '1.25rem', color: '#4b5563', margin: '0 0 1rem 0' }}>has successfully fulfilled the requirements and completed the course</p>
            <h3 style={{ fontSize: '1.75rem', color: '#1f2937', margin: '0 0 2rem 0', fontWeight: 'bold' }}>{viewCert.cert.courseId?.title || `Course ${viewCert.cert.courseId}`}</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '1rem', color: '#4b5563', margin: '0 0 0.25rem 0' }}><strong>Date of Issue:</strong> {new Date(viewCert.cert.issuedAt).toLocaleDateString()}</p>
                <p style={{ fontSize: '1rem', color: '#4b5563', margin: 0 }}><strong>Certificate ID:</strong> {viewCert.cert._id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1rem', color: '#4b5563', margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Academix Official Academy</p>
                <p style={{ fontSize: '1rem', color: '#4b5563', margin: 0 }}>Verified Issuer Signature</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: viewCert ? 'none' : 'block' }}>
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
                <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.875rem' }} onClick={() => handleAction(cert, 'view')}>
                  <Award size={16} /> Open Certificate 
                </button>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.875rem' }} onClick={() => handleAction(cert, 'print')}>
                  <Download size={16} /> Download PDF
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
};

export default MyCertificates;
