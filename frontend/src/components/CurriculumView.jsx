import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, HelpCircle, Award, PlayCircle, ArrowRight } from 'lucide-react';

export default function CurriculumView({ onLoadCircuitPreset, onSwitchToStudio }) {
  const [modules, setModules] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [userScore, setUserScore] = useState(150);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/curriculum/modules')
      .then((res) => res.json())
      .then((data) => {
        setModules(data);
        if (data.length > 0 && data[0].lessons.length > 0) {
          setActiveLesson(data[0].lessons[0]);
        }
      })
      .catch((err) => console.error("Curriculum fetch error:", err));
  }, []);

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  const handleOpenInStudio = () => {
    if (activeLesson?.preset_circuit) {
      onLoadCircuitPreset(activeLesson.preset_circuit);
      onSwitchToStudio();
    }
  };

  const handleSubmitQuiz = async () => {
    if (selectedQuizAnswer === null || !activeLesson?.quiz) return;
    const isCorrect = selectedQuizAnswer === activeLesson.quiz.valid_index_pointer;

    setQuizSubmitted(true);
    setQuizResult({
      isCorrect,
      explanation: isCorrect ?
        "Perfect! You've mastered the quantum state transformation for this concept." :
        "Incorrect. Review the theory notes and circuit representation above!"
    });

    if (isCorrect) {
      setUserScore((prev) => prev + 50);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', padding: '0 24px 24px 24px', flex: 1 }}>
      {/* Left Sidebar: Modules & Lessons Navigation */}
      <div className="liquid-glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} className="bklit-text-cyan" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Curriculum Index</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 98, 254, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '4px 10px', borderRadius: '4px' }}>
            <Award size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8', textShadow: '0 0 6px rgba(56, 189, 248, 0.6)' }}>Qiskit 1.0</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          {modules.map((mod) => (
            <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                {mod.title}
              </div>
              {mod.lessons.map((les) => (
                <button
                  key={les.id}
                  onClick={() => handleSelectLesson(les)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '4px',
                    textAlign: 'left',
                    background: activeLesson?.id === les.id ? 'rgba(15, 98, 254, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activeLesson?.id === les.id ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                    boxShadow: activeLesson?.id === les.id ? '0 0 14px rgba(15, 98, 254, 0.4)' : 'none',
                    color: activeLesson?.id === les.id ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{les.title}</span>
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8', padding: '2px 6px', background: 'rgba(15, 98, 254, 0.2)', borderRadius: '4px' }}>
                    {les.duration_min}m
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right Main Content: Lesson Reader & Interactive Challenge */}
      <div className="liquid-glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', borderRadius: '8px' }}>
        {activeLesson ? (
          <>
            {/* Title & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '16px' }}>
              <div>
                <span className="bklit-text-cyan" style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {activeLesson.difficulty} • {activeLesson.duration_min} Minutes
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px', color: '#f8fafc', textShadow: '0 0 12px rgba(255,255,255,0.3)' }}>
                  {activeLesson.title}
                </h2>
              </div>

              {activeLesson.preset_circuit && (
                <button className="btn btn-primary" onClick={handleOpenInStudio}>
                  <PlayCircle size={16} /> Load in Circuit Studio <ArrowRight size={14} />
                </button>
              )}
            </div>

            {/* Theory Text */}
            <div style={{ background: 'rgba(5, 7, 13, 0.7)', padding: '20px 24px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.12)', lineHeight: '1.75', fontSize: '0.94rem', color: '#e2e8f0', boxShadow: 'inset 0 0 14px rgba(0,0,0,0.6)' }}>
              <p>{activeLesson.theory_md}</p>
            </div>

            {/* Quiz Section (BKLIT LED Container) */}
            {activeLesson.quiz && (
              <div className="bklit-container" style={{ borderRadius: '6px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={18} className="bklit-text-cyan" />
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', textShadow: '0 0 8px rgba(255,255,255,0.4)' }}>
                    Interactive Concept Check
                  </h4>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '14px', fontWeight: 500 }}>
                  {activeLesson.quiz.question_string}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {activeLesson.quiz.options_array.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => !quizSubmitted && setSelectedQuizAnswer(idx)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '4px',
                        textAlign: 'left',
                        fontSize: '0.82rem',
                        cursor: quizSubmitted ? 'default' : 'pointer',
                        background: selectedQuizAnswer === idx ? 'rgba(15, 98, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${selectedQuizAnswer === idx ? '#0F62FE' : 'var(--border-subtle)'}`,
                        color: '#fff',
                        transition: 'all 0.2s'
                      }}
                    >
                      <strong style={{ color: '#38bdf8', marginRight: '6px' }}>{String.fromCharCode(65 + idx)}.</strong>
                      {opt}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {!quizSubmitted ? (
                    <button
                      className="btn btn-accent"
                      onClick={handleSubmitQuiz}
                      disabled={selectedQuizAnswer === null}
                    >
                      Submit Verification
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: quizResult?.isCorrect ? '#34d399' : '#f87171' }}>
                      {quizResult?.explanation}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '50px' }}>
            Select a curriculum module from the index.
          </div>
        )}
      </div>
    </div>
  );
}
