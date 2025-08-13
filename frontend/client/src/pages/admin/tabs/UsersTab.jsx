import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

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
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="max-w-xl mx-auto my-10 p-6 bg-white rounded-lg border border-gray-300 shadow-sm font-sans">
      <h3 className="text-2xl text-center text-gray-800 mb-6">All Users</h3>

      <input
        type="text"
        placeholder="Search by name..."
        className="w-full max-w-xs mb-4 px-4 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-red-600"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm mb-4"
        >
          <p className="text-gray-700 text-sm mb-1 font-semibold">
            {user.name} ({user.role})
          </p>
          <p className="text-gray-600 text-sm mb-1">{user.email}</p>
          <p className="text-gray-600 text-sm mb-3">{user.phone}</p>
          <button
            onClick={() => banUser(user.id)}
            className="bg-red-600 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-red-700 transition-colors"
          >
            Ban
          </button>
        </div>
      ))}
    </div>
  );
}
