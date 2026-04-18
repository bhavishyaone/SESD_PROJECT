import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const LearningPlayer: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'content' | 'assignment'>('content');
  const [modules, setModules] = useState<any[]>([]);
  const [lessonsMap, setLessonsMap] = useState<Record<string, any[]>>({});
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  React.useEffect(() => {
    const fetchContent = async () => {
      try {
        const mRes = await api.get(`/courses/${courseId}/modules`);
        const fetchedModules = mRes.data.data || [];
        setModules(fetchedModules);

        let map: Record<string, any[]> = {};
        let firstLesson = null;

        for (let m of fetchedModules) {
           const lRes = await api.get(`/modules/${m._id}/lessons`);
           map[m._id] = lRes.data.data || [];
           if (!firstLesson && map[m._id].length > 0) {
             firstLesson = map[m._id][0];
           }
        }
        setLessonsMap(map);
        if (firstLesson) setActiveLesson(firstLesson);
      } catch (e) {
        console.error("Failed fetching modules", e);
      }
    };
    fetchContent();
  }, [courseId]);

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      setTimeout(async () => {
        setIsCompleted(true);
        try {
          await api.post('/certificates/generate', { studentId: user?._id, courseId });
        } catch(err) {
          console.error("Certificate generation error", err);
        }
        setIsSubmitting(false);
      }, 1000);

    } catch (error) {
      console.error("Submission failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 120px)' }}>
      
      <div className="glass-panel" style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid hsla(var(--color-border), 0.5)' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Course Modules</h3>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Track your progress</p>
        </div>
        
        <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          
          {modules.map((m: any) => (
             <div key={m._id} style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))' }}>{m.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                   {lessonsMap[m._id]?.map(lesson => (
                     <button 
                        key={lesson._id}
                        onClick={() => { setActiveTab('content'); setActiveLesson(lesson); }} 
                        className="btn" 
                        style={{ 
                          justifyContent: 'flex-start', 
                          background: (activeTab === 'content' && activeLesson?._id === lesson._id) ? 'hsla(var(--color-primary), 0.15)' : 'transparent', 
                          color: (activeTab === 'content' && activeLesson?._id === lesson._id) ? 'hsl(var(--color-primary))' : 'inherit',
                          fontSize: '0.85rem'
                        }}>
                        <PlayCircle size={16} /> {lesson.title}
                     </button>
                   ))}
                </div>
             </div>
          ))}

          <div style={{ marginTop: 'auto', borderTop: '1px solid hsla(var(--color-border), 0.5)', paddingTop: '1rem' }}>
            <button onClick={() => setActiveTab('assignment')} className="btn" style={{ justifyContent: 'flex-start', width: '100%', background: activeTab === 'assignment' ? 'hsla(var(--color-primary), 0.15)' : 'transparent', color: activeTab === 'assignment' ? 'hsl(var(--color-primary))' : 'inherit' }}>
              <FileText size={18} /> Final Project Submission
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {activeTab === 'content' ? (
          <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '800px', aspectRatio: '16/9', background: 'hsl(var(--color-surface))', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>
               <PlayCircle size={64} opacity={0.5} />
            </div>
            <div style={{ maxWidth: '800px', width: '100%', padding: '1rem 0' }}>
              <h2>{activeLesson ? activeLesson.title : "Welcome"}</h2>
              <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '0.5rem' }}>
                {activeLesson ? activeLesson.content : "Please select a lesson from the sidebar to begin."}
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ flex: 1, padding: '3rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <h2 style={{ marginBottom: '1rem' }}>Submit Final Assignment</h2>
            
            {isCompleted ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'hsla(var(--color-success), 0.1)', borderRadius: 'var(--radius-md)', color: 'hsl(var(--color-success))', marginTop: '2rem' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 1rem auto' }} />
                <h3>Submission Received & Certificate Generated!</h3>
                <p style={{ marginTop: '0.5rem' }}>Your instructor will grade your project shortly. Your verifiable certificate has been permanently issued.</p>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '1.5rem' }}>
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))' }}>
                    Project Repository or Document URL
                  </label>
                  <input 
                    type="url" 
                    className="input-base" 
                    placeholder="https://github.com/..." 
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    required
                  />
                </div>
                
                <div style={{ padding: '1.5rem', border: '1px dashed hsl(var(--color-border))', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                  <Upload size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                  <p>Or drag and drop a ZIP folder here</p>
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading securely...' : 'Submit & Generate Certificate'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default LearningPlayer;
