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
import ColorPicker from './pages/ColorPicker';
import QrGenerator from './pages/QrGenerator';
import BackgroundDots from './components/BackgroundDots';

const Home = () => (
  <div className="animate-fade-in">
    <div className="page-header">
      <h1>Welcome to WebTools</h1>
    </div>
    <p>A suite of offline-capable, highly aesthetic client-side utilities.</p>
    <div className="glass-panel" style={{marginTop: '2rem'}}>
      <h3>Features</h3>
      <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
        <li style={{marginBottom: '0.5rem'}}><strong>Global Clipboard:</strong> Ctrl+V anywhere to save clipboard images directly as PNG (now securely bypasses clipboard limits to capture images directly from Google Slides & Docs!).</li>
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
  const [globalToast, setGlobalToast] = useState(null);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  // Clear global toast after 3 seconds
  useEffect(() => {
    if (globalToast) {
      const timer = setTimeout(() => setGlobalToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [globalToast]);

  // Track mouse position for glowing card effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const elements = document.querySelectorAll('.glass-panel, .nav-link, .sidebar');
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Global Clipboard Listener
  useEffect(() => {
    const processImageBlob = (blob) => {
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
    };

    const handlePaste = async (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;

      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') === 0) {
            const blob = items[i].getAsFile();
            if (blob) {
              e.preventDefault();
              processImageBlob(blob);
              return;
            }
          }
        }
      }

      if (navigator.clipboard && navigator.clipboard.read) {
        try {
          const clipboardItems = await navigator.clipboard.read();
          for (const clipboardItem of clipboardItems) {
            const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
            if (imageTypes.length > 0) {
              for (const type of imageTypes) {
                const blob = await clipboardItem.getType(type);
                if (blob) {
                  e.preventDefault();
                  processImageBlob(blob);
                  return;
                }
              }
            }
          }
        } catch (err) {
          console.warn("Async Clipboard API failed:", err);
        }
      }

      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type === 'text/html') {
            e.preventDefault();
            items[i].getAsString(async (html) => {
              const handled = await processHtmlPaste(html);
              if (!handled) {
                 setGlobalToast("No image found in clipboard.");
                 window.dispatchEvent(new Event('paste-error'));
              }
            });
            return;
          }
        }
      }

      setGlobalToast("No image found in clipboard.");
      window.dispatchEvent(new Event('paste-error'));
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleManualPaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      let handled = false;
      for (const clipboardItem of clipboardItems) {
        const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
        if (imageTypes.length > 0) {
          for (const type of imageTypes) {
            const blob = await clipboardItem.getType(type);
            if (blob) {
              processImageBlob(blob);
              handled = true;
              return;
            }
          }
        }
        // Try text/html if no images found
        if (!handled && clipboardItem.types.includes('text/html')) {
          const blob = await clipboardItem.getType('text/html');
          const html = await blob.text();
          handled = await processHtmlPaste(html);
          if (handled) return;
        }
      }
      
      if (!handled) {
        setGlobalToast("No image found in clipboard.");
        window.dispatchEvent(new Event('paste-error'));
      }
    } catch (err) {
      console.warn("Clipboard API failed:", err);
      setGlobalToast("Could not access clipboard. Please grant permission.");
      window.dispatchEvent(new Event('paste-error'));
    }
  };

  const processHtmlPaste = async (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const imgElement = doc.querySelector('img');
    
    if (imgElement && imgElement.src) {
      try {
        let response;
        try {
          response = await fetch(imgElement.src);
          if (!response.ok) throw new Error("Direct fetch not ok");
        } catch (e1) {
          try {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imgElement.src)}`;
            response = await fetch(proxyUrl);
            if (!response.ok) throw new Error("CorsProxy failed");
          } catch (e2) {
            const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(imgElement.src)}`;
            response = await fetch(proxyUrl2);
          }
        }
        
        if (!response || !response.ok) throw new Error("All proxy attempts failed");
        
        const blob = await response.blob();
        if (blob.type.startsWith('image/')) {
          processImageBlob(blob);
          return true;
        }
      } catch (err) {
        console.warn('Failed to load image from HTML paste via proxies.', err);
      }
    } else {
      const svgElement = doc.querySelector('svg');
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 800;
          canvas.height = img.height || 600;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((pngBlob) => {
            processImageBlob(pngBlob);
          }, 'image/png');
        };
        img.src = url;
        return true;
      }
    }
    return false;
  };

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
      <BackgroundDots />
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
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="WebTools Logo" width="24" height="24" />
            <span style={{ fontWeight: 'normal', fontSize: '1.2rem' }}>Web<span className="text-gradient">Tools</span></span>
          </div>
        </div>
        
        {globalToast && (
          <div className="toast animate-fade-in" style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, background: '#ff4444', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            {globalToast}
          </div>
        )}

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onManualPaste={handleManualPaste} />
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
            <Route path="/color-picker" element={<ColorPicker />} />
            <Route path="/qr-generator" element={<QrGenerator />} />
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
