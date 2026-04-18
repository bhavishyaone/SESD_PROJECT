import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import api from '../api/axios';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.status === 'success') {
        const { token, user } = response.data.data;
        login(token, user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Background Decorators */}
      <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, hsla(var(--color-secondary), 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, hsla(var(--color-primary), 0.08) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', position: 'relative', zIndex: 10 }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '1rem', background: 'hsla(var(--color-secondary), 0.1)', color: 'hsl(var(--color-secondary))', marginBottom: '1rem' }}>
            <UserPlus size={28} />
          </div>
          <h2>Join the Network</h2>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>Create an account to start your learning journey.</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'hsla(var(--color-danger), 0.1)', color: 'hsl(var(--color-danger))', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))' }}>Full Name</label>
            <input 
              type="text" 
              name="name"
              className="input-base" 
              placeholder="John Doe" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))' }}>Email Address</label>
            <input 
              type="email" 
              name="email"
              className="input-base" 
              placeholder="student@example.com" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))' }}>Password</label>
              <input 
                type="password" 
                name="password"
                className="input-base" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'hsl(var(--text-secondary))' }}>Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="input-base" style={{ cursor: 'pointer' }}>
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', margin: '2rem 0 0 0', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
          Already have an account? <Link to="/login" style={{ color: 'hsl(var(--color-primary))', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
