import { useState } from 'react';
import { SparklesIcon as ImageMinus } from '@heroicons/react/24/solid';
import { CloudArrowUpIcon as UploadCloud, ArrowDownTrayIcon as Download } from '@heroicons/react/24/outline';
import Dropzone from '../components/Dropzone';
import { removeBackground } from '@imgly/background-removal';

export default function BackgroundRemover() {
  const [imageFile, setImageFile] = useState(null);
  const [originalSrc, setOriginalSrc] = useState(null);
  const [resultSrc, setResultSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setOriginalSrc(URL.createObjectURL(file));
      setResultSrc(null);
    }
  };

  const processImage = async () => {
    if (!imageFile) return;
    setIsProcessing(true);
    setProgress(0.1); // Provide initial feedback

    try {
      const config = {
        progress: (key, current, total) => {
          // Progress roughly goes through fetching model -> processing
          // `current` / `total` represents fetch progress.
          if (total) {
            setProgress(0.1 + (current / total) * 0.8);
          }
        }
      };

      const imageBlob = await removeBackground(imageFile, config);
      setProgress(1.0);
      setResultSrc(URL.createObjectURL(imageBlob));
    } catch (err) {
      console.error(err);
      alert('Error removing background. Ensure you are connected to the internet on first run to download the model.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <ImageMinus />
        <h1>Background Remover</h1>
      </div>
      <p>Remove backgrounds from images locally using an AI model right in your browser.</p>
      
      <div className="glass-panel" style={{marginBottom: '1rem', background: 'var(--accent-transparent)', border: '1px solid var(--accent-color)'}}>
        <strong>Note:</strong> The AI model (~40MB) will be downloaded to your browser on the first use. Subsequent uses will work offline!
      </div>

      <div className="grid-container">
        <div className="glass-panel controls">
          {!originalSrc ? (
            <Dropzone 
              onDrop={(file) => {
                if (file && file.type.startsWith('image/')) {
                  setImageFile(file);
                  const reader = new FileReader();
                  reader.onload = (e) => setOriginalSrc(e.target.result);
                  reader.readAsDataURL(file);
                }
              }}
              title="Upload Image"
              subtitle="Select an image to remove its background"
              icon={<UploadCloud style={{width: 48, height: 48}}/>}
            />
          ) : (
            <div className="controls">
               <img src={originalSrc} alt="Original" style={{maxWidth: '100%', borderRadius: 'var(--border-radius-sm)'}} />
               
               {!isProcessing && !resultSrc && (
                 <button className="btn btn-primary" onClick={processImage}>
                   Remove Background
                 </button>
               )}

               {isProcessing && (
                 <div style={{ textAlign: 'center' }}>
                   <p>Processing... AI Model may be downloading</p>
                   <div className="loader" style={{marginBottom: '1rem'}}></div>
                   <div style={{ width: '100%', background: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px' }}>
                     <div style={{ width: `${progress * 100}%`, background: 'var(--accent-color)', height: '100%', borderRadius: '4px', transition: 'width 0.2s' }}></div>
                   </div>
                 </div>
               )}

               {resultSrc && (
                 <div className="button-group">
                   <a className="btn btn-primary" href={resultSrc} download={`nobg-${Date.now()}.png`}>
                     <Download style={{width: "18px", height: "18px"}} /> Download Result
                   </a>
                   <button className="btn" onClick={() => {setOriginalSrc(null); setImageFile(null); setResultSrc(null);}}>
                     Reset
                   </button>
                 </div>
               )}
            </div>
          )}
        </div>

        {resultSrc && (
          <div className="glass-panel preview-panel">
             <h3>Result</h3>
             <div className="canvas-container">
                <img src={resultSrc} alt="No Background" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
