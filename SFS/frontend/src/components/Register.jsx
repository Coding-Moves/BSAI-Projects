import React, { useState } from "react";
import { registerUser } from "../services/authService";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  function updateForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submitRegister() {
    await registerUser(form);
    alert("Registered successfully!");
    window.location = '/login';
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>

      <input name="username" placeholder="Username" onChange={updateForm} /><br />
      <input name="email" placeholder="Email" onChange={updateForm} /><br />
      <input name="password" placeholder="Password" onChange={updateForm} /><br />

      <button onClick={submitRegister}>Register</button>
    </div>
  );
}
