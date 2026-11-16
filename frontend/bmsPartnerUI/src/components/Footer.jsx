import { Phone, Mail } from "lucide-react";
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import appAndroid from "../assets/app-android.png";
import appIos from "../assets/app-ios.png";

export default function Footer() {
  return (
    <footer className="footer container">
      <div className="foot-brand">
        <div className="logo" style={{ border: 'none', padding: 0, background: 'none', marginBottom: '14px' }}>
          <img src={logo} alt="Book My Stars" style={{ height: '80px', display: 'block' }} />
        </div>
        <p>
          A/36, 3rd Floor, 36th Main Road, 2nd Block,
          <br />
          Rajajinagar, Bengaluru – 560010
        </p>
        <p style={{ marginTop: '12px' }}>
          <Phone size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> 
          <span style={{ verticalAlign: 'middle' }}>+91 63637 22597</span>
          <br />
          <Mail size={16} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> 
          <span style={{ verticalAlign: 'middle' }}>hire@bookmystars.com</span>
        </p>
        <div className="social">
          <FaInstagram />
          <FaFacebook />
          <FaLinkedin />
          <FaYoutube />
          <FaXTwitter />
        </div>
      </div>
      <div>
        <h4>Company</h4>
        <a>About Us</a>
        <a>Contact Us</a>
        <a>Terms of Service</a>
        <a>Privacy Policy</a>
      </div>
      <div className="foot-services-col">
        <h4>Services</h4>
        <Link to="/podcast">Podcast</Link>
        <Link to="/services/opportunities">Opportunities</Link>
        <Link to="/services/media-entertainment">Media & Entertainment</Link>
        <Link to="/services/makeover">Makeover</Link>
        <Link to="/services/post-production">Post Production</Link>
        <Link to="/services/promotion">Promotion</Link>
        <Link to="/services/digital-marketing">Digital Marketing</Link>
      </div>
      <div className="apps">
        <div className="apps-group-wrapper">
          <h4>COMING SOON</h4>
          <div className="apps-container">
            <a href="#googleplay" className="app-badge-link">
              <img src={appAndroid} alt="Android App" className="app-badge-img" />
            </a>
            <a href="#appstore" className="app-badge-link">
              <img src={appIos} alt="iOS App" className="app-badge-img" />
            </a>
          </div>
        </div>
      </div>
      <p className="copy" style={{ fontSize: '15px' }}>© 2026 Book My Stars. All rights reserved.</p>
    </footer>
  );
}


