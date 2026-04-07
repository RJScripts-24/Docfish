import { Fish, Twitter, Linkedin, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="df-footer">
      <div className="df-footer-grid">
        {/* Brand column */}
        <div className="df-footer-brand">
          <a href="#" className="df-footer-logo">
            <Fish size={22} />
            <span>Docfish</span>
          </a>
          <p className="df-footer-desc">
            AI-powered document intelligence for invoices. Extract, validate, and distribute structured data at scale.
          </p>
          <div className="df-footer-socials">
            <a href="#" aria-label="Twitter"><Twitter size={16} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={16} /></a>
            <a href="#" aria-label="GitHub"><Github size={16} /></a>
          </div>
        </div>

        {/* Product column */}
        <div className="df-footer-col">
          <h4>Product</h4>
          <ul>
            <li><a href="#">AI Extraction</a></li>
            <li><a href="#">Validation Layer</a></li>
            <li><a href="#">REST API</a></li>
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">Prompt Versioning</a></li>
          </ul>
        </div>

        {/* Resources column */}
        <div className="df-footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Case Studies</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Changelog</a></li>
            <li><a href="#">Help Docs</a></li>
            <li><a href="#">API Reference</a></li>
          </ul>
        </div>

        {/* Subscribe column */}
        <div className="df-footer-col">
          <h4>Subscribe</h4>
          <div className="df-footer-subscribe">
            <div className="df-footer-subscribe-form">
              <input type="email" placeholder="Your email address" />
              <button type="button">Subscribe</button>
            </div>
            <p className="df-footer-privacy">
              By subscribing you agree to our Privacy Policy. We'll never spam you.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="df-footer-bottom">
        <span className="df-footer-copyright">© 2025 Docfish. All rights reserved.</span>
        <div className="df-footer-legal">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Cookies</a>
          <a href="#">Status</a>
        </div>
      </div>
    </footer>
  );
}
