import { useState, useEffect, useRef } from 'react';
import { QrCodeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import QRCodeStyling from 'qr-code-styling';

export default function QrGenerator() {
  const [data, setData] = useState('https://github.com/CBTraining/webtoolstest');
  const [size, setSize] = useState(300);
  const [color1, setColor1] = useState('#40E0D0');
  const [color2, setColor2] = useState('#12a5d1');
  const [isRounded, setIsRounded] = useState(true);
  
  const qrRef = useRef(null);
  const qrCodeInstance = useRef(null);

  useEffect(() => {
    qrCodeInstance.current = new QRCodeStyling({
      width: size,
      height: size,
      data: data,
      dotsOptions: {
        type: isRounded ? 'rounded' : 'square',
        gradient: {
          type: 'linear',
          rotation: 0.785398, // 45 degrees
          colorStops: [
            { offset: 0, color: color1 },
            { offset: 1, color: color2 }
          ]
        }
      },
      cornersSquareOptions: {
        type: isRounded ? 'extra-rounded' : 'square'
      },
      backgroundOptions: {
        color: 'transparent'
      }
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = ''; // Clear old canvas
      qrCodeInstance.current.append(qrRef.current);
    }
  }, []);

  useEffect(() => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.update({
        width: size,
        height: size,
        data: data || ' ',
        dotsOptions: {
          type: isRounded ? 'rounded' : 'square',
          gradient: {
            type: 'linear',
            rotation: 0.785398,
            colorStops: [
              { offset: 0, color: color1 },
              { offset: 1, color: color2 }
            ]
          }
        },
        cornersSquareOptions: {
          type: isRounded ? 'extra-rounded' : 'square'
        }
      });
    }
  }, [data, size, color1, color2, isRounded]);

  const downloadQR = (ext) => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({ name: 'qrcode', extension: ext });
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1>QR Code Generator</h1>
        <p>Create highly customizable, beautiful QR codes instantly.</p>
      </header>

      <div className="grid-container">
        <div className="glass-panel controls">
          <h3>Customization</h3>
          
          <div className="control-group">
            <label>Payload (URL or Text)</label>
            <input 
              type="text" 
              className="text-input" 
              value={data} 
              onChange={(e) => setData(e.target.value)} 
              placeholder="Enter text or URL here"
            />
          </div>

          <div className="control-group" style={{marginTop: '1.5rem'}}>
            <label>Size ({size}px)</label>
            <input 
              type="range" 
              min="200" 
              max="800" 
              value={size} 
              onChange={(e) => setSize(Number(e.target.value))} 
              style={{width: '100%'}}
            />
          </div>

          <div className="control-group" style={{marginTop: '1.5rem'}}>
            <label>Gradient Colors</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="color" 
                value={color1} 
                onChange={(e) => setColor1(e.target.value)} 
                style={{width: '100%', height: '40px', cursor: 'pointer', border: 'none', background: 'none'}}
              />
              <input 
                type="color" 
                value={color2} 
                onChange={(e) => setColor2(e.target.value)} 
                style={{width: '100%', height: '40px', cursor: 'pointer', border: 'none', background: 'none'}}
              />
            </div>
          </div>

          <div className="control-group" style={{marginTop: '1.5rem'}}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isRounded} 
                onChange={(e) => setIsRounded(e.target.checked)} 
              />
              Use Rounded Dots
            </label>
          </div>

        </div>

        <div className="glass-panel preview">
          <h3>Preview</h3>
          <div style={{ 
            marginTop: '1rem', 
            background: '#fff', 
            padding: '1.5rem', 
            borderRadius: 'var(--border-radius)', 
            display: 'inline-block' 
          }}>
            <div ref={qrRef}></div>
          </div>
          
          <div className="button-group" style={{marginTop: '2rem'}}>
            <button className="btn btn-primary" onClick={() => downloadQR('png')}>
              <ArrowDownTrayIcon style={{width: 18, height: 18}} /> Download PNG
            </button>
            <button className="btn" onClick={() => downloadQR('svg')}>
              <ArrowDownTrayIcon style={{width: 18, height: 18}} /> Download SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
