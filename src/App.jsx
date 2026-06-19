import { useEffect, useState, useRef } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/solid';
import Sidebar from './components/Sidebar';
import ImageTools from './pages/ImageTools';
import BackgroundRemover from './pages/BackgroundRemover';
import VideoCompressor from './pages/VideoCompressor';
import VideoToGif from './pages/VideoToGif';
import LottieToGif from './pages/LottieToGif';
import SvgConverter from './pages/SvgConverter';
import JsonSaver from './pages/JsonSaver';

const Home = () => (
  <div className="animate-fade-in">
    <div className="page-header">
      <h1>Welcome to WebTools</h1>
    </div>
    <p>A suite of offline-capable, highly aesthetic client-side utilities.</p>
    <div className="glass-panel" style={{marginTop: '2rem'}}>
      <h3>Features</h3>
      <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
        <li style={{marginBottom: '0.5rem'}}><strong>Global Clipboard:</strong> Ctrl+V anywhere to save clipboard images directly as PNG.</li>
        <li style={{marginBottom: '0.5rem'}}><strong>Sidebar Drop:</strong> Drag & Drop images to the sidebar for instant PNG conversion.</li>
        <li style={{marginBottom: '0.5rem'}}><strong>Offline Ready:</strong> Install this PWA and use tools without an internet connection.</li>
      </ul>
    </div>
  </div>
);

function App() {
  const [showModal, setShowModal] = useState(false);
  const [filename, setFilename] = useState('clipboard_image');
  const [pendingBlob, setPendingBlob] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showModal]);

  // Track mouse position for background proximity effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Global Clipboard Listener
  useEffect(() => {
    const handlePaste = (e) => {
      // Don't trigger if we're typing in an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((pngBlob) => {
              if (!pngBlob) return;
              setPendingBlob(pngBlob);
              setFilename('clipboard_image');
              setShowModal(true);
            }, 'image/png');
          };
          img.src = URL.createObjectURL(blob);
          break; // Process only the first image
        }
      }
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleDownload = () => {
    if (pendingBlob && filename) {
      const url = URL.createObjectURL(pendingBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowModal(false);
    setPendingBlob(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setPendingBlob(null);
  };

  return (
    <Router>
      <svg width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#40E0D0" />
            <stop offset="100%" stopColor="#12a5d1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="app-layout">
        <div className="mobile-header">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Bars3Icon style={{width: '28px', height: '28px'}} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
            <img src={`${import.meta.env.BASE_URL}masked-icon.svg`} alt="WebTools Logo" width="24" height="24" />
            <span style={{ fontWeight: 'normal', fontSize: '1.2rem' }}>Web<span className="text-gradient">Tools</span></span>
          </div>
        </div>
        
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/image-tools" element={<ImageTools />} />
            <Route path="/bg-remover" element={<BackgroundRemover />} />
            <Route path="/video-compressor" element={<VideoCompressor />} />
            <Route path="/video-to-gif" element={<VideoToGif />} />
            <Route path="/lottie-to-gif" element={<LottieToGif />} />
            <Route path="/svg-converter" element={<SvgConverter />} />
            <Route path="/json-saver" element={<JsonSaver />} />
          </Routes>
        </main>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal glass-panel animate-fade-in">
              <h3>Save Image</h3>
              <p style={{marginBottom: '1rem', fontSize: '0.9rem'}}>Enter a name for your pasted image.</p>
              <input 
                ref={inputRef}
                type="text" 
                className="input-field" 
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDownload();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
              <div className="button-group" style={{justifyContent: 'flex-end', marginTop: '1.5rem'}}>
                <button className="btn" onClick={handleCancel}>Cancel</button>
                <button className="btn btn-primary" onClick={handleDownload}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
