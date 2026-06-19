import { useState, useRef } from 'react';
import '../index.css'; // Relies on index.css .dropzone styles

export default function Dropzone({ onDrop, accept = "*", title = "Upload File", subtitle = "Click or drag a file here", icon }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDropEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDrop(e.dataTransfer.files[0]);
    } else {
      // Handle cross-tab html/image drag
      const html = e.dataTransfer.getData('text/html');
      if (html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const img = doc.querySelector('img');
        if (img && img.src) {
           // We can't trivially convert a cross-origin URL to a File object synchronously,
           // but we can pass a dummy file or we should just alert for now.
           alert("Please use CTRL+V to paste images from other tabs!");
        }
      }
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onDrop(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`dropzone ${isDragActive ? 'active' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDropEvent}
      onClick={handleClick}
    >
      {icon}
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <input 
        ref={inputRef}
        type="file" 
        accept={accept} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        title=""
      />
    </div>
  );
}
