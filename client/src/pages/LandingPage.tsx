import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, GraduationCap, Video, FileCheck, CheckCircle,
  Users, Award, TrendingUp, PlayCircle, Shield, Zap,
  ChevronDown, Star, ArrowRight, Code, Brain, BarChart3,
  FileText, ClipboardCheck, Globe
} from 'lucide-react';

const useIntersection = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
};

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
  const { ref, visible } = useIntersection();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

const StatCounter: React.FC<{ end: number; label: string; suffix?: string }> = ({ end, label, suffix = '' }) => {
  const { ref, visible } = useIntersection();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end]);
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, background: 'linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; delay?: number }> = ({ icon, title, desc, delay = 0 }) => (
  <FadeIn delay={delay}>
    <div
      className="glass-panel"
      style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 40px -10px rgba(255,255,255,0.05)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
    >
      <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{title}</h3>
      <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.65, fontSize: '0.95rem', flex: 1 }}>{desc}</p>
    </div>
  </FadeIn>
);

const StepCard: React.FC<{ step: number; title: string; desc: string; icon: React.ReactNode }> = ({ step, title, desc, icon }) => (
  <FadeIn delay={step * 0.1}>
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>
        {step}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ color: '#ffffff' }}>{icon}</span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
        </div>
        <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.65, fontSize: '0.95rem' }}>{desc}</p>
      </div>
    </div>
  </FadeIn>
);

const TestimonialCard: React.FC<{ name: string; role: string; text: string; initials: string; color: string }> = ({ name, role, text, initials, color }) => (
  <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="hsl(45, 90%, 55%)" color="hsl(45, 90%, 55%)" />)}
    </div>
    <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.7, fontStyle: 'italic', fontSize: '0.95rem' }}>"{text}"</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
        {initials}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</div>
        <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.8rem' }}>{role}</div>
      </div>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const features = [
    { icon: <BookOpen size={24} />, title: 'Dynamic Course Builder', desc: 'Instructors craft multi-module courses with drag-and-drop lessons, embedded videos, lecture notes, and graded assignments — all from a single dashboard.', accent: 'hsl(var(--color-primary))' },
    { icon: <Video size={24} />, title: 'Immersive Learning Player', desc: 'Students consume content in a beautiful three-panel player combining video lectures, downloadable PDFs, and real-time quiz submissions side by side.', accent: 'hsl(var(--color-primary))' },
    { icon: <ClipboardCheck size={24} />, title: 'Automated Grading Engine', desc: 'A smart assessment system scores MCQ quizzes instantly, calculates pass percentages, and gives immediate feedback to the student.', accent: 'hsl(var(--color-primary))' },
    { icon: <Award size={24} />, title: 'Verifiable Certificates', desc: 'On 100% course completion, uniquely signed PDF certificates are auto-issued with IDs, student names, course titles, and issue dates.', accent: 'hsl(var(--color-primary))' },
    { icon: <BarChart3 size={24} />, title: 'Instructor Analytics', desc: 'Real-time aggregated dashboards show enrolled students, lecture completion counts, video watch metrics, notes downloads, quiz attempts, and assignment pass rates.', accent: 'hsl(var(--color-primary))' },
    { icon: <Shield size={24} />, title: 'Role-Based Access', desc: 'Secure platform access with three distinct roles — Student, Instructor, Admin — each with strict permissions and distinctly tailored dashboards.', accent: 'hsl(var(--color-primary))' },
    { icon: <Brain size={24} />, title: 'Smart Progress Tracking', desc: 'Every video watch, note download, and quiz attempt is individually recorded. Module and course completion auto-triggers when all children are satisfied.', accent: 'hsl(var(--color-primary))' },
    { icon: <Globe size={24} />, title: 'Global Content Delivery', desc: "All course videos and PDF notes are stored and served via a global delivery network — ensuring lightning-fast buffering anywhere in the world.", accent: 'hsl(var(--color-primary))' },

  ];

  const faqs = [
    { q: 'How do I enroll in a course?', a: 'Register as a Student, browse the Course Catalog, and click "Enroll Now" on any published course. You get instant access to all lessons, videos, and assignments.' },
    { q: 'How does the certificate get issued?', a: 'Once you watch every video, download all lecture notes, and pass every quiz in a course — the platform automatically generates a uniquely signed certificate for you to download and share.' },
    { q: 'Can instructors see student progress?', a: 'Yes. The Instructor Dashboard shows real-time stats for every course — including individual lesson completion counts, video watches, notes downloads, quiz attempts, and assignment pass rates.' },
    { q: 'What file formats are supported for upload?', a: 'Instructors can upload MP4 videos and PDF documents for lecture notes. Files are securely stored seamlessly for instant uninterrupted playback anywhere.' },
    { q: 'Is there a free tier?', a: 'Academix is designed to be completely free and self-hosted. You control the platform entirely — there are no subscription fees, no per-seat charges, and no lock-in.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--color-background))', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>

      <nav style={{
        padding: '1rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'hsla(var(--color-background), 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid hsla(var(--color-border), 0.5)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color="#ffffff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#ffffff' }}>
            Academix
          </span>
        </div>
        <div style={{ display: 'none', gap: '2rem', alignItems: 'center' }} className="nav-links">
          {['Features', 'How It Works', 'Testimonials', 'FAQ'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
              style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.target as HTMLAnchorElement).style.color = 'white'}
              onMouseLeave={e => (e.target as HTMLAnchorElement).style.color = 'hsl(var(--text-secondary))'}
              onClick={e => { e.preventDefault(); document.getElementById(link.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth' }); }}
            >{link}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-surface" onClick={() => navigate('/login')} style={{ padding: '0.5rem 1.25rem' }}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '0.5rem 1.25rem' }}>Get Started</button>
        </div>
      </nav>

      <section style={{ padding: 'clamp(5rem, 12vw, 10rem) 5% 6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>


        <div style={{ maxWidth: 1000, zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', background: 'hsla(var(--color-primary), 0.1)', border: '1px solid hsla(var(--color-primary), 0.25)', borderRadius: '2rem', fontSize: '0.8rem', color: 'hsl(var(--color-primary))', fontWeight: 500, marginBottom: '2rem', animation: 'fadeInUp 0.6s ease forwards' }}>
            <Zap size={13} />
            Complete Learning Ecosystem · Build · Deploy · Grow
          </div>

          <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', lineHeight: 1.07, marginBottom: '1.75rem', letterSpacing: '-0.04em', animation: 'fadeInUp 0.7s 0.1s ease both' }}>
            The Modern Standard<br />for{' '}
            <span style={{ color: 'hsl(var(--text-secondary))' }}>
              Digital Learning.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'hsl(var(--text-secondary))', maxWidth: 1000, margin: '0 auto 2.5rem', lineHeight: 1.7, animation: 'fadeInUp 0.7s 0.2s ease both' }}>
            Instructors build, deploy, and track courses. Students learn, progress, and earn verifiable certificates.
            Academix is a complete, production-ready learning management ecosystem built for the modern web.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 0.7s 0.3s ease both' }}>
            <button className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/register')}>
              Start Learning Free <ArrowRight size={16} />
            </button>
            <button className="btn btn-surface" style={{ padding: '0.875rem 2rem', fontSize: '1rem', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              <PlayCircle size={16} /> Explore Features
            </button>
          </div>


        </div>

        <div style={{ marginTop: '5rem', zIndex: 1, width: '100%', maxWidth: 1400 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 80px -20px rgba(34,197,94,0.15)' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
              <span style={{ marginLeft: '0.5rem', color: 'hsl(var(--text-muted))', fontSize: '0.8rem' }}>Academix Learning Management System · Dashboard</span>
            </div>
            <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Active Students', value: '1,284', icon: <Users size={18} /> },
                { label: 'Courses Published', value: '47', icon: <BookOpen size={18} /> },
                { label: 'Certificates Issued', value: '3,920', icon: <Award size={18} /> },
                { label: 'Avg. Completion', value: '84%', icon: <TrendingUp size={18} /> },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', fontSize: '0.8rem', fontWeight: 500 }}>
                    {stat.icon} {stat.label}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 5%', borderTop: '1px solid hsla(var(--color-border), 0.3)', borderBottom: '1px solid hsla(var(--color-border), 0.3)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <FadeIn>
            <p style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2.5rem' }}>Platform at a Glance</p>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem' }}>
            <StatCounter end={1284} label="Registered Students" suffix="+" />
            <StatCounter end={47} label="Published Courses" />
            <StatCounter end={3920} label="Certificates Issued" suffix="+" />
            <StatCounter end={98} label="Completion Rate" suffix="%" />
            <StatCounter end={9} label="Core Features" />
          </div>
        </div>
      </section>

      <section id="features" style={{ padding: '7rem 5%' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>What's Inside</span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '0.75rem', marginBottom: '1rem' }}>Everything You Need to Learn & Teach</h2>
              <p style={{ color: 'hsl(var(--text-muted))', maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
                From content creation to progress analytics, Academix covers every dimension of a professional-grade LMS — out of the box.
              </p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {features.map((f, i) => (
              <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{ padding: '7rem 5%', background: 'hsla(var(--color-surface), 0.25)', borderTop: '1px solid hsla(var(--color-border), 0.4)', borderBottom: '1px solid hsla(var(--color-border), 0.4)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '5rem', alignItems: 'center' }}>
          <div>
            <FadeIn>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>For Students</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginTop: '0.75rem', marginBottom: '2.5rem' }}>Learn at Your Own Pace</h2>
            </FadeIn>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <StepCard step={1} title="Create Your Account" desc="Sign up as a Student in under 30 seconds. No credit card, no commitments — immediate access to the full course catalog." icon={<Users size={18} />} />
              <StepCard step={2} title="Enroll in a Course" desc="Browse published courses, read module breakdowns, and enroll with a single click. Progress is tracked from the moment you start." icon={<BookOpen size={18} />} />
              <StepCard step={3} title="Learn & Complete Lessons" desc="Watch lecture videos, download study notes, and pass MCQ quizzes. Every action is individually tracked and marked with a persistent green completion tick." icon={<PlayCircle size={18} />} />
              <StepCard step={4} title="Earn Your Certificate" desc="Complete all modules and lessons. Your certificate is automatically generated, uniquely signed, and available to download and share forever." icon={<Award size={18} />} />
            </div>
          </div>
          <div>
            <FadeIn delay={0.2}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>For Instructors</span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', marginTop: '0.75rem', marginBottom: '2.5rem' }}>Build & Monitor with Confidence</h2>
            </FadeIn>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <StepCard step={1} title="Register as Instructor" desc="Create an instructor account. Your dashboard immediately unlocks course creation, module management, and student analytics tools." icon={<GraduationCap size={18} />} />
              <StepCard step={2} title="Build Your Course" desc="Add modules and lessons, securely upload lecture videos, attach PDF notes, and create MCQ assignments with up to 4 answer options." icon={<Code size={18} />} />
              <StepCard step={3} title="Publish & Deploy" desc="Review your course structure and click Publish. Your course instantly appears in the student-facing catalog, accessible to all enrolled students." icon={<Zap size={18} />} />
              <StepCard step={4} title="Track Real-Time Analytics" desc="Monitor student engagement on your dashboard — videos watched, notes downloaded, quizzes attempted, assignments passed, and full course completions." icon={<BarChart3 size={18} />} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '7rem 5%' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progress System</span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '0.75rem', marginBottom: '1rem' }}>Nothing Slips Through the Cracks</h2>
              <p style={{ color: 'hsl(var(--text-muted))', maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
                A multi-level completion tracking system ensures every action is recorded securely and reflected instantly across all your devices — even if you return weeks later.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: <Video size={22} />, title: 'Video Watched', desc: 'Clicking Play on a lecture marks that lesson\'s video as watched in your progress tracking record.' },
              { icon: <FileText size={22} />, title: 'Notes Downloaded', desc: 'Opening the Notes tab for a lesson marks the PDF as accessed — contributing to lesson completion.' },
              { icon: <FileCheck size={22} />, title: 'Assignment Submitted', desc: 'Passing an MCQ quiz with ≥50% marks marks the quiz as complete and triggers lesson-level evaluation.' },
              { icon: <CheckCircle size={22} />, title: 'Lesson Complete', desc: 'When video, notes, and quiz are all satisfied, the lesson receives a persistent green tick — forever.' },
              { icon: <BookOpen size={22} />, title: 'Module Complete', desc: 'When every lesson inside a module is complete, the module header gets its completion checkmark.' },
              { icon: <Award size={22} />, title: 'Course Complete', desc: 'All modules done? The system auto-flags your enrollment as completed and issues your certificate instantly.' },
              { icon: <TrendingUp size={22} />, title: 'Analytics Synced', desc: 'Every milestone you hit instantly updates your instructor\'s engagement dashboard in real-time.' },
              { icon: <GraduationCap size={22} />, title: 'Certificate Minted', desc: 'Upon reaching 100%, a digitally verifiable PDF certificate is permanently secured into your vault.' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}>
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.title}</h3>
                  <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '7rem 5%', background: 'hsla(var(--color-surface), 0.25)', borderTop: '1px solid hsla(var(--color-border), 0.4)', borderBottom: '1px solid hsla(var(--color-border), 0.4)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <FadeIn>
            <span style={{ color: 'hsl(45, 90%, 55%)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Certificates</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginTop: '0.75rem', marginBottom: '1.25rem', lineHeight: 1.2 }}>
              Credentials That Actually Mean Something
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: 1.7, marginBottom: '2rem' }}>
              Every Academix certificate is server-generated with a unique certificate ID, linked permanently to the student's profile, and downloadable in both web and print-quality PDF formats.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none' }}>
              {[
                'Unique signed certificate ID per issuance',
                'Student name, course title, and issue date embedded',
                'Available in Student\'s "My Certificates" dashboard forever',
                'Auto-triggered on 100% course completion — zero manual steps',
                'Professional print-quality PDF layout',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'hsl(var(--text-secondary))', fontSize: '0.95rem' }}>
                  <CheckCircle size={16} color="hsl(var(--color-success))" style={{ flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" style={{ marginTop: '2rem', padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/register')}>
              Start Earning Certificates <ArrowRight size={16} />
            </button>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: 380, textAlign: 'center', position: 'relative', transform: 'rotate(-1.5deg)', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5)' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'hsla(0, 0%, 100%, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <GraduationCap size={36} color="hsl(var(--color-primary))" />
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'hsl(var(--text-muted))', marginBottom: '0.5rem' }}>Certificate of Completion</div>
                <div style={{ width: '70%', height: 10, background: 'linear-gradient(90deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))', margin: '0.75rem auto', borderRadius: 5 }} />
                <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  This certifies that<br />
                  <strong style={{ color: 'white', fontSize: '1rem' }}>Bhavishya Sharma</strong><br />
                  has successfully completed<br />
                  <em style={{ color: 'hsl(var(--color-primary))' }}>Full-Stack Web Development</em>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ padding: '0.4rem 1rem', background: 'hsla(var(--color-success), 0.12)', color: 'hsl(var(--color-success))', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={12} /> VERIFIED GRADUATE
                  </div>
                </div>
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid hsla(var(--color-border), 0.5)', fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                  ID: ACDX-2026-0042 · Issued April 19, 2026
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>


      <section id="testimonials" style={{ padding: '7rem 5%', background: 'hsla(var(--color-surface), 0.25)', borderTop: '1px solid hsla(var(--color-border), 0.4)', borderBottom: '1px solid hsla(var(--color-border), 0.4)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Testimonials</span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '0.75rem' }}>Loved by Learners & Educators</h2>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <FadeIn delay={0.0}><TestimonialCard name="Arjun Mehta" role="Full-Stack Student" initials="AM" color="linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-secondary)))" text="The green completion ticks gave me so much motivation. I could see exactly how much I'd done and what was left. Finished the course in 2 weeks!" /></FadeIn>
            <FadeIn delay={0.1}><TestimonialCard name="Priya Singh" role="Instructor · 3 Courses" initials="PS" color="linear-gradient(135deg, hsl(160, 70%, 45%), #2ecc71)" text="Setting up my first course took under 30 minutes. The analytics dashboard shows me who's watching what — I can actually improve my content based on data." /></FadeIn>
            <FadeIn delay={0.2}><TestimonialCard name="Rahul Kapoor" role="Engineering Student" initials="RK" color="linear-gradient(135deg, hsl(45, 90%, 55%), #f39c12)" text="The Learning Player is gorgeous. Side-by-side video and notes meant I didn't have to constantly switch tabs. My quiz scores improved significantly." /></FadeIn>
            <FadeIn delay={0.3}><TestimonialCard name="Sneha Joshi" role="Data Science Instructor" initials="SJ" color="linear-gradient(135deg, hsl(348, 83%, 47%), #c0392b)" text="I uploaded a 45-minute video and it was on Cloudinary in seconds. The whole pipeline — upload, publish, student access — just works without any friction." /></FadeIn>
            <FadeIn delay={0.4}><TestimonialCard name="Dev Anand" role="Computer Science Student" initials="DA" color="linear-gradient(135deg, hsl(var(--color-secondary)), #8e44ad)" text="Got my certificate the moment I submitted my last assignment. It looked professional enough to add to my LinkedIn profile on the same day!" /></FadeIn>
            <FadeIn delay={0.5}><TestimonialCard name="Kavya Reddy" role="Instructor · 1 Course" initials="KR" color="linear-gradient(135deg, hsl(200, 80%, 55%), #2980b9)" text="The real-time instructor analytics are what sold me. Seeing that 78% of students skipped the third quiz, I rewrote the questions and retention jumped." /></FadeIn>
            <FadeIn delay={0.6}><TestimonialCard name="Anaya Patel" role="UX Design Student" initials="AP" color="linear-gradient(135deg, hsl(150, 60%, 50%), #27ae60)" text="The interface is so clean. Earning certificates actually feels incredibly rewarding on this platform when there's zero friction in the learning process." /></FadeIn>
            <FadeIn delay={0.7}><TestimonialCard name="Vikram Sharma" role="Software Engineer" initials="VS" color="linear-gradient(135deg, hsl(210, 80%, 55%), #3498db)" text="I use Academix to host my internal team training. The ability to track their progress down to the specific video timestamps they watched is an absolute gamechanger." /></FadeIn>
          </div>
        </div>
      </section>

      <section id="faq" style={{ padding: '7rem 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FAQ</span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '0.75rem' }}>Frequently Asked Questions</h2>
            </div>
          </FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div
                  className="glass-panel"
                  style={{ overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{faq.q}</span>
                    <ChevronDown size={18} color="hsl(var(--text-muted))" style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }} />
                  </div>
                  {openFaq === i && (
                    <div style={{ padding: '0 1.5rem 1.25rem', color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: 1.7, borderTop: '1px solid hsla(var(--color-border), 0.4)' }}>
                      <div style={{ paddingTop: '1rem' }}>{faq.a}</div>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '7rem 5%', background: 'hsla(var(--color-surface), 0.25)', borderTop: '1px solid hsla(var(--color-border), 0.4)' }}>
        <FadeIn>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: 76, height: 76, borderRadius: '1.5rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <GraduationCap size={36} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.25rem', lineHeight: 1.15 }}>
              Ready to Start Your<br />
              <span style={{ color: 'hsl(var(--text-secondary))' }}>
                Learning Journey?
              </span>
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.65 }}>
              Join thousands of students and instructors already using Academix. Set up takes less than a minute.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 25px -5px hsla(var(--color-primary), 0.4)' }} onClick={() => navigate('/register')}>
                Create Free Account <ArrowRight size={16} />
              </button>
              <button className="btn btn-surface" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '0.625rem' }} onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>

          </div>
        </FadeIn>
      </section>

      <footer style={{ padding: '3rem 5%', borderTop: '1px solid hsla(var(--color-border), 0.5)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.82rem' }}>© 2026 Academix. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy Policy', 'Terms of Service', 'System Status'].map(link => (
                <a key={link} href="#" style={{ color: 'hsl(var(--text-muted))', fontSize: '0.82rem', textDecoration: 'none' }}>{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
