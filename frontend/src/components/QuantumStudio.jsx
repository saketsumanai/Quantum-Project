import React, { useState } from 'react';
import {
  PanelRightClose, BookOpen, Layers, Volume2, Sparkles, Terminal,
  HelpCircle, ArrowUpRight, Copy, Check, ExternalLink, Bookmark, Award,
  Play, Video
} from 'lucide-react';
import { LatexBlock } from './MathRenderer';
import { QUANTUM_TEXTBOOK_EXCERPTS } from '../data/quantumCitationsData';
import { QUANTUM_FLASHCARD_DECKS } from '../data/quantumFlashcardsData';
import { VIDEO_LECTURES } from '../data/videoLecturesData';

/**
 * QuantumStudio — NotebookLM-inspired right panel for AI synthesis,
 * exact treatise citations, flashcards deck, and deep-dive study tools.
 */
export default function QuantumStudio({
  isOpen,
  onClose,
  activeTopic = '',
  citedSources = [],
  language = 'en',
  onOpenFlashcards,
  onOpenCitation,
  onOpenInStudio,
  onPlayVideo,
  onNavigateToHub,
  onSendQuery,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'videos' | 'citations' | 'formulas'

  if (!isOpen) return null;

  // Filter or resolve relevant excerpts from our catalog
  const matchingExcerpts = QUANTUM_TEXTBOOK_EXCERPTS.filter(item => {
    if (!activeTopic) return true;
    const t = activeTopic.toLowerCase();
    return item.keywords.some(k => t.includes(k)) || item.title.toLowerCase().includes(t);
  });

  const displayExcerpts = matchingExcerpts.length > 0 ? matchingExcerpts : QUANTUM_TEXTBOOK_EXCERPTS.slice(0, 3);

  // Filter and sort video lectures from our database based on topic and selected language
  const matchingLectures = VIDEO_LECTURES.filter(v => {
    if (!activeTopic) return true;
    const t = activeTopic.toLowerCase();
    return v.title.toLowerCase().includes(t) ||
      (v.englishTitle && v.englishTitle.toLowerCase().includes(t)) ||
      (v.topic && v.topic.toLowerCase().includes(t)) ||
      (v.description && v.description.toLowerCase().includes(t));
  });

  const baseLectures = matchingLectures.length > 0 ? matchingLectures : VIDEO_LECTURES;
  const sortedLectures = [...baseLectures].sort((a, b) => {
    const aMatchesLang = (a.language === language || (language === 'hi' && a.language === 'hinglish'));
    const bMatchesLang = (b.language === language || (language === 'hi' && b.language === 'hinglish'));
    if (aMatchesLang && !bMatchesLang) return -1;
    if (bMatchesLang && !aMatchesLang) return 1;
    return 0;
  });

  return (
    <aside style={{
      width: '380px',
      minWidth: '380px',
      background: '#0c0c10',
      borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: "'Poppins', sans-serif",
      color: '#ffffff',
      overflow: 'hidden',
      zIndex: 25,
      transition: 'all 0.25s ease',
    }}>
      {/* Studio Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#09090d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(129, 140, 248, 0.15)',
            border: '1px solid rgba(129, 140, 248, 0.30)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a5b4fc',
          }}>
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{
              fontSize: '1rem',
              fontWeight: 800,
              fontFamily: "'Times New Roman', Times, serif",
              color: '#ffffff',
              letterSpacing: '0.01em',
            }}>
              Quantum Studio
            </div>
            <div style={{ fontSize: '0.68rem', color: '#a1a1aa' }}>
              Treatises, Flashcards &amp; Synthesis
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          title="Collapse Studio"
          style={{
            background: 'none',
            border: 'none',
            color: '#a1a1aa',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 4,
          }}
        >
          <PanelRightClose size={18} />
        </button>
      </div>

      {/* Studio Navigation Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#0e0e14',
      }}>
        {[
          { id: 'overview', label: 'Studio Tools' },
          { id: 'videos', label: 'Lectures' },
          { id: 'citations', label: 'Book Excerpts' },
          { id: 'formulas', label: 'Theorems' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px 4px',
              fontSize: '0.78rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#ffffff' : '#71717a',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #818cf8' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Studio Body Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Callout Card */}
            <div style={{
              background: '#121218',
              border: '1px solid rgba(129, 140, 248, 0.20)',
              borderRadius: '12px',
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: '0.72rem', color: '#818cf8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', marginBottom: 4, fontFamily: "'Times New Roman', Times, serif" }}>
                Active Topic Synthesis
              </div>
              <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                {activeTopic || 'Quantum Mechanics & Algorithms'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#a1a1aa', lineHeight: 1.5 }}>
                150 peer-reviewed textbooks, lecture series, and seminal treatises indexed for verification.
              </div>
            </div>

            {/* NotebookLM Style Action Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Flashcards Tile - Muted Indigo */}
              <div
                onClick={onOpenFlashcards}
                style={{
                  background: '#14141c',
                  border: '1px solid rgba(129, 140, 248, 0.22)',
                  borderRadius: '10px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.55)';
                  e.currentTarget.style.background = '#181826';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.22)';
                  e.currentTarget.style.background = '#14141c';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '7px',
                  background: 'rgba(129, 140, 248, 0.15)',
                  border: '1px solid rgba(129, 140, 248, 0.30)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a5b4fc',
                }}>
                  <Layers size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>Flashcards</div>
                  <div style={{ fontSize: '0.70rem', color: '#a1a1aa', marginTop: 2 }}>Interactive 3D Study Deck</div>
                </div>
              </div>

              {/* Exact Citations Reader Tile - Muted Sage */}
              <div
                onClick={() => setActiveTab('citations')}
                style={{
                  background: '#14141c',
                  border: '1px solid rgba(52, 211, 153, 0.20)',
                  borderRadius: '10px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.50)';
                  e.currentTarget.style.background = '#141e1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.20)';
                  e.currentTarget.style.background = '#14141c';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '7px',
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.30)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6ee7b7',
                }}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>Book Excerpts</div>
                  <div style={{ fontSize: '0.70rem', color: '#a1a1aa', marginTop: 2 }}>Read exact treatise quotes</div>
                </div>
              </div>

              {/* Circuit Studio Link - Muted Ice Blue */}
              <div
                onClick={() => onOpenInStudio && onOpenInStudio()}
                style={{
                  background: '#14141c',
                  border: '1px solid rgba(56, 189, 248, 0.20)',
                  borderRadius: '10px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.50)';
                  e.currentTarget.style.background = '#141b24';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.20)';
                  e.currentTarget.style.background = '#14141c';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '7px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.30)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7dd3fc',
                }}>
                  <Terminal size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>Circuit Studio</div>
                  <div style={{ fontSize: '0.70rem', color: '#a1a1aa', marginTop: 2 }}>Launch visual builder</div>
                </div>
              </div>

              {/* Theorem Cheat Sheet - Muted Amethyst */}
              <div
                onClick={() => setActiveTab('formulas')}
                style={{
                  background: '#14141c',
                  border: '1px solid rgba(168, 85, 247, 0.20)',
                  borderRadius: '10px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.50)';
                  e.currentTarget.style.background = '#1b1426';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.20)';
                  e.currentTarget.style.background = '#14141c';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '7px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.30)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>Theorems</div>
                  <div style={{ fontSize: '0.70rem', color: '#a1a1aa', marginTop: 2 }}>Governing math formulas</div>
                </div>
              </div>

              {/* Curated Video Lectures Tile - Muted Amber */}
              <div
                onClick={() => setActiveTab('videos')}
                style={{
                  background: '#14141c',
                  border: '1px solid rgba(251, 191, 36, 0.20)',
                  borderRadius: '10px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  gridColumn: 'span 2',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.50)';
                  e.currentTarget.style.background = '#1a1814';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.20)';
                  e.currentTarget.style.background = '#14141c';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '7px',
                    background: 'rgba(251, 191, 36, 0.15)',
                    border: '1px solid rgba(251, 191, 36, 0.30)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fcd34d',
                  }}>
                    <Play size={16} fill="#fcd34d" />
                  </div>
                  <div style={{
                    fontSize: '0.68rem',
                    color: '#fcd34d',
                    background: 'rgba(251, 191, 36, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}>
                    {sortedLectures.length} Lectures Available
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>Multilingual Video Lectures</div>
                  <div style={{ fontSize: '0.70rem', color: '#a1a1aa', marginTop: 2 }}>Curated YouTube series with inline playback &amp; Hindi/regional guidance</div>
                </div>
              </div>
            </div>

            {/* Quick Treatise Citation Cards */}
            <div style={{ marginTop: 8 }}>
              <div style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 10,
                fontFamily: "'Times New Roman', Times, serif"
              }}>
                Authoritative Treatise References
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {displayExcerpts.slice(0, 2).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onOpenCitation && onOpenCitation(item)}
                    style={{
                      background: '#121218',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.background = '#161620';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.background = '#121218';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.68rem', color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase' }}>
                        {item.publisher} ({item.year})
                      </span>
                      <ArrowUpRight size={13} color="#a5b4fc" />
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff', marginBottom: 4, fontFamily: "'Times New Roman', Times, serif" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#a1a1aa', lineHeight: 1.4 }}>
                      {item.section} · {item.pages}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Multilingual Video Lectures from Database */}
        {activeTab === 'videos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>
                Curated lectures matching topic &amp; language:
              </div>
              {onNavigateToHub && (
                <button
                  onClick={onNavigateToHub}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    color: '#818cf8',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  <span>Video Hub</span>
                  <ArrowUpRight size={12} />
                </button>
              )}
            </div>

            {sortedLectures.slice(0, 10).map((video) => (
              <div
                key={video.id}
                style={{
                  background: '#121218',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                {/* Thumbnail Header with Play Button */}
                <div
                  onClick={() => onPlayVideo && onPlayVideo(video)}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '110px',
                    background: '#09090d',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 0.85,
                      transition: 'transform 0.25s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  {/* Play Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    backdropFilter: 'blur(4px)',
                  }}>
                    <Play size={16} fill="white" style={{ marginLeft: 2 }} />
                  </div>
                  {/* Duration Pill */}
                  <div style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 8,
                    background: 'rgba(0,0,0,0.80)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.66rem',
                    color: '#ffffff',
                    fontWeight: 600,
                  }}>
                    {video.duration}
                  </div>
                  {/* Language Pill */}
                  <div style={{
                    position: 'absolute',
                    top: 6,
                    left: 8,
                    background: video.language === language ? 'rgba(99, 102, 241, 0.90)' : 'rgba(0,0,0,0.75)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '0.64rem',
                    color: '#ffffff',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {video.languageLabel || video.language}
                  </div>
                </div>

                {/* Video Info & Action */}
                <div style={{ padding: '10px 12px' }}>
                  <div
                    onClick={() => onPlayVideo && onPlayVideo(video)}
                    title={video.title}
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: 4,
                      lineHeight: 1.35,
                      cursor: 'pointer',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontFamily: "'Times New Roman', Times, serif",
                    }}
                  >
                    {video.title}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#a1a1aa', marginBottom: 8 }}>
                    {video.instructor} · {video.organization}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => onPlayVideo && onPlayVideo(video)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 5,
                        background: 'rgba(251, 191, 36, 0.12)',
                        border: '1px solid rgba(251, 191, 36, 0.30)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: '#fcd34d',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.22)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.12)';
                      }}
                    >
                      <Play size={12} fill="#fcd34d" />
                      <span>Watch Inline</span>
                    </button>
                    {onNavigateToHub && (
                      <button
                        onClick={onNavigateToHub}
                        title="Open in Multilingual Video Hub"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.10)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          color: '#d4d4d8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Book Excerpts & Treatises */}
        {activeTab === 'citations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.80rem', color: '#a1a1aa', marginBottom: 4 }}>
              Click any source to project the exact chapter quote and formula:
            </div>
            {QUANTUM_TEXTBOOK_EXCERPTS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onOpenCitation && onOpenCitation(item)}
                style={{
                  background: '#121218',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  borderRadius: '10px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.45)';
                  e.currentTarget.style.background = '#161622';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)';
                  e.currentTarget.style.background = '#121218';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.68rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 800 }}>
                    {item.author}
                  </span>
                  <BookOpen size={13} color="#6ee7b7" />
                </div>
                <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#ffffff', marginBottom: 6, fontFamily: "'Times New Roman', Times, serif" }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: '0.76rem',
                  color: '#d4d4d8',
                  lineHeight: 1.5,
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  borderLeft: '2px solid #818cf8',
                  marginBottom: 8,
                }}>
                  "{item.excerpt.slice(0, 110)}…"
                </div>
                <div style={{ fontSize: '0.72rem', color: '#71717a' }}>
                  {item.chapter} · {item.pages}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Canonical Formulas */}
        {activeTab === 'formulas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.80rem', color: '#a1a1aa', marginBottom: 4 }}>
              Governing quantum equations from the indexed 150-book library:
            </div>
            {QUANTUM_TEXTBOOK_EXCERPTS.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#09090d',
                  border: '1px solid rgba(168, 85, 247, 0.20)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                  {item.section}
                </div>
                <LatexBlock tex={item.key_formula} display={true} style={{ fontSize: '1.1rem', margin: '8px 0' }} />
                <div style={{ fontSize: '0.72rem', color: '#71717a', textAlign: 'right', marginTop: 4 }}>
                  — {item.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
