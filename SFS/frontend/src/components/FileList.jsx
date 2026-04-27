import React, { useEffect, useState } from "react";
import { getFiles } from "../services/fileService";

export default function FileList({ files: initialFiles }) {
  const [files, setFiles] = useState(initialFiles || []);

  useEffect(() => {
    if (!initialFiles) {
      async function load() {
        const f = await getFiles();
        setFiles(f);
      }
      load();
    } else {
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  return (
    <div>
      <h3>Your Files</h3>
      {files && files.map((f) => (
        <div key={f.id} className="d-flex align-items-center mb-2">
          <div style={{flex:1}}>{f.original_filename}</div>
          <div>{f.size} bytes</div>
          <div className="ms-3">
            <a className="btn btn-sm btn-success" href={`/api/files/${f.id}/download/`}>Download</a>
          </div>
        </div>
      ))}
    </div>
  );
}
