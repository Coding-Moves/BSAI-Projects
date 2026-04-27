import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import SearchBar from "../components/SearchBar";
import { getFiles } from "../services/fileService";
import React, { useState } from "react";

export default function Dashboard() {
  const [files, setFiles] = useState([]);

  async function handleSearch(q){
    const resp = await getFiles(q)
    setFiles(resp)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <SearchBar onSearch={handleSearch} />
      <FileUpload />
      <hr />
      <FileList files={files} />
    </div>
  );
}
