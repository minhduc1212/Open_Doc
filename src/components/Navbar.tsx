'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  return (
    <nav className="glass-panel animate-fade-in" style={{
      margin: '1.5rem auto 0.5rem auto',
      width: '90%',
      maxWidth: '1200px',
      padding: '0.9rem 1.8rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          OpenDoc
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {!loading && (
          <>
            {user ? (
              <>
                <Link href="/dashboard" style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }} className="hover-link">
                  Dashboard
                </Link>
                <span style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                }}>
                  |
                </span>
                <span style={{
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}>
                  Hello, <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{user.username}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="secondary-button"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', borderRadius: '6px' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="secondary-button" style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem', borderRadius: '6px' }}>
                  Sign In
                </Link>
                <Link href="/auth/register" className="glow-button" style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem', borderRadius: '6px' }}>
                  Get Started
                </Link>
              </>
            )}
          </>
        )}
        {loading && <div style={{ width: '16px', height: '16px', borderWidth: '2px' }} className="spinner" />}
      </div>
      
      <style jsx>{`
        .hover-link {
          transition: color 0.2s ease;
        }
        .hover-link:hover {
          color: var(--text-primary) !important;
        }
      `}</style>
    </nav>
  );
}
