import React, { useState } from "react";
import { X } from "lucide-react";
import "../Styles/ProfileModal.css";
import { buildApiUrl } from "../utils/api";
import { showToast } from "../utils/toast";

export default function ProfileModal({ isOpen, onClose }) {
  const [profileName, setProfileName] = useState(
    localStorage.getItem("username") || "Admin User",
  );
  const [profileEmail, setProfileEmail] = useState("admin@tippingpoint.com");
  const [profilePassword, setProfilePassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [responseNotifications, setResponseNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

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
        method: "PATCH",
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

      showToast("Profile updated!", "success");
      setProfilePassword("");
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
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>

          <div className="profile-section">
            <h3>Notification Preferences</h3>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <span>Email Notifications</span>
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={responseNotifications}
                  onChange={(e) => setResponseNotifications(e.target.checked)}
                />
                <span>Response Notifications</span>
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={weeklyReports}
                  onChange={(e) => setWeeklyReports(e.target.checked)}
                />
                <span>Weekly Reports</span>
              </label>
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
