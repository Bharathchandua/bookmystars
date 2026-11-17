import PagesButton from "../common/PagesButton";
import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Phone, Video, MoreVertical, Mic, Send, Camera, ArrowLeft, Lock, Check, X, ShieldCheck, Clock,
  Calendar, MapPin, IndianRupee, Film, CheckCircle2, XCircle, UserPlus, UserMinus, Ban, Info,
  Image, Play, FileText, Music, Link2, ExternalLink, Download, UploadCloud, Folder, Sparkles, Eye, Plus, Maximize2, Loader2, Paperclip,
  ChevronDown, CornerUpLeft, CornerUpRight, Copy, Smile, Star, Pin, Trash2, Bot,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen
} from "lucide-react";
import { 
  getMyPortfolio, 
  getMyVideos, 
  getMyAudios, 
  getMyDocuments, 
  getFullImageUrl 
} from "../../features/bms/api";

const isYouTubeOrVimeo = (url) => {
  if (!url || typeof url !== "string") return false;
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
};

const getEmbedUrl = (url) => {
  if (!url) return "";
  try {
    if (url.includes("youtube.com/watch")) {
      const v = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${v}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
  } catch (e) {}
  return url;
};

const detectMediaType = (url) => {
  if (!url || typeof url !== "string") return "DOCUMENT";
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(clean)) return "IMAGE";
  if (/\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(clean)) return "VIDEO";
  if (/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(clean)) return "AUDIO";
  if (/\.(pdf|doc|docx|txt|xls|xlsx|ppt|pptx)$/i.test(clean)) return "DOCUMENT";
  if (/^https?:\/\//i.test(url)) return "LINK";
  return "DOCUMENT";
};

const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const WhatsAppEmojiIcon = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Outer sticker shape with folded bottom-right corner */}
    <path d="M7 3h10a4 4 0 0 1 4 4v8L15 21H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" />
    {/* Folded corner flap */}
    <path d="M15 21v-4a2 2 0 0 1 2-2h4" />
    {/* Left Eye */}
    <path d="M9 9h0" />
    {/* Right Eye */}
    <path d="M15 9h0" />
    {/* Smile Mouth */}
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
  </svg>
);

const VerticalPaperclipIcon = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    {...props}
  >
    <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z"/>
  </svg>
);

export default function ChatWindow({ 
  activeChat, 
  messages, 
  conversations = [],
  onSendMessage, 
  onUploadFile,
  onDeleteMessage,
  onBack, 
  isChatListOpen = true,
  onToggleChatList,
  isRightSidebarOpen = true,
  onToggleRightSidebar,
  onOpenSidebar, 
  onRespondAccessRequest,
  onRespondBookingRequest,
  onRespondChatRequest,
  onSendChatRequest,
  onCancelChatRequest,
  onDisconnectChat,
  onBlockUser,
  onUnblockUser,
  currentUserId,
  isOtherUserTyping = false,
  onTyping
}) {
  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const attachMenuRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // WhatsApp Message Action States
  const [activeMenuMsgId, setActiveMenuMsgId] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [starredMessageIds, setStarredMessageIds] = useState(new Set());
  const [pinnedMessageId, setPinnedMessageId] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [forwardSearch, setForwardSearch] = useState("");

  // Hidden file inputs
  const localFileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const typingDebounceRef = useRef(null);

  // Handle typing debounce
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    if (onTyping) {
      onTyping(true);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        onTyping(false);
      }, 2500);
    }
  };

  useEffect(() => {
    return () => {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      if (onTyping) onTyping(false);
    };
  }, [activeChat?.id, onTyping]);

  // Local File Upload Modal State (Multiple Media Support)
  const [selectedLocalFiles, setSelectedLocalFiles] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [uploadCaption, setUploadCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Account Media Selector Modal State
  const [isAccountMediaModalOpen, setIsAccountMediaModalOpen] = useState(false);
  const [accountMediaTab, setAccountMediaTab] = useState("photos"); // "photos" | "videos" | "audios" | "documents"
  const [accountMediaItems, setAccountMediaItems] = useState({ photos: [], videos: [], audios: [], documents: [] });
  const [isLoadingAccountMedia, setIsLoadingAccountMedia] = useState(false);
  const [selectedAccountMedia, setSelectedAccountMedia] = useState(null);
  const [accountMediaCaption, setAccountMediaCaption] = useState("");

  // Share Media Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [mediaLinkUrl, setMediaLinkUrl] = useState("");
  const [mediaLinkCaption, setMediaLinkCaption] = useState("");

  // Image Lightbox Modal State
  const [selectedLightboxImage, setSelectedLightboxImage] = useState(null);

  // Track chat ID and message count to only auto-scroll when appropriate
  const prevChatIdRef = useRef(activeChat?.id);
  const prevMsgCountRef = useRef(messages.length);
  const isUserScrolledUpRef = useRef(false);

  // Track if user manually scrolled up to read earlier message history
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // User is considered at the bottom if within 120px from bottom edge
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    isUserScrolledUpRef.current = !isNearBottom;
  };

  // Scroll ONLY the inner messages container, NEVER scrolling the window or outer page!
  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    const chatChanged = prevChatIdRef.current !== activeChat?.id;
    const newMessagesAdded = messages.length > prevMsgCountRef.current;
    prevChatIdRef.current = activeChat?.id;
    prevMsgCountRef.current = messages.length;

    // Auto-scroll ONLY on switching chats, or when new messages arrive while user is already at bottom
    if (chatChanged || (newMessagesAdded && !isUserScrolledUpRef.current)) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, activeChat?.id]);

  // Close header options dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setIsAttachMenuOpen(false);
      }
      if (!e.target.closest(".wa-context-menu-wrapper") && !e.target.closest(".msg-bubble-chevron-btn")) {
        setActiveMenuMsgId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    if (onTyping) onTyping(false);
    onSendMessage({
      text: inputText.trim(),
      messageText: inputText.trim(),
      replyTo: replyingTo ? {
        id: replyingTo.id,
        senderName: replyingTo.sender === "me" ? "You" : activeChat?.name,
        text: replyingTo.text || replyingTo.fileName || "Media attachment"
      } : null
    });
    setInputText("");
    setReplyingTo(null);
  };

  // WhatsApp Message Action Handlers
  const handleToggleReaction = (msgId, emoji) => {
    setActiveMenuMsgId(null);
    setMessageReactions((prev) => {
      const list = prev[msgId] || [];
      const hasMine = list.some(r => r.emoji === emoji && r.byMe);
      let updated;
      if (hasMine) {
        updated = list.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, byMe: false } : r)
                      .filter(r => r.count > 0);
      } else {
        const existing = list.find(r => r.emoji === emoji);
        if (existing) {
          updated = list.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, byMe: true } : r);
        } else {
          updated = [...list, { emoji, count: 1, byMe: true }];
        }
      }
      return { ...prev, [msgId]: updated };
    });
  };

  const handleReplyMessage = (msg) => {
    setActiveMenuMsgId(null);
    setReplyingTo(msg);
  };

  const handleCopyMessage = async (msg) => {
    setActiveMenuMsgId(null);
    const content = msg.text || msg.mediaUrl || msg.fileName || "";
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Copied to clipboard",
          showConfirmButton: false,
          timer: 1600,
          timerProgressBar: true
        });
      } catch (e) {
        console.error("Clipboard write error:", e);
      }
    }
  };

  const handleForwardMessage = (msg) => {
    setActiveMenuMsgId(null);
    setForwardingMessage(msg);
    setForwardSearch("");
  };

  const handleExecuteForward = (targetConv) => {
    if (!forwardingMessage || !targetConv) return;
    onSendMessage({
      targetChatId: targetConv.id,
      text: forwardingMessage.text || "",
      messageText: forwardingMessage.text || "",
      mediaUrl: forwardingMessage.mediaUrl,
      mediaType: forwardingMessage.mediaType,
      fileName: forwardingMessage.fileName,
      fileSize: forwardingMessage.fileSize,
      recipientId: targetConv.targetUserId
    });
    setForwardingMessage(null);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `Forwarded to ${targetConv.name}`,
      showConfirmButton: false,
      timer: 1800
    });
  };

  const handleTogglePinMessage = (msgId) => {
    setActiveMenuMsgId(null);
    setPinnedMessageId(prev => prev === msgId ? null : msgId);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: pinnedMessageId === msgId ? "Message unpinned" : "Message pinned to top",
      showConfirmButton: false,
      timer: 1600
    });
  };

  const handleToggleStarMessage = (msgId) => {
    setActiveMenuMsgId(null);
    setStarredMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  const handleAskBmsAi = (msg) => {
    setActiveMenuMsgId(null);
    const query = `Can you explain or summarize this message: "${msg.text || msg.fileName || ""}"`;
    setInputText(query);
  };

  const handleConfirmDeleteMessage = async (msg) => {
    setActiveMenuMsgId(null);
    const isMe = msg.sender === "me";

    if (isMe) {
      const result = await Swal.fire({
        title: "Delete message?",
        html: `<div style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 6px;">
          Choose whether to delete this message for everyone or only for yourself.
        </div>`,
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonColor: "#dc2626",
        denyButtonColor: "#475569",
        cancelButtonColor: "#94a3b8",
        confirmButtonText: "Delete for everyone",
        denyButtonText: "Delete for me",
        cancelButtonText: "Cancel",
        reverseButtons: false,
        customClass: {
          popup: "bms-swal-popup",
          title: "bms-swal-title",
          confirmButton: "bms-swal-btn-danger",
          denyButton: "bms-swal-btn-secondary",
          cancelButton: "bms-swal-btn-cancel",
        }
      });

      if (result.isConfirmed) {
        onDeleteMessage?.(activeChat.id, msg.id, "everyone");
      } else if (result.isDenied) {
        onDeleteMessage?.(activeChat.id, msg.id, "me");
      }
    } else {
      const result = await Swal.fire({
        title: "Delete message for me?",
        html: `<div style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 6px;">
          This message will be removed from your chat view.
        </div>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Delete for me",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        customClass: {
          popup: "bms-swal-popup",
          title: "bms-swal-title",
          confirmButton: "bms-swal-btn-danger",
          cancelButton: "bms-swal-btn-cancel",
        }
      });

      if (result.isConfirmed) {
        onDeleteMessage?.(activeChat.id, msg.id, "me");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Load account media from API
  const handleOpenAccountMedia = async () => {
    setIsAttachMenuOpen(false);
    setIsAccountMediaModalOpen(true);
    setSelectedAccountMedia(null);
    setAccountMediaCaption("");
    setIsLoadingAccountMedia(true);
    try {
      const [photos, videos, audios, docs] = await Promise.all([
        getMyPortfolio().catch(() => []),
        getMyVideos().catch(() => []),
        getMyAudios().catch(() => []),
        getMyDocuments().catch(() => [])
      ]);
      setAccountMediaItems({
        photos: Array.isArray(photos) ? photos : [],
        videos: Array.isArray(videos) ? videos : [],
        audios: Array.isArray(audios) ? audios : [],
        documents: Array.isArray(docs) ? docs : []
      });
    } catch (err) {
      console.error("Failed to load account media:", err);
    } finally {
      setIsLoadingAccountMedia(false);
    }
  };

  // Local file selection (supports multiple files)
  const handleLocalFileSelect = (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;
    setIsAttachMenuOpen(false);

    const newItems = rawFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type || "",
      name: file.name,
      size: file.size
    }));

    setSelectedLocalFiles((prev) => {
      const updated = [...prev, ...newItems];
      return updated;
    });
    e.target.value = "";
  };

  const handleRemoveLocalFile = (indexToRemove) => {
    setSelectedLocalFiles((prev) => {
      const removed = prev[indexToRemove];
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (activeFileIndex >= updated.length) {
        setActiveFileIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleSendLocalFiles = async () => {
    if (!selectedLocalFiles.length) return;
    try {
      setIsUploading(true);
      if (onUploadFile) {
        for (let i = 0; i < selectedLocalFiles.length; i++) {
          const item = selectedLocalFiles[i];
          await onUploadFile(item.file, i === 0 ? uploadCaption : "");
        }
      }
      selectedLocalFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      setSelectedLocalFiles([]);
      setActiveFileIndex(0);
      setUploadCaption("");
    } catch (err) {
      console.error("Local file upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelLocalFiles = () => {
    selectedLocalFiles.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setSelectedLocalFiles([]);
    setActiveFileIndex(0);
    setUploadCaption("");
  };

  // Send selected account media
  const handleSendAccountMedia = () => {
    if (!selectedAccountMedia) return;
    const mediaUrl = selectedAccountMedia.url;
    const mediaType = selectedAccountMedia.type;
    const fileName = selectedAccountMedia.title;
    const caption = accountMediaCaption.trim();

    onSendMessage({
      messageText: caption,
      mediaUrl,
      mediaType,
      fileName
    });

    setIsAccountMediaModalOpen(false);
    setSelectedAccountMedia(null);
    setAccountMediaCaption("");
  };

  // Send media link
  const handleSendMediaLink = () => {
    if (!mediaLinkUrl.trim()) return;
    const url = mediaLinkUrl.trim();
    const caption = mediaLinkCaption.trim();
    let type = "LINK";
    if (isYouTubeOrVimeo(url)) {
      type = "VIDEO";
    } else {
      type = detectMediaType(url);
    }

    onSendMessage({
      messageText: caption,
      mediaUrl: url,
      mediaType: type,
      fileName: caption || url
    });

    setIsLinkModalOpen(false);
    setMediaLinkUrl("");
    setMediaLinkCaption("");
  };

  if (!activeChat) {
    return (
      <div className="msg-chat-window-empty" style={{ position: "relative" }}>
        {!isChatListOpen && onToggleChatList && (
          <button
            type="button"
            className="msg-header-panel-toggle-btn active"
            onClick={onToggleChatList}
            title="Show conversations"
            style={{ position: "absolute", top: 16, left: 16 }}
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
        <div className="msg-empty-icon">💬</div>
        <h3>No conversation selected</h3>
        <p>Choose a contact from the left list to start messaging.</p>
        {!isChatListOpen && onToggleChatList && (
          <button
            type="button"
            onClick={onToggleChatList}
            style={{
              marginTop: 14,
              padding: "8px 16px",
              background: "#ee008f",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13
            }}
          >
            <PanelLeftOpen size={16} /> Open Chat List
          </button>
        )}
      </div>
    );
  }

  const { booking } = activeChat;
  const chatReq = activeChat.chatRequest;
  const rawStatus = (chatReq?.rawStatus || chatReq?.status || "NONE").toUpperCase();
  const isChatPending = rawStatus === "PENDING" || rawStatus === "OUTGOING_PENDING" || rawStatus === "INCOMING_PENDING";
  const isConnected = rawStatus === "ACCEPTED";
  const isCancelled = rawStatus === "CANCELLED";
  const isDeclined = rawStatus === "DECLINED";
  const isBlocked = rawStatus === "BLOCKED" || rawStatus === "BLOCKED_BY_ME";
  const isBlockedByMe = chatReq?.blockedByMe || rawStatus === "BLOCKED_BY_ME" || (rawStatus === "BLOCKED" && currentUserId && String(chatReq?.senderId) === String(currentUserId));
  const isRequester = rawStatus === "OUTGOING_PENDING" || (chatReq && currentUserId && String(chatReq.senderId) === String(currentUserId));
  const isRecipient = rawStatus === "INCOMING_PENDING" || (chatReq && currentUserId && String(chatReq.recipientId) === String(currentUserId));

  // If a chat is purely peer-to-peer and not connected via booking or accepted request
  const isDisconnectedOrNone = (rawStatus === "NONE" || isCancelled || isDeclined) && !activeChat.bookingRequest && !activeChat.booking;

  // SweetAlert Confirmation Handlers
  const handleConfirmBlock = async () => {
    setIsMenuOpen(false);
    const result = await Swal.fire({
      title: `Block ${activeChat.name}?`,
      html: `<div style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 6px;">
        They will not be able to send you messages or contact you. You can unblock them at any time.
      </div>`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Block User",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "bms-swal-popup",
        title: "bms-swal-title",
        confirmButton: "bms-swal-btn-danger",
        cancelButton: "bms-swal-btn-cancel",
      }
    });

    if (result.isConfirmed) {
      onBlockUser?.(activeChat.targetUserId);
    }
  };

  const handleConfirmUnblock = async () => {
    setIsMenuOpen(false);
    const result = await Swal.fire({
      title: `Unblock ${activeChat.name}?`,
      html: `<div style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 6px;">
        You will be able to send connection requests and chat with <strong>${activeChat.name}</strong> again.
      </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Unblock",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "bms-swal-popup",
        title: "bms-swal-title",
        confirmButton: "bms-swal-btn",
        cancelButton: "bms-swal-btn-cancel",
      }
    });

    if (result.isConfirmed) {
      onUnblockUser?.(activeChat.targetUserId);
    }
  };

  const handleConfirmCancelRequest = async (requestId) => {
    setIsMenuOpen(false);
    const targetReqId = requestId || chatReq?.id;
    const result = await Swal.fire({
      title: "Cancel Chat Request?",
      html: `<div style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 6px;">
        Do you want to cancel the connection request sent to <strong>${activeChat.name}</strong>?
      </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d97706",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Cancel Request",
      cancelButtonText: "Keep Request",
      reverseButtons: true,
      customClass: {
        popup: "bms-swal-popup",
        title: "bms-swal-title",
        confirmButton: "bms-swal-btn",
        cancelButton: "bms-swal-btn-cancel",
      }
    });

    if (result.isConfirmed) {
      onCancelChatRequest?.(targetReqId);
    }
  };

  return (
    <div className="msg-chat-window-panel">
      {/* Chat Header */}
      <div className="msg-chat-header">
        <div className="msg-header-user-info">
          {onBack && (
            <PagesButton className="msg-back-btn" onClick={onBack} title="Back to chats">
              <ArrowLeft size={20} />
            </PagesButton>
          )}
          {onToggleChatList && (
            <button
              type="button"
              className={`msg-header-panel-toggle-btn ${!isChatListOpen ? "active" : ""}`}
              onClick={onToggleChatList}
              title={isChatListOpen ? "Collapse conversation list" : "Show conversation list"}
            >
              {isChatListOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
          )}
          <div className="msg-header-avatar-wrap" onClick={onOpenSidebar} style={{ cursor: "pointer" }}>
            <img src={activeChat.avatar} alt={activeChat.name} className="msg-header-avatar" />
            {activeChat.online && <span className="msg-online-dot header" />}
          </div>
          <div className="msg-header-text" onClick={onOpenSidebar} style={{ cursor: "pointer" }}>
            <h3>{activeChat.name}</h3>
            {isOtherUserTyping ? (
              <p style={{ color: "#10b981", fontWeight: 700, fontStyle: "italic", margin: 0 }}>
                typing...
              </p>
            ) : (
              <p>
                {activeChat.role} {activeChat.company && `· ${activeChat.company}`}
                {activeChat.online && <span style={{ color: "#10b981", marginLeft: 6, fontWeight: 700 }}>• Online</span>}
              </p>
            )}
          </div>
        </div>

        <div className="msg-header-actions">
          <PagesButton className="msg-header-btn" title="Call">
            <Phone size={18} />
          </PagesButton>
          <PagesButton className="msg-header-btn" title="Video Call">
            <Video size={18} />
          </PagesButton>

          {onToggleRightSidebar && (
            <PagesButton
              className={`msg-header-btn ${isRightSidebarOpen ? "active-panel-toggle" : ""}`}
              title={isRightSidebarOpen ? `Hide About ${activeChat.name}` : `Show About ${activeChat.name}`}
              onClick={onToggleRightSidebar}
            >
              {isRightSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </PagesButton>
          )}
          
          {/* Header Options Dropdown */}
          <div style={{ position: "relative" }} ref={menuRef}>
            <PagesButton 
              className="msg-header-btn" 
              title="More options" 
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <MoreVertical size={18} />
            </PagesButton>

            {isMenuOpen && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 8,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
                zIndex: 60,
                minWidth: 195,
                padding: "6px 0",
                display: "flex",
                flexDirection: "column"
              }}>
                <button
                  type="button"
                  onClick={() => { setIsMenuOpen(false); onToggleRightSidebar ? onToggleRightSidebar() : onOpenSidebar?.(); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 16px",
                    border: "none",
                    background: "transparent",
                    color: "#334155",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%"
                  }}
                >
                  <Info size={15} color="#64748b" /> {isRightSidebarOpen ? `Hide About ${activeChat.name}` : `About ${activeChat.name}`}
                </button>

                {isChatPending && isRequester && (
                  <button
                    type="button"
                    onClick={() => handleConfirmCancelRequest(chatReq?.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 16px",
                      border: "none",
                      background: "transparent",
                      color: "#d97706",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%"
                    }}
                  >
                    <X size={15} color="#d97706" /> Cancel Request
                  </button>
                )}

                <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />

                {isBlocked ? (
                  <button
                    type="button"
                    onClick={handleConfirmUnblock}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 16px",
                      border: "none",
                      background: "transparent",
                      color: "#16a34a",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%"
                    }}
                  >
                    <ShieldCheck size={15} color="#16a34a" /> Unblock User
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmBlock}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 16px",
                      border: "none",
                      background: "transparent",
                      color: "#dc2626",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%"
                    }}
                  >
                    <Ban size={15} color="#dc2626" /> Block User
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Reference Card (Widget for mock/regular bookings) */}
      {booking && !activeChat.bookingRequest && (
        <div className="msg-booking-widget animate-fadeIn">
          <div className="msg-booking-widget-content">
            <img src={booking.cover} alt={booking.project} className="msg-booking-cover" />
            <div className="msg-booking-details">
              <h4>{booking.project}</h4>
              <p>{booking.role}</p>
            </div>
          </div>
          <div className="msg-booking-meta text-right">
            <span className="msg-booking-id-label">Booking ID</span>
            <span className="msg-booking-id">{booking.id}</span>
          </div>
        </div>
      )}

      {/* Director Shoot Booking Request Widget */}
      {activeChat.bookingRequest && (
        <div 
          style={{
            margin: "12px 16px",
            padding: "18px 20px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
            color: "#ffffff",
            boxShadow: "0 8px 24px rgba(30, 27, 75, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 14
          }}
          className="animate-fadeIn"
        >
          {/* Header row with Icon, Title, and Status Badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(236, 72, 153, 0.4)"
              }}>
                <Film size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.2px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🎬 Shoot Booking Request</span>
                  <span style={{ fontSize: 11, background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                    #{activeChat.bookingRequest.id}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "#cbd5e1", marginTop: 2 }}>
                  From Director: <strong>{activeChat.bookingRequest.professionalName || activeChat.name}</strong>
                  {activeChat.bookingRequest.professionalCompany && ` (${activeChat.bookingRequest.professionalCompany})`}
                </div>
              </div>
            </div>

            <div>
              {activeChat.bookingRequest.status === "PENDING" && (
                <span style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: "0 2px 6px rgba(254, 243, 199, 0.2)"
                }}>
                  <Clock size={13} /> Action Required
                </span>
              )}
              {activeChat.bookingRequest.status === "ACCEPTED" && (
                <span style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5
                }}>
                  <CheckCircle2 size={13} /> Shoot Confirmed
                </span>
              )}
              {activeChat.bookingRequest.status === "DECLINED" && (
                <span style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5
                }}>
                  <XCircle size={13} /> Declined
                </span>
              )}
            </div>
          </div>

          {/* Project Details Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 10,
            background: "rgba(255, 255, 255, 0.06)",
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Project</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>{activeChat.bookingRequest.projectTitle}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Type</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#e2e8f0", marginTop: 2 }}>{activeChat.bookingRequest.projectType || "Shoot"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Shoot Date</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fbbf24", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={13} /> {activeChat.bookingRequest.bookingDate}
              </div>
            </div>
            {activeChat.bookingRequest.location && (
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Location</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#e2e8f0", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={13} /> {activeChat.bookingRequest.location}
                </div>
              </div>
            )}
            {activeChat.bookingRequest.offeredRate && (
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Offered Rate</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#34d399", marginTop: 2, display: "flex", alignItems: "center", gap: 2 }}>
                  <IndianRupee size={13} /> {activeChat.bookingRequest.offeredRate}
                </div>
              </div>
            )}
          </div>

          {/* Director's Note / Message */}
          {activeChat.bookingRequest.message && (
            <div style={{
              background: "rgba(255, 255, 255, 0.08)",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: 13,
              fontStyle: "italic",
              lineHeight: 1.5,
              borderLeft: "3px solid #ec4899",
              color: "#e2e8f0"
            }}>
              &ldquo;{activeChat.bookingRequest.message}&rdquo;
            </div>
          )}

          {/* Action Buttons for Pending Status */}
          {activeChat.bookingRequest.status === "PENDING" && onRespondBookingRequest && (
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => onRespondBookingRequest(activeChat.bookingRequest.id, true)}
                style={{
                  flex: 1.2,
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "11px 18px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  transition: "all 0.2s ease"
                }}
              >
                <Check size={16} strokeWidth={2.5} /> Accept Shoot & Confirm Booking
              </button>
              <button
                type="button"
                onClick={() => onRespondBookingRequest(activeChat.bookingRequest.id, false)}
                style={{
                  flex: 0.8,
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  padding: "11px 18px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s ease"
                }}
              >
                <X size={16} /> Decline Offer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile Access Request Widget */}
      {activeChat.accessRequest && (
        <div 
          style={{
            margin: "12px 16px",
            padding: "16px 20px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 16px rgba(49, 46, 129, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
          className="animate-fadeIn"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Lock size={20} color="#facc15" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.2px" }}>
                  Private Profile Access Request
                </div>
                <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2 }}>
                  From: <strong>{activeChat.accessRequest.requesterName}</strong> ({activeChat.accessRequest.requesterEmail})
                </div>
              </div>
            </div>

            <div>
              {activeChat.accessRequest.status === "PENDING" && (
                <span style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "4px 12px",
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <Clock size={12} /> Pending Approval
                </span>
              )}
              {activeChat.accessRequest.status === "APPROVED" && (
                <span style={{
                  background: "#dcfce7",
                  color: "#15803d",
                  padding: "4px 12px",
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}>
                  <ShieldCheck size={12} /> Access Granted
                </span>
              )}
              {activeChat.accessRequest.status === "REJECTED" && (
                <span style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "4px 12px",
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  ❌ Declined
                </span>
              )}
            </div>
          </div>

          {activeChat.accessRequest.requesterMessage && (
            <div style={{
              background: "rgba(255,255,255,0.1)",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontStyle: "italic",
              lineHeight: 1.5,
              borderLeft: "3px solid #facc15"
            }}>
              &ldquo;{activeChat.accessRequest.requesterMessage}&rdquo;
            </div>
          )}

          {activeChat.accessRequest.status === "PENDING" && onRespondAccessRequest && (
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => onRespondAccessRequest(activeChat.accessRequest.id, true)}
                style={{
                  flex: 1,
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                }}
              >
                <Check size={15} /> Approve Access
              </button>
              <button
                type="button"
                onClick={() => onRespondAccessRequest(activeChat.accessRequest.id, false)}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}
              >
                <X size={15} /> Decline
              </button>
            </div>
          )}
        </div>
      )}

      {/* Blocked Conversation Notice Banner */}
      {isBlocked && (
        <div 
          style={{
            margin: "12px 16px",
            padding: "16px 20px",
            borderRadius: "14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12
          }} 
          className="animate-fadeIn"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ef4444"
            }}>
              <Ban size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                {isBlockedByMe ? "You have blocked this user" : "Conversation Unavailable"}
              </div>
              <div style={{ fontSize: 12.5, color: "#b91c1c", marginTop: 2 }}>
                {isBlockedByMe 
                  ? `You will not receive messages from ${activeChat.name}. Unblock anytime to resume chatting.`
                  : `You cannot send messages to this contact.`}
              </div>
            </div>
          </div>
          {isBlockedByMe && (
            <button
              type="button"
              onClick={handleConfirmUnblock}
              style={{
                background: "#16a34a",
                color: "#ffffff",
                border: "none",
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)"
              }}
            >
              <ShieldCheck size={14} /> Unblock
            </button>
          )}
        </div>
      )}

      {/* Peer Chat Connection Request Banner (Pending Status) */}
      {!isBlocked && isChatPending && (
        isRecipient ? (
          /* Exact design from user photo for receiving user */
          <div 
            style={{
              margin: "12px 16px",
              padding: "16px 24px",
              borderRadius: "14px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap"
            }}
            className="animate-fadeIn"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 260 }}>
              {/* Lavender circle with purple UserPlus icon */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#f3e8ff",
                color: "#43188f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <UserPlus size={22} color="#43188f" strokeWidth={2.2} />
              </div>

              {/* Vertical divider */}
              <div style={{ width: 1, height: 38, background: "#e2e8f0", flexShrink: 0 }} />

              {/* Text content */}
              <div>
                <div style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#0f172a",
                  letterSpacing: "-0.2px",
                  lineHeight: 1.3
                }}>
                  Chat Connection Request
                </div>
                <div style={{
                  fontSize: 14,
                  color: "#64748b",
                  marginTop: 2,
                  fontWeight: 500,
                  lineHeight: 1.4
                }}>
                  {activeChat.name} wants to connect with you.
                </div>
                {chatReq?.message && (
                  <div style={{
                    marginTop: 6,
                    fontSize: 12.5,
                    color: "#475569",
                    fontStyle: "italic",
                    background: "#f8fafc",
                    padding: "4px 10px",
                    borderRadius: 6,
                    borderLeft: "2px solid #43188f"
                  }}>
                    &ldquo;{chatReq.message}&rdquo;
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons (Accept & Decline matching the photo) */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="button"
                onClick={() => onRespondChatRequest?.(chatReq.id, true)}
                style={{
                  background: "#3f148d",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 26px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 8px rgba(63, 20, 141, 0.25)",
                  transition: "all 0.15s ease"
                }}
              >
                <Check size={16} strokeWidth={2.6} /> Accept
              </button>
              <button
                type="button"
                onClick={() => onRespondChatRequest?.(chatReq.id, false)}
                style={{
                  background: "#ffffff",
                  color: "#3f148d",
                  border: "1.5px solid #3f148d",
                  padding: "9px 24px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s ease"
                }}
              >
                <X size={15} strokeWidth={2.4} /> Decline
              </button>
            </div>
          </div>
        ) : (
          /* Requester view (Waiting for approval) */
          <div 
            style={{
              margin: "12px 16px",
              padding: "16px 24px",
              borderRadius: "14px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap"
            }}
            className="animate-fadeIn"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 260 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#fef3c7",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <UserPlus size={22} strokeWidth={2.2} />
              </div>
              <div style={{ width: 1, height: 38, background: "#e2e8f0", flexShrink: 0 }} />
              <div>
                <div style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#0f172a",
                  letterSpacing: "-0.2px"
                }}>
                  Chat Connection Request Sent
                </div>
                <div style={{
                  fontSize: 14,
                  color: "#64748b",
                  marginTop: 2,
                  fontWeight: 500
                }}>
                  Waiting for <strong>{activeChat.name}</strong> to accept your request.
                  {chatReq?.attemptCount && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                      (Request {chatReq.attemptCount} of 3)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                background: "#fef3c7",
                color: "#92400e",
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 5
              }}>
                <Clock size={13} /> Pending Approval
              </span>
              {isRequester && (
                <button
                  type="button"
                  onClick={() => handleConfirmCancelRequest(chatReq?.id)}
                  style={{
                    background: "#ffffff",
                    color: "#dc2626",
                    border: "1.5px solid #fca5a5",
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all 0.15s ease"
                  }}
                >
                  <X size={14} /> Cancel Request
                </button>
              )}
            </div>
          </div>
        )
      )}

      {/* Disconnected / Not Connected Banner (Allows sending new request up to 3 times) */}
      {!isBlocked && isDisconnectedOrNone && (
        <div 
          style={{
            margin: "12px 16px",
            padding: "16px 20px",
            borderRadius: "14px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12
          }} 
          className="animate-fadeIn"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b"
            }}>
              <UserPlus size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                {isCancelled ? "Chat Request Cancelled" : isDeclined ? "Connection Declined" : "Connect to Chat"}
              </div>
              <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
                {isCancelled 
                  ? `You cancelled the chat request. Send a new request whenever you wish to connect.`
                  : isDeclined 
                  ? `Chat request was declined. You can send another request if needed.`
                  : `Connect with ${activeChat.name} to message in real-time.`}
                {chatReq?.attemptCount ? ` (${chatReq.attemptCount}/3 requests used)` : ""}
              </div>
            </div>
          </div>

          {chatReq?.attemptCount >= 3 ? (
            <div style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}>
              <Ban size={14} /> Limit Reached (3/3)
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSendChatRequest?.(activeChat.targetUserId || activeChat.id)}
              style={{
                background: "linear-gradient(135deg, #ec4899 0%, #d946ef 100%)",
                color: "#ffffff",
                border: "none",
                padding: "9px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 3px 10px rgba(236, 72, 153, 0.25)",
                whiteSpace: "nowrap"
              }}
            >
              <UserPlus size={15} /> 
              {chatReq?.attemptCount ? `Send Request (${chatReq.attemptCount}/3)` : "Send Request to Chat"}
            </button>
          )}
        </div>
      )}

      {/* Connected Status Bar */}
      {!isBlocked && isConnected && (
        <div style={{
          margin: "8px 16px 2px 16px",
          padding: "8px 14px",
          borderRadius: "8px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          color: "#166534",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 600
        }}>
          <CheckCircle2 size={14} color="#16a34a" />
          <span>Connected with <strong>{activeChat.name}</strong> &bull; You can chat freely</span>
        </div>
      )}

      {/* Chat Messages Timeline */}
      <div className="msg-chat-timeline">
        {/* Pinned Message Top Banner */}
        {(() => {
          const pinnedMsg = messages.find((m) => m.id === pinnedMessageId);
          if (!pinnedMsg) return null;
          return (
            <div 
              className="msg-pinned-top-banner"
              onClick={() => {
                const el = document.getElementById(`msg-${pinnedMsg.id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              title="Click to scroll to pinned message"
            >
              <Pin size={13} color="#ec4899" />
              <span className="msg-pinned-title">Pinned Message:</span>
              <span className="msg-pinned-text">{pinnedMsg.text || pinnedMsg.fileName || "Media attachment"}</span>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setPinnedMessageId(null); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9d174d", display: "flex", padding: 2 }}
                title="Unpin message"
              >
                <X size={13} />
              </button>
            </div>
          );
        })()}

        <div 
          className="msg-messages-scroll-area" 
          ref={scrollAreaRef}
          onScroll={handleScroll}
        >
          <div className="msg-timeline-date">Today</div>
          {messages.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "48px 20px",
              color: "#94a3b8",
              fontSize: "13px"
            }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>💬</div>
              <div style={{ fontWeight: "800", color: "#334155", fontSize: "14px", marginBottom: "4px" }}>
                Start of conversation with {activeChat.name}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Send a message below to connect directly.
              </div>
            </div>
          )}

          {messages.map((msg) => {
            // System notices (e.g. connected, disconnected, blocked)
            if (msg.isSystem) {
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: "center", margin: "14px 0" }}>
                  <div style={{
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "6px 18px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "center",
                    maxWidth: "85%",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            }

            // Normal chat messages:
            // isMe = true -> sent by me, placed on RIGHT (.msg-bubble-row.me)
            // isMe = false -> received from them, placed on LEFT (.msg-bubble-row.them)
            const isMe = msg.sender === "me";
            const hasMedia = Boolean(msg.mediaUrl);
            const mediaType = (msg.mediaType || detectMediaType(msg.mediaUrl) || "").toUpperCase();
            const fullMediaUrl = msg.mediaUrl ? (msg.mediaUrl.startsWith("blob:") ? msg.mediaUrl : getFullImageUrl(msg.mediaUrl)) : "";
            const isPureText = !hasMedia;
            const isStarred = starredMessageIds.has(msg.id);
            const isPinned = pinnedMessageId === msg.id;
            const reactions = messageReactions[msg.id] || [];

            return (
              <div 
                key={msg.id} 
                id={`msg-${msg.id}`}
                className={`msg-bubble-row ${isMe ? "me" : "them"}`}
              >
                <div 
                  className={`msg-bubble-wrap ${isMe ? "me" : "them"}`}
                  style={{
                    padding: hasMedia ? "10px 12px" : undefined,
                    maxWidth: hasMedia ? "340px" : undefined,
                    width: hasMedia ? "100%" : undefined
                  }}
                >
                  {/* WhatsApp Dropdown Chevron Button */}
                  <button
                    type="button"
                    className={`msg-bubble-chevron-btn ${activeMenuMsgId === msg.id ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuMsgId((prev) => (prev === msg.id ? null : msg.id));
                    }}
                    title="Message options"
                  >
                    <ChevronDown size={14} />
                  </button>

                  {/* WhatsApp Floating Context Menu & Reaction Bar */}
                  {activeMenuMsgId === msg.id && (
                    <div 
                      className="wa-context-menu-wrapper"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Top Floating Reaction Bar Pill */}
                      <div className="wa-reaction-bar-pill">
                        {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className="wa-reaction-emoji-btn"
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="wa-reaction-plus-btn"
                          onClick={() => handleToggleReaction(msg.id, "🔥")}
                          title="More reactions"
                        >
                          +
                        </button>
                      </div>

                      {/* Dropdown Menu Card */}
                      <div className="wa-dropdown-menu-card">
                        <button 
                          type="button" 
                          className="wa-dropdown-item" 
                          onClick={() => handleReplyMessage(msg)}
                        >
                          <CornerUpLeft size={16} color="#94a3b8" />
                          <span>Reply</span>
                        </button>
                        <button 
                          type="button" 
                          className="wa-dropdown-item" 
                          onClick={() => handleCopyMessage(msg)}
                        >
                          <Copy size={16} color="#94a3b8" />
                          <span>Copy</span>
                        </button>
                        <button 
                          type="button" 
                          className="wa-dropdown-item" 
                          onClick={() => handleToggleReaction(msg.id, "👍")}
                        >
                          <Smile size={16} color="#94a3b8" />
                          <span>React</span>
                        </button>
                        <button 
                          type="button" 
                          className="wa-dropdown-item" 
                          onClick={() => handleForwardMessage(msg)}
                        >
                          <CornerUpRight size={16} color="#94a3b8" />
                          <span>Forward</span>
                        </button>
                        <button 
                          type="button" 
                          className="wa-dropdown-item" 
                          onClick={() => handleTogglePinMessage(msg.id)}
                        >
                          <Pin size={16} color="#94a3b8" />
                          <span>{isPinned ? "Unpin" : "Pin"}</span>
                        </button>
                        <button 
                          type="button" 
                          className="wa-dropdown-item" 
                          onClick={() => handleAskBmsAi(msg)}
                        >
                          <Bot size={16} color="#94a3b8" />
                          <span>Ask BMS AI</span>
                        </button>
                        <button 
                          type="button" 
                          className="wa-dropdown-item" 
                          onClick={() => handleToggleStarMessage(msg.id)}
                        >
                          <Star 
                            size={16} 
                            color={isStarred ? "#fbbf24" : "#94a3b8"} 
                            fill={isStarred ? "#fbbf24" : "none"} 
                          />
                          <span>{isStarred ? "Unstar" : "Star"}</span>
                        </button>
                        <div className="wa-dropdown-divider" />
                        <button 
                          type="button" 
                          className="wa-dropdown-item delete" 
                          onClick={() => handleConfirmDeleteMessage(msg)}
                        >
                          <Trash2 size={16} color="#ef4444" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quoted Reply Block inside Bubble */}
                  {msg.replyTo && (
                    <div className="msg-quoted-block">
                      <div className="msg-quoted-author">{msg.replyTo.senderName || "User"}</div>
                      <div className="msg-quoted-snippet">{msg.replyTo.text}</div>
                    </div>
                  )}
                  {/* Media Content */}
                  {hasMedia && (
                    <div style={{ marginBottom: (msg.text && msg.text !== msg.fileName) ? "8px" : "4px" }}>
                      {mediaType === "IMAGE" && (
                        <div 
                          style={{
                            position: "relative",
                            cursor: "pointer",
                            borderRadius: "10px",
                            overflow: "hidden",
                            background: "#0f172a",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                          }}
                          onClick={() => setSelectedLightboxImage(fullMediaUrl)}
                          title="Click to view full image"
                        >
                          <img 
                            src={fullMediaUrl} 
                            alt={msg.fileName || "Chat image"} 
                            style={{ width: "100%", maxHeight: "260px", objectFit: "cover", display: "block" }} 
                          />
                          <div style={{
                            position: "absolute",
                            bottom: 6,
                            right: 6,
                            background: "rgba(0,0,0,0.6)",
                            color: "#ffffff",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            fontSize: "11px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <Maximize2 size={12} /> View
                          </div>
                        </div>
                      )}

                      {mediaType === "VIDEO" && (
                        isYouTubeOrVimeo(msg.mediaUrl) ? (
                          <div style={{ borderRadius: "10px", overflow: "hidden", background: "#000" }}>
                            <iframe 
                              src={getEmbedUrl(msg.mediaUrl)} 
                              title="Video player" 
                              style={{ width: "100%", height: "200px", border: "none", display: "block" }} 
                              allowFullScreen 
                            />
                          </div>
                        ) : (
                          <video 
                            src={fullMediaUrl} 
                            controls 
                            playsInline 
                            preload="metadata" 
                            style={{ width: "100%", maxHeight: "260px", borderRadius: "10px", display: "block", background: "#000" }} 
                          />
                        )
                      )}

                      {mediaType === "AUDIO" && (
                        <div style={{
                          background: isMe ? "rgba(238, 0, 143, 0.08)" : "#f8fafc",
                          border: isMe ? "1px solid rgba(238, 0, 143, 0.2)" : "1px solid #e2e8f0",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontWeight: "700", color: "#334155" }}>
                            <Music size={16} color="#8b5cf6" />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {msg.fileName || "Audio Track / Voice Reel"}
                            </span>
                          </div>
                          <audio src={fullMediaUrl} controls style={{ width: "100%", height: "36px", marginTop: "2px" }} />
                        </div>
                      )}

                      {mediaType === "DOCUMENT" && (
                        <a 
                          href={fullMediaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            background: isMe ? "rgba(238, 0, 143, 0.06)" : "#f8fafc",
                            border: isMe ? "1px solid rgba(238, 0, 143, 0.25)" : "1px solid #e2e8f0",
                            color: "#1e293b",
                            textDecoration: "none"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                            <div style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              background: "#eff6ff",
                              color: "#2563eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}>
                              <FileText size={20} />
                            </div>
                            <div style={{ overflow: "hidden" }}>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                {msg.fileName || "Document File"}
                              </div>
                              {msg.fileSize && (
                                <div style={{ fontSize: "11px", color: "#64748b" }}>
                                  {formatFileSize(msg.fileSize)}
                                </div>
                              )}
                            </div>
                          </div>
                          <Download size={16} color="#64748b" style={{ flexShrink: 0 }} />
                        </a>
                      )}

                      {mediaType === "LINK" && (
                        <a 
                          href={msg.mediaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            background: isMe ? "rgba(238, 0, 143, 0.06)" : "#f8fafc",
                            border: isMe ? "1px solid rgba(238, 0, 143, 0.25)" : "1px solid #e2e8f0",
                            color: "#1e293b",
                            textDecoration: "none"
                          }}
                        >
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: "#fdf2f8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <Link2 size={18} color="#ec4899" />
                          </div>
                          <div style={{ overflow: "hidden", flex: 1 }}>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                              {msg.fileName || "Shared Media Link"}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                              {msg.mediaUrl}
                            </div>
                          </div>
                          <ExternalLink size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Message Text (if present and not just the filename) */}
                  {msg.text && (msg.text !== msg.fileName || isPureText) && (
                    <div className="msg-bubble-text">{msg.text}</div>
                  )}

                  {/* Bubble Meta */}
                  <div className="msg-bubble-meta">
                    {isPinned && <Pin size={11} color="#ec4899" style={{ marginRight: 2 }} />}
                    {isStarred && <Star size={11} fill="#eab308" color="#eab308" style={{ marginRight: 2 }} />}
                    {msg.isUploading ? (
                      <span style={{ fontSize: "11px", color: "#ec4899", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                        <Loader2 size={11} className="animate-spin" /> Uploading...
                      </span>
                    ) : (
                      <span className="msg-bubble-time">{msg.time}</span>
                    )}
                    {isMe && !msg.isUploading && (
                      <span className="msg-bubble-status">
                        <svg className="w-3 h-3 text-pink-600 fill-current" viewBox="0 0 24 24" width="13" height="13">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#ee008f" />
                        </svg>
                      </span>
                    )}
                  </div>

                  {/* Message Reactions Badge Pill */}
                  {reactions.length > 0 && (
                    <div className="msg-bubble-reactions-row">
                      {reactions.map((r, i) => (
                        <span 
                          key={i} 
                          className="msg-reaction-pill"
                          onClick={() => handleToggleReaction(msg.id, r.emoji)}
                          title={`${r.emoji} reaction`}
                        >
                          {r.emoji} {r.count > 1 ? r.count : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Composer Footer */}
      {isBlocked ? (
        <div style={{
          padding: "16px 20px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          textAlign: "center",
          color: "#dc2626",
          fontSize: "13.5px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px"
        }}>
          <Ban size={16} />
          <span>
            {isBlockedByMe 
              ? "This contact is blocked. Unblock to resume messaging." 
              : "This conversation is currently unavailable."}
          </span>
          {isBlockedByMe && (
            <button
              type="button"
              onClick={handleConfirmUnblock}
              style={{
                background: "#16a34a",
                color: "#fff",
                border: "none",
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                marginLeft: 8
              }}
            >
              Unblock
            </button>
          )}
        </div>
      ) : isChatPending ? (
        <div style={{
          padding: "16px 20px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          textAlign: "center",
          color: "#64748b",
          fontSize: "13.5px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px"
        }}>
          <Lock size={16} color="#94a3b8" />
          <span>
            {isRecipient
              ? `Accept the chat request above to start chatting with ${activeChat.name}.`
              : `Waiting for ${activeChat.name} to accept your chat request. Chat unlocks automatically once accepted.`}
          </span>
          {isRequester && (
            <button
              type="button"
              onClick={() => handleConfirmCancelRequest(chatReq?.id)}
              style={{
                background: "#ffffff",
                color: "#dc2626",
                border: "1px solid #fca5a5",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                marginLeft: 8
              }}
            >
              Cancel Request
            </button>
          )}
        </div>
      ) : isDisconnectedOrNone ? (
        <div style={{
          padding: "16px 20px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          textAlign: "center",
          color: "#64748b",
          fontSize: "13.5px",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px"
        }}>
          <Lock size={16} color="#94a3b8" />
          <span>Send a connection request to chat with {activeChat.name}.</span>
          {chatReq?.attemptCount >= 3 ? (
            <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "12.5px", background: "#fee2e2", padding: "4px 10px", borderRadius: 6 }}>
              Request limit reached (3/3)
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onSendChatRequest?.(activeChat.targetUserId || activeChat.id)}
              style={{
                background: "linear-gradient(135deg, #ec4899 0%, #d946ef 100%)",
                color: "#ffffff",
                border: "none",
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <UserPlus size={14} /> Send Request {chatReq?.attemptCount ? `(${chatReq.attemptCount}/3)` : ""}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* WhatsApp Replying Preview Banner */}
          {replyingTo && (
            <div className="msg-reply-banner">
              <div className="msg-reply-preview-left">
                <div className="msg-reply-accent-stripe" />
                <div style={{ overflow: "hidden" }}>
                  <div className="msg-reply-sender-name">
                    Replying to {replyingTo.sender === "me" ? "yourself" : activeChat?.name}
                  </div>
                  <div className="msg-reply-snippet">
                    {replyingTo.text || replyingTo.fileName || "Media attachment"}
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                className="msg-reply-cancel-btn"
                onClick={() => setReplyingTo(null)}
                title="Cancel reply"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="msg-chat-composer" style={{ position: "relative" }}>
          {/* Hidden File Inputs (Supports multiple selection) */}
          <input
            type="file"
            ref={localFileInputRef}
            multiple
            onChange={handleLocalFileSelect}
            style={{ display: "none" }}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          <input
            type="file"
            ref={cameraInputRef}
            multiple
            onChange={handleLocalFileSelect}
            style={{ display: "none" }}
            accept="image/*,video/*"
          />

          {/* Floating Attachment Menu (WhatsApp style above paperclip) */}
          {isAttachMenuOpen && (
            <div 
              ref={attachMenuRef}
              style={{
                position: "absolute",
                bottom: "76px",
                right: "60px",
                background: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 12px 32px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.08)",
                border: "1px solid #e2e8f0",
                padding: "8px",
                zIndex: 60,
                width: "260px",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
              className="animate-fadeIn"
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", padding: "6px 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Share Media
              </div>

              {/* Option 1: Local Device File */}
              <button
                type="button"
                onClick={() => {
                  setIsAttachMenuOpen(false);
                  localFileInputRef.current?.click();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "transparent",
                  color: "#1e293b",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "background 0.15s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: "#eff6ff",
                  color: "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <UploadCloud size={19} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Upload from Device</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Photos, videos, audio & docs</div>
                </div>
              </button>

              {/* Option 2: From My Account (Portfolio, Videos, Audio) */}
              <button
                type="button"
                onClick={handleOpenAccountMedia}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "transparent",
                  color: "#1e293b",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "background 0.15s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf2f8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: "#fdf2f8",
                  color: "#ec4899",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Folder size={19} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>From My Account</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Portfolio, reels & audio samples</div>
                </div>
              </button>

              {/* Option 3: Share Media Link */}
              <button
                type="button"
                onClick={() => {
                  setIsAttachMenuOpen(false);
                  setIsLinkModalOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "transparent",
                  color: "#1e293b",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "background 0.15s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: "#f5f3ff",
                  color: "#8b5cf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Link2 size={19} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Share Media Link</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>YouTube, Vimeo, Cloud or Web link</div>
                </div>
              </button>
            </div>
          )}

          {/* Live Typing Indicator */}
          {isOtherUserTyping && (
            <div style={{ padding: "4px 14px", fontSize: "12px", color: "#059669", background: "rgba(16, 185, 129, 0.12)", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "6px", margin: "0 0 6px 12px", fontWeight: 700, width: "fit-content" }}>
              <span style={{ fontSize: "9px" }}>●</span>
              <span>{activeChat.name} is typing...</span>
            </div>
          )}

          {/* WhatsApp-style Input Capsule (White Section) */}
          <div className="msg-composer-capsule">
            {/* Smiley Icon on Left */}
            <PagesButton className="msg-capsule-icon-btn" type="button" title="Emojis">
              <WhatsAppEmojiIcon size={21} />
            </PagesButton>

            {/* Text input */}
            <input
              type="text"
              placeholder="Message"
              value={inputText}
              onChange={handleInputChange}
              onBlur={() => {
                if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
                if (onTyping) onTyping(false);
              }}
              onKeyDown={handleKeyDown}
              className="msg-capsule-input"
            />

            {/* Right Icons inside Capsule */}
            <div className="msg-capsule-right-actions">
              <PagesButton 
                className="msg-capsule-icon-btn" 
                type="button" 
                title="Add Attachment"
                onClick={() => setIsAttachMenuOpen((prev) => !prev)}
              >
                <VerticalPaperclipIcon size={19} />
              </PagesButton>

              {!inputText.trim() && (
                <PagesButton 
                  className="msg-capsule-icon-btn" 
                  type="button" 
                  title="Camera / Take Photo"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera size={20} />
                </PagesButton>
              )}
            </div>
          </div>

          {/* Circle Button Outside on Right */}
          <PagesButton
            className="msg-composer-action-circle-btn"
            onClick={inputText.trim() ? handleSend : undefined}
            title={inputText.trim() ? "Send Message" : "Voice Message"}
          >
            {inputText.trim() ? (
              <Send size={18} style={{ marginLeft: "2px" }} />
            ) : (
              <Mic size={20} />
            )}
          </PagesButton>
        </div>
      </div>
    )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: LOCAL FILE PRE-SEND DIALOG (Supports Multiple Media)
          ───────────────────────────────────────────────────────────── */}
      {selectedLocalFiles.length > 0 && (() => {
        const currentFile = selectedLocalFiles[activeFileIndex] || selectedLocalFiles[0];
        return (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
          }}>
            <div style={{
              background: "#ffffff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}>
              {/* Header */}
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    background: "#eff6ff",
                    color: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <UploadCloud size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                      Share {selectedLocalFiles.length > 1 ? `Media (${selectedLocalFiles.length})` : "Media"}
                    </h4>
                    <span style={{ fontSize: "11.5px", color: "#64748b" }}>To {activeChat.name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelLocalFiles}
                  disabled={isUploading}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Active Media Preview Box */}
              <div style={{ padding: "16px 20px", background: "#f8fafc", textAlign: "center", minHeight: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {currentFile.type.startsWith("image/") ? (
                  <img 
                    src={currentFile.previewUrl} 
                    alt="Preview" 
                    style={{ maxHeight: "240px", maxWidth: "100%", objectFit: "contain", borderRadius: "12px", margin: "0 auto", display: "block" }} 
                  />
                ) : currentFile.type.startsWith("video/") ? (
                  <video 
                    src={currentFile.previewUrl} 
                    controls 
                    style={{ maxHeight: "220px", width: "100%", borderRadius: "12px", background: "#000" }} 
                  />
                ) : currentFile.type.startsWith("audio/") ? (
                  <div style={{ padding: "20px 0", width: "100%" }}>
                    <Music size={40} color="#8b5cf6" style={{ margin: "0 auto 10px" }} />
                    <audio src={currentFile.previewUrl} controls style={{ width: "100%" }} />
                  </div>
                ) : (
                  <div style={{ padding: "20px 0" }}>
                    <FileText size={48} color="#3b82f6" style={{ margin: "0 auto 8px" }} />
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>{currentFile.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{formatFileSize(currentFile.size)}</div>
                  </div>
                )}
              </div>

              {/* Multiple Media Thumbnails Strip */}
              {selectedLocalFiles.length > 1 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  background: "#f1f5f9",
                  overflowX: "auto",
                  borderTop: "1px solid #e2e8f0"
                }}>
                  {selectedLocalFiles.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveFileIndex(idx)}
                      style={{
                        position: "relative",
                        cursor: "pointer",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: activeFileIndex === idx ? "2.5px solid #ec4899" : "1.5px solid #cbd5e1",
                        width: "52px",
                        height: "52px",
                        flexShrink: 0,
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {item.type.startsWith("image/") ? (
                        <img src={item.previewUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : item.type.startsWith("video/") ? (
                        <Video size={20} color="#64748b" />
                      ) : item.type.startsWith("audio/") ? (
                        <Music size={20} color="#8b5cf6" />
                      ) : (
                        <FileText size={20} color="#3b82f6" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLocalFile(idx);
                        }}
                        title="Remove"
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "rgba(15, 23, 42, 0.8)",
                          color: "#ffffff",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0
                        }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => localFileInputRef.current?.click()}
                    title="Add more media"
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "8px",
                      border: "1.5px dashed #94a3b8",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#64748b",
                      flexShrink: 0
                    }}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              )}

              {/* Caption Input */}
              <div style={{ padding: "16px 20px" }}>
                <input
                  type="text"
                  placeholder="Add a caption... (optional)"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isUploading) {
                      handleSendLocalFiles();
                    }
                  }}
                  disabled={isUploading}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13.5px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Footer Buttons */}
              <div style={{
                padding: "12px 20px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #f1f5f9"
              }}>
                <button
                  type="button"
                  onClick={() => localFileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6366f1",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Plus size={16} /> Add more
                </button>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleCancelLocalFiles}
                    disabled={isUploading}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#475569",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendLocalFiles}
                    disabled={isUploading}
                    style={{
                      padding: "9px 22px",
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg, #ec4899 0%, #d946ef 100%)",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: isUploading ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 8px rgba(236, 72, 153, 0.3)"
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>{selectedLocalFiles.length > 1 ? `Send (${selectedLocalFiles.length})` : "Send"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: ACCOUNT MEDIA SELECTOR MODAL
          ───────────────────────────────────────────────────────────── */}
      {isAccountMediaModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "680px",
            maxHeight: "85vh",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Header */}
            <div style={{
              padding: "16px 22px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>⭐ Share from My BMS Account</span>
                </h4>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                  Select from your profile portfolio, showreels, or audio reels
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountMediaModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Bar */}
            <div style={{
              display: "flex",
              padding: "0 20px",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              gap: "16px"
            }}>
              {[
                { id: "photos", label: "Photos", count: accountMediaItems.photos.length, icon: Image },
                { id: "videos", label: "Videos", count: accountMediaItems.videos.length, icon: Film },
                { id: "audios", label: "Audios", count: accountMediaItems.audios.length, icon: Music },
                { id: "documents", label: "Documents", count: accountMediaItems.documents.length, icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = accountMediaTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAccountMediaTab(tab.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "12px 6px",
                      border: "none",
                      background: "transparent",
                      borderBottom: isActive ? "3px solid #ec4899" : "3px solid transparent",
                      color: isActive ? "#ec4899" : "#64748b",
                      fontWeight: isActive ? 800 : 600,
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                    <span style={{
                      fontSize: "10.5px",
                      padding: "1px 6px",
                      borderRadius: "10px",
                      background: isActive ? "rgba(236, 72, 153, 0.12)" : "#e2e8f0",
                      color: isActive ? "#ec4899" : "#64748b",
                      fontWeight: 700
                    }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content / Grid */}
            <div style={{ padding: "18px 22px", flex: 1, overflowY: "auto", minHeight: "260px" }}>
              {isLoadingAccountMedia ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
                  <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 10px", color: "#ec4899" }} />
                  <p style={{ fontSize: "13px" }}>Loading your account media...</p>
                </div>
              ) : accountMediaTab === "photos" ? (
                accountMediaItems.photos.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8" }}>
                    <Image size={40} style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontWeight: 600, fontSize: "13.5px" }}>No portfolio photos uploaded yet</p>
                    <p style={{ fontSize: "12px" }}>Upload photos to your portfolio tab in Profile first.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "12px" }}>
                    {accountMediaItems.photos.map((photo) => {
                      const fullUrl = getFullImageUrl(photo.imageUrl || photo.photoUrl || photo.url);
                      const isSelected = selectedAccountMedia?.id === photo.id && selectedAccountMedia?.type === "IMAGE";
                      return (
                        <div
                          key={photo.id}
                          onClick={() => setSelectedAccountMedia({
                            id: photo.id,
                            url: photo.imageUrl || photo.photoUrl || photo.url,
                            title: photo.title || "Portfolio Photo",
                            type: "IMAGE"
                          })}
                          style={{
                            borderRadius: "10px",
                            overflow: "hidden",
                            cursor: "pointer",
                            position: "relative",
                            border: isSelected ? "3px solid #ec4899" : "1px solid #e2e8f0",
                            boxShadow: isSelected ? "0 0 0 2px rgba(236, 72, 153, 0.3)" : "none",
                            transition: "all 0.15s"
                          }}
                        >
                          <img src={fullUrl} alt={photo.title || ""} style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }} />
                          {isSelected && (
                            <div style={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              background: "#ec4899",
                              color: "#fff",
                              borderRadius: "50%",
                              width: 22,
                              height: 22,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                          <div style={{
                            padding: "6px 8px",
                            background: "#ffffff",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#334155",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}>
                            {photo.title || photo.category || "Photo"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : accountMediaTab === "videos" ? (
                accountMediaItems.videos.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8" }}>
                    <Film size={40} style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontWeight: 600, fontSize: "13.5px" }}>No videos found on your account</p>
                    <p style={{ fontSize: "12px" }}>Add video showreels to your profile to share them here.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                    {accountMediaItems.videos.map((vid) => {
                      const isSelected = selectedAccountMedia?.id === vid.id && selectedAccountMedia?.type === "VIDEO";
                      const thumb = vid.thumbnailUrl ? getFullImageUrl(vid.thumbnailUrl) : null;
                      return (
                        <div
                          key={vid.id}
                          onClick={() => setSelectedAccountMedia({
                            id: vid.id,
                            url: vid.videoUrl,
                            title: vid.title || "Video Showreel",
                            type: "VIDEO"
                          })}
                          style={{
                            borderRadius: "10px",
                            overflow: "hidden",
                            cursor: "pointer",
                            position: "relative",
                            border: isSelected ? "3px solid #ec4899" : "1px solid #e2e8f0",
                            boxShadow: isSelected ? "0 0 0 2px rgba(236, 72, 153, 0.3)" : "none",
                            background: "#0f172a"
                          }}
                        >
                          <div style={{ height: "100px", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                            {thumb ? (
                              <img src={thumb} alt={vid.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <Play size={28} color="#ec4899" />
                            )}
                            <div style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(0,0,0,0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <Play size={24} color="#ffffff" />
                            </div>
                            {isSelected && (
                              <div style={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                background: "#ec4899",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 22,
                                height: 22,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                <Check size={14} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div style={{ padding: "8px 10px", background: "#ffffff" }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {vid.title || "Video Reel"}
                            </div>
                            <div style={{ fontSize: "10.5px", color: "#64748b" }}>{vid.category || "Showreel"}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : accountMediaTab === "audios" ? (
                accountMediaItems.audios.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8" }}>
                    <Music size={40} style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontWeight: 600, fontSize: "13.5px" }}>No audio tracks uploaded yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {accountMediaItems.audios.map((aud) => {
                      const isSelected = selectedAccountMedia?.id === aud.id && selectedAccountMedia?.type === "AUDIO";
                      return (
                        <div
                          key={aud.id}
                          onClick={() => setSelectedAccountMedia({
                            id: aud.id,
                            url: aud.audioUrl,
                            title: aud.title || "Voice Track",
                            type: "AUDIO"
                          })}
                          style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: isSelected ? "2px solid #8b5cf6" : "1px solid #e2e8f0",
                            background: isSelected ? "#f5f3ff" : "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#f5f3ff", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Music size={18} />
                            </div>
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{aud.title || "Voice Sample"}</div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>{aud.category || "Audio Track"}</div>
                            </div>
                          </div>
                          {isSelected && <Check size={18} color="#8b5cf6" strokeWidth={3} />}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                accountMediaItems.documents.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "50px 0", color: "#94a3b8" }}>
                    <FileText size={40} style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontWeight: 600, fontSize: "13.5px" }}>No documents uploaded yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {accountMediaItems.documents.map((doc) => {
                      const isSelected = selectedAccountMedia?.id === doc.id && selectedAccountMedia?.type === "DOCUMENT";
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedAccountMedia({
                            id: doc.id,
                            url: doc.fileUrl,
                            title: doc.title || doc.fileName || "Document",
                            type: "DOCUMENT"
                          })}
                          style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: isSelected ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                            background: isSelected ? "#eff6ff" : "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <FileText size={18} />
                            </div>
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{doc.title || doc.fileName || "Document"}</div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>{doc.category || "Resume / Portfolio PDF"}</div>
                            </div>
                          </div>
                          {isSelected && <Check size={18} color="#3b82f6" strokeWidth={3} />}
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            {/* Bottom Caption & Share Button */}
            <div style={{
              padding: "14px 22px",
              borderTop: "1px solid #f1f5f9",
              background: "#fafbff",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <input
                type="text"
                placeholder={selectedAccountMedia ? `Caption for ${selectedAccountMedia.title}...` : "Select an item above to share"}
                value={accountMediaCaption}
                onChange={(e) => setAccountMediaCaption(e.target.value)}
                disabled={!selectedAccountMedia}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
              <button
                type="button"
                onClick={handleSendAccountMedia}
                disabled={!selectedAccountMedia}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: selectedAccountMedia ? "linear-gradient(135deg, #ec4899 0%, #d946ef 100%)" : "#cbd5e1",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: selectedAccountMedia ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: selectedAccountMedia ? "0 2px 8px rgba(236, 72, 153, 0.3)" : "none"
                }}
              >
                <Send size={14} /> Share into Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: SHARE MEDIA LINK MODAL
          ───────────────────────────────────────────────────────────── */}
      {isLinkModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "460px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: "#f5f3ff",
                  color: "#8b5cf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Link2 size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>Share Media Link</h4>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>YouTube, Vimeo, Cloud or Web media</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", display: "block" }}>
                  Media URL / Link *
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  value={mediaLinkUrl}
                  onChange={(e) => setMediaLinkUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px", display: "block" }}>
                  Title / Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Latest Commercial Showreel"
                  value={mediaLinkCaption}
                  onChange={(e) => setMediaLinkCaption(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div style={{
              padding: "12px 20px 18px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              borderTop: "1px solid #f1f5f9"
            }}>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendMediaLink}
                disabled={!mediaLinkUrl.trim()}
                style={{
                  padding: "9px 22px",
                  borderRadius: "8px",
                  border: "none",
                  background: mediaLinkUrl.trim() ? "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)" : "#cbd5e1",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: mediaLinkUrl.trim() ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: mediaLinkUrl.trim() ? "0 2px 8px rgba(139, 92, 246, 0.3)" : "none"
                }}
              >
                <Send size={14} /> Share Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 4: FULL-SCREEN IMAGE LIGHTBOX
          ───────────────────────────────────────────────────────────── */}
      {selectedLightboxImage && (
        <div 
          onClick={() => setSelectedLightboxImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(6px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedLightboxImage} 
              alt="Fullscreen view" 
              style={{ maxWidth: "100%", maxHeight: "88vh", objectFit: "contain", borderRadius: "10px", display: "block" }} 
            />
            <button
              type="button"
              onClick={() => setSelectedLightboxImage(null)}
              style={{
                position: "absolute",
                top: "-14px",
                right: "-14px",
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#ffffff",
                color: "#0f172a",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────
          MODAL 4: WHATSAPP-STYLE FORWARD MESSAGE MODAL
          ───────────────────────────────────────────────────────────── */}
      {forwardingMessage && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 16,
            width: "100%",
            maxWidth: 420,
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "80vh",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                <CornerUpRight size={18} color="#ec4899" />
                <span>Forward message to...</span>
              </div>
              <button 
                type="button" 
                onClick={() => setForwardingMessage(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <input
                type="text"
                placeholder="Search contacts..."
                value={forwardSearch}
                onChange={(e) => setForwardSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 13,
                  outline: "none"
                }}
              />
            </div>

            <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
              {(conversations || [])
                .filter((c) => c.id !== activeChat?.id && (c.name || "").toLowerCase().includes(forwardSearch.toLowerCase()))
                .map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleExecuteForward(c)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      cursor: "pointer",
                      transition: "background 0.12s ease"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={c.avatar} alt={c.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{c.name}</div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>{c.role || "Contact"}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      style={{
                        background: "linear-gradient(135deg, #ec4899, #d946ef)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Send size={12} /> Send
                    </button>
                  </div>
                ))}
              {(conversations || []).filter((c) => c.id !== activeChat?.id).length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  No other contacts found to forward.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
