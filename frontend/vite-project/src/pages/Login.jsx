import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/UserContext.jsx";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in both fields");
      return;
    }

    try {

      console.log(" axios baseURL:", axiosInstance.defaults.baseURL);
      console.log(" sending data:", { email, password });
      console.log(" Sending login request to:", axiosInstance.defaults.baseURL + "/users/login");
      
      const res = await axiosInstance.post("/users/login", { email, password }, {
        withCredentials: true,
      });

      console.log(" Login success:", res.data);

      // Store token and update context
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
     

      navigate("/");
    } catch (err) {
      console.error(" Login failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed, please check credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
          </div>
         
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors py-2 rounded-lg font-semibold"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:underline hover:text-blue-400"
          >
            New Registration
          </Link>
        </p>
      </div>
    </div>
  );
}
