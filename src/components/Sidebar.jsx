import { NavLink } from 'react-router-dom';
import { 
  PhotoIcon, 
  FilmIcon,
  GifIcon,
  ScissorsIcon, 
  CodeBracketSquareIcon, 
  SparklesIcon, 
  CommandLineIcon, 
  Square3Stack3DIcon
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const [isDragging, setIsDragging] = useState(false);

  // Handle Drag Events for Passive Side-bar Drops
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processDroppedFile = async (file) => {
    if (file.type.startsWith('image/')) {
      // Passive Image to PNG converter
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'pngconvert.png';
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      };
      img.src = URL.createObjectURL(file);
    } else if (file.type.startsWith('video/')) {
      // Passive Video to GIF converter
      // (Will implement full FFmpeg.wasm logic later, placeholder for now)
      alert('Passive Video to GIF conversion via ffmpeg.wasm will trigger here!');
    } else {
      alert('Unsupported file type for passive conversion.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processDroppedFile(file);
    }
  };

  const navItems = [
    { to: '/', icon: Square3Stack3DIcon, label: 'Home' },
    { to: '/image-tools', icon: PhotoIcon, label: 'Image Tools' },
    { to: '/bg-remover', icon: SparklesIcon, label: 'Background Remover' },
    { to: '/video-compressor', icon: FilmIcon, label: 'Video Compressor' },
    { to: '/video-to-gif', icon: GifIcon, label: 'Video to GIF' },
    { to: '/lottie-to-gif', icon: ScissorsIcon, label: 'Lottie to GIF' },
    { to: '/svg-converter', icon: CommandLineIcon, label: 'SVG Converter' },
    { to: '/json-saver', icon: CodeBracketSquareIcon, label: 'JSON Saver' }
  ];

  return (
    <aside 
      className={`sidebar glass-panel ${isDragging ? 'drag-active' : ''} ${isOpen ? 'open' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="sidebar-header">
        <div className="logo-container" style={{ alignItems: 'center' }}>
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="WebTools Logo" width="28" height="28" style={{ marginRight: '4px' }} />
          <h2>WebTools</h2>
          <span className="version">v2.05</span>
        </div>
        <div style={{marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4'}}>
          <p><strong>Tip:</strong> CTRL+V to Save Named.</p>
          <p>Drag in an image or video to auto convert.</p>
        </div>
        {isDragging && (
          <div className="drop-overlay animate-fade-in">
            <p>Drop to Convert!</p>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to}
            className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => { if(onClose) onClose(); }}
          >
            <item.icon style={{width: "20px", height: "20px"}} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
