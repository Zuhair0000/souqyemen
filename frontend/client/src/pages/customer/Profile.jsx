import { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../../components/NavBar";
import Icons from "../../components/Icons";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
        });
      })
      .catch((err) => console.error(err));
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = () => {
    axios
      .put("http://localhost:3001/api/user/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => alert("Profile updated"))
      .catch((err) => console.error(err));
  };

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <NavBar>
        <Icons />
      </NavBar>
      <div className="flex justify-center items-center px-[100px] py-10 max-w-[1000px] mx-auto mt-8 bg-[#f4f1eb]">
        <div className="flex justify-between items-start gap-10 w-full flex-wrap lg:flex-nowrap">
          {/* Info Section */}
          <div className="flex-1 bg-[#f9f9f9] p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl mb-4">My Profile</h2>
            <p className="text-base text-gray-800 mb-3">
              <strong>Name:</strong> {user.name}
            </p>
            <p className="text-base text-gray-800 mb-3">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-base text-gray-800 mb-3">
              <strong>Phone Number:</strong> {user.phone}
            </p>
            <p className="text-base text-gray-800 mb-3">
              <strong>Address:</strong> {user.address || "Not provided"}
            </p>
          </div>

          {/* Form Section */}
          <div className="flex-1 max-w-[400px] text-left">
            <h2 className="text-2xl mb-2">Update Information</h2>
            <p className="text-base text-gray-700 mb-5">
              Make changes to your profile below:
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col"
            >
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
                className="p-2 mb-4 text-sm border border-gray-300 rounded w-full"
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="p-2 mb-4 text-sm border border-gray-300 rounded w-full"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                className="p-2 mb-4 text-sm border border-gray-300 rounded w-full"
              />
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="p-2 mb-4 text-sm border border-gray-300 rounded w-full"
              />
              <button
                onClick={handleUpdate}
                className="bg-[#a40000] hover:bg-[#870000] text-white p-3 text-base rounded cursor-pointer w-full"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
