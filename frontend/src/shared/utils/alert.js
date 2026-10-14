import Swal from "sweetalert2";

/**
 * Standardized SweetAlert dialog utility for BookMyStars.
 * Matches brand styling (#ee008f, #e91e8c, rounded borders, clear messaging).
 */

const primaryColor = "#ee008f";
const dangerColor = "#ef4444";
const cancelColor = "#64748b";

/**
 * Success modal dialog
 */
export function showSuccess(title = "Success!", text = "") {
  return Swal.fire({
    icon: "success",
    title: title,
    text: text,
    confirmButtonColor: primaryColor,
    confirmButtonText: "OK",
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: "bms-swal-popup",
      title: "bms-swal-title",
      confirmButton: "bms-swal-btn",
    },
  });
}

/**
 * Error modal dialog (displays reason why operation failed)
 */
export function showError(title = "Operation Failed", text = "") {
  return Swal.fire({
    icon: "error",
    title: title,
    html: text ? `<div style="font-size: 14px; color: #475569; margin-top: 6px;">${text}</div>` : undefined,
    confirmButtonColor: primaryColor,
    confirmButtonText: "OK",
    customClass: {
      popup: "bms-swal-popup",
      title: "bms-swal-title",
      confirmButton: "bms-swal-btn",
    },
  });
}

/**
 * Warning modal dialog
 */
export function showWarning(title = "Warning", text = "") {
  return Swal.fire({
    icon: "warning",
    title: title,
    text: text,
    confirmButtonColor: primaryColor,
    confirmButtonText: "Understood",
  });
}

/**
 * Destructive Delete Confirmation Dialog with cross-verification
 * Returns Promise<boolean> (true if confirmed, false if cancelled)
 */
export async function confirmDelete(itemName = "this item", customText = "") {
  const result = await Swal.fire({
    title: `Delete ${itemName}?`,
    text: customText || "Are you sure you want to delete this? This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: dangerColor,
    cancelButtonColor: cancelColor,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: "bms-swal-popup",
      confirmButton: "bms-swal-btn-danger",
      cancelButton: "bms-swal-btn-cancel",
    },
  });

  return result.isConfirmed;
}

/**
 * Generic confirmation dialog
 */
export async function confirmAction({
  title = "Are you sure?",
  text = "",
  confirmButtonText = "Yes, Proceed",
  cancelButtonText = "Cancel",
  icon = "question",
  isDestructive = false,
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: isDestructive ? dangerColor : primaryColor,
    cancelButtonColor: cancelColor,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * Lightweight top-right toast notification
 */
export function showToast(title = "", icon = "success") {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon,
    title,
  });
}

export default {
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
  confirmAction,
  showToast,
};
