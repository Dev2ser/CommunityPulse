import { useEffect, useState } from "react";
import "../Styles/Toast.css";
import { APP_TOAST_EVENT } from "../utils/toast";

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const message = event?.detail?.message;
      if (!message) return;

      const id = `${Date.now()}-${Math.random()}`;
      const type = event?.detail?.type || "success";
      const duration = Number(event?.detail?.duration || 2500);

      setToasts((prev) => [...prev, { id, message, type }]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    };

    window.addEventListener(APP_TOAST_EVENT, handleToast);
    return () => window.removeEventListener(APP_TOAST_EVENT, handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="app-toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`app-toast ${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
