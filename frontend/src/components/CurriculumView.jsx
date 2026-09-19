import React, { useState, useEffect } from 'react';
import { PlayCircle, ArrowRight, BookOpen, Award, HelpCircle } from 'lucide-react';

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
        "Correct. You have verified the quantum transformation." :
        "Incorrect. Review the theory notes and circuit representation."
    });

    if (isCorrect) {
      setUserScore((prev) => prev + 50);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', padding: '0 24px 24px 24px', flex: 1 }}>
      {/* Left Sidebar: Modules & Lessons Navigation */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              Curriculum Index
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Academic modules &amp; exercises
            </span>
          </div>
          <span style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: '#ffffff',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            padding: '3px 10px',
            borderRadius: '9999px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            {userScore} PTS
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          {modules.map((mod) => (
            <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: '#a1a1aa', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                {mod.title}
              </div>
              {mod.lessons.map((les) => (
                <button
                  key={les.id}
                  onClick={() => handleSelectLesson(les)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    background: activeLesson?.id === les.id ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activeLesson?.id === les.id ? '#ffffff' : 'rgba(255, 255, 255, 0.08)'}`,
                    color: activeLesson?.id === les.id ? '#000000' : '#a1a1aa',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '0.82rem',
                    fontWeight: activeLesson?.id === les.id ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: activeLesson?.id === les.id ? '0 0 16px rgba(255, 255, 255, 0.25)' : 'none',
                  }}
                >
                  <span>{les.title}</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>
                    {les.duration_min}m
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right Main Content: Lesson Reader & Interactive Challenge */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 24, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {activeLesson ? (
          <>
            {/* Title & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#a1a1aa',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  display: 'inline-block',
                  marginBottom: '8px'
                }}>
                  {activeLesson.difficulty} · {activeLesson.duration_min} Minutes
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.03em', margin: 0, textTransform: 'uppercase' }}>
                  {activeLesson.title}
                </h2>
              </div>

              {activeLesson.preset_circuit && (
                <button
                  onClick={handleOpenInStudio}
                  className="btn-overview-primary"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: 'none',
                    color: '#000000',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <PlayCircle size={14} /> Open in Circuit Studio <ArrowRight size={12} />
                </button>
              )}
            </div>

            {/* Theory Text */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '20px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              lineHeight: '1.7',
              fontSize: '0.92rem',
              color: '#d4d4d8'
            }}>
              <p>{activeLesson.theory_md}</p>
            </div>

            {/* Quiz Section */}
            {activeLesson.quiz && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
                borderRadius: '14px',
                padding: '22px'
              }}>
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                    Concept Check
                  </span>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>
                    {activeLesson.quiz.question_string}
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {activeLesson.quiz.options_array.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => !quizSubmitted && setSelectedQuizAnswer(idx)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        textAlign: 'left',
                        fontSize: '0.84rem',
                        cursor: quizSubmitted ? 'default' : 'pointer',
                        background: selectedQuizAnswer === idx ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${selectedQuizAnswer === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: '#fff',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <strong style={{ color: '#a1a1aa', marginRight: '6px', fontFamily: 'var(--font-mono)' }}>{String.fromCharCode(65 + idx)}.</strong>
                      {opt}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={selectedQuizAnswer === null}
                      className="btn-overview-primary"
                      style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: 'none',
                        color: '#000000',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: selectedQuizAnswer === null ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      Submit Verification
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: quizResult?.isCorrect ? '#10b981' : '#f87171' }}>
                      {quizResult?.explanation}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#a1a1aa', padding: '50px' }}>
            Select a curriculum module from the index.
          </div>
        )}
      </div>
    </div>
  );
}
