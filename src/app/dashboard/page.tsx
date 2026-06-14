'use client';

import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch session and docs
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/auth/login');
        } else {
          setUser(data.user);
          setCheckingAuth(false);
          fetchDocuments();
        }
      })
      .catch(() => {
        router.push('/auth/login');
      });
  }, [router]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/docs/list');
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error('Error fetching documents', e);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    // Validate client-side
    const allowedExtensions = ['.txt', '.docx', '.doc', '.pdf'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(fileExt)) {
      setUploadError('Unsupported file type. Please upload txt, doc, docx, or pdf files.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File is too large. Max size is 10MB.');
      return;
    }

    setUploadError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/docs/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      // Success, refetch documents
      await fetchDocuments();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/docs/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete file');
      }
    } catch (e) {
      console.error('Error deleting document', e);
      alert('An error occurred while deleting the file');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📕';
      case 'docx': return '📘';
      default: return '📄';
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <main style={{
        flex: 1,
        width: '90%',
        maxWidth: '1200px',
        margin: '2rem auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
      }} className="animate-fade-in">
        
        {/* Welcome Section */}
        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-1px' }}>
              Your <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Upload and manage your reading materials
            </p>
          </div>
        </section>

        {/* Upload Zone */}
        <section>
          <div
            className={`glass-panel ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              border: dragActive ? '2px dashed var(--primary)' : '1px dashed var(--border-color)',
              background: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".txt,.doc,.docx,.pdf"
              style={{ display: 'none' }}
              disabled={uploading}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                border: '1px solid var(--border-color)',
              }}>
                📤
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {uploading ? 'Uploading your document...' : 'Drag & Drop your document here'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {uploading ? 'Processing file and uploading to cloud storage...' : 'or click to browse from your computer'}
                </p>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Supports TXT, DOC, DOCX, and PDF up to 10MB
              </div>
            </div>
            
            {uploading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(7, 9, 14, 0.7)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Uploading file...</span>
                </div>
              </div>
            )}
          </div>

          {uploadError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginTop: '1rem',
            }}>
              ⚠️ {uploadError}
            </div>
          )}
        </section>

        {/* Documents List */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Your Documents</h2>
          
          {loadingDocs ? (
            <div style={{ display: 'flex', padding: '4rem 0', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '32px', height: '32px' }} />
            </div>
          ) : documents.length === 0 ? (
            <div className="glass-panel" style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📚</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No documents yet</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Upload your first document above to get started!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="glass-panel glass-panel-hover"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto auto',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    gap: '1.5rem',
                  }}
                >
                  <div style={{ fontSize: '1.8rem' }}>
                    {getFileIcon(doc.type)}
                  </div>
                  
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {doc.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{formatSize(doc.size)}</span>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => router.push(`/read/${doc.id}`)}
                      className="glow-button glow-button-accent"
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderRadius: '6px' }}
                    >
                      Read
                    </button>
                  </div>

                  <div>
                    <a
                      href={doc.url}
                      download={doc.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="secondary-button"
                      style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderRadius: '6px' }}
                    >
                      Download
                    </a>
                  </div>

                  <div>
                    <button
                      onClick={() => handleDelete(doc.id, doc.name)}
                      className="secondary-button"
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        borderColor: 'transparent',
                        color: 'var(--text-muted)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--danger)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.background = 'transparent';
                      }}
                      title="Delete document"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
