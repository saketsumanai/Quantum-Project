import React, { useState, useEffect } from 'react';
import {
  RotateCw, ChevronLeft, ChevronRight, Shuffle, CheckCircle,
  HelpCircle, Sparkles, X, Award, Lightbulb, BookOpen, Layers
} from 'lucide-react';
import MathRenderer, { LatexBlock } from './MathRenderer';
import { QUANTUM_FLASHCARD_DECKS, generateDynamicFlashcards } from '../data/quantumFlashcardsData';

/**
 * QuantumFlashcards — 3D Interactive Spaced-Repetition Study Decks
 * Adapted for Quantum Computing algorithm & physics mastery.
 */
export default function QuantumFlashcards({
  initialTopic = '',
  onClose,
  isModal = true,
  onDeepDive,
}) {
  const [deck, setDeck] = useState(() => {
    if (initialTopic) {
      return generateDynamicFlashcards(initialTopic);
    }
    return QUANTUM_FLASHCARD_DECKS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [masteryStats, setMasteryStats] = useState({});

  const currentCard = deck[currentIndex] || deck[0];
  const totalCards = deck.length;

  // Handle category filtering
  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    let filtered = QUANTUM_FLASHCARD_DECKS;
    if (cat !== 'All') {
      filtered = QUANTUM_FLASHCARD_DECKS.filter(c => c.category === cat);
    }
    setDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalCards]);

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev + 1) % totalCards);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev - 1 + totalCards) % totalCards);
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleRateMastery = (rating) => {
    setMasteryStats(prev => ({ ...prev, [currentCard.id]: rating }));
    setTimeout(() => {
      handleNext();
    }, 250);
  };

  if (!currentCard) return null;

  const categories = ['All', 'Foundations', 'Entanglement', 'Algorithms', 'Error Correction'];

  const CATEGORY_THEMES = {
    'Foundations': {
      badgeBg: 'rgba(56, 189, 248, 0.12)',
      badgeBorder: 'rgba(56, 189, 248, 0.32)',
      badgeText: '#7dd3fc',
      activeBg: 'rgba(56, 189, 248, 0.20)',
      activeBorder: 'rgba(56, 189, 248, 0.45)',
      accent: '#7dd3fc'
    },
    'Entanglement': {
      badgeBg: 'rgba(129, 140, 248, 0.12)',
      badgeBorder: 'rgba(129, 140, 248, 0.32)',
      badgeText: '#a5b4fc',
      activeBg: 'rgba(129, 140, 248, 0.20)',
      activeBorder: 'rgba(129, 140, 248, 0.45)',
      accent: '#a5b4fc'
    },
    'Algorithms': {
      badgeBg: 'rgba(251, 191, 36, 0.12)',
      badgeBorder: 'rgba(251, 191, 36, 0.32)',
      badgeText: '#fcd34d',
      activeBg: 'rgba(251, 191, 36, 0.20)',
      activeBorder: 'rgba(251, 191, 36, 0.45)',
      accent: '#fcd34d'
    },
    'Error Correction': {
      badgeBg: 'rgba(52, 211, 153, 0.12)',
      badgeBorder: 'rgba(52, 211, 153, 0.32)',
      badgeText: '#6ee7b7',
      activeBg: 'rgba(52, 211, 153, 0.20)',
      activeBorder: 'rgba(52, 211, 153, 0.45)',
      accent: '#6ee7b7'
    },
    'All': {
      badgeBg: 'rgba(255, 255, 255, 0.08)',
      badgeBorder: 'rgba(255, 255, 255, 0.22)',
      badgeText: '#ffffff',
      activeBg: '#ffffff',
      activeBorder: '#ffffff',
      accent: '#ffffff'
    }
  };

  const currentTheme = CATEGORY_THEMES[currentCard.category] || CATEGORY_THEMES['Foundations'];

  const content = (
    <div style={{
      width: '100%',
      maxWidth: isModal ? '720px' : '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      fontFamily: "'Poppins', sans-serif",
      color: '#ffffff',
    }}>
      {/* Deck Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            fontFamily: "'Times New Roman', Times, serif",
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Layers size={20} color="#a5b4fc" />
            <span>Quantum Mastery Flashcards</span>
          </div>
          <div style={{ fontSize: '0.80rem', color: '#a1a1aa', marginTop: 2 }}>
            Interactive 3D Spaced-Repetition Deck · Flip to verify mathematical proofs
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            title="Close Flashcards"
            style={{
              background: 'none',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map(cat => {
          const theme = CATEGORY_THEMES[cat];
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: isSelected ? 700 : 500,
                background: isSelected ? (cat === 'All' ? '#ffffff' : theme.activeBg) : 'rgba(255, 255, 255, 0.05)',
                color: isSelected ? (cat === 'All' ? '#000000' : theme.accent) : '#a1a1aa',
                border: isSelected ? (cat === 'All' ? '1px solid #ffffff' : `1px solid ${theme.activeBorder}`) : '1px solid rgba(255, 255, 255, 0.10)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Progress Counter & Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div style={{ fontSize: '0.82rem', color: '#a1a1aa', fontWeight: 600 }}>
          Card <span style={{ color: '#ffffff', fontWeight: 800 }}>{currentIndex + 1}</span> of {totalCards}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleShuffle}
            title="Shuffle Deck"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              borderRadius: 6,
              padding: '4px 10px',
              color: '#a1a1aa',
              fontSize: '0.76rem',
              cursor: 'pointer',
            }}
          >
            <Shuffle size={12} /> Shuffle
          </button>
        </div>
      </div>

      {/* ── 3D Flippable Card Container ── */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          perspective: '1200px',
          width: '100%',
          minHeight: '380px',
          cursor: 'pointer',
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: '380px',
          transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {/* ── FRONT FACE ── */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            background: '#0d0d12',
            border: `1px solid ${currentTheme.badgeBorder}`,
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 18px 40px rgba(0, 0, 0, 0.6)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: currentTheme.badgeText,
                  background: currentTheme.badgeBg,
                  border: `1px solid ${currentTheme.badgeBorder}`,
                  borderRadius: 4,
                  padding: '3px 8px',
                }}>
                  {currentCard.category} · {currentCard.difficulty}
                </span>

                <span style={{ fontSize: '0.74rem', color: '#71717a' }}>
                  {currentCard.topic}
                </span>
              </div>

              <h2 style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: "'Times New Roman', Times, serif",
                marginBottom: 16,
                lineHeight: 1.3,
              }}>
                {currentCard.front.title}
              </h2>

              <div style={{ fontSize: '1.15rem', color: '#f4f4f5', lineHeight: 1.7, marginBottom: 16 }}>
                <MathRenderer content={currentCard.front.question} />
              </div>

              {showHint && currentCard.front.hint && (
                <div style={{
                  background: 'rgba(251, 191, 36, 0.06)',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: '0.88rem',
                  color: '#e4e4e7',
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <Lightbulb size={16} color="#fcd34d" />
                  <span><b style={{ color: '#fcd34d' }}>Hint:</b> {currentCard.front.hint}</span>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              {currentCard.front.hint ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowHint(!showHint); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fcd34d',
                    fontSize: '0.80rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <HelpCircle size={14} color="#fcd34d" /> {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              ) : <div />}

              <div style={{
                fontSize: '0.78rem',
                color: '#71717a',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <RotateCw size={12} /> Click card or Spacebar to reveal proof
              </div>
            </div>
          </div>

          {/* ── BACK FACE ── */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: '#0a0a0f',
            border: '1px solid rgba(129, 140, 248, 0.35)',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 18px 40px rgba(0, 0, 0, 0.6)',
            overflowY: 'auto',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#a5b4fc',
                  background: 'rgba(129, 140, 248, 0.15)',
                  border: '1px solid rgba(129, 140, 248, 0.32)',
                  borderRadius: 4,
                  padding: '3px 8px',
                }}>
                  Exact Solution &amp; Proof
                </span>
                <span style={{ fontSize: '0.74rem', color: '#a1a1aa' }}>
                  {currentCard.topic}
                </span>
              </div>

              <div style={{
                fontSize: '1.20rem',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: "'Times New Roman', Times, serif",
                marginBottom: 12,
                lineHeight: 1.35,
              }}>
                {currentCard.back.answer}
              </div>

              {currentCard.back.formula && (
                <div style={{
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(129, 140, 248, 0.22)',
                  borderLeft: '4px solid #818cf8',
                  borderRadius: '0 8px 8px 0',
                  padding: '10px 16px',
                  marginBottom: 14,
                }}>
                  <LatexBlock tex={currentCard.back.formula} display={true} style={{ fontSize: '1.15rem' }} />
                </div>
              )}

              <p style={{ fontSize: '0.96rem', color: '#d4d4d8', lineHeight: 1.7, marginBottom: 14 }}>
                {currentCard.back.explanation}
              </p>

              {currentCard.back.keyTakeaway && (
                <div style={{
                  background: 'rgba(52, 211, 153, 0.06)',
                  borderLeft: '3px solid #34d399',
                  padding: '8px 12px',
                  borderRadius: '0 6px 6px 0',
                  fontSize: '0.84rem',
                  color: '#d4d4d8',
                }}>
                  <b style={{ color: '#6ee7b7' }}>Key Takeaway:</b> {currentCard.back.keyTakeaway}
                </div>
              )}
            </div>

            {/* Self-Rating Mastery Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              marginTop: 14,
            }}>
              <span style={{ fontSize: '0.78rem', color: '#71717a' }}>How well did you know this?</span>
              <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleRateMastery('review')}
                  style={{
                    background: 'rgba(248, 113, 113, 0.08)',
                    border: '1px solid rgba(248, 113, 113, 0.28)',
                    borderRadius: 6,
                    padding: '5px 11px',
                    color: '#f87171',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Review Again
                </button>
                <button
                  onClick={() => handleRateMastery('good')}
                  style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.28)',
                    borderRadius: 6,
                    padding: '5px 11px',
                    color: '#7dd3fc',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Good
                </button>
                <button
                  onClick={() => handleRateMastery('mastered')}
                  style={{
                    background: 'rgba(52, 211, 153, 0.16)',
                    border: '1px solid rgba(52, 211, 153, 0.38)',
                    borderRadius: 6,
                    padding: '5px 12px',
                    color: '#6ee7b7',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Mastered
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <button
          onClick={handlePrev}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#121216',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: 8,
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: '0.84rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 8,
            padding: '8px 16px',
            color: '#ffffff',
            fontSize: '0.84rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <RotateCw size={14} /> Flip Card
        </button>

        <button
          onClick={handleNext}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            color: '#000000',
            fontSize: '0.84rem',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: 20,
    }}>
      <div style={{
        background: '#09090d',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        padding: '24px 28px',
        maxWidth: '760px',
        width: '100%',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
      }}>
        {content}
      </div>
    </div>
  );
}
