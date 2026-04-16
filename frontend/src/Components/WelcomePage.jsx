import React from "react";
import tippingPointIcon from "../assets/TP_Stacked_BlackGreen.png";
import tippingPointLogo from "../assets/TP_Wide_BlackGreen_NoST.png";
import tippingPointHorizontal from "../assets/TP_Wide_BlackGreen_ST2.png";

import "../Styles/WelcomePage.css";

function WelcomePage({ onStart }) {
  return (
    <div className="welcome-container">
      {/* Header with Tipping Point branding */}
      <header className="welcome-header">
        <div className="welcome-header-content">
          <div className="welcome-header-logo">
            <img 
              src={tippingPointLogo} 
              alt="Tipping Point Real Estate Development"
              className="welcome-logo-image"
            />
          </div>
          <a 
            href="#start"
            className="welcome-header-cta"
          >
            Start Survey
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="welcome-hero">
        <div className="welcome-hero-content">
          <div className="welcome-hero-icon">
            <img 
              src={tippingPointIcon} 
              alt="Tipping Point"
              className="welcome-icon-image"
            />
          </div>
          
          <h1 className="welcome-hero-title">
            Community Pulse
          </h1>
          
          <p className="welcome-hero-subtitle">
            A Tipping Point initiative to hear directly from residents
          </p>

          <div className="welcome-hero-actions">
            <button
              id="start"
              onClick={onStart}
              className="welcome-hero-button"
            >
              Start Survey
            </button>
            
            <a 
              href="#transparency"
              className="welcome-hero-link"
            >
              Learn how your input is used
            </a>
          </div>
        </div>
      </section>

      {/* Why Participate Section */}
      <section className="welcome-why-section">
        <div className="welcome-why-content">
          <h2 className="welcome-section-title">
            Why Your Voice Matters
          </h2>
          
          <p className="welcome-section-subtitle">
            Your feedback shapes the future of your neighborhood
          </p>

          <div className="welcome-why-grid">
            {/* Block 1 */}
            <div className="welcome-why-block">
              <div className="welcome-why-icon">
                <div className="welcome-icon-circle">
                  <span role="img" aria-label="residents">👥</span>
                </div>
              </div>
              <h3 className="welcome-why-heading">
                Resident-Centered
              </h3>
              <p className="welcome-why-text">
                Community development works best when it reflects the real needs and priorities of the people who live here. Your perspective matters.
              </p>
            </div>

            {/* Block 2 */}
            <div className="welcome-why-block">
              <div className="welcome-why-icon">
                <div className="welcome-icon-circle">
                  <span role="img" aria-label="report">📄</span>
                </div>
              </div>
              <h3 className="welcome-why-heading">
                Guides Design
              </h3>
              <p className="welcome-why-text">
                Survey results directly inform how Tipping Point plans for your community.
              </p>
            </div>

            {/* Block 3 */}
            <div className="welcome-why-block">
              <div className="welcome-why-icon">
                <div className="welcome-icon-circle">
                  <span role="img" aria-label="heart">❤️</span>
                </div>
              </div>
              <h3 className="welcome-why-heading">
                Simple & Respectful
              </h3>
              <p className="welcome-why-text">
                We designed this experience to be easy, accessible, and respectful of your time. No jargon, no pressure-just honest questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust and Transparency Section */}
      <section id="transparency" className="welcome-trust-section">
        <div className="welcome-trust-content">
          <div className="welcome-trust-header">
            <h2 className="welcome-section-title">
              Built on Trust
            </h2>
            <p className="welcome-section-subtitle">
              Your privacy and peace of mind come first.
            </p>
          </div>

          <div className="welcome-trust-grid">
            <div className="welcome-trust-card">
              <div className="welcome-trust-card-content">
                <div className="welcome-trust-icon">
                  <span role="img" aria-label="shield">🛡️</span>
                </div>
                <div>
                  <h4 className="welcome-trust-card-title">
                    Surveys Are Anonymous
                  </h4>
                  <p className="welcome-trust-card-text">
                    Your responses are collected confidentially. We never share individual answers or personally identifiable information.
                  </p>
                </div>
              </div>
            </div>

            <div className="welcome-trust-card">
              <div className="welcome-trust-card-content">
                <div className="welcome-trust-icon">
                  <span role="img" aria-label="check">✅</span>
                </div>
                <div>
                  <h4 className="welcome-trust-card-title">
                    Real Community Investment
                  </h4>
                  <p className="welcome-trust-card-text">
                    This isn't a marketing exercise. Feedback directly shapes planning priorities in your area.
                  </p>
                </div>
              </div>
            </div>

            <div className="welcome-trust-card">
              <div className="welcome-trust-card-content">
                <div className="welcome-trust-icon">
                  <span role="img" aria-label="clock">⏱️</span>
                </div>
                <div>
                  <h4 className="welcome-trust-card-title">
                    Takes Just a Few Minutes
                  </h4>
                  <p className="welcome-trust-card-text">
                    Most surveys are completed in 5-7 minutes. We value your time and keep questions clear and focused.
                  </p>
                </div>
              </div>
            </div>

            <div className="welcome-trust-card-featured">
              <div className="welcome-trust-card-content">
                <div className="welcome-trust-icon">
                  <img 
                    src={tippingPointIcon} 
                    alt="Tipping Point"
                    className="welcome-trust-logo"
                  />
                </div>
                <div>
                  <h4 className="welcome-trust-card-title">
                    Backed by Tipping Point
                  </h4>
                  <p className="welcome-trust-card-text">
                    CommunityPulse is an official initiative from Tipping Point, a trusted partner in community development and affordable housing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="welcome-cta-section">
        <div className="welcome-cta-content">
          <h2 className="welcome-cta-title">
            Ready to Share Your Perspective?
          </h2>
          
          <p className="welcome-cta-subtitle">
            Your input helps build stronger, more responsive communities that reflect the needs of residents.
          </p>

          <button
            onClick={onStart}
            className="welcome-cta-button"
          >
            Start Survey Now
          </button>

          <p className="welcome-cta-note">
            No account required • Fully anonymous • Takes 5-7 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        <div className="welcome-footer-content">
          <div className="welcome-footer-logo">
            <img 
              src={tippingPointHorizontal} 
              alt="Tipping Point"
              className="welcome-footer-logo-image"
            />
          </div>
          <div className="welcome-footer-text">
            © 2026 Tipping Point Management Company LLC • CommunityPulse Platform
          </div>
        </div>
      </footer>
    </div>
  );
}

export default WelcomePage;
