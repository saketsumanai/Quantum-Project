import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Quantum Platform Caught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#08080a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Poppins', sans-serif",
          textAlign: 'center',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            marginBottom: '20px',
          }}>
            <AlertTriangle size={28} />
          </div>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            fontFamily: "'Times New Roman', Times, serif",
            marginBottom: '10px',
            color: '#ffffff',
          }}>
            Quantum Workspace Recovery
          </h2>

          <p style={{
            fontSize: '0.94rem',
            color: '#a1a1aa',
            maxWidth: '500px',
            lineHeight: 1.6,
            marginBottom: '16px',
          }}>
            An unexpected render issue occurred. Click reload to refresh your simulation state.
          </p>

          {this.state.error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '14px 18px',
              maxWidth: '750px',
              width: '90%',
              textAlign: 'left',
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              color: '#f87171',
              whiteSpace: 'pre-wrap',
              marginBottom: '20px',
              maxHeight: '220px',
              overflow: 'auto',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{this.state.error?.toString()}</div>
              <div>{this.state.error?.stack}</div>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              color: '#000000',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '10px 22px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)',
            }}
          >
            <RefreshCw size={15} />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
