import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UsersTab.css";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState(""); // ✅ search input

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const banUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3001/api/admin/users/${id}/ban`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error banning user", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-tab-container">
      <h3>All Users</h3>
      <input
        type="text"
        placeholder="Search by name..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredUsers.map((user) => (
        <div key={user.id} className="admin-user-card">
          <p>
            {user.name} ({user.role})
          </p>
          <p>{user.email}</p>
          <p>{user.phone}</p>
          <button onClick={() => banUser(user.id)} className="ban-btn">
            Ban
          </button>
        </div>
      ))}
    </div>
  );
}
