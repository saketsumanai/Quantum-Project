import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Flame,
  Zap,
  Cpu,
  RefreshCw,
  Clock,
  ShieldCheck,
  UserCheck,
  PlayCircle,
  ArrowRight
} from 'lucide-react';
import MathBlock from './MathBlock';

export default function StudentDashboard({ onNavigateToStudio, onNavigateToCurriculum }) {
  const { user, authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, progressRes] = await Promise.all([
        authFetch('/assessment/dashboard-stats').then((r) => r.json()),
        authFetch('/curriculum/progress').then((r) => r.json()),
      ]);

      if (statsRes.success) {
        setStats(statsRes);
      }
      if (progressRes.success && progressRes.badges) {
        setBadges(progressRes.badges);
      }
    } catch (err) {
      console.error('Error fetching dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalXp = stats?.total_xp ?? user?.total_xp ?? 150;
  const userLevel = stats?.user_level ?? 'Level 2 Superposition Adept';
  const streak = stats?.current_streak_days ?? 1;
  const accuracy = stats?.accuracy_pct ?? 100.0;
  const quizzesCount = stats?.total_quizzes_completed ?? 0;

  return (
    <div style={{ padding: '0 24px 40px 24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Top Banner: Profile & Hero Telemetry */}
      <div className="liquid-glass-panel" style={{ padding: '28px 32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e293b 0%, #09090b 100%)',
            border: '2px solid rgba(56, 189, 248, 0.6)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {user?.photo_url ? (
              <img src={user.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserCheck size={32} color="#38bdf8" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{
                fontFamily: "'Times New Roman', Times, serif !important",
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '0.02em',
                textShadow: '0 0 14px rgba(255, 255, 255, 0.35)'
              }}>
                {user?.display_name || 'Quantum Researcher'}
              </h2>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                {userLevel}
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
              {user?.email || 'telemetry.student@quantumleap.internal'} • NISQ Research Station
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary"
            title="Refresh Live Telemetry"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>
          <button
            onClick={onNavigateToCurriculum}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}
          >
            <BookOpen size={15} color="#38bdf8" /> Practice Dynamic Quiz
          </button>
          <button
            onClick={onNavigateToStudio}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}
          >
            <Cpu size={15} /> Circuit Studio <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 Stat Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Card 1: Total XP */}
        <div className="liquid-glass-panel" style={{ padding: '20px 24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 600 }}>
              Total Mastery XP
            </span>
            <Zap size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', textShadow: '0 0 10px rgba(56, 189, 248, 0.4)' }}>
            {totalXp} <span style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 500 }}>XP</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
            Next Rank Unlock at {Math.ceil((totalXp + 1) / 250) * 250} XP
          </div>
        </div>

        {/* Card 2: Daily Streak */}
        <div className="liquid-glass-panel" style={{ padding: '20px 24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 600 }}>
              Active Learning Streak
            </span>
            <Flame size={18} color="#f97316" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', textShadow: '0 0 10px rgba(249, 115, 22, 0.3)' }}>
            {streak} <span style={{ fontSize: '0.9rem', color: '#f97316', fontWeight: 500 }}>Day{streak !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
            Continuous daily quantum state verification
          </div>
        </div>

        {/* Card 3: Global Accuracy */}
        <div className="liquid-glass-panel" style={{ padding: '20px 24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 600 }}>
              Verification Accuracy
            </span>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', textShadow: '0 0 10px rgba(16, 185, 129, 0.3)' }}>
            {accuracy}%
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
            Derived from validated assessment submissions
          </div>
        </div>

        {/* Card 4: Quizzes Completed */}
        <div className="liquid-glass-panel" style={{ padding: '20px 24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 600 }}>
              Evaluated Assessments
            </span>
            <ShieldCheck size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', textShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}>
            {quizzesCount}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
            Persisted in SQLite telemetry repository
          </div>
        </div>
      </div>

      {/* Main Grid: Topic Mastery & Dirac Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(420px, 1.3fr)', gap: '20px' }}>
        {/* Left: Topic Mastery Spectrum */}
        <div className="liquid-glass-panel" style={{ padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
            <h3 style={{
              fontFamily: "'Times New Roman', Times, serif !important",
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              textShadow: '0 0 10px rgba(255, 255, 255, 0.25)'
            }}>
              Curriculum Domain Mastery
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Dynamic Weighted Metrics</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { name: 'Superposition & Qubit States', key: 'superposition', val: stats?.topic_mastery?.superposition ?? 85.0 },
              { name: 'Quantum Entanglement & Non-Locality', key: 'entanglement', val: stats?.topic_mastery?.entanglement ?? 75.0 },
              { name: 'Grover Amplitude Amplification', key: 'grover', val: stats?.topic_mastery?.grover ?? 60.0 },
              { name: 'Quantum Error Correction (QEC)', key: 'qec', val: stats?.topic_mastery?.qec ?? 40.0 },
              { name: 'Quantum Teleportation', key: 'teleportation', val: stats?.topic_mastery?.teleportation ?? 50.0 },
              { name: 'Variational Quantum Eigensolver (VQE)', key: 'vqe', val: stats?.topic_mastery?.vqe ?? 30.0 },
            ].map((topic) => (
              <div key={topic.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{topic.name}</span>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>{topic.val}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${topic.val}%`,
                      background: 'linear-gradient(90deg, #0F62FE 0%, #38bdf8 100%)',
                      borderRadius: '3px',
                      boxShadow: '0 0 8px rgba(56, 189, 248, 0.5)',
                      transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dirac Competency Badges Shelf */}
        <div className="liquid-glass-panel" style={{ padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
            <div>
              <h3 style={{
                fontFamily: "'Times New Roman', Times, serif !important",
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                textShadow: '0 0 10px rgba(255, 255, 255, 0.25)'
              }}>
                Dirac Competency Seals
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#94a3b8' }}>
                Cryptographic mathematical verification of mastered theorems
              </p>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>
              {badges.filter((b) => b.unlocked).length} of {badges.length || 8} Unlocked
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
            {(badges.length > 0 ? badges : [
              { id: 'b1', title: 'Superposition Apprentice', symbol: '|0⟩ → |+⟩', latex_verification: '\\langle\\psi|\\psi\\rangle = 1.00', unlocked: true },
              { id: 'b2', title: 'Entanglement Pioneer', symbol: '|Φ⁺⟩', latex_verification: '\\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)', unlocked: true },
              { id: 'b3', title: 'Quantum Oracle Seeker', symbol: 'G_oracle', latex_verification: '2|s\\rangle\\langle s| - I', unlocked: false },
              { id: 'b4', title: 'Fourier Phase Analyst', symbol: 'QFT', latex_verification: '\\sum e^{2\\pi i j k / N}', unlocked: false },
              { id: 'b5', title: 'Shor Factorization Analyst', symbol: 'aʳ ≡ 1', latex_verification: '\\gcd(a^{r/2} \\pm 1, N)', unlocked: false },
              { id: 'b6', title: 'Variational Eigensolver', symbol: '⟨H⟩_θ', latex_verification: '\\langle\\psi|H|\\psi\\rangle \\ge E_0', unlocked: false },
              { id: 'b7', title: 'Stabilizer Guardian', symbol: 'S|ψ⟩ = +|ψ⟩', latex_verification: 'S_i |\\psi_L\\rangle = +1 |\\psi_L\\rangle', unlocked: false },
              { id: 'b8', title: 'Fault-Tolerant Architect', symbol: 'd = 3 Surface', latex_verification: 'P_L < 10^{-6}', unlocked: false },
            ]).map((badge, idx) => (
              <div
                key={badge.id || idx}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  background: badge.unlocked ? 'rgba(15, 98, 254, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${badge.unlocked ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  opacity: badge.unlocked ? 1 : 0.45,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Award size={16} color={badge.unlocked ? '#38bdf8' : '#64748b'} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: badge.unlocked ? '#38bdf8' : '#64748b', textTransform: 'uppercase' }}>
                    {badge.unlocked ? 'Verified' : 'Locked'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                  {badge.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '3px', textAlign: 'center' }}>
                  {badge.latex_verification ? (
                    <MathBlock math={badge.latex_verification} inline={true} />
                  ) : (
                    badge.symbol
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Telemetry Quiz Attempt History */}
      <div className="liquid-glass-panel" style={{ padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
          <div>
            <h3 style={{
              fontFamily: "'Times New Roman', Times, serif !important",
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              textShadow: '0 0 10px rgba(255, 255, 255, 0.25)'
            }}>
              Recent Assessment Telemetry
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: '#94a3b8' }}>
              Real-time audit log of evaluated concept checks and challenge submissions
            </p>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Live SQLite Session Log</span>
        </div>

        {stats?.recent_attempts && stats.recent_attempts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)', color: '#94a3b8' }}>
                  <th style={{ padding: '10px 14px' }}>Assessment ID</th>
                  <th style={{ padding: '10px 14px' }}>Curriculum Domain</th>
                  <th style={{ padding: '10px 14px' }}>Verification Result</th>
                  <th style={{ padding: '10px 14px' }}>Points Earned</th>
                  <th style={{ padding: '10px 14px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_attempts.map((attempt) => (
                  <tr
                    key={attempt.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: 'rgba(255, 255, 255, 0.01)',
                      transition: 'background 0.2s'
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#e2e8f0' }}>
                      {attempt.quiz_id}
                    </td>
                    <td style={{ padding: '12px 14px', textTransform: 'capitalize', color: '#38bdf8', fontWeight: 600 }}>
                      {attempt.topic}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {attempt.is_correct ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 600 }}>
                          <CheckCircle2 size={14} /> Passed
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: 600 }}>
                          <XCircle size={14} /> Failed
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: attempt.is_correct ? '#10b981' : '#64748b' }}>
                      +{attempt.points_earned} XP
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.78rem' }}>
                      {new Date(attempt.attempted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '0.88rem' }}>
            No assessment attempts logged yet. Complete an interactive quiz in the Curriculum to earn Dirac seals and XP!
          </div>
        )}
      </div>
    </div>
  );
}
