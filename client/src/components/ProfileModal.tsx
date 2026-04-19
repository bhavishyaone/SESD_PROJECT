import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import api from '../api/axios';

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, login } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const { data } = await api.put('/users/profile', { name, email, password });
      if (data.success) {
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        login(data.data.token, data.data.user);
        
        setTimeout(() => onClose(), 1500);
      }
    } catch (error: any) {
      setMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '3rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'hsla(var(--color-surface), 0.5)', border: 'none', color: 'hsl(var(--text-primary))', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-grow">
          <X size={20} />
        </button>

        <h2 style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '1.75rem' }}>Update Profile</h2>
        
        {msg.text && (
          <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '0.5rem', background: msg.type === 'success' ? 'hsla(var(--color-success), 0.2)' : 'hsla(var(--color-danger), 0.2)', color: msg.type === 'success' ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))', fontSize: '1rem', textAlign: 'center', fontWeight: '500' }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="name" style={{ fontSize: '1rem', color: 'hsl(var(--text-secondary))' }}>Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '1rem', background: 'hsla(var(--color-surface), 0.5)', border: '1px solid hsla(var(--color-border), 0.5)', borderRadius: 'var(--radius-sm)', color: 'hsl(var(--text-primary))' }}
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontSize: '1rem', color: 'hsl(var(--text-secondary))' }}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '1rem', background: 'hsla(var(--color-surface), 0.5)', border: '1px solid hsla(var(--color-border), 0.5)', borderRadius: 'var(--radius-sm)', color: 'hsl(var(--text-primary))' }}
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{ fontSize: '1rem', color: 'hsl(var(--text-secondary))' }}>New Password <span style={{fontSize: '0.875rem', opacity: 0.6}}>(Optional)</span></label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '1rem', background: 'hsla(var(--color-surface), 0.5)', border: '1px solid hsla(var(--color-border), 0.5)', borderRadius: 'var(--radius-sm)', color: 'hsl(var(--text-primary))' }}
              placeholder="Leave blank to keep current"
            />
          </div>

          <button type="submit" className="btn btn-primary hover-grow" style={{ marginTop: '1rem', padding: '1rem', fontSize: '1rem', fontWeight: 'bold' }} disabled={loading}>
            {loading ? 'Updating...' : 'Save Profile'}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
