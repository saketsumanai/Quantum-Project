import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, ExternalLink, PlayCircle, X, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch("http://localhost:8000/api/v1/curriculum/library")
      .then((r) => r.json())
      .then((data) => {
        setBooks(Array.isArray(data) ? data : []);
        if (data.length > 0 && !selectedBook) {
          setSelectedBook(data[0]);
        }
      })
      .catch((err) => console.error("Error fetching library catalog:", err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (initialSearch) setSearchQuery(initialSearch);
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialSearch, initialCategory]);

  const categories = useMemo(() => {
    const set = new Set();
    books.forEach(b => { if (b.category) set.add(b.category); });
    return Array.from(set).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchesCategory = !selectedCategory || b.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const titleMatch = (b.title || "").toLowerCase().includes(q);
      const authorMatch = (b.author || "").toLowerCase().includes(q);
      const summaryMatch = (b.training_vector_summary || "").toLowerCase().includes(q);
      const conceptsMatch = (b.key_concepts || []).some(c => c.toLowerCase().includes(q));

      return matchesCategory && (titleMatch || authorMatch || summaryMatch || conceptsMatch);
    });
  }, [books, selectedCategory, searchQuery]);

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
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#71717a', fontWeight: 600, marginBottom: '8px' }}>
                    Curriculum Vector Excerpt &amp; Overview
                  </div>
                  <div style={{
                    padding: '20px 24px', background: '#000000', border: '1px solid #27272a',
                    borderRadius: '6px', fontSize: '0.92rem', lineHeight: 1.7, color: '#e4e4e7'
                  }}>
                    {selectedBook.training_vector_summary || "Foundational literature entry indexed in the ChromaDB RAG vector space."}
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
