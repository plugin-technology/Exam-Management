import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* SECTION 1: HERO SECTION */}
      <section className="hero-section">
        <div className="hero-badge">
          <span>✨ Enterprise Cloud Assessment Engine 2026</span>
        </div>
        <h1 className="hero-title">
          Next-Generation Digital <br />
          <span className="hero-gradient-text">Examination & Proctoring</span>
        </h1>
        <p className="hero-subtitle">
          Empowering educational institutions and enterprises with real-time automated grading,
          anti-cheat countdown delivery, and verifiable PDF certification—wrapped in an ultra-modern glassmorphic interface.
        </p>

        <div className="hero-cta-group">
          <Link to="/login" className="btn btn-primary btn-hero-primary">
            🚀 Launch Portal / Sign In
          </Link>
          <Link to="/register" className="btn btn-secondary btn-hero-secondary">
            🎓 Register Student Account
          </Link>
        </div>

        {/* Hero Interactive Glass Preview Card */}
        <div className="glass-panel hero-floating-preview">
          <div className="preview-top-bar">
            <div className="preview-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="preview-status">
              <span>● Proctored Engine Active</span>
            </div>
          </div>
          <div className="preview-body">
            <div className="preview-stat-pill">
              <strong>99.98%</strong> Submission Uptime
            </div>
            <div className="preview-stat-pill">
              <strong>0.00s</strong> Instant Grading Latency
            </div>
            <div className="preview-stat-pill">
              <strong>100%</strong> Tamper-Proof Timers
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ARCHITECTURE & CORE PLATFORM CAPABILITIES */}
      <section id="features" className="landing-section">
        <div className="section-header-center">
          <span className="section-tag">Core Features</span>
          <h2>Engineered for Precision & Integrity</h2>
          <p>Everything required to conduct large-scale, high-stakes assessments securely.</p>
        </div>

        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon icon-cyan">⏱️</div>
            <h3>Server-Synced Countdown</h3>
            <p>
              Strict server-recorded timestamps eliminate client-side clock tampering. Automated forced submission on timer expiration guarantees parity.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon icon-purple">⚡</div>
            <h3>Instant Real-Time Evaluation</h3>
            <p>
              Instantaneous algorithmic grading upon test submission calculates scores, percentages, and performance breakdowns in milliseconds.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon icon-emerald">🏆</div>
            <h3>Competitive Leaderboards</h3>
            <p>
              Dynamic percentile ranking using score efficiency and precise microsecond completion timestamps to break ties transparently.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon icon-pink">📜</div>
            <h3>Verifiable PDF Certificates</h3>
            <p>
              Automated iText PDF generation delivers formal, tamper-evident examination certificates with performance metrics directly to candidates.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon icon-blue">📚</div>
            <h3>Multi-Item Question Bank</h3>
            <p>
              Comprehensive administration supporting MCQs, True/False, and Fill-in-the-blank items with subject tagging and difficulty scaling.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon icon-amber">🛡️</div>
            <h3>Strict RBAC & JWT Security</h3>
            <p>
              Stateless JWT authentication enforcing strict role-based permission boundaries between Students and Administrators.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: STEP-BY-STEP HOW IT WORKS */}
      <section id="workflow" className="landing-section">
        <div className="section-header-center">
          <span className="section-tag">Evaluation Lifecycle</span>
          <h2>How The Platform Operates</h2>
          <p>A streamlined, 4-step workflow from configuration to final scorecard.</p>
        </div>

        <div className="workflow-steps-grid">
          <div className="glass-card step-card">
            <div className="step-number">01</div>
            <h3>Author Question Bank</h3>
            <p>Instructors curate items with marks, subject tags, and difficulty tiers in the central repository.</p>
          </div>

          <div className="glass-card step-card">
            <div className="step-number">02</div>
            <h3>Configure & Schedule</h3>
            <p>Define duration, start and end windows, and assign questions to produce an active assessment.</p>
          </div>

          <div className="glass-card step-card">
            <div className="step-number">03</div>
            <h3>Candidate Delivery</h3>
            <p>Students access their dedicated workspace and take tests with a clean, distraction-free live interface.</p>
          </div>

          <div className="glass-card step-card">
            <div className="step-number">04</div>
            <h3>Instant Score & Export</h3>
            <p>Immediate result display with leaderboard standing and instantaneous download of certified PDFs.</p>
          </div>
        </div>
      </section>

      {/* SECTION 4: ENTERPRISE TELEMETRY & STATS */}
      <section className="landing-section">
        <div className="glass-panel stats-banner">
          <div className="stat-banner-item">
            <h3>10,000+</h3>
            <p>Concurrent Tests Delivered</p>
          </div>
          <div className="stat-banner-divider"></div>
          <div className="stat-banner-item">
            <h3>99.99%</h3>
            <p>Proctor Reliability</p>
          </div>
          <div className="stat-banner-divider"></div>
          <div className="stat-banner-item">
            <h3>50,000+</h3>
            <p>Generated PDF Scorecards</p>
          </div>
          <div className="stat-banner-divider"></div>
          <div className="stat-banner-item">
            <h3>&lt; 50ms</h3>
            <p>API Evaluation Latency</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: ROLES & USER WORKSPACES */}
      <section id="personas" className="landing-section">
        <div className="section-header-center">
          <span className="section-tag">User Experience</span>
          <h2>Tailored for Every Stakeholder</h2>
          <p>Dedicated workspaces built with specialized tools for each persona.</p>
        </div>

        <div className="personas-grid">
          <div className="glass-card persona-card">
            <div className="persona-badge">👨‍🏫 Administrators & Faculty</div>
            <h3>Instructor Command Center</h3>
            <ul className="persona-list">
              <li>✓ Bento-box telemetry overview for exam monitoring</li>
              <li>✓ Full CRUD control over the multi-tier Question Bank</li>
              <li>✓ Instant exam scheduler with custom duration controls</li>
              <li>✓ Systemic analytics and audit logging</li>
            </ul>
            <Link to="/login" className="btn btn-secondary btn-block">
              Open Admin Portal →
            </Link>
          </div>

          <div className="glass-card persona-card">
            <div className="persona-badge" style={{ color: 'var(--accent-purple)', borderColor: 'rgba(168, 85, 247, 0.4)' }}>
              🎓 Candidates & Students
            </div>
            <h3>Student Performance Hub</h3>
            <ul className="persona-list">
              <li>✓ Clean distraction-free assessment environment</li>
              <li>✓ Client-synced countdown timer with auto-submit protection</li>
              <li>✓ Instant visual scorecards & global leaderboard ranks</li>
              <li>✓ Verified longitudinal history with 1-click PDF export</li>
            </ul>
            <Link to="/login" className="btn btn-primary btn-block">
              Open Candidate Portal →
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6: READY TO START CALL TO ACTION */}
      <section className="landing-section cta-final-section">
        <div className="glass-card cta-card">
          <h2>Ready to Experience Modern Assessments?</h2>
          <p>
            Join educators and students enjoying secure, automated, and beautiful examinations today.
          </p>
          <div className="hero-cta-group" style={{ justifyContent: 'center', marginTop: '24px' }}>
            <Link to="/login" className="btn btn-primary btn-hero-primary">
              🔑 Sign In to Portal
            </Link>
            <Link to="/register" className="btn btn-secondary btn-hero-secondary">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>📝 ExamPortal</h3>
            <p>Enterprise Assessment & Proctoring System</p>
          </div>
          <div className="footer-meta">
            <span>Powered by Spring Boot 3 & React 18 in Docker</span>
            <span>ACID Compliant • Strict RBAC • PDF Certification</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
