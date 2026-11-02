import { Camera, Video, Megaphone, Settings } from "lucide-react";
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import appAndroid from "../assets/app-android.png";
import appIos from "../assets/app-ios.png";

export default function FooterAgency() {
  return (
    <footer className="footer container">
      <div className="foot-brand">
        <div className="logo" style={{ border: 'none', padding: 0, background: 'none', marginBottom: '14px' }}>
          <img src={logo} alt="Book My Stars" style={{ height: '80px', display: 'block' }} />
        </div>
        <p style={{ fontSize: '14.5px', color: '#000000', lineHeight: '1.6', marginBottom: '20px' }}>
          India's trusted talent & production network connecting talent with real opportunities across entertainment and beyond.
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
        <h4 style={{ color: '#ec008c', textTransform: 'none', fontWeight: '800', marginBottom: '16px' }}>Company</h4>
        <a>About Us</a>
        <a>Careers</a>
        <a>Press & Media</a>
        <a>Contact Us</a>
        <a>Terms of Service</a>
        <a>Privacy Policy</a>
      </div>
      <div className="foot-services-col">
        <h4 style={{ color: '#ec008c', textTransform: 'none', fontWeight: '800', marginBottom: '16px' }}>Services</h4>
        <Link to="/podcast">Podcast</Link>
        <Link to="/services/opportunities">Opportunities</Link>
        <Link to="/services/media-entertainment">Media & Entertainment</Link>
        <Link to="/services/makeover">Makeover</Link>
        <Link to="/services/post-production">Post Production</Link>
        <Link to="/services/promotion">Promotion</Link>
        <Link to="/services/digital-marketing">Digital Marketing</Link>
      </div>
      <div className="apps" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'center' }}>
        <h4 style={{ color: '#ec008c', textTransform: 'none', fontWeight: '800', marginBottom: '16px' }}>Download Our App</h4>
        <div className="footer-badges-container">
          <a href="#googleplay" className="app-badge-link">
            <img src={appAndroid} alt="Google Play" className="app-badge-img" style={{ borderRadius: '12px' }} />
          </a>
          <a href="#appstore" className="app-badge-link">
            <img src={appIos} alt="App Store" className="app-badge-img" style={{ borderRadius: '12px' }} />
          </a>
        </div>
        <div className="footer-icons-row" style={{ display: 'flex', gap: '8px', marginTop: '14px', justifyContent: 'center' }}>
          <div style={{ width: '38px', height: '32px', borderRadius: '4px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
            <Camera size={16} />
          </div>
          <div style={{ width: '38px', height: '32px', borderRadius: '4px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
            <Video size={16} />
          </div>
          <div style={{ width: '38px', height: '32px', borderRadius: '4px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
            <Megaphone size={16} />
          </div>
          <div style={{ width: '38px', height: '32px', borderRadius: '4px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
            <Settings size={16} />
          </div>
        </div>
      </div>
      <p className="copy" style={{ fontSize: '15px', gridColumn: '1 / -1', textAlign: 'center', margin: '30px auto 0', justifySelf: 'center' }}>
        © 2026 Book My Stars. All rights reserved.
      </p>
    </footer>
  );
}
