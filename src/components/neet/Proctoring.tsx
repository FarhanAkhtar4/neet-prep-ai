'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertTriangle } from 'lucide-react';

export function Proctoring() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [faceDetected, setFaceDetected] = useState(true);
  const [noFaceCount, setNoFaceCount] = useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let interval: NodeJS.Timeout | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }

        // Periodic face detection check (simple: check if video is playing)
        // In production, this would use a face detection API
        interval = setInterval(() => {
          const video = videoRef.current;
          if (!video) return;

          const canvas = document.createElement('canvas');
          canvas.width = 80;
          canvas.height = 60;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.drawImage(video, 0, 0, 80, 60);
          const imageData = ctx.getImageData(0, 0, 80, 60);

          // Simple skin-tone detection heuristic
          let skinPixels = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            // Basic skin color detection
            if (
              r > 95 &&
              g > 40 &&
              b > 20 &&
              r > g &&
              r > b &&
              Math.abs(r - g) > 15 &&
              r - g > 15 &&
              r - b > 15
            ) {
              skinPixels++;
            }
          }

          const totalPixels = 80 * 60;
          const skinRatio = skinPixels / totalPixels;
          const hasFace = skinRatio > 0.05; // At least 5% skin pixels

          if (!hasFace) {
            setNoFaceCount((prev) => {
              const newCount = prev + 1;
              if (newCount >= 5) {
                setFaceDetected(false);
                // In production, this would trigger a violation
              }
              return newCount;
            });
          } else {
            setNoFaceCount(0);
            setFaceDetected(true);
          }
        }, 5000);
      } catch (err) {
        setCameraError('Camera access denied. Proctoring is inactive.');
        console.warn('Camera access error:', err);
      }
    }

    // Start camera after a short delay
    const timeout = setTimeout(startCamera, 2000);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <>
      {/* Hidden video element for webcam */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
        aria-hidden="true"
      />

      {/* Proctoring status indicator */}
      {cameraActive && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-xs ${
            faceDetected
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
          }`}
        >
          {faceDetected ? (
            <Camera className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          <span>{faceDetected ? 'Proctoring Active' : 'No Face Detected!'}</span>
        </div>
      )}

      {/* Camera error notification */}
      {cameraError && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs">
          <CameraOff className="h-3.5 w-3.5" />
          <span>{cameraError}</span>
        </div>
      )}
    </>
  );
}
