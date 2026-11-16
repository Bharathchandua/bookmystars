import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getStoredUser } from "../features/bms/api/auth/authApi";
import { CLIENT_PORTAL_URL, PARTNER_PORTAL_URL, ADMIN_PORTAL_URL } from "../services/apiConfig";

import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import OpportunityCards from "../components/OpportunityCards.jsx";
import PodcastSection from "../components/PodcastSection.jsx";
import OpportunitiesSection from "../components/OpportunitiesSection.jsx";
import MediaSection from "../components/MediaSection.jsx";
import BottomServices from "../components/BottomServices.jsx";
import CTA from "../components/CTA.jsx";
import Footer from "../components/Footer.jsx";

import SignIn from "../components/ClientPartner/SignIn.jsx";
import JoinFree from "../components/ClientPartner/JoinFree.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Profile from "../pages/Profile/Profile.jsx";
import PublicProfile from "../pages/Profile/PublicProfile.jsx";
import MyMedia from "../pages/MyMedia/MyMedia.jsx";
import Auditions from "../pages/Auditions/Auditions.jsx";
import Opportunities from "../pages/Opportunities/Opportunities.jsx";
import Bookings from "../pages/Bookings/Bookings.jsx";
import Calendar from "../pages/Calendar/Calendar.jsx";
import Messages from "../pages/Messages/Messages.jsx";
import Contacts from "../pages/Contacts/Contacts.jsx";
import Talents from "../pages/Talents/Talents.jsx";

import Podcast from "../components/Services/Podcast/Podcast.jsx";
import OpportunitiesService from "../components/Services/Opportunities/Opportunities.jsx";
import MediaEntertainmentService from "../components/Services/MediaEntertainment/MediaEntertainment.jsx";
import MakeoverService from "../components/Services/MakeOver/MakeOver.jsx";
import Promotion from "../components/Services/Promotion/Promotion.jsx";
import PostProduction from "../components/Services/PostProduction/PostProduction.jsx";
import DigitalMarketing from "../components/Services/DigitalMarketing/DigitalMarketing.jsx";
import Media from "../components/Media/Media.jsx";
import BecomeClient from "../components/ClientPartner/BecomeClient/BecomeClient.jsx";
import BecomePartner from "../components/ClientPartner/BecomePartner/BecomePartner.jsx";

function HomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const navbarHeight = 95;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 150);
    }
  }, [hash]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <OpportunityCards />
        <PodcastSection />
        <OpportunitiesSection />
        <MediaSection />
        <BottomServices />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  if (user.accountType === "CLIENT") {
    window.location.href = `${CLIENT_PORTAL_URL}/dashboard`;
    return null;
  }
  if (user.accountType === "PARTNER") {
    window.location.href = `${PARTNER_PORTAL_URL}/dashboard`;
    return null;
  }
  return children;
}

function TalentRoute({ children }) {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

function RedirectToClient() {
  const location = useLocation();
  useEffect(() => {
    let target = CLIENT_PORTAL_URL;
    if (location.pathname.includes("signin") || location.pathname.includes("login")) {
      target = `${CLIENT_PORTAL_URL}/signin`;
    } else if (location.pathname.includes("dashboard")) {
      target = `${CLIENT_PORTAL_URL}/dashboard`;
    }
    window.location.replace(target);
  }, [location]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#fff" }}>
      <p>Redirecting to BookMyStars Client Portal...</p>
    </div>
  );
}

function RedirectToPartner() {
  const location = useLocation();
  useEffect(() => {
    let target = PARTNER_PORTAL_URL;
    if (location.pathname.includes("signin") || location.pathname.includes("login")) {
      target = `${PARTNER_PORTAL_URL}/signin`;
    } else if (location.pathname.includes("dashboard")) {
      target = `${PARTNER_PORTAL_URL}/dashboard`;
    }
    window.location.replace(target);
  }, [location]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#fff" }}>
      <p>Redirecting to BookMyStars Partner Portal...</p>
    </div>
  );
}

function RedirectToAdmin() {
  useEffect(() => {
    window.location.replace(ADMIN_PORTAL_URL);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#fff" }}>
      <p>Redirecting to BookMyStars Admin Desk...</p>
    </div>
  );
}

export default function UserRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/client/signin" element={<Navigate to="/signin" replace />} />
        <Route path="/partner/signin" element={<Navigate to="/signin" replace />} />
        <Route path="/client/login" element={<Navigate to="/signin" replace />} />
        <Route path="/partner/login" element={<Navigate to="/signin" replace />} />
        <Route path="/client-partner/signin" element={<SignIn />} />
        <Route path="/join" element={<JoinFree />} />
        <Route path="/client-partner/join" element={<JoinFree />} />

        {/* Protected Talent & Professional routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/professional/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/professional" element={<Navigate to="/dashboard" replace />} />
        <Route path="/profile" element={<TalentRoute><Profile /></TalentRoute>} />
        <Route path="/public-profile/:userId" element={<PublicProfile />} />
        <Route path="/my-media" element={<TalentRoute><MyMedia /></TalentRoute>} />
        <Route path="/auditions" element={<TalentRoute><Auditions /></TalentRoute>} />
        <Route path="/opportunities" element={<TalentRoute><Opportunities /></TalentRoute>} />
        <Route path="/bookings" element={<TalentRoute><Bookings /></TalentRoute>} />
        <Route path="/calendar" element={<TalentRoute><Calendar /></TalentRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/talents" element={<ProtectedRoute><Talents /></ProtectedRoute>} />
        <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/earnings" element={<Navigate to="/profile?tab=rates" replace />} />
        <Route path="/reviews" element={<Navigate to="/profile?tab=reviews" replace />} />
        <Route path="/settings" element={<Navigate to="/profile?tab=overview" replace />} />

        {/* Public Services */}
        <Route path="/podcast" element={<Podcast />} />
        <Route path="/services/opportunities" element={<OpportunitiesService />} />
        <Route path="/services/media-entertainment" element={<MediaEntertainmentService />} />
        <Route path="/services/makeover" element={<MakeoverService />} />
        <Route path="/services/promotion" element={<Promotion />} />
        <Route path="/services/post-production" element={<PostProduction />} />
        <Route path="/services/digital-marketing" element={<DigitalMarketing />} />
        <Route path="/media" element={<Media />} />

        {/* Dedicated Client & Partner Pages */}
        <Route path="/become-client" element={<BecomeClient />} />
        <Route path="/become-partner" element={<BecomePartner />} />
        <Route path="/client/*" element={<Navigate to="/become-client" replace />} />
        <Route path="/partner/*" element={<Navigate to="/become-partner" replace />} />
        <Route path="/admin/*" element={<RedirectToAdmin />} />
        <Route path="/admin" element={<RedirectToAdmin />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
