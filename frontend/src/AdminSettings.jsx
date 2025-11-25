import React from "react";
import "./AdminSettings.css";

export default function AdminSettings() {
  return (
    <div className="admin-settings-container">

      {/* Top Controls */}
      <div className="admin-controls">
        <input
          type="text"
          placeholder="Search..."
          className="admin-search"
        />

        <div className="admin-filter">Filter By Role | username</div>
      </div>

      {/* Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>username</th>
            <th>password</th>
            <th>role</th>
            <th>Edit</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Jim23</td>
            <td>*******</td>
            <td>CEO</td>
            <td className="edit-cell">Edit</td>
          </tr>

          <tr>
            <td>Grace22</td>
            <td>******</td>
            <td>Admin</td>
            <td className="edit-cell">Edit</td>
          </tr>
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
