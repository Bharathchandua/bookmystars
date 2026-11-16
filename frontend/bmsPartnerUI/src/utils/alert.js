import Swal from "sweetalert2";

export const showAlert = (title, text, icon = "info") => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: "#ec008c",
    background: "#1e293b",
    color: "#ffffff",
  });
};

export const showSuccess = (title, text) => showAlert(title, text, "success");
export const showError = (title, text) => showAlert(title, text, "error");
export const showWarning = (title, text) => showAlert(title, text, "warning");

export const showConfirm = async (title, text, confirmButtonText = "Yes, proceed") => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ec008c",
    cancelButtonColor: "#334155",
    confirmButtonText,
    background: "#1e293b",
    color: "#ffffff",
  });
  return result.isConfirmed;
};

export default { showAlert, showSuccess, showError, showWarning, showConfirm };
