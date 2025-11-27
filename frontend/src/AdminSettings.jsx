import React, { useEffect, useState } from "react";
import "./AdminSettings.css";

export default function AdminSettings() {
  const [admins, setAdmins] = useState([]);


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
        <button className="admin-btn create">Create User</button>
        <button className="admin-btn delete">Delete User</button>
      </div>
    </div>
  );
}
