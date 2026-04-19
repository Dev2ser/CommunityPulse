export const APP_TOAST_EVENT = "app:toast";

export function showToast(message, type = "success", duration = 2500) {
  if (!message) return;

  window.dispatchEvent(
    new CustomEvent(APP_TOAST_EVENT, {
      detail: {
        message: String(message),
        type,
        duration,
      },
    }),
  );
}
