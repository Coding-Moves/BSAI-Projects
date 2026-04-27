import React, { useState } from "react";
import { uploadFile } from "../services/fileService";

export default function FileUpload() {
  const [file, setFile] = useState(null);

  async function handleUpload() {
    if (!file) return alert("Select a file first");
    await uploadFile(file);
    alert("File uploaded securely!");
  }

  return (
    <div>
      <h3>Upload File</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
