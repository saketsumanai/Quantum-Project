import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, ExternalLink, PlayCircle, X, ChevronRight, Volume2, VolumeX } from 'lucide-react';

const CATEGORY_CIRCUIT_MAP = {
  "Qubit States, Superposition & Bloch Sphere": "superposition",
  "Quantum Gates & Circuit Theory": "bell_state",
  "Entanglement & Non-Locality": "quantum_teleportation",
  "Oracle & Algebraic Algorithms": "deutsch_jozsa",
  "Quantum Search, Amplitude Amplification & Random Walks": "grover_2qubit",
  "Quantum Fourier Transform, Phase Estimation & Shor": "qft",
  "NISQ & Variational Quantum Algorithms (VQE, QAOA, QML)": "vqe_h2",
  "Quantum Error Correction & Fault Tolerance": "qec_bitflip",
  "Quantum Information Theory, Cryptography & Hardware": "bell_state",
  "Quantum Mechanics & Linear Algebra for QC": "superposition"
};

export default function TextbookReaderModal({ isOpen, onClose, initialSearch = "", initialCategory = "", onOpenStudio }) {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isReadingExcerpt, setIsReadingExcerpt] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch("http://localhost:8000/api/v1/curriculum/library")
      .then((r) => r.json())
      .then((data) => {
        const bookList = Array.isArray(data) ? data : [];
        setBooks(bookList);
        if (bookList.length > 0 && !selectedBook) {
          setSelectedBook(bookList[0]);
        }
      })
      .catch((err) => console.error("Error fetching library catalog:", err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (initialSearch) {
      // Strip numeric lesson prefixes like "1.1 ", "Chapter 2: ", etc.
      const cleaned = initialSearch.replace(/^\d+(\.\d+)*\s*[:\-–]?\s*/, "").trim();
      setSearchQuery(cleaned);
    }
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialSearch, initialCategory]);

  const categories = useMemo(() => {
    const set = new Set();
    books.forEach(b => { if (b.category) set.add(b.category); });
    return Array.from(set).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (books.length === 0) return [];
    const q = searchQuery.toLowerCase().trim();

    const matchQuery = (b) => {
      if (!q) return true;
      const title = (b.title || "").toLowerCase();
      const author = (b.author || "").toLowerCase();
      const summary = (b.training_vector_summary || "").toLowerCase();
      const concepts = (b.key_concepts || []).map(c => c.toLowerCase());

      // Exact substring match
      if (title.includes(q) || author.includes(q) || summary.includes(q) || concepts.some(c => c.includes(q))) {
        return true;
      }

      // Token keywords match
      const tokens = q
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length >= 3 && !['the', 'and', 'for', 'with', 'from', 'into'].includes(t));

      if (tokens.length > 0) {
        return tokens.some(t => title.includes(t) || summary.includes(t) || concepts.some(c => c.includes(t)));
      }

      return false;
    };

    // 1. Try with selected category
    let result = books.filter(b => {
      const matchesCat = !selectedCategory || b.category === selectedCategory;
      return matchesCat && matchQuery(b);
    });

    // 2. Fallback: if 0 results and category was set, search across all categories
    if (result.length === 0 && selectedCategory && q) {
      result = books.filter(b => matchQuery(b));
    }

    // 3. Fallback: if still 0 results, return all books in category, or all books
    if (result.length === 0) {
      if (selectedCategory) {
        result = books.filter(b => b.category === selectedCategory);
      }
      if (result.length === 0) {
        result = books;
      }
    }

    return result;
  }, [books, selectedCategory, searchQuery]);

  // Synchronize selectedBook to filtered results
  useEffect(() => {
    if (filteredBooks.length > 0) {
      if (!selectedBook || !filteredBooks.some(b => b.id === selectedBook.id)) {
        setSelectedBook(filteredBooks[0]);
      }
    }
  }, [filteredBooks, selectedBook]);

  // Handle stop speech when modal closes or book changes
  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsReadingExcerpt(false);
  }, [selectedBook?.id, isOpen]);

  const handleReadExcerpt = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (isReadingExcerpt) {
      window.speechSynthesis.cancel();
      setIsReadingExcerpt(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.onend = () => setIsReadingExcerpt(false);
    utterance.onerror = () => setIsReadingExcerpt(false);
    setIsReadingExcerpt(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: '#09090b', border: '1px solid #27272a', borderRadius: '8px',
        width: '100%', maxWidth: '1280px', height: '90vh', maxHeight: '900px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.95)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px', borderBottom: '1px solid #27272a', background: '#000000',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '4px', background: '#18181b',
              border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={18} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: 0, fontFamily: "'Poppins', sans-serif" }}>
                Quantum Literature &amp; Textbook Library
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace", marginTop: '2px' }}>
                76 Local Research Papers &amp; Textbooks | 150 Indexed Peer-Reviewed Sources
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#18181b', border: '1px solid #27272a', borderRadius: '4px',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#a1a1aa', cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div style={{
          padding: '16px 28px', borderBottom: '1px solid #27272a', background: '#09090b',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#71717a" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across 150 textbooks by title, author, concept (e.g., Nielsen, Grover, Fault Tolerance, VQE)..."
              style={{
                width: '100%', padding: '10px 16px 10px 42px',
                background: '#000000', border: '1px solid #27272a', borderRadius: '4px',
                color: '#ffffff', fontSize: '0.86rem', fontFamily: "'JetBrains Mono', monospace",
                outline: 'none'
              }}
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => setSelectedCategory("")}
              style={{
                padding: '6px 12px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600,
                background: selectedCategory === "" ? '#27272a' : '#18181b',
                color: selectedCategory === "" ? '#ffffff' : '#a1a1aa',
                border: '1px solid #27272a', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              All Topics ({books.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                style={{
                  padding: '6px 12px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600,
                  background: selectedCategory === cat ? '#27272a' : '#18181b',
                  color: selectedCategory === cat ? '#ffffff' : '#a1a1aa',
                  border: '1px solid #27272a', cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Content: Left Book List, Right Book Detail */}
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', flex: 1, overflow: 'hidden' }}>
          {/* Left Book List */}
          <div style={{
            borderRight: '1px solid #27272a', background: '#000000', overflowY: 'auto',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #27272a', fontSize: '0.74rem', color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
              Found {filteredBooks.length} titles
            </div>
            {filteredBooks.map((book) => {
              const isSelected = selectedBook?.id === book.id;
              return (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  style={{
                    padding: '16px 20px', borderBottom: '1px solid #18181b', cursor: 'pointer',
                    background: isSelected ? '#18181b' : 'transparent',
                    borderLeft: isSelected ? '3px solid #ffffff' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    {book.category}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: isSelected ? '#ffffff' : '#e4e4e7', marginTop: '4px', lineHeight: 1.4 }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#a1a1aa', marginTop: '4px' }}>
                    {book.author} {book.year ? `(${book.year})` : ""}
                  </div>
                </div>
              );
            })}
            {filteredBooks.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#71717a', fontSize: '0.86rem' }}>
                No textbooks matched your query.
              </div>
            )}
          </div>

          {/* Right Book Detail Panel */}
          <div style={{ background: '#09090b', padding: '36px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {selectedBook ? (
              <>
                {/* Header & Badges */}
                <div style={{ borderBottom: '1px solid #27272a', paddingBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#18181b', color: '#ffffff', border: '1px solid #27272a' }}>
                      {selectedBook.category}
                    </span>
                    {selectedBook.year && (
                      <span style={{ fontSize: '0.72rem', color: '#a1a1aa', fontFamily: "'JetBrains Mono', monospace" }}>
                        Published {selectedBook.year}
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#ffffff', margin: '4px 0 8px 0', lineHeight: 1.3 }}>
                    {selectedBook.title}
                  </h1>
                  <div style={{ fontSize: '0.92rem', color: '#d4d4d8', fontWeight: 500 }}>
                    Author: {selectedBook.author}
                  </div>
                  {selectedBook.reference && (
                    <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '4px' }}>
                      Publisher / Venue: {selectedBook.reference}
                    </div>
                  )}
                </div>

                {/* Key Concepts Tags */}
                {selectedBook.key_concepts && selectedBook.key_concepts.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#71717a', fontWeight: 600, marginBottom: '8px' }}>
                      Key Theoretical Concepts
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedBook.key_concepts.map((concept, cIdx) => (
                        <span key={cIdx} style={{
                          fontSize: '0.78rem', background: '#000000', color: '#ffffff',
                          border: '1px solid #27272a', padding: '4px 10px', borderRadius: '4px',
                          fontFamily: "'JetBrains Mono', monospace"
                        }}>
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* RAG Knowledge Excerpt / Vector Summary */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#71717a', fontWeight: 600 }}>
                      Curriculum Vector Excerpt &amp; Overview
                    </div>
                    {selectedBook.training_vector_summary && (
                      <button
                        onClick={() => handleReadExcerpt(selectedBook.training_vector_summary)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: isReadingExcerpt ? 'rgba(52, 211, 153, 0.15)' : '#18181b',
                          border: '1px solid ' + (isReadingExcerpt ? 'rgba(52, 211, 153, 0.4)' : '#27272a'),
                          borderRadius: '4px',
                          padding: '4px 10px',
                          color: isReadingExcerpt ? '#34d399' : '#a1a1aa',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 500,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isReadingExcerpt ? <VolumeX size={13} color="#34d399" /> : <Volume2 size={13} />}
                        <span>{isReadingExcerpt ? "Stop Voice" : "Read Aloud"}</span>
                      </button>
                    )}
                  </div>
                  <div style={{
                    padding: '20px 24px', background: '#000000', border: '1px solid #27272a',
                    borderRadius: '6px', fontSize: '0.92rem', lineHeight: 1.7, color: '#e4e4e7'
                  }}>
                    {selectedBook.training_vector_summary || "Foundational literature entry indexed in the quantum research knowledge base."}
                  </div>
                </div>

                {/* Direct Actions: Studio Simulator Execution & External Link */}
                <div style={{
                  padding: '20px 24px', background: '#18181b', border: '1px solid #27272a',
                  borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                      Verify Theory with 16-Qubit Simulation
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '2px' }}>
                      Simulate the algorithm related to this topic directly in Circuit Studio
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {selectedBook.url && (
                      <a
                        href={selectedBook.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', background: '#000000', border: '1px solid #27272a',
                          borderRadius: '4px', color: '#ffffff', fontSize: '0.82rem',
                          textDecoration: 'none', fontWeight: 500
                        }}
                      >
                        <ExternalLink size={14} /> View Reference
                      </a>
                    )}

                    <button
                      onClick={() => {
                        const preset = CATEGORY_CIRCUIT_MAP[selectedBook.category] || "superposition";
                        onOpenStudio(preset);
                        onClose();
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 18px', background: '#ffffff', color: '#000000',
                        border: 'none', borderRadius: '4px', fontSize: '0.82rem',
                        fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      <PlayCircle size={14} /> Open Algorithm in Studio
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: '#71717a', fontSize: '0.9rem' }}>Select a textbook to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
