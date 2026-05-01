import { useEffect, useRef } from "react";
import tippingPointIcon from "../assets/TP_Stacked_BlackGreen.png";
import tippingPointLogo from "../assets/TP_Wide_BlackGreen_NoST.png";
import tippingPointHorizontal from "../assets/TP_Wide_BlackGreen_ST2.png";
import {
  CheckCircle2,
  Clock3,
  Shield,
  Users,
  TrendingUp,
  Smile,
} from "lucide-react";

import "../Styles/WelcomePage.css";

function WelcomePage({ onStart }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const revealElements = container.querySelectorAll(".welcome-reveal");

    if (!revealElements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="welcome-container" ref={containerRef}>
      <header className="welcome-header">
        <div className="welcome-header-content">
          <div className="welcome-header-logo">
            <img
              src={tippingPointLogo}
              alt="Tipping Point Real Estate Development"
              className="welcome-logo-image"
            />
          </div>
          <button
            type="button"
            className="welcome-header-cta"
            onClick={onStart}
          >
            Start Survey
          </button>
        </div>
      </header>

      <section className="welcome-hero">
        <div className="welcome-hero-content welcome-reveal">
          <div className="welcome-hero-icon">
            <img
              src={tippingPointIcon}
              alt="Tipping Point"
              className="welcome-icon-image"
            />
          </div>

          <h1 className="welcome-hero-title">Community Pulse</h1>

          <p className="welcome-hero-subtitle">
            A Tipping Point initiative to hear directly from residents
          </p>

          <div className="welcome-hero-actions">
            <button
              id="start"
              type="button"
              onClick={onStart}
              className="welcome-hero-button"
            >
              Start Survey
            </button>

            <a href="#transparency" className="welcome-hero-link">
              Learn how your input is used
            </a>
          </div>
        </div>
      </section>

      <section className="welcome-why-section">
        <div className="welcome-why-grid">
          <div className="welcome-why-block welcome-reveal">
            <div className="welcome-why-icon">
              <div className="welcome-icon-circle">
                <Users className="welcome-icon-white" />
              </div>
            </div>
            <h3 className="welcome-why-heading">Resident-Centered</h3>
            <p className="welcome-why-text">
              Community development works best when it reflects the real needs
              and priorities of the people who live here. Your perspective
              matters.
            </p>
          </div>

          <div className="welcome-why-block welcome-reveal">
            <div className="welcome-why-icon">
              <div className="welcome-icon-circle">
                <TrendingUp className="welcome-icon-white" />
              </div>
            </div>
            <h3 className="welcome-why-heading">Guides Investment</h3>
            <p className="welcome-why-text">
              Survey results directly inform where and how Tipping Point
              allocates resources for housing, services, and neighborhood
              improvements.
            </p>
          </div>

          <div className="welcome-why-block welcome-reveal">
            <div className="welcome-why-icon">
              <div className="welcome-icon-circle">
                <Smile className="welcome-icon-white" />
              </div>
            </div>
            <h3 className="welcome-why-heading">Simple &amp; Respectful</h3>
            <p className="welcome-why-text">
              We designed this experience to be easy, accessible, and respectful
              of your time. No jargon, no pressure, just honest questions.
            </p>
          </div>
        </div>
      </section>

      <section id="transparency" className="welcome-trust-section">
        <div className="welcome-trust-content">
          <div className="welcome-trust-header welcome-reveal">
            <h2 className="welcome-section-title">Built on Trust</h2>
            <p className="welcome-section-subtitle">
              Your privacy and peace of mind come first.
            </p>
          </div>

          <div className="welcome-trust-grid">
            <div className="welcome-trust-card welcome-reveal">
              <div className="welcome-trust-card-content">
                <div className="welcome-trust-icon" aria-hidden="true">
                  <Shield />
                </div>
                <div>
                  <h4 className="welcome-trust-card-title">
                    Surveys Are Anonymous
                  </h4>
                  <p className="welcome-trust-card-text">
                    Your responses are collected confidentially. We never share
                    individual answers or personally identifiable information.
                  </p>
                </div>
              </div>
            </div>

            <div className="welcome-trust-card welcome-reveal">
              <div className="welcome-trust-card-content">
                <div className="welcome-trust-icon" aria-hidden="true">
                  <CheckCircle2 />
                </div>
                <div>
                  <h4 className="welcome-trust-card-title">
                    Real Community Investment
                  </h4>
                  <p className="welcome-trust-card-text">
                    This is not a marketing exercise. Feedback directly shapes
                    planning priorities in your area.
                  </p>
                </div>
              </div>
            </div>

            <div className="welcome-trust-card welcome-reveal">
              <div className="welcome-trust-card-content">
                <div className="welcome-trust-icon" aria-hidden="true">
                  <Clock3 />
                </div>
                <div>
                  <h4 className="welcome-trust-card-title">
                    Takes Just a Few Minutes
                  </h4>
                  <p className="welcome-trust-card-text">
                    Most surveys are completed in 5-7 minutes. We value your
                    time and keep questions clear and focused.
                  </p>
                </div>
              </div>
            </div>

            <div className="welcome-trust-card-featured welcome-reveal">
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
                    Community Pulse is an official initiative from Tipping
                    Point, a trusted partner in community development and
                    affordable housing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="welcome-cta-section">
        <div className="welcome-cta-content welcome-reveal">
          <h2 className="welcome-cta-title">
            Ready to Share Your Perspective?
          </h2>

          <p className="welcome-cta-subtitle">
            Your input helps build stronger, more responsive communities that
            reflect the needs of residents.
          </p>

          <button
            type="button"
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
            © 2026 Tipping Point Management Company LLC • CommunityPulse
            Platform
          </div>
        </div>
      </footer>
    </div>
  );
}

export default WelcomePage;
