import React from "react";

const HeroSection = ({ onApplyClick }) => {
  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-white to-white">
      {/* Logo */}
      <div className="pt-8 pb-6 flex justify-center">
        <img
          src="../assets/logo.png"
          alt="The Velvet Box"
          className="h-24 w-auto"
        />
      </div>

      {/* Hero Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 pb-16">
        {/* We're Hiring Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-900 rounded-full mb-8 shadow-sm">
          <span className="text-2xl">🎉</span>
          <span className="text-purple-900 font-semibold text-lg">
            We're Hiring!
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4">
          <span className="text-purple-900">Join Our Team at</span>
          <br />
          <span
            className="font-black"
            style={{
              fontFamily: '"Short Stack", cursive',
              fontWeight: 900,
              background:
                "linear-gradient(90deg, #8B4167 0%, #A8566E 25%, #C57B6B 50%, #D9976A 75%, #E6B369 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            The Velvet Box
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-xl sm:text-2xl mb-10 max-w-3xl mx-auto">
          Leading event management company specializing in weddings and
          corporate events
        </p>

        {/* Apply Now Button */}
        <button
          onClick={onApplyClick}
          className="bg-linear-to-r from-purple-800 to-orange-400 text-white px-12 py-4 rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Apply Now
        </button>

        {/* Illustration */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-pink-100 to-pink-50 rounded-full blur-3xl opacity-50"></div>
          <img
            src="../assets/hero-hiring.png"
            alt="Team"
            className="relative z-10 w-full max-w-4xl mx-auto"
          />
        </div>
      </div>

      {/* About Us & Why Join Us - White Background Two Column Section */}
      <div className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
            {/* Left Column - About Us */}
            <div className="relative">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-purple-900"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-purple-900">
                  About Us
                </h2>
              </div>

              <div className="pl-13 space-y-4">
                <p className="text-gray-700 text-base leading-relaxed">
                  We are a leading event management company specializing in
                  weddings and corporate events. Our expertise lies in
                  delivering end-to-end solutions — from conceptualization and
                  planning to décor, logistics, artist management, and on-ground
                  execution.
                </p>
              </div>
            </div>

            {/* Right Column - Why Join Us */}
            <div>
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-purple-900"
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
                <h2 className="text-3xl sm:text-4xl font-bold text-purple-900">
                  Why Join Us?
                </h2>
              </div>

              <div className="pl-13 space-y-4 mb-6">
                <p className="text-gray-700 text-base leading-relaxed">
                  This is an exciting opportunity to be part of a creative,
                  fun-filled, and fast-growing team. You'll gain hands-on
                  experience in the wedding and events industry with immense
                  growth potential.
                </p>
              </div>

              {/* Benefits List - Checkmark Style */}
              <div className="pl-13 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center mt-0.5">
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
                  <p className="text-gray-700 text-base">
                    Work with top wedding and corporate events
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center mt-0.5">
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
                  <p className="text-gray-700 text-base">
                    Hands-on experience with immense growth potential
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center mt-0.5">
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
                  <p className="text-gray-700 text-base">
                    Creative and fun-filled work environment
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center mt-0.5">
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
                  <p className="text-gray-700 text-base">
                    Be part of a fast-growing team
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-16">
            <button
              onClick={onApplyClick}
              className="bg-linear-to-r from-purple-900 to-purple-800 text-white px-16 py-5 rounded-xl text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:from-orange-400 hover:to-orange-500"
            >
              Start Your Application →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
