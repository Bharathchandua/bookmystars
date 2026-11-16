import React from "react";
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaXTwitter } from "react-icons/fa6";
import logo from "../../assets/logo.png";
import appAndroid from "../../assets/app-android.png";
import appIos from "../../assets/app-ios.png";
import { USER_PORTAL_URL } from "../../services/apiConfig";

export default function ClientFooter() {
  return (
    <footer style={{
      background: "#090d16",
      borderTop: "1px solid #1e293b",
      padding: "60px 24px 30px",
      color: "#94a3b8",
      fontSize: "14px"
    }}>
      <div style={{
        maxWidth: "1340px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "40px",
        marginBottom: "40px"
      }}>
        <div>
          <img src={logo} alt="BookMyStars" style={{ height: "54px", marginBottom: "16px" }} />
          <p style={{ lineHeight: "1.6", color: "#64748b" }}>
            The Premier Casting & Commercial Production Hub connecting Brands, Film Studios & Ad Agencies with top-tier verified talent across India.
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px", fontSize: "18px", color: "#cbd5e1" }}>
            <FaInstagram style={{ cursor: "pointer" }} />
            <FaFacebook style={{ cursor: "pointer" }} />
            <FaLinkedin style={{ cursor: "pointer" }} />
            <FaYoutube style={{ cursor: "pointer" }} />
            <FaXTwitter style={{ cursor: "pointer" }} />
          </div>
        </div>

        <div>
          <h4 style={{ color: "#ec008c", fontSize: "15px", fontWeight: "800", marginBottom: "16px" }}>Client Solutions</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li><a href="#client-registration-section" style={{ color: "#94a3b8", textDecoration: "none" }}>Hire Verified Actors</a></li>
            <li><a href="#client-registration-section" style={{ color: "#94a3b8", textDecoration: "none" }}>Post Brand Commercials</a></li>
            <li><a href="#client-registration-section" style={{ color: "#94a3b8", textDecoration: "none" }}>Influencer Collaborations</a></li>
            <li><a href="#client-registration-section" style={{ color: "#94a3b8", textDecoration: "none" }}>Production Crew Booking</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: "#ec008c", fontSize: "15px", fontWeight: "800", marginBottom: "16px" }}>Portals</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li><a href={USER_PORTAL_URL} style={{ color: "#38bdf8", textDecoration: "none", fontWeight: "700" }}>Talent & Professional Portal</a></li>
            <li><a href={`${USER_PORTAL_URL}/become-partner`} style={{ color: "#94a3b8", textDecoration: "none" }}>Academy & Partner Portal</a></li>
            <li><a href={`${USER_PORTAL_URL}/podcast`} style={{ color: "#94a3b8", textDecoration: "none" }}>Celebrity Podcast</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: "#ec008c", fontSize: "15px", fontWeight: "800", marginBottom: "16px" }}>Mobile Apps</h4>
          <p style={{ fontSize: "13px", color: "#64748b" }}>Manage auditions and casting calls on the go.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <img src={appAndroid} alt="Android App" style={{ height: "40px", width: "fit-content", borderRadius: "8px" }} />
            <img src={appIos} alt="iOS App" style={{ height: "40px", width: "fit-content", borderRadius: "8px" }} />
          </div>
        </div>
      </div>

      <div style={{
        borderTop: "1px solid #1e293b",
        paddingTop: "24px",
        textAlign: "center",
        fontSize: "12.5px",
        color: "#475569"
      }}>
        © {new Date().getFullYear()} BookMyStars Client Portal. All rights reserved.
      </div>
    </footer>
  );
}
