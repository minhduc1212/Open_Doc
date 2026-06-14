import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navbar />
      
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
      }} className="animate-slide-up">
        {/* Hero Section */}
        <section style={{ margin: '4rem 0 5rem 0', maxWidth: '800px' }}>
          <div style={{
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            padding: '0.4rem 1rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'inline-block',
            marginBottom: '1.5rem',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}>
            Introducing OpenDoc v1.0
          </div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            marginBottom: '1.5rem',
          }}>
            The Modern Reader for <br />
            <span className="gradient-text">All Your Documents</span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '650px',
            margin: '0 auto 2.5rem auto',
          }}>
            Upload, store, and read your TXT, DOCX, and PDF files directly on the web. Designed with a premium, distraction-free layout optimized for reading.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="glow-button glow-button-accent" style={{ fontSize: '1.05rem', padding: '0.9rem 2.2rem', borderRadius: '10px' }}>
              Go to Dashboard
            </Link>
            <Link href="/auth/register" className="secondary-button" style={{ fontSize: '1.05rem', padding: '0.9rem 2.2rem', borderRadius: '10px' }}>
              Create Free Account
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          width: '100%',
          margin: '2rem 0',
        }}>
          <div className="glass-panel glass-panel-hover" style={{ padding: '2.5rem 2rem', textAlign: 'left' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}>
              🗂️
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem' }}>Cloud File Storage</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Keep all your documents safely stored in the cloud with Vercel Blob, ensuring instant loading speeds from anywhere in the world.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover" style={{ padding: '2.5rem 2rem', textAlign: 'left' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              ⚙️
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem' }}>Smart Document Parser</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Convert word documents (`.docx`), text files (`.txt`), and pdfs on-the-fly. No external software needed; open and read directly.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover" style={{ padding: '2.5rem 2rem', textAlign: 'left' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--danger)',
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              📖
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem' }}>Distraction-Free E-Reader</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
              Enjoy your documents in a custom, beautiful reader interface designed with proper typography, padding, and reading themes.
            </p>
          </div>
        </section>
        
        {/* Footer */}
        <footer style={{ marginTop: '6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>© {new Date().getFullYear()} OpenDoc. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
