import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ImageTools from './pages/ImageTools';
import BackgroundRemover from './pages/BackgroundRemover';
import VideoTools from './pages/VideoTools';
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
  // Global Clipboard Listener
  useEffect(() => {
    const handlePaste = (e) => {
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
              const filename = prompt('Enter a name for the PNG file:', 'clipboard_image');
              if (filename) {
                const url = URL.createObjectURL(pngBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
                a.click();
                URL.revokeObjectURL(url);
              }
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

  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/image-tools" element={<ImageTools />} />
            <Route path="/bg-remover" element={<BackgroundRemover />} />
            <Route path="/video-tools" element={<VideoTools />} />
            <Route path="/lottie-to-gif" element={<LottieToGif />} />
            <Route path="/svg-converter" element={<SvgConverter />} />
            <Route path="/json-saver" element={<JsonSaver />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
