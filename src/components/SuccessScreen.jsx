import React from 'react';

const SuccessScreen = ({ jobTitle, applicationId, submittedAt, email }) => {
  return (
    <div 
      className="min-h-screen py-16 px-4"
      style={{
        background: '#FBF9F6'
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Lora:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
        `}
      </style>
      <div className="max-w-3xl mx-auto">
        <div 
          className="text-center transform transition-all duration-300"
          style={{
            background: '#FFFFFF',
            borderRadius: 28,
            boxShadow: '0 12px 40px rgba(89, 45, 74, 0.15)',
            border: '2px solid #86efac',
            padding: 40
          }}
        >
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div style={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              borderRadius: '50%',
              padding: 16,
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.2)'
            }}>
              <svg 
                className="h-20 w-20" 
                style={{ color: '#16a34a' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2.5" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h2 style={{
            fontFamily: '"Playfair Display", "Lora", serif',
            fontSize: '2.5rem',
            fontWeight: 800,
            color: '#592D4A',
            marginBottom: 16
          }}>
            Application Submitted!
          </h2>
          <p style={{
            fontFamily: '"Poppins", sans-serif',
            fontSize: '1.15rem',
            color: '#333333',
            marginBottom: 32,
            lineHeight: 1.7
          }}>
            Thank you for applying to{' '}
            <span style={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              color: '#592D4A'
            }}>
              {jobTitle}
            </span>. 
            We have received your application and will review it shortly.
          </p>

          {/* Application Details */}
          <div style={{
            background: 'linear-gradient(135deg, #F0E6ED 0%, #FBF9F6 100%)',
            borderRadius: 20,
            padding: 24,
            marginBottom: 32,
            border: '1.5px solid #B7966B', // Gold/Dust Accent Border
            boxShadow: '0 2px 12px rgba(89, 45, 74, 0.08)'
          }}>
            <div className="space-y-3">
              <p style={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.95rem',
                color: '#333333'
              }}>
                <span style={{
                  fontWeight: 700,
                  color: '#592D4A'
                }}>
                  Application ID:
                </span> 
                <span style={{
                  marginLeft: 8,
                  fontFamily: 'monospace',
                  color: '#A67390',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}>
                  {applicationId}
                </span>
              </p>
              <p style={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.95rem',
                color: '#333333'
              }}>
                <span style={{
                  fontWeight: 700,
                  color: '#592D4A'
                }}>
                  Submitted on:
                </span> 
                <span style={{
                  marginLeft: 8
                }}>
                  {new Date(submittedAt).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* Countdown message */}
          <p style={{
            fontFamily: '"Poppins", sans-serif',
            fontSize: '0.9rem',
            color: '#666',
            marginBottom: 24
          }}>
            Redirecting back to the job listing in a few seconds...
          </p>

          {/* Decorative element */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            marginTop: 20
          }}>
            <div style={{
              width: 40,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #B7966B, transparent)'
            }}></div>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#A67390'
            }}></div>
            <div style={{
              width: 40,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #B7966B, transparent)'
            }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
