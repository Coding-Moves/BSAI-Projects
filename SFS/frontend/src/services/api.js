import axios from "axios";

const API = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});

API.setToken = (token) => {
  if (token) API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete API.defaults.headers.common["Authorization"];
};

export default API;
