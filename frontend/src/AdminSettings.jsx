import React, { useEffect, useState } from "react";
import "./AdminSettings.css";

export default function AdminSettings() {
  const [admins, setAdmins] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: ""
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/admin/getTable');
        if (!res.ok) throw new Error("Failed to fetch admins");
        const data = await res.json();
        setAdmins(data);
      } catch (err) {
        console.error("Error fetching admins:", err);
        alert(err.message);
      }
    };

    fetchAdmins();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5001/api/admin/createAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Failed to create user");

      alert("User created");
      setShowCreate(false);
      setNewUser({ username: "", password: "", role: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-settings-container">

      {/* Top Controls */}
      <div className="admin-controls">
        <input type="text" placeholder="Search..." className="admin-search" />
        <div className="admin-filter">Filter By Role | Username</div>
      </div>

      {/* Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Edit</th>
          </tr>
        </thead>

        <tbody>
          {admins.map((admin) => (
            <tr key={admin._id}>
              <td>{admin.username}</td>
              <td>{admin.role}</td>
              <td className="edit-cell">Edit</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom Buttons */}
      <div className="admin-buttons">
        <button className="admin-btn create" onClick={() => setShowCreate(true)}>
          Create User
        </button>
        <button className="admin-btn delete">Delete User</button>
      </div>

      {showCreate && (
        <div className="modal-overlay">
          <div className="modal-content">

            <h2>Create User</h2>

            <form onSubmit={handleCreateUser}>

              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
              />

             <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            required
            className="role-dropdown"
            >
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
            </select>


              <div className="modal-buttons">
                <button type="submit" className="save-btn">Create</button>
                <button type="button" className="cancel-btn"
                        onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
