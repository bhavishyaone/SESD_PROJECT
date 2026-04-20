import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle, HelpCircle } from 'lucide-react';
import api from '../api/axios';

const API_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
  : 'http://localhost:5000';

const LearningPlayer: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const [modules, setModules] = useState<any[]>([]);
  const [lessonsMap, setLessonsMap] = useState<Record<string, any[]>>({});
  
  const [activeModule, setActiveModule] = useState<any>(null);
  
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'lecture' | 'notes' | 'assignment'>('lecture');
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<{marks: number, maxMarks: number} | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const mRes = await api.get(`/courses/${courseId}/modules`);
        const fetchedModules = mRes.data.data || [];
        setModules(fetchedModules);

        let map: Record<string, any[]> = {};

        for (let m of fetchedModules) {
           const lRes = await api.get(`/courses/modules/${m._id}/lessons`);
           map[m._id] = lRes.data.data || [];
        }
        setLessonsMap(map);

        const eRes = await api.get('/enrollments');
        const currentEnrollment = eRes.data.data?.find((e: any) => String(e.courseId?._id || e.courseId) === String(courseId));
        setEnrollment(currentEnrollment);
      } catch (e) {
        console.error("Failed fetching modules or enrollment", e);
      }
    };
    fetchContent();
  }, [courseId]);

  const handleSelectLesson = async (lesson: any) => {
      setActiveLesson(lesson);
      setActiveSubTab('lecture');
      setActiveQuiz(null);
      setQuizAnswers([]);
      setQuizResult(null);

      try {
         const qRes = await api.get(`/assignments/lesson/${lesson._id}`);
         if (qRes.data && qRes.data.data) {
             const quiz = qRes.data.data;
             setActiveQuiz(quiz);
             setQuizAnswers(new Array(quiz.questions.length).fill(-1));
         }
      } catch(err) {
         console.warn("No quiz or error fetching quiz", err);
      }
  };

  const updateProgressTracking = async (actionType: 'video' | 'notes' | 'quiz') => {
      if (!activeLesson) return;
      try {
          const res = await api.post(`/enrollments/course/${courseId}/progress`, {
              lessonId: activeLesson._id,
              actionType
          });
          setEnrollment(res.data.data);
      } catch (err) {
          console.error("Failed tracking internal progress", err);
      }
  };

  // Proxy download: the backend streams the Cloudinary file server-to-server
  // (no CORS) with Content-Disposition: attachment, so the browser always
  // saves the file locally — no new tab, no 401 errors.
  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadNotes = useCallback(async (notesUrl: string) => {
    setIsDownloading(true);
    try {
      // Call our backend proxy — it fetches Cloudinary server-side and streams
      // the file back with the correct download headers.
      const response = await api.get('/upload/download', {
        params: { url: notesUrl },
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const blobUrl = URL.createObjectURL(blob);

      // Derive filename from the original URL
      const parts = notesUrl.split('/');
      const filename = parts[parts.length - 1]?.split('?')[0] || 'lecture-notes.pdf';

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      await updateProgressTracking('notes');
    } catch (err) {
      console.error('Download failed:', err);
      alert('Could not download the file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLesson, courseId]);

  const isLessonCompleted = (lessonId: string) => {
      if (!enrollment || !enrollment.progressTracking) return false;
      const track = enrollment.progressTracking.find((t: any) => String(t.lessonId) === String(lessonId));
      return track ? track.isCompleted : false;
  };

  const isModuleCompleted = (module: any) => {
      const lessons = lessonsMap[module._id] || [];
      if (lessons.length === 0) return false;
      return lessons.every(l => isLessonCompleted(l._id));
  };

  const submitQuiz = async () => {
      if (quizAnswers.includes(-1)) return alert("Please answer all questions before submitting.");
      
      setIsSubmitting(true);
      try {
          const res = await api.post('/assignments/submit', {
              assignmentId: activeQuiz._id,
              answers: quizAnswers
          });
          setQuizResult({ marks: res.data.data.marks, maxMarks: activeQuiz.maxMarks });
          
          await api.post(`/courses/modules/${activeLesson.moduleId}/lessons/${activeLesson._id}/progress`, {
              completed: true
          }).catch(() => null);
          
          await updateProgressTracking('quiz');

      } catch(err) {
          alert("Failed to submit quiz.");
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', height: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: '1rem', paddingBottom: '4rem' }}>
        
                {!activeModule && (
            <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                       <h2 style={{ fontSize: '2rem', margin: 0 }}>Learning Player</h2>
                       {enrollment?.status === 'completed' && (
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--color-success))', background: 'hsla(var(--color-success), 0.1)', padding: '0.25rem 1rem', borderRadius: '2rem', fontWeight: 'bold' }}>
                               <CheckCircle size={20} /> Course Completed
                           </div>
                       )}
                   </div>
                   <div style={{ textAlign: 'right' }}>
                       <p style={{ color: 'hsl(var(--text-muted))', margin: 0 }}>Select a module below to begin.</p>
                       {enrollment && enrollment.progress > 0 && enrollment.status !== 'completed' && (
                           <p style={{ color: 'hsl(var(--color-primary))', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>Progress: {enrollment.progress}%</p>
                       )}
                   </div>
                </div>
                
                {modules.map((m: any) => (
                     <div onClick={() => setActiveModule(m)} key={m._id} className="hover-grow" style={{ background: 'hsla(var(--color-surface-hover), 0.5)', width: '100%', padding: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: 'var(--radius-lg)', border: '2px solid hsla(228, 85%, 63%, 0.4)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                         <h3 style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>
                             Module: {m.title}
                             {isModuleCompleted(m) && <CheckCircle size={28} color="hsl(var(--color-success))" />}
                         </h3>
                         <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'hsl(var(--color-primary))' }}>View Lessons ▶</span>
                     </div>
                ))}
            </>
        )}

                {activeModule && !activeLesson && (
            <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                   <button className="btn btn-outline" onClick={() => setActiveModule(null)}>← Back to Modules</button>
                   <h2 style={{ fontSize: '1.75rem', margin: 0 }}>{activeModule.title}</h2>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {lessonsMap[activeModule._id]?.map(lesson => (
                         <div onClick={() => handleSelectLesson(lesson)} key={lesson._id} className="hover-grow" style={{ background: 'hsla(var(--color-surface-hover), 0.5)', width: '100%', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderRadius: 'var(--radius-lg)', border: '2px solid hsla(228, 85%, 63%, 0.4)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                             <h4 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
                                 <PlayCircle size={24} color="hsl(var(--color-primary))" /> Lesson: {lesson.title}
                                 {isLessonCompleted(lesson._id) && <CheckCircle size={24} color="hsl(var(--color-success))" style={{ marginLeft: '1rem' }} />}
                             </h4>
                             <span style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--color-primary))' }}>Start Learning ▶</span>
                         </div>
                    ))}
                    {(!lessonsMap[activeModule._id] || lessonsMap[activeModule._id].length === 0) && (
                         <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                             <p style={{ fontSize: '1.1rem' }}>No lessons available in this module yet.</p>
                         </div>
                    )}
                </div>
            </>
        )}

                {activeModule && activeLesson && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                   <button className="btn btn-outline" onClick={() => setActiveLesson(null)}>← Back to Lessons</button>
                   <div>
                       <p style={{ margin: 0, fontSize: '0.95rem', color: 'hsl(var(--color-primary))', fontWeight: 600 }}>{activeModule.title}</p>
                       <h2 style={{ fontSize: '2rem', margin: 0 }}>{activeLesson.title}</h2>
                   </div>
                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1rem' }}>
                    <div className="glass-panel" onClick={() => setActiveSubTab('lecture')} style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', borderRadius: 'var(--radius-md)', border: activeSubTab === 'lecture' ? '2px solid hsl(var(--color-primary))' : '1px solid hsla(var(--color-border), 0.5)', background: activeSubTab === 'lecture' ? 'hsla(var(--color-primary), 0.1)' : 'transparent', transition: 'all 0.2s ease', position: 'relative' }}>
                        <PlayCircle size={36} color="hsl(var(--color-primary))" style={{ margin: '0 auto 1rem auto' }} />
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Lecture Video {enrollment?.progressTracking?.find((t: any) => String(t.lessonId) === String(activeLesson._id))?.videoWatched && <CheckCircle size={20} color="hsl(var(--color-success))" />}</h3>
                    </div>
                    <div className="glass-panel" onClick={() => setActiveSubTab('notes')} style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', borderRadius: 'var(--radius-md)', border: activeSubTab === 'notes' ? '2px solid hsl(var(--color-primary))' : '1px solid hsla(var(--color-border), 0.5)', background: activeSubTab === 'notes' ? 'hsla(var(--color-primary), 0.1)' : 'transparent', transition: 'all 0.2s ease', position: 'relative' }}>
                        <FileText size={36} color="hsl(var(--color-primary))" style={{ margin: '0 auto 1rem auto' }} />
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Lecture Notes {enrollment?.progressTracking?.find((t: any) => String(t.lessonId) === String(activeLesson._id))?.notesDownloaded && <CheckCircle size={20} color="hsl(var(--color-success))" />}</h3>
                    </div>
                    <div className="glass-panel" onClick={() => setActiveSubTab('assignment')} style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', borderRadius: 'var(--radius-md)', border: activeSubTab === 'assignment' ? '2px solid hsl(var(--color-primary))' : '1px solid hsla(var(--color-border), 0.5)', background: activeSubTab === 'assignment' ? 'hsla(var(--color-primary), 0.1)' : 'transparent', transition: 'all 0.2s ease', position: 'relative' }}>
                        <HelpCircle size={36} color="hsl(var(--color-primary))" style={{ margin: '0 auto 1rem auto' }} />
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Assignment {enrollment?.progressTracking?.find((t: any) => String(t.lessonId) === String(activeLesson._id))?.quizAttempted && <CheckCircle size={20} color="hsl(var(--color-success))" />}</h3>
                    </div>
                </div>

                                <div style={{ border: '1px solid hsla(var(--color-border), 0.5)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: '400px' }}>
                    
                                        {activeSubTab === 'lecture' && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {activeLesson.videoUrl ? (
                                <video 
                                    controls 
                                    src={activeLesson.videoUrl.startsWith('http') ? activeLesson.videoUrl : `${API_BASE}${activeLesson.videoUrl.startsWith('/') ? '' : '/'}${activeLesson.videoUrl}`} 
                                    style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}
                                    onEnded={() => updateProgressTracking('video')}
                                />
                            ) : (
                                <div style={{ width: '100%', padding: '6rem', background: 'hsl(var(--color-surface))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <PlayCircle size={64} opacity={0.5} style={{ margin: '0 auto 1.5rem auto' }} />
                                        <p style={{ fontSize: '1.25rem' }}>No video available for this lecture.</p>
                                    </div>
                                </div>
                            )}
                            <div style={{ padding: '2.5rem' }}>
                                <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.8', fontSize: '1.15rem' }}>
                                    {activeLesson.content || "Watch the video lecture to understand the concepts."}
                                </p>
                            </div>
                        </div>
                    )}

                                        {activeSubTab === 'notes' && (() => {
                        if (!activeLesson.notesUrl) {
                            return (
                                <div style={{ padding: '8rem 2rem', textAlign: 'center', background: 'hsl(var(--color-surface))' }}>
                                    <FileText size={64} style={{ opacity: 0.3, margin: '0 auto 1.5rem auto' }} />
                                    <p style={{ color: 'hsl(var(--color-danger))', fontSize: '1.1rem' }}>No documents attached to this lesson yet.</p>
                                </div>
                            );
                        }

                        const rawNotesUrl = activeLesson.notesUrl.startsWith('http')
                            ? activeLesson.notesUrl
                            : `${API_BASE}${activeLesson.notesUrl.startsWith('/') ? '' : '/'}${activeLesson.notesUrl}`;

                        // Google Docs Viewer renders the PDF on Google's servers —
                        // no CORS, no 401, works for any publicly reachable URL.
                        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawNotesUrl)}&embedded=true`;

                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                {/* Toolbar */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid hsla(var(--color-border), 0.4)', background: 'hsl(var(--color-surface))' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <FileText size={22} color="hsl(var(--color-primary))" />
                                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>Lecture Notes</span>
                                    </div>
                                    <button
                                        onClick={() => handleDownloadNotes(rawNotesUrl)}
                                        disabled={isDownloading}
                                        className="btn btn-primary"
                                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: isDownloading ? 'wait' : 'pointer' }}
                                    >
                                        <FileText size={16} />
                                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                                    </button>
                                </div>

                                {/* PDF Viewer */}
                                <iframe
                                    src={viewerUrl}
                                    title="Lecture Notes"
                                    style={{ flex: 1, width: '100%', minHeight: '600px', border: 'none', background: '#fff' }}
                                    onLoad={() => updateProgressTracking('notes')}
                                />
                            </div>
                        );
                    })()}


                                        {activeSubTab === 'assignment' && (
                        <div style={{ padding: '4rem', background: 'hsl(var(--color-surface))', height: '100%' }}>
                            {activeQuiz ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', borderBottom: '1px solid hsla(var(--color-border), 0.5)', paddingBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.75rem', margin: 0 }}>{activeQuiz.title}</h3>
                                    </div>

                                    {quizResult ? (
                                        <div style={{ background: 'hsla(var(--color-success), 0.1)', border: '1px solid hsla(var(--color-success), 0.3)', padding: '4rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                                            <CheckCircle size={80} color="hsl(var(--color-success))" style={{ margin: '0 auto 2rem auto' }} />
                                            <h3 style={{ color: 'hsl(var(--color-success))', fontSize: '2.5rem' }}>Quiz Graded!</h3>
                                            <p style={{ fontSize: '1.75rem', marginTop: '1.5rem' }}>Total Marks: <strong>{quizResult.marks} / {quizResult.maxMarks}</strong></p>
                                            <div style={{ marginTop: '3rem', width: '100%', height: '16px', background: 'hsla(var(--color-success), 0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${(quizResult.marks / quizResult.maxMarks) * 100}%`, background: 'hsl(var(--color-success))' }} />
                                            </div>
                                            
                                            <button className="btn btn-outline" style={{ marginTop: '3rem', padding: '1.25rem 3rem', fontSize: '1.25rem', borderColor: 'hsl(var(--color-success))', color: 'hsl(var(--color-success))' }} onClick={() => {
                                                setQuizResult(null);
                                                setQuizAnswers(new Array(activeQuiz.questions.length).fill(-1));
                                            }}>
                                                ↺ Retake Quiz
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                            {activeQuiz.questions.map((q: any, qIdx: number) => (
                                                <div key={qIdx} style={{ background: 'hsl(var(--color-background))', padding: '2.5rem', borderRadius: 'var(--radius-md)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                                        <p style={{ fontWeight: 500, fontSize: '1.35rem', margin: 0 }}>{qIdx + 1}. {q.questionText}</p>
                                                        <span style={{ fontSize: '1.1rem', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap' }}>{q.marks} Marks</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                        {q.options.map((opt: string, optIdx: number) => (
                                                            <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.75rem', background: 'hsla(var(--color-surface), 0.5)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: quizAnswers[qIdx] === optIdx ? '2px solid hsl(var(--color-primary))' : '2px solid transparent', transition: 'all 0.2s ease' }}>
                                                                <input 
                                                                    type="radio" 
                                                                    name={`q_${qIdx}`} 
                                                                    checked={quizAnswers[qIdx] === optIdx}
                                                                    onChange={() => {
                                                                        const newArr = [...quizAnswers];
                                                                        newArr[qIdx] = optIdx;
                                                                        setQuizAnswers(newArr);
                                                                    }}
                                                                    style={{ accentColor: 'hsl(var(--color-primary))', transform: 'scale(1.3)' }}
                                                                />
                                                                <span style={{ fontSize: '1.2rem' }}>{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                                <button className="btn btn-primary" style={{ padding: '1.25rem 4rem', fontSize: '1.35rem' }} onClick={submitQuiz} disabled={isSubmitting}>
                                                    {isSubmitting ? 'Evaluating...' : 'Submit Final Answers'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '4rem' }}>
                                    <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem' }}>No quiz or assignment attached to this lecture.</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                </div>
            </div>
        )}

    </div>
  );
};

export default LearningPlayer;
