import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import "../Styles/ProfileModal.css";
import { buildApiUrl } from "../utils/api";
import { showToast } from "../utils/toast";

export default function ProfileModal({ isOpen, onClose }) {
  const [profileName, setProfileName] = useState(
    localStorage.getItem("username") || "Admin User",
  );
  const [profileEmail, setProfileEmail] = useState(
    localStorage.getItem("email") || "",
  );
  const [profilePassword, setProfilePassword] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const currentUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email") || "";

    if (currentUsername) setProfileName(currentUsername);
    if (storedEmail) setProfileEmail(storedEmail);

    if (!currentUsername) return;

    const fetchCurrentAdmin = async () => {
      try {
        const res = await fetch(buildApiUrl("/api/admin/getTable"));
        if (!res.ok) return;

        const admins = await res.json();
        const currentAdmin = (admins || []).find(
          (a) => a.username === currentUsername,
        );

        if (!currentAdmin) return;

        const nextName = currentAdmin.username || currentUsername;
        const nextEmail = currentAdmin.email || "";

        setProfileName(nextName);
        setProfileEmail(nextEmail);
        localStorage.setItem("username", nextName);
        if (nextEmail) localStorage.setItem("email", nextEmail);
      } catch {
        // Keep local values if fetch fails.
      }
    };

    fetchCurrentAdmin();
  }, [isOpen]);

  const handleEditAdmin = async () => {
    const updates = {};

    if (profileName.trim()) updates.username = profileName;
    if (profileEmail.trim()) updates.email = profileEmail;
    if (profilePassword.trim()) updates.password = profilePassword;

    if (Object.keys(updates).length === 0) {
      showToast("Nothing to update", "info");
      return;
    }

    const currentUsername = localStorage.getItem("username");

    try {
      const res = await fetch(buildApiUrl("/api/admin/updateAdmin"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUsername,
          ...updates,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update localStorage if name changed
      if (updates.username) {
        localStorage.setItem("username", updates.username);
      }
      if (updates.email) {
        localStorage.setItem("email", updates.email);
      }

      showToast("Profile updated!", "success");
      setProfilePassword("");
      onClose();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div
        className="profile-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profile-modal-header">
          <h2>Profile Settings</h2>
          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="profile-modal-content">
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Full Name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="email@tippingpoint.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-password">New Password</label>
              <input
                id="profile-password"
                type="password"
                name="new-password"
                autoComplete="new-password"
                data-lpignore="true"
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>
        </div>

        <div className="profile-modal-footer">
          <button
            type="button"
            className="profile-modal-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="profile-modal-save"
            onClick={handleEditAdmin}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
