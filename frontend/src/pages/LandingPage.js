import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';

// Styles
const styles = {
  // Main container
  pageWrapper: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  
  // Hero section
  heroSection: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 25%, #9333EA 50%, #7C3AED 75%, #6D28D9 100%)',
    position: 'relative',
    overflow: 'hidden'
  },
  
  // Navigation
  nav: {
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '12px 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'white',
    margin: 0,
    letterSpacing: '1.5px'
  },
  navButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  contactBtn: {
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease'
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  
  // Hero content
  heroContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '80px 24px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    alignItems: 'center',
    minHeight: 'calc(100vh - 160px)'
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '30px',
    padding: '8px 24px',
    marginBottom: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  badgeText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  heroTitle: {
    fontSize: 'clamp(3rem, 6vw, 4.5rem)',
    fontWeight: '900',
    color: 'white',
    marginBottom: '32px',
    lineHeight: '1.1'
  },
  heroTitleAccent: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B6B 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  heroDescription: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '40px',
    lineHeight: '1.7',
    maxWidth: '500px'
  },
  ctaButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },
  ctaPrimary: {
    background: 'white',
    color: '#7C3AED',
    border: 'none',
    padding: '18px 36px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease'
  },
  ctaSecondary: {
    background: 'transparent',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    padding: '16px 36px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  
  // Dashboard preview card
  dashboardCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(25px)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
    padding: '32px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px'
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },
  cardSubtitle: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0
  },
  cardIcon: {
    width: '52px',
    height: '52px',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px'
  },
  statCard: (color) => ({
    background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
    borderRadius: '14px',
    padding: '18px',
    border: `1px solid ${color}30`
  }),
  statLabel: (color) => ({
    color: color,
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: '6px',
    letterSpacing: '0.5px'
  }),
  statValue: {
    fontSize: '26px',
    fontWeight: '900',
    color: '#1f2937'
  },
  progressSection: {
    background: '#f8fafc',
    borderRadius: '14px',
    padding: '20px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  progressLabel: {
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  progressPercent: {
    color: '#8B5CF6',
    fontSize: '13px',
    fontWeight: '700'
  },
  progressBar: {
    width: '100%',
    background: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '10px',
    height: '10px',
    overflow: 'hidden',
    marginBottom: '10px'
  },
  progressFill: {
    width: '73%',
    height: '100%',
    background: 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)',
    borderRadius: '10px'
  },
  progressFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressAmount: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1f2937'
  },
  progressGoal: {
    color: '#64748b',
    fontSize: '13px'
  },
  
  // About section
  aboutSection: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    padding: '100px 0'
  },
  sectionContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: '2.75rem',
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: '16px'
  },
  sectionSubtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    maxWidth: '550px',
    margin: '0 auto 50px'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px'
  },
  featureCard: {
    background: 'white',
    padding: '36px',
    borderRadius: '18px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    textAlign: 'center',
    transition: 'transform 0.3s ease'
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '18px'
  },
  featureTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '12px'
  },
  featureDesc: {
    color: '#64748b',
    lineHeight: '1.6',
    fontSize: '0.95rem'
  },
  
  // Contact section
  contactSection: {
    background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    padding: '100px 0',
    color: 'white'
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '30px',
    marginBottom: '50px'
  },
  contactCard: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    borderRadius: '18px',
    padding: '36px',
    textAlign: 'center'
  },
  contactIcon: {
    fontSize: '2.5rem',
    marginBottom: '18px'
  },
  contactTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    marginBottom: '10px'
  },
  contactText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: '0.95rem',
    margin: '4px 0'
  },
  
  // Footer
  footer: {
    background: '#111827',
    padding: '30px 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white'
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '13px'
  }
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={styles.pageWrapper}>
      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        html { scroll-behavior: smooth; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .float { animation: float 5s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.8s ease forwards; }
      `}</style>

      {/* Hero Section */}
      <div style={styles.heroSection}>
        {/* Navigation */}
        <nav style={styles.nav}>
          <div style={styles.navContainer}>
            <div style={styles.logoWrapper}>
              <div style={styles.logoIcon}>
                <Target style={{ width: '26px', height: '26px', color: 'white' }} />
              </div>
              <h1 style={styles.logoText}>GoalArc</h1>
            </div>
            <div style={styles.navButtons}>
              <button onClick={scrollToContact} style={styles.contactBtn}>Contact Us</button>
              <button onClick={() => navigate('/auth')} style={styles.primaryBtn}>Get Started</button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <section style={styles.heroContent}>
          <div className={isLoaded ? 'fade-in' : ''} style={{ opacity: isLoaded ? 1 : 0 }}>
            <div style={styles.badge}>
              <span style={styles.badgeText}>🚀 AI-Powered Financial Intelligence</span>
            </div>
            <h1 style={styles.heroTitle}>
              Master Your Financial<br />
              <span style={styles.heroTitleAccent}>Future Today</span>
            </h1>
            <p style={styles.heroDescription}>
              Transform your financial journey with intelligent goal tracking, advanced analytics, and personalized insights that drive real results.
            </p>
            <div style={styles.ctaButtons}>
              <button onClick={() => navigate('/auth')} style={styles.ctaPrimary}>🎯 Start Your Journey</button>
              <button style={styles.ctaSecondary}>📊 Watch Demo</button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="float" style={{ opacity: isLoaded ? 1 : 0 }}>
            <div style={styles.dashboardCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Financial Hub</h3>
                  <p style={styles.cardSubtitle}>Smart goal tracking</p>
                </div>
                <div style={styles.cardIcon}>
                  <span style={{ color: 'white', fontSize: '22px', fontWeight: '800' }}>$</span>
                </div>
              </div>
              <div style={styles.statsGrid}>
                <div style={styles.statCard('#22c55e')}>
                  <div style={styles.statLabel('#22c55e')}>Portfolio Growth</div>
                  <div style={styles.statValue}>+24.7%</div>
                </div>
                <div style={styles.statCard('#3b82f6')}>
                  <div style={styles.statLabel('#3b82f6')}>Goals Achieved</div>
                  <div style={styles.statValue}>9/12</div>
                </div>
              </div>
              <div style={styles.progressSection}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>Emergency Fund</span>
                  <span style={styles.progressPercent}>73%</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={styles.progressFill}></div>
                </div>
                <div style={styles.progressFooter}>
                  <span style={styles.progressAmount}>₹18,750</span>
                  <span style={styles.progressGoal}>Goal: ₹25,000</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* About Section */}
      <section style={styles.aboutSection}>
        <div style={styles.sectionContainer}>
          <h2 style={styles.sectionTitle}>About Our Platform</h2>
          <p style={styles.sectionSubtitle}>
            GoalArc transforms how you approach financial planning with cutting-edge AI technology.
          </p>
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🎯</div>
              <h3 style={styles.featureTitle}>Smart Goal Tracking</h3>
              <p style={styles.featureDesc}>Set, monitor, and achieve your financial goals with AI-powered insights.</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📊</div>
              <h3 style={styles.featureTitle}>Advanced Analytics</h3>
              <p style={styles.featureDesc}>Gain deep insights with comprehensive reports and predictive modeling.</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🔒</div>
              <h3 style={styles.featureTitle}>Bank-Level Security</h3>
              <p style={styles.featureDesc}>Your data is protected with enterprise-grade encryption.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={styles.contactSection}>
        <div style={styles.sectionContainer}>
          <h2 style={{...styles.sectionTitle, color: 'white'}}>Ready to Transform Your Future?</h2>
          <p style={{...styles.sectionSubtitle, color: 'rgba(255,255,255,0.8)'}}>
            Get in touch with our team and start your journey towards financial freedom.
          </p>
          <div style={styles.contactGrid}>
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>📧</div>
              <h4 style={styles.contactTitle}>Email Us</h4>
              <p style={styles.contactText}>hello@goalarc.com</p>
              <p style={styles.contactText}>support@goalarc.com</p>
            </div>
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>📞</div>
              <h4 style={styles.contactTitle}>Call Us</h4>
              <p style={styles.contactText}>+1 (555) 123-4567</p>
              <p style={styles.contactText}>Mon-Fri 9AM-6PM EST</p>
            </div>
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>📍</div>
              <h4 style={styles.contactTitle}>Visit Us</h4>
              <p style={styles.contactText}>123 Innovation Drive</p>
              <p style={styles.contactText}>San Francisco, CA 94105</p>
            </div>
          </div>
          <button onClick={() => navigate('/auth')} style={{...styles.primaryBtn, padding: '18px 40px', fontSize: '17px'}}>
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerLogo}>
            <Target style={{ width: '28px', height: '28px', color: '#a78bfa' }} />
            <span style={{ fontSize: '18px', fontWeight: '700' }}>GoalArc</span>
          </div>
          <span style={styles.footerText}>© 2026 GoalArc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
