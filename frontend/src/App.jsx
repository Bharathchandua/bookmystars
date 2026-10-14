import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { getStoredUser } from "./services/api";

import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import OpportunityCards from "./components/OpportunityCards.jsx";
import PodcastSection from "./components/PodcastSection.jsx";
import OpportunitiesSection from "./components/OpportunitiesSection.jsx";
import MediaSection from "./components/MediaSection.jsx";
import MakeoverSection from "./components/MakeoverSection.jsx";
import BottomServices from "./components/BottomServices.jsx";
import CTA from "./components/CTA.jsx";
import Footer from "./components/Footer.jsx";

import SignIn from "./components/ClientPartner/SignIn.jsx";
import JoinFree from "./components/ClientPartner/JoinFree.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import PublicProfile from "./pages/Profile/PublicProfile.jsx";
import MyMedia from "./pages/MyMedia/MyMedia.jsx";
import Auditions      from "./pages/Auditions/Auditions.jsx";
import Opportunities from "./pages/Opportunities/Opportunities.jsx";
import Bookings      from "./pages/Bookings/Bookings.jsx";
import Calendar     from "./pages/Calendar/Calendar.jsx";
import Messages     from "./pages/Messages/Messages.jsx";
import Contacts     from "./pages/Contacts/Contacts.jsx";
import ProfessionalDashboard from "./pages/Professional/ProfessionalDashboard.jsx";
import BecomeClient from "./components/ClientPartner/BecomeClient/BecomeClient.jsx";
import BecomePartner from "./components/ClientPartner/BecomePartner/BecomePartner.jsx";
import Podcast from "./components/Services/Podcast/Podcast.jsx";
import OpportunitiesService from "./components/Services/Opportunities/Opportunities.jsx";
import MediaEntertainmentService from "./components/Services/MediaEntertainment/MediaEntertainment.jsx";
import MakeoverService from "./components/Services/MakeOver/MakeOver.jsx";
import Promotion from "./components/Services/Promotion/Promotion.jsx";
import PostProduction from "./components/Services/PostProduction/PostProduction.jsx";
import DigitalMarketing from "./components/Services/DigitalMarketing/DigitalMarketing.jsx";
import Media from "./components/Media/Media.jsx";

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
        <MakeoverSection />
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
  return children;
}

function ProfessionalRoute({ children }) {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  const type = (user.accountType || "").toUpperCase();
  if (type !== "PROFESSIONAL") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function TalentRoute({ children }) {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  const type = (user.accountType || "").toUpperCase();
  if (type === "PROFESSIONAL") {
    return <Navigate to="/professional/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/client-partner/signin" element={<SignIn />} />
        <Route path="/join" element={<JoinFree />} />
        <Route path="/client-partner/join" element={<JoinFree />} />
        <Route path="/dashboard" element={<TalentRoute><Dashboard /></TalentRoute>} />
        <Route path="/professional/dashboard" element={<ProfessionalRoute><ProfessionalDashboard /></ProfessionalRoute>} />
        <Route path="/professional" element={<Navigate to="/professional/dashboard" replace />} />
        <Route path="/profile"   element={<TalentRoute><Profile /></TalentRoute>} />
        <Route path="/public-profile/:userId" element={<PublicProfile />} />
        <Route path="/my-media"  element={<TalentRoute><MyMedia /></TalentRoute>} />
        <Route path="/auditions"     element={<TalentRoute><Auditions /></TalentRoute>} />
        <Route path="/opportunities" element={<TalentRoute><Opportunities /></TalentRoute>} />
        <Route path="/bookings"      element={<TalentRoute><Bookings /></TalentRoute>} />
        <Route path="/calendar"     element={<TalentRoute><Calendar /></TalentRoute>} />
        <Route path="/messages"     element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/contacts"     element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
        <Route path="/become-client" element={<BecomeClient />} />
        <Route path="/become-partner" element={<BecomePartner />} />
        <Route path="/podcast" element={<Podcast />} />
        <Route path="/services/opportunities" element={<OpportunitiesService />} />
        <Route path="/services/media-entertainment" element={<MediaEntertainmentService />} />
        <Route path="/services/makeover" element={<MakeoverService />} />
        <Route path="/services/promotion" element={<Promotion />} />
        <Route path="/services/post-production" element={<PostProduction />} />
        <Route path="/services/digital-marketing" element={<DigitalMarketing />} />
        <Route path="/media" element={<Media />} />
      </Routes>
    </>
  );
}