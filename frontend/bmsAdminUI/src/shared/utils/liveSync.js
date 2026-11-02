/**
 * Cross-Tab Live Synchronization Utility for BookMyStars
 * 
 * Uses BroadcastChannel + window events + localStorage storage events + tab visibility
 * so changes in one tab (e.g. User posting or Admin approving) immediately update
 * all other open tabs/windows without manual page reload!
 */

const CHANNEL_NAME = "bms_realtime_db_sync";
let channel = null;

try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn("BroadcastChannel not supported in this environment:", e);
}

/**
 * Emit a synchronization event across the current tab AND all other open tabs.
 * @param {string} eventType - e.g. "opportunity_updated", "opportunity_created", "auth_changed"
 * @param {any} data - optional payload
 */
export function emitLiveSync(eventType, data = {}) {
  const payload = {
    type: eventType,
    data,
    timestamp: Date.now(),
  };

  // 1. Send to all other tabs via BroadcastChannel
  try {
    if (channel) {
      channel.postMessage(payload);
    }
  } catch (err) {
    console.warn("BroadcastChannel postMessage failed:", err);
  }

  // 2. Dispatch in current window/tab
  try {
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
    window.dispatchEvent(new CustomEvent("bms_live_sync", { detail: payload }));
  } catch (err) {
    console.warn("window dispatchEvent failed:", err);
  }

  // 3. Fallback for cross-window sync via localStorage storage event
  try {
    localStorage.setItem(
      "bms_sync_pulse",
      JSON.stringify({ ...payload, _rnd: Math.random() })
    );
  } catch (err) {
    // Ignore storage quota/security errors
  }
}

/**
 * Subscribe to live synchronization events with auto-refresh on tab visibility.
 * @param {string[]|string} eventTypes - Event type(s) to listen for (e.g. ["opportunity_created", "opportunity_updated"])
 * @param {Function} callback - Callback function to invoke when event occurs or tab becomes active
 * @param {Object} options - { pollIntervalMs: 8000, triggerOnFocus: true }
 * @returns {Function} unsubscribe function
 */
export function onLiveSync(eventTypes, callback, options = {}) {
  const { pollIntervalMs = null, triggerOnFocus = true } = options;
  const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

  const handleMessage = (event) => {
    const payload = event?.data || event;
    if (payload && (types.includes(payload.type) || types.includes("*"))) {
      callback(payload.data, payload.type);
    }
  };

  // 1. BroadcastChannel listener
  if (channel) {
    channel.addEventListener("message", handleMessage);
  }

  // 2. Window event listeners
  const windowHandlers = [];
  types.forEach((type) => {
    const handler = (e) => callback(e?.detail, type);
    window.addEventListener(type, handler);
    windowHandlers.push({ type, handler });
  });

  // 3. Storage event listener (for other tabs)
  const storageHandler = (e) => {
    if (e.key === "bms_sync_pulse" && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && (types.includes(parsed.type) || types.includes("*"))) {
          callback(parsed.data, parsed.type);
        }
      } catch (err) {}
    }
  };
  window.addEventListener("storage", storageHandler);

  // 4. Tab visibility change & focus listener (refetch whenever user switches back to this tab)
  const visibilityHandler = () => {
    if (document.visibilityState === "visible") {
      callback({ reason: "tab_activated" }, "visibility_change");
    }
  };
  if (triggerOnFocus) {
    document.addEventListener("visibilitychange", visibilityHandler);
    window.addEventListener("focus", visibilityHandler);
  }

  // 5. Background gentle polling heartbeat
  let pollTimer = null;
  if (pollIntervalMs && pollIntervalMs > 0) {
    pollTimer = setInterval(() => {
      if (document.visibilityState === "visible") {
        callback({ reason: "heartbeat_poll" }, "heartbeat");
      }
    }, pollIntervalMs);
  }

  // Return unsubscribe cleanup function
  return () => {
    if (channel) {
      channel.removeEventListener("message", handleMessage);
    }
    windowHandlers.forEach(({ type, handler }) => {
      window.removeEventListener(type, handler);
    });
    window.removeEventListener("storage", storageHandler);
    if (triggerOnFocus) {
      document.removeEventListener("visibilitychange", visibilityHandler);
      window.removeEventListener("focus", visibilityHandler);
    }
    if (pollTimer) {
      clearInterval(pollTimer);
    }
  };
}
