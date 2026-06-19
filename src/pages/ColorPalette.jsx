import { useState, useRef } from 'react';
import { PhotoIcon as Photo, DocumentDuplicateIcon as CopyIcon, CheckIcon as Check } from '@heroicons/react/24/solid';
import { getColorSync, getPaletteSync } from 'colorthief';

export default function ColorPalette() {
  const [imageSrc, setImageSrc] = useState(null);
  const [palette, setPalette] = useState([]);
  const [dominant, setDominant] = useState(null);
  const [copiedColor, setCopiedColor] = useState(null);
  const imgRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
    }
  };

  const extractColors = () => {
    if (!imgRef.current) return;
    try {
      const domColor = getColorSync(imgRef.current);
      const palColors = getPaletteSync(imgRef.current, { colorCount: 8 });
      
      if (domColor && typeof domColor.hex === 'function') setDominant(domColor.hex());
      if (palColors) setPalette(palColors.filter(c => typeof c.hex === 'function').map(c => c.hex()));
    } catch (e) {
      console.error("Failed to extract colors. Image might be tainted.", e);
    }
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color).then(() => {
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    });
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><SwatchIcon style={{width: 32, height: 32}}/> Color Palette Extractor</h1>
          <p style={{marginTop: '0.5rem', color: 'var(--text-secondary)'}}>Upload an image to automatically extract its dominant color and a harmonious palette.</p>
        </div>
      </header>

      <div className="grid-container">
        <div className="glass-panel controls">
          {!imageSrc ? (
            <div className="dropzone">
              <Photo />
              <h3>Upload Image</h3>
              <p>Drag & drop or click to select</p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} 
              />
            </div>
          ) : (
            <div className="controls">
              <img 
                ref={imgRef}
                src={imageSrc} 
                alt="Upload preview" 
                crossOrigin="Anonymous"
                style={{width: '100%', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem', maxHeight: '300px', objectFit: 'contain'}} 
                onLoad={extractColors}
              />
              <div className="button-group" style={{marginTop: '1rem'}}>
                <button className="btn" onClick={() => {setImageSrc(null); setPalette([]); setDominant(null);}}>
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel preview">
          <h3>Extracted Palette</h3>
          {!dominant ? (
            <div className="empty-state">
              <p>Upload an image to see its colors.</p>
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Dominant Color</h4>
              <div 
                className="color-swatch"
                onClick={() => copyToClipboard(dominant)}
                style={{ 
                  background: dominant, 
                  height: '80px', 
                  borderRadius: 'var(--border-radius-sm)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  marginBottom: '1.5rem',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {copiedColor === dominant ? <><Check style={{width: 20, height: 20, marginRight: 8}}/> Copied!</> : <><CopyIcon style={{width: 20, height: 20, marginRight: 8}}/> {dominant}</>}
              </div>

              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Palette</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                {palette.map((color, i) => (
                  <div 
                    key={i}
                    onClick={() => copyToClipboard(color)}
                    style={{ 
                      background: color, 
                      height: '60px', 
                      borderRadius: 'var(--border-radius-sm)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#fff',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {copiedColor === color ? 'Copied!' : color}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Toast Notification */}
      {copiedColor && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          padding: '0.75rem 1.5rem',
          borderRadius: '50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 'bold'
        }}>
          <Check style={{width: 20, height: 20, color: 'var(--success-color)'}}/>
          Color {copiedColor} copied to clipboard!
        </div>
      )}
    </div>
  );
}
