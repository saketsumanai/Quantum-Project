import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Award,
  PlayCircle,
  ArrowRight,
  RefreshCw,
  Zap,
  Sparkles
} from 'lucide-react';
import MathBlock, { LaTeXText } from './MathBlock';

export default function CurriculumView({ onLoadCircuitPreset, onSwitchToStudio }) {
  const { authFetch } = useAuth();
  const [modules, setModules] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [userScore, setUserScore] = useState(150);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/curriculum/modules')
      .then((res) => res.json())
      .then((data) => {
        setModules(data);
        if (data.length > 0 && data[0].lessons.length > 0) {
          const firstLesson = data[0].lessons[0];
          setActiveLesson(firstLesson);
          loadDynamicQuizForLesson(firstLesson);
        }
      })
      .catch((err) => console.error("Curriculum fetch error:", err));
  }, []); // eslint-disable-line

  const loadDynamicQuizForLesson = useCallback(async (lesson) => {
    if (!lesson) return;
    setIsGeneratingQuiz(true);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
    setQuizResult(null);

    // Derive topic keyword from title
    const topicKeywords = ['superposition', 'entanglement', 'grover', 'teleportation', 'qec', 'vqe'];
    const titleLower = lesson.title.toLowerCase();
    const matchedTopic = topicKeywords.find((k) => titleLower.includes(k)) || 'superposition';

    try {
      const res = await authFetch('/assessment/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: matchedTopic,
          lesson_id: lesson.id,
          difficulty: lesson.difficulty?.toLowerCase() || 'beginner',
          count: 1,
        }),
      });
      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        setCurrentQuiz(data.questions[0]);
      } else if (lesson.quiz) {
        setCurrentQuiz({
          id: `quiz_${lesson.id}`,
          question_string: lesson.quiz.question_string,
          options_array: lesson.quiz.options_array,
          valid_index_pointer: lesson.quiz.valid_index_pointer,
          points: 50,
        });
      }
    } catch (err) {
      console.warn("Dynamic quiz generation fallback:", err);
      if (lesson.quiz) {
        setCurrentQuiz({
          id: `quiz_${lesson.id}`,
          question_string: lesson.quiz.question_string,
          options_array: lesson.quiz.options_array,
          valid_index_pointer: lesson.quiz.valid_index_pointer,
          points: 50,
        });
      }
    } finally {
      setIsGeneratingQuiz(false);
    }
  }, [authFetch]);

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
    loadDynamicQuizForLesson(lesson);
  };

  const handleOpenInStudio = () => {
    if (activeLesson?.preset_circuit) {
      onLoadCircuitPreset(activeLesson.preset_circuit);
      onSwitchToStudio();
    }
  };

  const handleSubmitQuiz = async () => {
    if (selectedQuizAnswer === null || !currentQuiz) return;

    try {
      const res = await authFetch('/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: currentQuiz.id,
          selected_option_index: selectedQuizAnswer,
          time_taken_seconds: 15,
        }),
      });
      const data = await res.json();
      setQuizSubmitted(true);
      setQuizResult({
        isCorrect: data.is_correct,
        explanation: data.explanation,
        pointsEarned: data.points_earned,
        mastery: data.user_mastery,
      });

      if (data.is_correct) {
        setUserScore((prev) => prev + (data.points_earned || 50));
      }
    } catch (err) {
      console.error("Quiz submission error:", err);
      // Client-side fallback
      const isCorrect = selectedQuizAnswer === (currentQuiz.valid_index_pointer ?? 0);
      setQuizSubmitted(true);
      setQuizResult({
        isCorrect,
        explanation: isCorrect ?
          "Perfect! You've mastered the quantum state transformation for this concept." :
          "Incorrect. Review the theory notes and circuit representation above!",
        pointsEarned: isCorrect ? 50 : 0,
      });
      if (isCorrect) setUserScore((prev) => prev + 50);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', padding: '0 24px 24px 24px', flex: 1 }}>
      {/* Left Sidebar: Modules & Lessons Navigation */}
      <div className="liquid-glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} className="bklit-text-cyan" />
            <h3 style={{
              fontFamily: "'Times New Roman', Times, serif !important",
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#f8fafc',
              textShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}>
              Curriculum Index
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 98, 254, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '4px 10px', borderRadius: '4px' }}>
            <Award size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8', textShadow: '0 0 6px rgba(56, 189, 248, 0.6)' }}>Qiskit 1.0</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          {modules.map((mod) => (
            <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 600 }}>
                {mod.title}
              </span>
              {mod.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    background: activeLesson?.id === lesson.id ? 'rgba(15, 98, 254, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activeLesson?.id === lesson.id ? '#0F62FE' : 'transparent'}`,
                    color: activeLesson?.id === lesson.id ? '#38bdf8' : '#e2e8f0',
                    fontSize: '0.84rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lesson.title}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {lesson.duration_min}m
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right Main Content: Lesson Reader & Dynamic Interactive Challenge */}
      <div className="liquid-glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', borderRadius: '8px' }}>
        {activeLesson ? (
          <>
            {/* Title & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '16px' }}>
              <div>
                <span className="bklit-text-cyan" style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {activeLesson.difficulty} • {activeLesson.duration_min} Minutes
                </span>
                <h2 style={{
                  fontFamily: "'Times New Roman', Times, serif !important",
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  marginTop: '4px',
                  color: '#f8fafc',
                  textShadow: '0 0 12px rgba(255,255,255,0.3)'
                }}>
                  {activeLesson.title}
                </h2>
              </div>

              {activeLesson.preset_circuit && (
                <button className="btn btn-primary" onClick={handleOpenInStudio}>
                  <PlayCircle size={16} /> Load in Circuit Studio <ArrowRight size={14} />
                </button>
              )}
            </div>

            {/* Theory Text with KaTeX Parsing */}
            <div style={{ background: 'rgba(5, 7, 13, 0.7)', padding: '20px 24px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.12)', lineHeight: '1.75', fontSize: '0.94rem', color: '#e2e8f0', boxShadow: 'inset 0 0 14px rgba(0,0,0,0.6)' }}>
              <LaTeXText text={activeLesson.theory_md} />
            </div>

            {/* Dynamic Interactive Quiz Section */}
            {currentQuiz && (
              <div className="bklit-container" style={{ borderRadius: '6px', padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={18} className="bklit-text-cyan" />
                    <h4 style={{
                      fontFamily: "'Times New Roman', Times, serif !important",
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#f8fafc',
                      textShadow: '0 0 8px rgba(255,255,255,0.4)',
                      margin: 0
                    }}>
                      Interactive Concept Check
                    </h4>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                      Dynamic AI Assessment
                    </span>
                  </div>

                  <button
                    onClick={() => loadDynamicQuizForLesson(activeLesson)}
                    disabled={isGeneratingQuiz}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#94a3b8',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    title="Generate another randomized problem on this topic"
                  >
                    <RefreshCw size={12} className={isGeneratingQuiz ? 'spin-icon' : ''} />
                    New Question
                  </button>
                </div>

                <div style={{ fontSize: '0.9rem', color: '#f1f5f9', marginBottom: '8px', fontWeight: 500, lineHeight: 1.6 }}>
                  <LaTeXText text={currentQuiz.question_string} />
                </div>

                {currentQuiz.latex_formula && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '10px 16px', borderRadius: '4px', textAlign: 'center', color: '#38bdf8', fontSize: '0.9rem' }}>
                    <MathBlock math={currentQuiz.latex_formula} inline={true} />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                  {currentQuiz.options_array?.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => !quizSubmitted && setSelectedQuizAnswer(idx)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '4px',
                        textAlign: 'left',
                        fontSize: '0.84rem',
                        cursor: quizSubmitted ? 'default' : 'pointer',
                        background: selectedQuizAnswer === idx ? 'rgba(15, 98, 254, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${selectedQuizAnswer === idx ? '#38bdf8' : 'var(--border-subtle)'}`,
                        color: '#fff',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}
                    >
                      <strong style={{ color: '#38bdf8', minWidth: '18px' }}>{String.fromCharCode(65 + idx)}.</strong>
                      <span><LaTeXText text={opt} /></span>
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  {!quizSubmitted ? (
                    <button
                      className="btn btn-accent"
                      onClick={handleSubmitQuiz}
                      disabled={selectedQuizAnswer === null}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Zap size={14} /> Submit Live Verification (+50 XP)
                    </button>
                  ) : (
                    <div style={{
                      padding: '12px 18px',
                      borderRadius: '6px',
                      background: quizResult?.isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      border: `1px solid ${quizResult?.isCorrect ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          color: quizResult?.isCorrect ? '#34d399' : '#f87171',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {quizResult?.isCorrect ? <CheckCircle2 size={16} /> : null}
                          {quizResult?.isCorrect ? "Verification Passed! (+50 XP)" : "Verification Failed"}
                        </span>
                        {quizResult?.mastery && (
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                            Domain Mastery: {quizResult.mastery.mastery_percentage}%
                          </span>
                        )}
                      </div>
                      <div style={{ margin: 0, fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                        <LaTeXText text={quizResult?.explanation} />
                      </div>
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
