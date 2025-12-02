import React from "react";

const HeroSection = ({ onApplyClick, jobData }) => {
  const aboutUs = jobData?.aboutUs || {};
  const whyJoinUs = jobData?.whyJoinUs || {};
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        // Base Background: Rich Cream/Mauve Gradient with movement
        background:
          "linear-gradient(180deg, #FBF9F6 0%, #F0E6ED 50%, #FBF9F6 100%)",
        backgroundSize: "100% 200%",
        animation: "gradientMove 20s ease-in-out infinite",
      }}
    >
      {/* 1. CSS Styles and Keyframes */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap');

          /* Keyframes for Moving Gradient Background */
          @keyframes gradientMove {
            0% {
              background-position: 0 0;
            }
            50% {
              background-position: 0 100%;
            }
            100% {
              background-position: 0 0;
            }
          }

          /* Keyframes for Card Gradient Movement */
          @keyframes cardGradientMove {
            0% {
              background-position: 0% 0%;
            }
            50% {
              background-position: 100% 100%;
            }
            100% {
              background-position: 0% 0%;
            }
          }

          /* Keyframes for Particle Drift */
          @keyframes drift {
            0% {
              transform: translateY(100vh) translateX(0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            90% {
              opacity: 0.8;
            }
            100% {
              transform: translateY(-100vh) translateX(var(--tx)) rotate(360deg);
              opacity: 0;
            }
          }

          /* Keyframes for Confetti Fall */
          @keyframes confettiFall {
            0% {
              transform: translateY(-100vh) rotate(0deg) translateX(0px);
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg) translateX(var(--tx, 0px));
              opacity: 0;
            }
          }

          /* Keyframes for Fluid Wave Motion */
          @keyframes waveFloat {
            0% {
              transform: translate(0, 0) scale(1) rotate(0deg);
              opacity: 0.9;
            }
            12.5% {
              transform: translate(-3px, 2px) scale(1.01) rotate(0.5deg);
              opacity: 0.88;
            }
            25% {
              transform: translate(-6px, 6px) scale(1.02) rotate(1deg);
              opacity: 0.85;
            }
            37.5% {
              transform: translate(-8px, 10px) scale(1.04) rotate(1.5deg);
              opacity: 0.78;
            }
            50% {
              transform: translate(-8px, 12px) scale(1.05) rotate(2deg);
              opacity: 0.75;
            }
            62.5% {
              transform: translate(-6px, 10px) scale(1.04) rotate(1.5deg);
              opacity: 0.78;
            }
            75% {
              transform: translate(-3px, 6px) scale(1.02) rotate(1deg);
              opacity: 0.85;
            }
            87.5% {
              transform: translate(0px, 2px) scale(1.01) rotate(0.5deg);
              opacity: 0.88;
            }
            100% {
              transform: translate(0, 0) scale(1) rotate(0deg);
              opacity: 0.9;
            }
          }
          
          /* Keyframes for Subtle Fade/Sparkle Effect */
          @keyframes sparkle {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.4; }
          }

          /* Styling for the rich title gradient */
          .velvet-desk-title {
            font-family: "Playfair Display", "Lora", serif !important;
            font-weight: 800;
            background: linear-gradient(90deg, #592D4A 0%, #A67390 50%, #B7966B 100%); 
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          /* Corner Element Base Styling */
          .corner-wave {
            position: absolute;
            width: 400px; 
            height: 400px;
            pointer-events: none;
            z-index: 1;
            opacity: 0.6;
            filter: blur(80px); 
            background: radial-gradient(circle at center, #592D4A 0%, #A67390 40%, transparent 80%);
            animation: waveFloat 40s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
          }

          /* Positioning the waves - Layer 1 */
          .top-left-wave-1 {
            top: 60px; 
            left: -120px;
            animation-duration: 35s; 
            transform-origin: center;
          }
          .top-right-wave-1 {
            top: 60px;
            right: -120px;
            animation-duration: 45s; 
            transform-origin: center;
          }

          /* Positioning the waves - Layer 2 */
          .top-left-wave-2 {
            top: 120px;
            left: -80px;
            width: 350px;
            height: 350px;
            opacity: 0.5;
            background: radial-gradient(circle at center, #A67390 0%, #C57B6B 30%, transparent 70%); 
            animation: waveFloat 28s cubic-bezier(0.25, 0.1, 0.25, 1) infinite reverse; 
            transform-origin: center;
          }
          .top-right-wave-2 {
            top: 120px;
            right: -80px;
            width: 350px;
            height: 350px;
            opacity: 0.5;
            background: radial-gradient(circle at center, #A67390 0%, #C57B6B 30%, transparent 70%);
            animation: waveFloat 32s cubic-bezier(0.25, 0.1, 0.25, 1) infinite reverse;
            transform-origin: center;
          }

          /* Gold Dust Overlay */
          .gold-dust-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%; 
            pointer-events: none;
            z-index: 2; 
            opacity: 0.7;
            
            /* Subtle texture + gold dust pattern */
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="10" cy="10" r="1.5" fill="#B7966B" opacity="0.4"/><circle cx="50" cy="50" r="1" fill="#B7966B" opacity="0.3"/><circle cx="90" cy="30" r="1.5" fill="#B7966B" opacity="0.5"/><circle cx="30" cy="80" r="0.8" fill="#B7966B" opacity="0.35"/></svg>');
            background-size: 50px 50px;
            
            animation: sparkle 7s ease-in-out infinite alternate;
          }

          /* Particles Container */
          .particles-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 3;
            overflow: hidden;
          }

          /* Individual Particle */
          .particle {
            position: absolute;
            bottom: 0;
            width: var(--size, 3px);
            height: var(--size, 3px);
            background: #B7966B;
            border-radius: 50%;
            opacity: 0.6;
            animation: drift linear infinite;
          }

          /* Confetti Container */
          .confetti-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 4;
            overflow: hidden;
          }

          /* Individual Confetti Piece */
          .confetti-piece {
            position: absolute;
            top: -10px;
            width: 6px;
            height: 12px;
            opacity: 0.8;
            animation: confettiFall linear infinite;
            transform-origin: center;
          }

          /* Animated Card Background */
          .animated-card {
            background: linear-gradient(135deg, #FBF9F6 0%, #FFFFFF 50%, #FBF9F6 100%);
            background-size: 200% 200%;
            animation: cardGradientMove 15s ease-in-out infinite;
          }
        `}
      </style>

      {/* 2. Corner Wave Elements and Gold Dust (Background Effects) */}
      <div className="corner-wave top-left-wave-1"></div>
      <div className="corner-wave top-right-wave-1"></div>
      <div className="corner-wave top-left-wave-2"></div>
      <div className="corner-wave top-right-wave-2"></div>
      <div className="gold-dust-overlay"></div>

      {/* 3. Particle Effects */}
      <div className="particles-container">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              "--size": `${2 + Math.random() * 4}px`,
              "--tx": `${(Math.random() - 0.5) * 200}px`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* 4. Confetti Bursts */}
      <div className="confetti-container">
        {Array.from({ length: 50 }).map((_, i) => {
          const colors = [
            "#B7966B",
            "#A67390",
            "#592D4A",
            "#FBF9F6",
            "#F0E6ED",
          ];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const sizeVariation = 0.5 + Math.random();
          const leftPos = Math.random() * 100;
          const txVariation = (Math.random() - 0.5) * 100;
          const delay = Math.random() * 5;
          const duration = 3 + Math.random() * 3;
          return (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${leftPos}%`,
                backgroundColor: randomColor,
                width: `${6 * sizeVariation}px`,
                height: `${12 * sizeVariation}px`,
                "--tx": `${txVariation}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      {/* 5. Main Content Wrapper */}
      <div className="relative z-30">
        {/* Logo */}
        <div className="pt-8 pb-6 flex justify-center">
          <img
            src="../assets/logo.png"
            alt="The Velvet Desk"
            className="h-40 w-auto"
          />
        </div>

        {/* Hero Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-5 pb-16">
          {/* We're Hiring Badge */}
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-8"
            style={{
              background: "#FFFFFF",
              border: "2px solid #592D4A",
              boxShadow: "0 4px 12px rgba(89, 45, 74, 0.08)",
            }}
          >
            <span className="text-2xl">🎉</span>
            <span
              style={{
                color: "#592D4A",
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                fontSize: "1.125rem",
              }}
            >
              We're Hiring!
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl mb-4"
            style={{
              fontFamily: '"Playfair Display", "Lora", serif',
              fontWeight: 700,
            }}
          >
            <span style={{ color: "#592D4A" }}>Join Our Team at</span>
            <br />
            <span className="velvet-desk-title">The Velvet Desk</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-xl sm:text-2xl mb-10 max-w-3xl mx-auto"
            style={{
              color: "#333333",
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Leading event management company specializing in weddings and
            corporate events
          </p>

          {/* Apply Now Button */}
          <button
            onClick={onApplyClick}
            className="px-12 py-4 rounded-lg text-xl font-semibold transform hover:-translate-y-0.5 transition-all duration-300"
            style={{
              background: "#592D4A",
              color: "#FBF9F6",
              fontFamily: '"Lora", serif',
              fontWeight: 600,
              boxShadow: "0 6px 20px rgba(89, 45, 74, 0.15)",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#432235";
              e.currentTarget.style.boxShadow =
                "0 8px 28px rgba(89, 45, 74, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#592D4A";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(89, 45, 74, 0.15)";
            }}
          >
            Apply Now
          </button>

          {/* Illustration */}
          <div className="mt-16 relative">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-30"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, #A67390, #592D4A)",
              }}
            ></div>
            <img
              src="../assets/hero-hiring.png"
              alt="Team"
              className="relative z-10 w-full max-w-4xl mx-auto"
            />
          </div>
        </div>

        {/* About Us & Why Join Us - Luxurious Two Column Section */}
        <div
          className="py-20"
          style={{
            // 🛑 UPDATED BACKGROUND: Changed from static #FFFFFF to a subtle gradient for texture
            background: "linear-gradient(180deg, #FBF9F6 0%, #F9F9F9 100%)",
            borderTop: "1.5px solid #B7966B",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
              {/* Left Column - About Us */}
              {aboutUs.description && (
                <div
                  className="relative p-8 rounded-2xl transition-all duration-300 animated-card"
                  style={{
                    boxShadow: "0 4px 20px rgba(89, 45, 74, 0.1)",
                    border: "2px solid #B7966B",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 8px 30px rgba(89, 45, 74, 0.2)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(89, 45, 74, 0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="flex items-start gap-3 mb-6">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "#F0E6ED" }}
                    >
                      <svg
                        className="w-7 h-7"
                        style={{ color: "#592D4A" }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </div>
                    <h2
                      className="text-3xl sm:text-4xl"
                      style={{
                        color: "#592D4A",
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 700,
                      }}
                    >
                      About Us
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <p
                      className="text-base leading-relaxed"
                      style={{
                        color: "#333333",
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 400,
                        lineHeight: 1.8,
                      }}
                    >
                      {aboutUs.description}
                    </p>

                    {/* Render bullet points if they exist and are not empty */}
                    {aboutUs.bulletPoints &&
                      aboutUs.bulletPoints.length > 0 && (
                        <div className="space-y-3 mt-4">
                          {aboutUs.bulletPoints.map((point, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div
                                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                                style={{ background: "#A67390" }}
                              >
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <p
                                className="text-sm"
                                style={{
                                  color: "#333333",
                                  fontFamily: '"Poppins", sans-serif',
                                  lineHeight: 1.6,
                                }}
                              >
                                {point}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Right Column - Why Join Us */}
              {whyJoinUs.description && (
                <div
                  className="p-8 rounded-2xl transition-all duration-300 animated-card"
                  style={{
                    boxShadow: "0 4px 20px rgba(89, 45, 74, 0.1)",
                    border: "2px solid #B7966B",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 8px 30px rgba(89, 45, 74, 0.2)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(89, 45, 74, 0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="flex items-start gap-3 mb-6">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "#F0E6ED" }}
                    >
                      <svg
                        className="w-7 h-7"
                        style={{ color: "#592D4A" }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h2
                      className="text-3xl sm:text-4xl"
                      style={{
                        color: "#592D4A",
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 700,
                      }}
                    >
                      Why Join Us?
                    </h2>
                  </div>

                  <div className="space-y-4 mb-6">
                    <p
                      className="text-base leading-relaxed"
                      style={{
                        color: "#333333",
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 400,
                        lineHeight: 1.8,
                      }}
                    >
                      {whyJoinUs.description}
                    </p>
                  </div>

                  {/* Benefits List - Only render if bulletPoints exist and are not empty */}
                  {whyJoinUs.bulletPoints &&
                    whyJoinUs.bulletPoints.length > 0 && (
                      <div className="space-y-3">
                        {whyJoinUs.bulletPoints.map((benefit, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div
                              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                              style={{ background: "#A67390" }}
                            >
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <p
                              className="text-sm"
                              style={{
                                color: "#333333",
                                fontFamily: '"Poppins", sans-serif',
                                lineHeight: 1.6,
                              }}
                            >
                              {benefit}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="text-center mt-16">
              <button
                onClick={onApplyClick}
                className="px-16 py-5 rounded-xl text-xl transform transition-all duration-300"
                style={{
                  background: "#592D4A",
                  color: "#FBF9F6",
                  fontFamily: '"Lora", serif',
                  fontWeight: 700,
                  boxShadow: "0 8px 24px rgba(89, 45, 74, 0.18)",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #A67390 0%, #592D4A 100%)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(89, 45, 74, 0.28)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#592D4A";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(89, 45, 74, 0.18)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Start Your Application →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
