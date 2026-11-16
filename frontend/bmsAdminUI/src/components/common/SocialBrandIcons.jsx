import React from "react";

export function WebsiteIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <radialGradient id="instaGrad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#instaGrad)" />
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#ffffff" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="4.2" stroke="#ffffff" strokeWidth="1.8" fill="none" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="#ffffff" />
    </svg>
  );
}

export function LinkedInIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path d="M6.5 6.5C6.5 7.6 5.6 8.5 4.5 8.5C3.4 8.5 2.5 7.6 2.5 6.5C2.5 5.4 3.4 4.5 4.5 4.5C5.6 4.5 6.5 5.4 6.5 6.5ZM2.7 10H6.3V21.5H2.7V10ZM12.2 10H8.7V21.5H12.2V15.5C12.2 12.2 16.5 11.9 16.5 15.5V21.5H20V14.3C20 8.7 13.6 8.9 12.2 11.7V10Z" fill="#ffffff" />
    </svg>
  );
}

export function YouTubeIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000" />
      <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff" />
    </svg>
  );
}

export function FacebookIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path d="M15.12 12.03h-2.12V20h-3.32v-7.97H8v-2.82h1.68V7.47c0-2.35 1.44-3.63 3.53-3.63 1 0 2.06.18 2.06.18v2.27h-1.16c-1.16 0-1.52.72-1.52 1.46v1.48h2.56l-.41 2.82z" fill="#ffffff" />
    </svg>
  );
}

export function TwitterXIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="4" fill="#000000" />
      <path d="M18.244 3.25h2.532l-5.53 6.32 6.507 8.68h-5.094l-3.99-5.217-4.568 5.217H5.564l5.915-6.76L5.25 3.25h5.223l3.606 4.767 4.165-4.767zm-.888 13.484h1.402L8.718 4.708H7.213l10.143 12.026z" fill="#ffffff" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path d="M17.5 14.3c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.2-.5 0-.2-.1-.4-.2-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.3c.2.2 2.4 3.7 5.8 5.1.8.3 1.4.5 1.9.7.8.3 1.6.2 2.1.1.7-.1 1.7-.7 1.9-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.5z" fill="#ffffff" />
    </svg>
  );
}

/**
 * Returns formatted URL for any social platform
 */
export function buildSocialUrl(platform, raw) {
  if (!raw || typeof raw !== "string") return "#";
  const val = raw.trim();
  if (val.startsWith("http://") || val.startsWith("https://")) return val;

  switch (platform) {
    case "website":
      return `https://${val}`;
    case "instagram":
      return `https://instagram.com/${val.replace(/^@/, "")}`;
    case "linkedin":
      return val.includes("linkedin.com") ? `https://${val}` : `https://linkedin.com/company/${val}`;
    case "youtube":
      return val.includes("youtube.com") ? `https://${val}` : `https://youtube.com/@${val.replace(/^@/, "")}`;
    case "facebook":
      return val.includes("facebook.com") ? `https://${val}` : `https://facebook.com/${val}`;
    case "twitter":
    case "x":
      return `https://x.com/${val.replace(/^@/, "")}`;
    case "whatsapp": {
      const cleanPhone = val.replace(/[^0-9]/g, "");
      return `https://wa.me/${cleanPhone}`;
    }
    default:
      return val;
  }
}

/**
 * Returns formatted handle/display text
 */
export function formatSocialDisplay(platform, raw) {
  if (!raw) return "";
  const val = raw.trim();
  switch (platform) {
    case "website":
      return val.replace(/^https?:\/\//, "").replace(/\/$/, "");
    case "instagram":
      return val.startsWith("@") ? val : `@${val.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "")}`;
    case "linkedin":
      return val.replace(/^https?:\/\/(www\.)?linkedin\.com\/(company\/|in\/)?/, "").replace(/\/$/, "") || "LinkedIn";
    case "youtube":
      return val.replace(/^https?:\/\/(www\.)?youtube\.com\//, "").replace(/\/$/, "") || "YouTube";
    case "facebook":
      return val.replace(/^https?:\/\/(www\.)?facebook\.com\//, "").replace(/\/$/, "") || "Facebook";
    case "twitter":
    case "x":
      return val.startsWith("@") ? val : `@${val.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, "").replace(/\/$/, "")}`;
    case "whatsapp":
      return val;
    default:
      return val;
  }
}
