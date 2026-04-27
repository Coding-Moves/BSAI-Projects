import React, { useState } from "react";
import { login } from "../services/authService";
import API from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const result = await login(username, password);
    if (result.access) {
      localStorage.setItem("sfs_token", result.access);
      API.setToken(result.access);
      window.location.href = "/dashboard";
    } else {
      alert("Login failed");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
