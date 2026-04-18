import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Video, FileCheck, CheckCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Dynamic Navbar */}
      <nav style={{ padding: '1.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsla(var(--color-border), 0.3)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h2 style={{ background: 'linear-gradient(90deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700, letterSpacing: '-0.05em' }}>
          SESD LMS
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-surface" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Start Learning</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '8rem 5% 6rem 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow effects */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'hsl(var(--color-primary))', opacity: 0.15, filter: 'blur(100px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '400px', height: '400px', background: 'hsl(var(--color-secondary))', opacity: 0.15, filter: 'blur(100px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>
        
        <div style={{ maxWidth: '800px', zIndex: 1, animation: 'fadeInUp 0.8s ease-out forwards' }}>
          <div style={{ display: 'inline-block', padding: '0.25rem 1rem', background: 'hsla(var(--color-surface), 0.5)', border: '1px solid hsla(var(--color-border), 0.5)', borderRadius: '2rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '2rem' }}>
            <span style={{ color: 'hsl(var(--color-primary))', marginRight: '0.5rem' }}>★</span> 
            Platform Version 2.0 Live
          </div>
          
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            The Modern Standard for <br />
            <span style={{ background: 'linear-gradient(90deg, hsl(var(--color-primary)), #a855f7, hsl(var(--color-secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradientShift 8s ease infinite', backgroundSize: '200% 200%' }}>
              Digital Curriculum.
            </span>
          </h1>
          
          <p style={{ fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', color: 'hsl(var(--text-secondary))', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
            A premium full-stack learning management system empowering instructors to construct beautiful courses, and students to earn verifiable certificates.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem', borderRadius: 'var(--radius-md)' }} onClick={() => navigate('/register')}>
              Join the Ecosystem
            </button>
            <button className="btn btn-surface" style={{ padding: '1rem 2rem', fontSize: '1.125rem', borderRadius: 'var(--radius-md)' }} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" style={{ padding: '5rem 5%', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Engineered for Excellence.</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.125rem' }}>A seamless pipeline from course discovery to guaranteed certification.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Card 1 */}
            <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', animation: 'fadeInUp 1s ease-out forwards', animationDelay: '0.1s', opacity: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: 'hsla(var(--color-primary), 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--color-primary))', marginBottom: '1.5rem' }}>
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Course Architecture</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.6, flex: 1 }}>
                Instructors can natively build rich courses with customized pricing, durations, and content right from their personalized dashboard without touching external databases.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', animation: 'fadeInUp 1s ease-out forwards', animationDelay: '0.2s', opacity: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: 'hsla(var(--color-secondary), 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--color-secondary))', marginBottom: '1.5rem' }}>
                <Video size={24} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Immersive Environments</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.6, flex: 1 }}>
                Students consume materials in a beautifully integrated "Learning Player" that combines interactive video modules directly alongside their final project submission portals.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', animation: 'fadeInUp 1s ease-out forwards', animationDelay: '0.3s', opacity: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: 'hsla(var(--color-success), 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--color-success))', marginBottom: '1.5rem' }}>
                <FileCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Automated Grading</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.6, flex: 1 }}>
                Submit project repos instantly. Evaluators map metrics on a unified dashboard, issuing precise grades that natively trigger the automated certificate issuance pipelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Component Section */}
      <section style={{ padding: '5rem 5%', background: 'hsla(var(--color-surface), 0.3)', borderTop: '1px solid hsla(var(--color-border), 0.5)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>Proof of Work, <br/><span style={{ color: 'hsl(var(--text-muted))' }}>Automated via LMS hooks.</span></h2>
            <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '2rem', lineHeight: 1.6 }}>
              SESD integrates deep Node.js logic to verify student assignments mathematically. When an instructor confirms a submission, verifiable JWT-secured certificates are instantly piped to the blockchain or student dashboards seamlessly.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><CheckCircle color="hsl(var(--color-success))" size={20}/> <span>Immutable Issuance</span></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><CheckCircle color="hsl(var(--color-success))" size={20}/> <span>Downloadable Premium PDFs</span></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><CheckCircle color="hsl(var(--color-success))" size={20}/> <span>Globally Verifiable Links</span></li>
            </ul>
          </div>

          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '380px', transform: 'rotate(2deg)', boxShadow: '0 20px 40px -10px hsla(var(--color-primary), 0.15)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'hsla(var(--color-success), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--color-success))', margin: '0 auto 1.5rem auto' }}>
                <GraduationCap size={32} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40%', height: '8px', background: 'hsl(var(--color-border))', margin: '0 auto 1rem auto', borderRadius: '4px' }}></div>
                <div style={{ width: '80%', height: '16px', background: 'linear-gradient(90deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))', margin: '0 auto 1.5rem auto', borderRadius: '4px' }}></div>
                <div style={{ width: '60%', height: '8px', background: 'hsl(var(--color-border))', margin: '0 auto 1rem auto', borderRadius: '4px' }}></div>
                <div style={{ width: '50%', height: '8px', background: 'hsl(var(--color-border))', margin: '0 auto 1rem auto', borderRadius: '4px' }}></div>
                <div style={{ padding: '0.5rem 1rem', background: 'hsla(var(--color-success), 0.1)', color: 'hsl(var(--color-success))', borderRadius: '1rem', display: 'inline-block', marginTop: '1.5rem', fontSize: '0.75rem', fontWeight: 600 }}>VERIFIED GRADUATE</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '3rem 5%', borderTop: '1px solid hsla(var(--color-border), 0.5)', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
        <p style={{ marginBottom: '1rem' }}>© 2026 SESD Learning Management System. Built for absolute scaling.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.875rem' }}>
           <span>Privacy Sandbox</span>
           <span>Terms of Operations</span>
           <span>System Status</span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
