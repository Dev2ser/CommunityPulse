import React, { useState, useEffect } from "react";
import "../Styles/AdminSettings.css";
import { buildApiUrl } from "../utils/api";
import { showToast } from "../utils/toast";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("admins");
  const [admins, setAdmins] = useState([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("Admin");

  const [profileName, setProfileName] = useState("Admin User");
  const [profileEmail, setProfileEmail] = useState("admin@tippingpoint.com");
  const [profilePassword, setProfilePassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [responseNotifications, setResponseNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editEmail, setEditEmail] = useState("");

  
  useEffect(() => {
    async function loadAdmins() {
      try {
        const res = await fetch(buildApiUrl("/api/admin/getTable"));
        if (!res.ok) {
          console.error("Failed to load admins", res.status);
          return;
        }
        const data = await res.json();

        const normalized = data.map((a) => ({
          id: a._id,
          name: a.username,
          email: a.email || a.username || "",
          role: a.role,
          status: "active",
        }));

        setAdmins(normalized);
      } catch (err) {
        console.error("Error loading admins", err);
      }
    }

    loadAdmins();
  }, []);

  
  const addAdmin = async () => {
    if (!newAdminName.trim() || !newAdminRole.trim() || !newAdminEmail.trim()) {
      showToast("Please provide name, email, and role.", "error");
      return;
    }

    try {
      const res = await fetch(buildApiUrl("/api/admin/createAdmin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newAdminName.trim(),
          password: "psu12345", // temp default password
          role: newAdminRole.trim(),
          email: newAdminEmail.trim(),
        }),
      });

      if (!res.ok) {
        let body = {};
        try {
          body = await res.json();
        } catch {}
        showToast(body.message || "Failed to create admin", "error");
        return;
      }

      
      const tableRes = await fetch(buildApiUrl("/api/admin/getTable"));
      const tableData = await tableRes.json();
      const normalized = tableData.map((a) => ({
        id: a._id,
        name: a.username,
        email: a.email || a.username || "",
        role: a.role,
        status: "active",
      }));
      setAdmins(normalized);

      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminRole("Admin");
      setIsInviteOpen(false);
      showToast("Admin created successfully", "success");
    } catch (err) {
      console.error("Failed to create admin", err);
      showToast("Server error creating admin", "error");
    }
  };

  
  const handleDeleteAdmin = async (id) => {
    try {
      const res = await fetch(buildApiUrl(`/api/admin/deleteAdmin/${id}`), {
        method: "DELETE",
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        console.error("Failed to delete admin:", data);
        showToast(data.message || "Failed to delete admin. Please try again.", "error");
        return;
      }

      setAdmins((prev) => prev.filter((admin) => admin.id !== id));
      showToast("Admin deleted", "success");
    } catch (error) {
      console.error("Failed to delete admin", error);
      showToast("Failed to delete admin. Please try again.", "error");
    }
  };

  const handleSaveAdmin = async (id) => {
    try {
      const res = await fetch(buildApiUrl(`/api/admin/updateAdmin/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editName,
          role: editRole,
          email: editEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to update admin", "error");
        return;
      }

      setAdmins((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, name: editName, role: editRole, email: editEmail } : a
        )
      );

      setEditingId(null);
      setEditEmail("");
      showToast("Admin updated", "success");
    } catch (err) {
      console.error("Failed to update admin", err);
      showToast("Server error updating admin", "error");
    }
  };

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
          ...updates
        })
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
  
  

  const getRoleBadge = (role) => {
    const base = "badge";
    if (role === "Super Admin")
      return <span className={`${base} badge-super-admin`}>Super Admin</span>;
    if (role === "Admin")
      return <span className={`${base} badge-admin`}>Admin</span>;
    if (role === "Editor")
      return <span className={`${base} badge-editor`}>Editor</span>;
    return <span className={`${base} badge-viewer`}>Viewer</span>;
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <span className="badge badge-status-active">Active</span>
    ) : (
      <span className="badge badge-status-inactive">Inactive</span>
    );
  };

  return (
    <div className="admin-settings-page">
      <div className="admin-settings-content">
        <div className="admin-settings-container">
          <div className="admin-settings-header">
            <h2 className="admin-settings-title">Settings &amp; Administration</h2>
            <p className="admin-settings-subtitle">
              Manage administrators and account preferences
            </p>
          </div>

          <div className="admin-settings-tabs">
            <div className="admin-settings-tabs-list">
              <button
                className={`admin-settings-tab-trigger ${
                  activeTab === "admins" ? "active" : ""
                }`}
                onClick={() => setActiveTab("admins")}
              >
                Admin Management
              </button>
              <button
                className={`admin-settings-tab-trigger ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile Settings
              </button>
            </div>

            {activeTab === "admins" && (
              <div className="admin-list-card">
                <div className="admin-list-header">
                  <div>
                    <h3 className="admin-list-title">Administrator List</h3>
                    <p className="admin-list-subtitle">
                      Manage staff access to the portal
                    </p>
                  </div>
                  <button
                    className="add-admin-button"
                    onClick={() => setIsInviteOpen(true)}
                  >
                    + Add New Admin
                  </button>
                </div>

                {isInviteOpen && (
                  <div className="dialog-card">
                    <div className="dialog-form">
                      <div className="dialog-field">
                        <label htmlFor="invite-name">Full Name</label>
                        <input
                          id="invite-name"
                          placeholder="Enter full name"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                        />
                      </div>
                      <div className="dialog-field">
                        <label htmlFor="invite-email">Email Address</label>
                        <input
                          id="invite-email"
                          type="email"
                          placeholder="email@tippingpoint.com"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                        />
                      </div>
                    
                      <div className="dialog-field">
                        <label htmlFor="invite-role">Role</label>
                        <select
                          id="invite-role"
                          value={newAdminRole}
                          onChange={(e) => setNewAdminRole(e.target.value)}
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Admin">Admin</option>
                          <option value="Editor">Editor</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </div>
                      <div className="dialog-actions">
                        <button
                          className="dialog-cancel"
                          onClick={() => setIsInviteOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="dialog-submit"
                          onClick={addAdmin}
                        >
                          Send Invitation
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr className="table-header-row">
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin, index) => (
                        <tr
                          key={admin.id}
                          className={
                            index % 2 === 0
                              ? "table-row-even"
                              : "table-row-odd"
                          }
                        >
                          <td className="table-cell-name">
                            {editingId === admin.id ? (
                              <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="edit-input"
                              />
                            ) : (
                              admin.name
                            )}
                          </td>

                          <td className="table-cell-email">
                            {editingId === admin.id ? (
                              <input
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="edit-input"
                                type="email"
                              />
                            ) : (
                              admin.email || "N/A"
                            )}
                          </td>

                          

                          <td>
                            {editingId === admin.id ? (
                              <select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="edit-select"
                              >
                                <option value="Super Admin">Super Admin</option>
                                <option value="Admin">Admin</option>
                                <option value="Editor">Editor</option>
                                <option value="Viewer">Viewer</option>
                              </select>
                            ) : (
                              getRoleBadge(admin.role)
                            )}
                          </td>
                          <td>{getStatusBadge(admin.status)}</td>
                          <td className="table-actions centered">
                            {editingId === admin.id ? (
                              <>
                                <button
                                  className="action-button action-button-save"
                                  onClick={() => handleSaveAdmin(admin.id)}
                                >
                                  Save
                                </button>
                                <button
                                  className="action-button action-button-cancel"
                                  onClick={() => setEditingId(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="action-button action-button-edit"
                                  onClick={() => {
                                    setEditingId(admin.id);
                                    setEditName(admin.name);
                                    setEditRole(admin.role);
                                    setEditEmail(admin.email);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="action-button action-button-delete"
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}

                      {admins.length === 0 && (
                        <tr>
                          <td colSpan={6} className="table-cell-empty">
                            No admins found. Create one to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="profile-grid">
                <div className="profile-card">
                  <div className="profile-card-header">
                    <div className="profile-icon-wrapper">
                      <span className="profile-icon">👤</span>
                    </div>
                    <div>
                      <h3 className="profile-card-title">Profile Information</h3>
                      <p className="profile-card-subtitle">
                        Update your name, email, and password
                      </p>
                    </div>
                  </div>

                  <form className="profile-form">
  <label>
    Full Name
    <input
      type="text"
      value={profileName}
      onChange={(e) => setProfileName(e.target.value)}
      placeholder="Full Name"
    />
  </label>

  <label>
    Email Address
    <input
      type="email"
      value={profileEmail}
      onChange={(e) => setProfileEmail(e.target.value)}
      placeholder="email@tippingpoint.com"
    />
  </label>

  <label>
    New Password
    <input
      type="password"
      value={profilePassword}
      onChange={(e) => setProfilePassword(e.target.value)}
      placeholder="New Password"
    />
  </label>

  <button
    type="button"
    className="update-profile-button"
    onClick={handleEditAdmin}
  >
    Save Changes
  </button>
</form>

                </div>

                <div className="notification-card">
                  <div className="notification-card-header">
                    <div className="notification-icon-wrapper">
                      <span className="notification-icon">🔔</span>
                    </div>
                    <div>
                      <h3 className="notification-card-title">Notifications</h3>
                      <p className="notification-card-subtitle">
                        Choose when we email you
                      </p>
                    </div>
                  </div>

                  <div className="notification-settings">
                    <div className="notification-item">
                      <div>
                        <div className="notification-label">Email Alerts</div>
                        <div className="notification-description">
                          Receive email about account activity
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) =>
                          setEmailNotifications(e.target.checked)
                        }
                      />
                    </div>
                    <div className="notification-item">
                      <div>
                        <div className="notification-label">Response Updates</div>
                        <div className="notification-description">
                          Notify me when responses increase
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={responseNotifications}
                        onChange={(e) =>
                          setResponseNotifications(e.target.checked)
                        }
                      />
                    </div>
                    <div className="notification-item">
                      <div>
                        <div className="notification-label">Weekly Reports</div>
                        <div className="notification-description">
                          Send a digest of weekly stats
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={weeklyReports}
                        onChange={(e) => setWeeklyReports(e.target.checked)}
                      />
                    </div>
                  </div>
                  <div className="notification-save">
                    <button
                      type="button"
                      className="save-notification-button"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
