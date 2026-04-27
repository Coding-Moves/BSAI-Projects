import API from "./api";

export async function login(username, password) {
  const resp = await API.post("/api/auth/token/", { username, password });
  return resp.data;
}

export async function registerUser(data) {
  const resp = await API.post("/api/auth/register/", data);
  return resp.data;
}
