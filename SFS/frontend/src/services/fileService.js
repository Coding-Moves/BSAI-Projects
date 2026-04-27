import API from "./api";

export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const resp = await API.post("/api/files/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resp.data;
}

export async function getFiles(q) {
  const options = q ? { params: { q } } : undefined;
  const resp = await API.get("/api/files/", options);
  return resp.data;
}

export async function downloadFile(id) {
  // direct link
  return `/api/files/${id}/download/`;
}
