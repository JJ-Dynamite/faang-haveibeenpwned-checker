'use client';

import { useState, useEffect } from 'react';

interface Breach {
  name: string;
  title: string;
  domain: string;
  breach_date: string;
  pwn_count: number;
  description: string;
  data_classes: string[];
}

interface EmailCheckResult {
  email: string;
  breached: boolean;
  breach_count: number;
  breaches: Breach[];
  checked_at: string;
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<EmailCheckResult | null>(null);
  const [history, setHistory] = useState<EmailCheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const checkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        fetchHistory();
      } else {
        setError(data.error || 'Failed to check email');
      }
    } catch (err) {
      setError('Failed to check email');
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000000) return (count / 1000000000).toFixed(1) + 'B';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            🔒 Have I Been Pwned?
          </h1>
          <p className="text-gray-400 text-lg">Check if your data has been compromised</p>
        </header>

        <form onSubmit={checkEmail} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="your@email.com"
            />
          </div>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:from-red-600 hover:to-orange-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check for Breaches'}
          </button>
        </form>

        {result && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
            {result.breached ? (
              <>
                <div className="text-center mb-6">
                  <p className="text-6xl mb-4">🚨</p>
                  <h2 className="text-3xl font-bold text-red-400 mb-2">Oh no — pwned!</h2>
                  <p className="text-gray-400">
                    <span className="text-white font-bold">{result.email}</span> was found in{' '}
                    <span className="text-red-400 font-bold">{result.breach_count}</span> data breach{result.breach_count !== 1 ? 'es' : ''}
                  </p>
                </div>
                <div className="space-y-4">
                  {result.breaches.map((breach, i) => (
                    <div key={i} className="bg-gray-900/50 rounded-xl p-5 border border-gray-600">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white">{breach.title}</h3>
                          <p className="text-gray-400 text-sm">{breach.domain}</p>
                        </div>
                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                          {formatCount(breach.pwn_count)} accounts
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{breach.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {breach.data_classes.map((cls, j) => (
                          <span key={j} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                            {cls}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-500 text-xs mt-3">Breached: {breach.breach_date}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-6xl mb-4">✅</p>
                <h2 className="text-3xl font-bold text-green-400 mb-2">Good news — no pwnage found!</h2>
                <p className="text-gray-400">
                  <span className="text-white font-bold">{result.email}</span> wasn't found in any known data breaches.
                </p>
              </div>
            )}
            <p className="text-gray-500 text-xs text-center mt-6">
              Checked at: {new Date(result.checked_at).toLocaleString()}
            </p>
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-300">Recent Checks</h2>
            <div className="space-y-3">
              {history.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={item.breached ? 'text-red-400' : 'text-green-400'}>
                      {item.breached ? '🚨' : '✅'}
                    </span>
                    <span className="font-mono text-sm">{item.email}</span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {item.breach_count} breach{item.breach_count !== 1 ? 'es' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
