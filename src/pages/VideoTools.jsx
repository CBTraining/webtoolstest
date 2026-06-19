import { useState, useRef, useEffect } from 'react';
import { VideoCameraIcon as Video, CloudArrowUpIcon as UploadCloud, ArrowDownTrayIcon as Download } from '@heroicons/react/24/solid';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function VideoTools() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState('');
  const [resultUrl, setResultUrl] = useState(null);
  const [resultType, setResultType] = useState(''); // 'video/mp4' or 'image/gif'

  // FFmpeg instance
  const ffmpegRef = useRef(new FFmpeg());
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const load = async () => {
      const ffmpeg = ffmpegRef.current;
      if (ffmpeg.loaded) {
        setIsReady(true);
        return;
      }
      
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
      
      ffmpeg.on('log', ({ message }) => {
        setLog(message);
      });
      
      ffmpeg.on('progress', ({ progress, time }) => {
        setProgress(progress);
      });

      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setIsReady(true);
      } catch (err) {
        console.error('Failed to load FFmpeg:', err);
        setLoadError('Failed to load FFmpeg engine. Please check your connection.');
      }
    };
    
    load();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoSrc(URL.createObjectURL(file));
      setResultUrl(null);
    }
  };

  const processVideo = async (action) => {
    if (!videoFile || !isReady) return;
    setIsProcessing(true);
    setProgress(0);
    setLog('Starting process...');

    const ffmpeg = ffmpegRef.current;
    
    // Write file to memory
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

    if (action === 'compress') {
      // Compress Video: Re-encode with lower bitrate/CRF
      await ffmpeg.exec(['-i', 'input.mp4', '-vcodec', 'libx264', '-crf', '28', '-preset', 'fast', 'output.mp4']);
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      setResultUrl(URL.createObjectURL(blob));
      setResultType('video/mp4');
    } else if (action === 'gif') {
      // Convert to GIF: Generate palette, then apply
      await ffmpeg.exec(['-i', 'input.mp4', '-vf', 'fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse', '-loop', '0', 'output.gif']);
      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data.buffer], { type: 'image/gif' });
      setResultUrl(URL.createObjectURL(blob));
      setResultType('image/gif');
    }

    setIsProcessing(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <Video />
        <h1>Video Tools</h1>
      </div>
      <p>Compress videos or convert them to GIFs instantly, fully in your browser.</p>
      
      {!isReady && !loadError && (
        <div className="glass-panel" style={{marginBottom: '1rem', background: 'var(--accent-transparent)', border: '1px solid var(--accent-color)'}}>
          <div className="loader" style={{width: '16px', height: '16px', marginRight: '10px'}}></div>
          Loading FFmpeg engine...
        </div>
      )}
      {loadError && (
        <div className="glass-panel" style={{marginBottom: '1rem', background: 'rgba(255, 77, 79, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)'}}>
          <strong>Error: </strong> {loadError}
        </div>
      )}

      <div className="grid-container">
        <div className="glass-panel controls">
          {!videoSrc ? (
            <div className="dropzone">
              <UploadCloud />
              <h3>Upload Video</h3>
              <p>Select an MP4, WebM, or MOV file</p>
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleFileUpload} 
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} 
                disabled={!isReady}
              />
            </div>
          ) : (
            <div className="controls">
              <video src={videoSrc} controls style={{width: '100%', borderRadius: 'var(--border-radius-sm)', background: '#000'}} />
              
              {!isProcessing && !resultUrl && (
                <div className="button-group">
                  <button className="btn btn-primary" onClick={() => processVideo('compress')}>
                    Compress Video
                  </button>
                  <button className="btn" onClick={() => processVideo('gif')}>
                    Convert to GIF
                  </button>
                </div>
              )}

              {isProcessing && (
                <div style={{ textAlign: 'center' }}>
                  <p>Processing... {Math.round(progress * 100)}%</p>
                  <div style={{ width: '100%', background: 'var(--bg-tertiary)', height: '8px', borderRadius: '4px', marginBottom: '0.5rem' }}>
                    <div style={{ width: `${progress * 100}%`, background: 'var(--accent-color)', height: '100%', borderRadius: '4px', transition: 'width 0.2s' }}></div>
                  </div>
                  <small style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', display: 'block', height: '1.5em', overflow: 'hidden' }}>{log}</small>
                </div>
              )}

              {resultUrl && (
                <div className="button-group">
                  <a className="btn btn-primary" href={resultUrl} download={`processed-${Date.now()}.${resultType === 'image/gif' ? 'gif' : 'mp4'}`}>
                    <Download style={{width: "18px", height: "18px"}} /> Download {resultType === 'image/gif' ? 'GIF' : 'Video'}
                  </a>
                  <button className="btn" onClick={() => {setVideoSrc(null); setVideoFile(null); setResultUrl(null);}}>
                    Start Over
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {resultUrl && (
          <div className="glass-panel preview-panel">
             <h3>Result</h3>
             <div className="canvas-container">
                {resultType === 'video/mp4' ? (
                  <video src={resultUrl} controls style={{ maxWidth: '100%', maxHeight: '60vh', background: '#000' }} />
                ) : (
                  <img src={resultUrl} alt="GIF Result" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
