// app/parents-enfants/page.tsx
import React, { useState } from 'react';

const ParentsAndChildrenPage = () => {
  const [files, setFiles] = useState([]);

  const uploadFile = (event) => {
    // Function to handle file uploads
    const newFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  return (
    <div>
      <h1>Parents and Children Section</h1>
      <input 
        type="file" 
        multiple 
        accept="audio/*,video/*,application/pdf" 
        onChange={uploadFile}
      />
      <ul>
        {files.map((file, index) => (
          <li key={index}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ParentsAndChildrenPage;