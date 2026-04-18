import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutTemplate } from 'lucide-react';
import api from '../api/axios';

const CourseBuilder: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    duration: 0,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/courses', {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        instructorId: user?._id
      });
      navigate('/dashboard'); // Go back to instructor dashboard after success
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to construct the course module.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent generic students from bypassing route randomly
  if (user?.role === 'Student') {
    return <div className="p-8 text-center">Unauthorized access</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: 'hsla(var(--color-primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--color-primary))' }}>
          <LayoutTemplate size={24} />
        </div>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Course Builder</h1>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Construct a new curriculum module explicitly linked to your Instructor profile.</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'hsla(var(--color-danger), 0.1)', color: 'hsl(var(--color-danger))', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))' }}>Course Title</label>
          <input 
            type="text" 
            name="title"
            className="input-base" 
            placeholder="E.g., Advanced React Patterns" 
            value={formData.title}
            onChange={handleChange}
            required 
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))' }}>Description Overview</label>
          <textarea 
            name="description"
            className="input-base" 
            placeholder="Provide a comprehensive summary..." 
            value={formData.description}
            onChange={handleChange}
            style={{ minHeight: '120px', resize: 'vertical' }}
            required 
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))' }}>Enrollment Price ($)</label>
            <input 
              type="number" 
              name="price"
              min="0"
              className="input-base" 
              value={formData.price}
              onChange={handleChange}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))' }}>Duration (Hours)</label>
            <input 
              type="number" 
              name="duration"
              min="1"
              className="input-base" 
              value={formData.duration}
              onChange={handleChange}
              required 
            />
          </div>
        </div>

        <div style={{ marginTop: '1rem', borderTop: '1px solid hsla(var(--color-border), 0.5)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-surface" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Deploy Course'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CourseBuilder;
