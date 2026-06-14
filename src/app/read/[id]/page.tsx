'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

type ReadingTheme = 'dark' | 'sepia' | 'light';

export default function Reader() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [docContent, setDocContent] = useState<string>('');
  const [docUrl, setDocUrl] = useState<string>('');
  const [docType, setDocType] = useState<string>('');
  const [docName, setDocName] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Reader Customization States
  const [theme, setTheme] = useState<ReadingTheme>('dark');
  const [fontSize, setFontSize] = useState<number>(18); // px
  const [maxWidth, setMaxWidth] = useState<number>(800); // px

  // Auth & fetch content
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/auth/login');
        } else {
          setCheckingAuth(false);
          fetchContent();
        }
      })
      .catch(() => {
        router.push('/auth/login');
      });
  }, [router, id]);

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/docs/${id}/content`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load document');
      }
      
      setDocType(data.type);
      setDocName(data.name);
      if (data.type === 'pdf') {
        setDocUrl(data.url);
      } else {
        setDocContent(data.content);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading document contents.');
    } finally {
      setLoading(false);
    }
  };

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 32));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 12));

  const getThemeStyles = () => {
    switch (theme) {
      case 'light':
        return {
          background: '#ffffff',
          color: '#1a1a1a',
          borderColor: '#e2e8f0',
        };
      case 'sepia':
        return {
          background: '#f4ecd8',
          color: '#5c4033',
          borderColor: '#e8dcbf',
        };
      case 'dark':
      default:
        return {
          background: '#0d1117',
          color: '#e6edf3',
          borderColor: '#21262d',
        };
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
      </div>
    );
  }

  const themeStyles = getThemeStyles();

  return (
    <>
      <Navbar />
      
      <main style={{
        flex: 1,
        width: '90%',
        maxWidth: '1200px',
        margin: '1rem auto 3rem auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }} className="animate-fade-in">
        
        {/* Back and Toolbar Section */}
        <div className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" className="secondary-button" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '6px' }}>
              ← Dashboard
            </Link>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {docName || 'Loading document...'}
            </h2>
          </div>

          {/* Reader Controls (Only for TXT and DOCX) */}
          {!loading && docType !== 'pdf' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {/* Theme Selector */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Theme:</span>
                <button
                  onClick={() => setTheme('dark')}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#0d1117',
                    border: theme === 'dark' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                  }}
                  title="Dark theme"
                />
                <button
                  onClick={() => setTheme('sepia')}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#f4ecd8',
                    border: theme === 'sepia' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                  }}
                  title="Sepia theme"
                />
                <button
                  onClick={() => setTheme('light')}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: theme === 'light' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                  }}
                  title="Light theme"
                />
              </div>

              {/* Font Size Selector */}
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '0.25rem' }}>Size:</span>
                <button
                  onClick={decreaseFontSize}
                  className="secondary-button"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px' }}
                >
                  A-
                </button>
                <span style={{ fontSize: '0.9rem', width: '2rem', textAlign: 'center', fontWeight: 'bold' }}>
                  {fontSize}
                </span>
                <button
                  onClick={increaseFontSize}
                  className="secondary-button"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px' }}
                >
                  A+
                </button>
              </div>

              {/* Layout Width Selector */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Width:</span>
                <select
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={600} style={{ background: '#0a0a0a' }}>Narrow</option>
                  <option value={800} style={{ background: '#0a0a0a' }}>Medium</option>
                  <option value={1000} style={{ background: '#0a0a0a' }}>Wide</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content Viewer Panel */}
        <div
          className="glass-panel animate-fade-in"
          style={{
            padding: '2rem',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            background: docType === 'pdf' ? 'transparent' : themeStyles.background,
            color: docType === 'pdf' ? 'inherit' : themeStyles.color,
            borderColor: docType === 'pdf' ? 'var(--border-color)' : themeStyles.borderColor,
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div className="spinner" style={{ width: '36px', height: '36px' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Loading content...</span>
              </div>
            </div>
          ) : error ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--danger)',
              minHeight: '40vh',
            }}>
              <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Error Loading Document</h3>
              <p style={{ maxWidth: '500px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{error}</p>
              <Link href="/dashboard" className="glow-button" style={{ marginTop: '1.5rem', borderRadius: '6px' }}>
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div style={{
              width: '100%',
              maxWidth: docType === 'pdf' ? '100%' : `${maxWidth}px`,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}>
              
              {/* Render PDF */}
              {docType === 'pdf' && (
                <iframe
                  src={`/api/docs/${id}/download?disposition=inline`}
                  style={{
                    width: '100%',
                    height: '80vh',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                  title={docName}
                />
              )}

              {/* Render TXT */}
              {docType === 'txt' && (
                <div style={{
                  fontSize: `${fontSize}px`,
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.8',
                  fontFamily: 'var(--font-sans)',
                  width: '100%',
                  wordBreak: 'break-word',
                }}>
                  {docContent}
                </div>
              )}

              {/* Render DOCX (HTML content parsed by mammoth) */}
              {docType === 'docx' && (
                <div
                  className="reader-content"
                  style={{
                    fontSize: `${fontSize}px`,
                    width: '100%',
                  }}
                  dangerouslySetInnerHTML={{ __html: docContent }}
                />
              )}

            </div>
          )}
        </div>

      </main>

      {/* Adjust styling inside HTML dynamically if light/sepia theme is selected */}
      {theme !== 'dark' && docType !== 'pdf' && !loading && (
        <style jsx global>{`
          .reader-content h1,
          .reader-content h2,
          .reader-content h3,
          .reader-content h4,
          .reader-content blockquote {
            color: ${theme === 'sepia' ? '#5c4033' : '#1a1a1a'} !important;
          }
          .reader-content blockquote {
            border-left-color: ${theme === 'sepia' ? '#a4785e' : '#4f46e5'} !important;
          }
          .reader-content code {
            background: ${theme === 'sepia' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.05)'} !important;
            color: ${theme === 'sepia' ? '#78350f' : '#dc2626'} !important;
          }
        `}</style>
      )}
    </>
  );
}
