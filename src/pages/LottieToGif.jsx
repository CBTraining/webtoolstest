import { useState, useRef } from 'react';
import { ScissorsIcon as Scissors, CloudArrowUpIcon as UploadCloud, ArrowDownTrayIcon as Download } from '@heroicons/react/24/solid';
import Dropzone from '../components/Dropzone';
import lottie from 'lottie-web';
import GIF from 'gif.js';

export default function LottieToGif() {
  const [lottieData, setLottieData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gifUrl, setGifUrl] = useState(null);
  const containerRef = useRef(null);

  const handleConvert = async () => {
    if (!lottieData) return;
    setIsProcessing(true);
    setProgress(0);

    // Create a temporary hidden container for canvas rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.width = '300px';
    tempContainer.style.height = '300px';
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);

    const animItem = lottie.loadAnimation({
      container: tempContainer,
      renderer: 'canvas',
      loop: false,
      autoplay: false,
      animationData: lottieData,
    });

    await new Promise(resolve => animItem.addEventListener('DOMLoaded', resolve));

    const totalFrames = animItem.totalFrames;
    const frameRate = animItem.frameRate;
    const delay = 1000 / frameRate;

    const canvas = tempContainer.querySelector('canvas');
    
    // We use a CDN for the worker to avoid Vite build configuration complexities
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
      workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js',
      transparent: 0x000000 // Best effort transparency
    });

    gif.on('progress', p => setProgress(p));
    
    gif.on('finished', (blob) => {
      setGifUrl(URL.createObjectURL(blob));
      setIsProcessing(false);
      animItem.destroy();
      document.body.removeChild(tempContainer);
    });

    // Render frame by frame
    for (let i = 0; i < totalFrames; i++) {
      animItem.goToAndStop(i, true);
      // We must pass the canvas element to gif.addFrame
      gif.addFrame(canvas, { copy: true, delay });
    }

    gif.render();
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <Scissors />
        <h1>Lottie to GIF</h1>
      </div>
      <p>Convert your JSON Lottie animations to high-quality GIFs.</p>

      <div className="grid-container">
        <div className="glass-panel controls">
          {!lottieData ? (
            <Dropzone 
              onDrop={(file) => {
                if (file && file.name.endsWith('.json')) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    try {
                      const json = JSON.parse(e.target.result);
                      setLottieData(json);
                      setGifUrl(null);
                      
                      // Render preview
                      setTimeout(() => {
                        if (containerRef.current) {
                          containerRef.current.innerHTML = '';
                          lottie.loadAnimation({
                            container: containerRef.current,
                            renderer: 'svg',
                            loop: true,
                            autoplay: true,
                            animationData: json,
                          });
                        }
                      }, 0);
                    } catch (err) {
                      alert("Invalid JSON file");
                    }
                  };
                  reader.readAsText(file);
                } else {
                  alert("Please upload a .json Lottie file");
                }
              }}
              accept=".json"
              title="Upload Lottie JSON"
              subtitle="Drag & drop or click to select"
              icon={<UploadCloud style={{width: 48, height: 48}}/>}
            />
          ) : (
            <div className="controls">
              <div className="glass-panel" style={{background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'center'}}>
                <div ref={containerRef} style={{ width: '200px', height: '200px' }}></div>
              </div>
              
              {!isProcessing && !gifUrl && (
                <button className="btn btn-primary" onClick={handleConvert}>
                  Convert to GIF
                </button>
              )}
              
              {isProcessing && (
                <div style={{ textAlign: 'center' }}>
                  <p>Processing... {Math.round(progress * 100)}%</p>
                  <div style={{ width: '100%', background: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px' }}>
                    <div style={{ width: `${progress * 100}%`, background: 'var(--accent-color)', height: '100%', borderRadius: '4px', transition: 'width 0.2s' }}></div>
                  </div>
                </div>
              )}

              {gifUrl && (
                <div className="button-group" style={{justifyContent: 'center'}}>
                  <a className="btn btn-primary" href={gifUrl} download={`lottie-${Date.now()}.gif`}>
                    <Download style={{width: "18px", height: "18px"}} /> Download GIF
                  </a>
                  <button className="btn" onClick={() => {setLottieData(null); setGifUrl(null);}}>
                    Convert Another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
