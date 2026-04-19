import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Save, Video, FileText, ChevronDown, ChevronRight, Upload, Trash2, HelpCircle, Zap, CheckCircle } from 'lucide-react';
import api from '../api/axios';

interface IQuestionForm {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

const ManageCourseContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<Record<string, any[]>>({});
  const [assignments, setAssignments] = useState<any[]>([]);

  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<{title: string; notesFile: File | null; videoFile: File | null}>({ title: '', notesFile: null, videoFile: null });

  const [addingAssignmentToLesson, setAddingAssignmentToLesson] = useState<string | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<{title: string; gradingType: string; questions: IQuestionForm[]}>({ title: '', gradingType: 'percentage', questions: [] });

  const [expandedModules, setExpandedModules] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  const fetchContent = React.useCallback(async () => {
    try {
      const cRes = await api.get(`/courses/${id}`);
      setCourse(cRes.data.data);
      const mRes = await api.get(`/courses/${id}/modules`);
      const mods = mRes.data.data;
      setModules(mods);

      const lessonsMap: Record<string, any[]> = {};
      for (const m of mods) {
        const lRes = await api.get(`/courses/modules/${m._id}/lessons`);
        lessonsMap[m._id] = lRes.data.data || [];
      }
      setLessons(lessonsMap);

      const aRes = await api.get(`/courses/${id}/assignments`);
      setAssignments(aRes.data.data || []);
    } catch (err) {
      console.error("Failed to load content for course.");
    }
  }, [id]);

  useEffect(() => {
    if (authLoading) return;
    fetchContent();
  }, [authLoading, fetchContent]);

  const handleAddModule = async () => {
    if (!newTitle.trim()) return alert('Need module title');
    setLoading(true);
    try {
      const res = await api.post(`/courses/${id}/modules`, {
        title: newTitle,
        orderIndex: modules.length + 1
      });
      setModules([...modules, res.data.data]);
      setNewTitle('');
    } catch (err) {
      alert("Failed creating module");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data.fileUrl; 
  }

  const submitLesson = async (moduleId: string) => {
    if (!lessonForm.title) return alert("Title is required.");
    if (!lessonForm.notesFile) return alert("Lecture Notes file is mandatory.");

    setUploading(true);
    try {
      const notesUrl = await uploadFile(lessonForm.notesFile);
      let videoUrl = undefined;
      
      if (lessonForm.videoFile) {
          videoUrl = await uploadFile(lessonForm.videoFile);
      }

      const res = await api.post(`/courses/modules/${moduleId}/lessons`, { 
          title: lessonForm.title, 
          notesUrl,
          videoUrl
      });
      
      setLessons(prev => ({
          ...prev,
          [moduleId]: [...(prev[moduleId] || []), res.data.data]
      }));
      setAddingLessonToModule(null);
      setLessonForm({ title: '', notesFile: null, videoFile: null });
    } catch(err) {
      alert("Failed adding lesson");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const submitAssignment = async (lessonId: string) => {
      if (!assignmentForm.title) return alert("Title required.");
      if (assignmentForm.questions.length === 0) return alert("At least one question is required.");
      
      for (const q of assignmentForm.questions) {
          if (!q.questionText || q.options.some(o => !o) || q.correctOptionIndex < 0 || q.marks <= 0) {
             return alert("All questions must be fully filled out with 4 options and valid marks.");
          }
      }

      setUploading(true);
      try {
        const aggregatedMarks = assignmentForm.questions.reduce((sum, q) => sum + q.marks, 0);

        const res = await api.post('/assignments', {
          title: assignmentForm.title,
          maxMarks: aggregatedMarks,
          gradingType: assignmentForm.gradingType,
          lessonId,
          questions: assignmentForm.questions
        });
        setAssignments([...assignments, res.data.data]);
        setAddingAssignmentToLesson(null);
        setAssignmentForm({ title: '', gradingType: 'percentage', questions: [] });
      } catch(err) {
        alert("Failed creating quiz");
      } finally {
        setUploading(false);
      }
  };

  const handleDeleteCourse = async () => {
      if(!window.confirm('Are you sure you want to delete this ENTIRE course? This cannot be undone.')) return;
      try {
          await api.delete(`/courses/${id}`);
          navigate('/dashboard');
      } catch(err) {
          alert('Failed to delete course');
      }
  };

  const handlePublishCourse = async () => {
      if (course?.status === 'published') {
          alert('This course is already published and visible to students.');
          return;
      }
      try {
          const res = await api.patch(`/courses/${id}/publish`);
          setCourse(res.data.data);
          alert('Course published! Students can now see and enroll in it.');
      } catch(err) {
          alert('Failed to publish course');
      }
  };

  const handleDeleteModule = async (moduleId: string) => {
      if(!window.confirm('Delete this module and all its lessons?')) return;
      try {
          await api.delete(`/courses/${id}/modules/${moduleId}`);
          setModules(modules.filter(m => m._id !== moduleId));
      } catch(err) {
          alert('Failed to delete module');
      }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
      if(!window.confirm('Delete this lesson?')) return;
      try {
          await api.delete(`/courses/modules/${moduleId}/lessons/${lessonId}`);
          setLessons(prev => ({
              ...prev,
              [moduleId]: prev[moduleId].filter(l => l._id !== lessonId)
          }));
      } catch(err) {
          alert('Failed to delete lesson');
      }
  };

  const toggleModule = (mId: string) => {
    setExpandedModules((prev: any) => ({ ...prev, [mId]: !prev[mId] }));
  };

  if (user?.role !== 'Instructor') return <div>Unauthorized</div>;

  return (
    <div>
      <div style={{ padding: '2rem', background: 'hsla(var(--color-surface), 0.5)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <h2>Manage Course Content</h2>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '1rem', background: course?.status === 'published' ? 'hsla(var(--color-success), 0.15)' : 'hsla(40, 90%, 50%, 0.15)', color: course?.status === 'published' ? 'hsl(var(--color-success))' : '#f39c12', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {course?.status || 'draft'}
                    </span>
                    <button className="btn btn-outline btn-sm" style={{borderColor: 'hsl(var(--color-danger))', color: 'hsl(var(--color-danger))'}} onClick={handleDeleteCourse}>
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
                <p style={{ color: 'hsl(var(--color-primary))' }}>{course?.title}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                {course?.status !== 'published' && (
                    <button
                        className="btn btn-primary"
                        onClick={handlePublishCourse}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Zap size={16} /> Publish Course
                    </button>
                )}
                {course?.status === 'published' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--color-success))', fontSize: '0.875rem', fontWeight: 500 }}>
                        <CheckCircle size={16} /> Live
                    </span>
                )}
                <button className="btn btn-outline" onClick={() => navigate('/manage-assignments')}>
                    View Submissions
                </button>
            </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <h4>Modules</h4>
          {modules.map((m: any) => (
            <div key={m._id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleModule(m._id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    {expandedModules[m._id] ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                    {m.title}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-surface btn-sm" onClick={(e) => { e.stopPropagation(); handleDeleteModule(m._id); }}>
                    <Trash2 size={16} color="hsl(var(--color-danger))" />
                    </button>
                    <button className="btn btn-surface btn-sm" onClick={(e) => { e.stopPropagation(); setAddingLessonToModule(m._id); setExpandedModules((p:any)=>({...p,[m._id]:true})); }}>
                    + Add Lesson
                    </button>
                </div>
              </div>

              {expandedModules[m._id] && (
                  <div style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(lessons[m._id] || []).map(lesson => {
                          const lessonAssignments = assignments.filter(a => a.lessonId === lesson._id);
                          return (
                          <div key={lesson._id} style={{ background: 'hsla(var(--color-background), 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Video size={16} color="hsl(var(--color-primary))" /> 
                                    <span>{lesson.title}</span>
                                    {lesson.videoUrl && <span style={{fontSize: '12px', background: 'hsla(var(--color-primary), 0.2)', padding: '2px 6px', borderRadius: '4px'}}>Video</span>}
                                    {lesson.notesUrl && <span style={{fontSize: '12px', background: 'hsla(var(--color-secondary), 0.2)', padding: '2px 6px', borderRadius: '4px'}}>Notes</span>}
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                      <button className="btn btn-surface btn-sm" onClick={() => handleDeleteLesson(m._id, lesson._id)}>
                                        <Trash2 size={14} color="hsl(var(--color-danger))" />
                                      </button>
                                      <button className="btn btn-surface btn-sm" onClick={() => setAddingAssignmentToLesson(lesson._id)}>
                                        + Add Quiz / Assignment
                                      </button>
                                  </div>
                              </div>

                              {lessonAssignments.length > 0 && (
                                  <div style={{ marginTop: '1rem', paddingLeft: '1.5rem', borderLeft: '2px solid hsla(var(--color-border), 0.3)' }}>
                                      <h6 style={{ opacity: 0.7, marginBottom: '0.5rem' }}>Quizzes</h6>
                                      {lessonAssignments.map(a => (
                                          <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <HelpCircle size={14} color="hsl(var(--color-primary))" />
                                                <span>{a.title} ({a.questions?.length || 0} Questions, {a.maxMarks} marks)</span>
                                              </div>
                                              <span style={{ cursor: 'pointer', color: 'hsl(var(--color-primary))' }} onClick={() => navigate('/manage-assignments')}>View Submissions →</span>
                                          </div>
                                      ))}
                                  </div>
                              )}

                              {addingAssignmentToLesson === lesson._id && (
                                  <div style={{ marginTop: '1rem', background: 'hsla(var(--color-primary), 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                      <h5>New Quiz Assignment for {lesson.title}</h5>
                                      
                                      <div style={{display: 'flex', gap: '1rem'}}>
                                          <input className="input-base" style={{flex: 1}} placeholder="Quiz Title" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} />
                                          <select className="input-base" style={{width: '200px'}} value={assignmentForm.gradingType} onChange={e => setAssignmentForm({...assignmentForm, gradingType: e.target.value})}>
                                              <option value="percentage">Percentage Grading</option>
                                              <option value="pass_fail">Pass/Fail</option>
                                          </select>
                                      </div>

                                      <div>
                                          <h6>Questions</h6>
                                          {assignmentForm.questions.map((q, qIndex) => (
                                              <div key={qIndex} style={{background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                      <strong>Question {qIndex + 1}</strong>
                                                      <button className="btn btn-surface btn-sm" onClick={() => {
                                                          const qs = [...assignmentForm.questions];
                                                          qs.splice(qIndex, 1);
                                                          setAssignmentForm({...assignmentForm, questions: qs});
                                                      }}><Trash2 size={14} color="hsl(var(--color-danger))"/></button>
                                                  </div>
                                                  
                                                  <input className="input-base" placeholder="Enter Question text..." value={q.questionText} onChange={e => {
                                                      const qs = [...assignmentForm.questions];
                                                      qs[qIndex].questionText = e.target.value;
                                                      setAssignmentForm({...assignmentForm, questions: qs});
                                                  }} />

                                                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                                                      {[0, 1, 2, 3].map(optIdx => (
                                                          <div key={optIdx} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'hsla(var(--color-background), 0.5)', padding: '0.5rem', borderRadius: 'var(--radius-sm)'}}>
                                                              <input type="radio" style={{accentColor: 'hsl(var(--color-primary))'}} name={`correctOption_${qIndex}`} checked={q.correctOptionIndex === optIdx} onChange={() => {
                                                                  const qs = [...assignmentForm.questions];
                                                                  qs[qIndex].correctOptionIndex = optIdx;
                                                                  setAssignmentForm({...assignmentForm, questions: qs});
                                                              }} />
                                                              <input className="input-base" style={{flex: 1, padding: '0.2rem 0.5rem'}} placeholder={`Option ${optIdx + 1}`} value={q.options[optIdx]} onChange={e => {
                                                                  const qs = [...assignmentForm.questions];
                                                                  qs[qIndex].options[optIdx] = e.target.value;
                                                                  setAssignmentForm({...assignmentForm, questions: qs});
                                                              }} />
                                                          </div>
                                                      ))}
                                                  </div>

                                                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem'}}>
                                                      <span style={{fontSize: '0.9rem'}}>Marks for this question:</span>
                                                      <input type="number" className="input-base" style={{width: '100px', padding: '0.2rem 0.5rem'}} value={q.marks} onChange={e => {
                                                          const qs = [...assignmentForm.questions];
                                                          qs[qIndex].marks = parseInt(e.target.value) || 0;
                                                          setAssignmentForm({...assignmentForm, questions: qs});
                                                      }} />
                                                  </div>
                                              </div>
                                          ))}
                                          
                                          <button className="btn btn-outline btn-sm" onClick={() => {
                                              setAssignmentForm({
                                                  ...assignmentForm, 
                                                  questions: [...assignmentForm.questions, { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, marks: 10 }]
                                              });
                                          }}>+ Add another question</button>
                                      </div>

                                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button className="btn btn-primary btn-sm" onClick={() => submitAssignment(lesson._id)} disabled={uploading}>
                                            {uploading ? 'Building Quiz...' : 'Save Quiz'}
                                        </button>
                                        <button className="btn btn-outline btn-sm" onClick={() => setAddingAssignmentToLesson(null)}>Cancel</button>
                                      </div>
                                  </div>
                              )}
                          </div>
                      )})}

                      {addingLessonToModule === m._id && (
                          <div style={{ background: 'hsla(var(--color-surface), 0.8)', border: '1px solid hsla(var(--color-border), 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h5>New Lesson</h5>
                                <input className="input-base" placeholder="Lesson Title" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} />
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{border: '1px dashed hsla(var(--color-border), 0.8)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center'}}>
                                        <h6>Upload Lecture Notes <span style={{color: 'hsl(var(--color-danger))'}}>*</span></h6>
                                        <p style={{fontSize: '0.8rem', opacity: 0.7}}>Mandatory (PDF/Docx)</p>
                                        <Upload size={24} style={{opacity: 0.5, margin: '0.5rem 0'}} />
                                        <br />
                                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setLessonForm({...lessonForm, notesFile: e.target.files?.[0] || null})} />
                                    </div>
                                    <div style={{border: '1px dashed hsla(var(--color-border), 0.8)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center'}}>
                                        <h6>Upload Video Lecture</h6>
                                        <p style={{fontSize: '0.8rem', opacity: 0.7}}>Optional (.mp4)</p>
                                        <Upload size={24} style={{opacity: 0.5, margin: '0.5rem 0'}} />
                                        <br />
                                        <input type="file" accept="video/*" onChange={(e) => setLessonForm({...lessonForm, videoFile: e.target.files?.[0] || null})} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                  <button className="btn btn-primary btn-sm" onClick={() => submitLesson(m._id)} disabled={uploading}>
                                      {uploading ? 'Uploading...' : 'Save Lesson'}
                                  </button>
                                  <button className="btn btn-outline btn-sm" onClick={() => setAddingLessonToModule(null)}>Cancel</button>
                                </div>
                          </div>
                      )}
                  </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <input className="input-base" placeholder="New Module Name..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <button className="btn btn-primary" onClick={handleAddModule} disabled={loading}>
              <PlusCircle size={18} /> Add Module
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageCourseContent;
