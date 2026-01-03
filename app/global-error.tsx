'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#fafafa'
        }}>
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '500px',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#dc2626" 
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600',
              marginBottom: '12px',
              color: '#111'
            }}>Application Error</h2>
            <p style={{ 
              color: '#666', 
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              A critical error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
