/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw } from 'lucide-react';

export default function LiveSelfieCapture({ disabled, submitting, onConfirm }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [phase, setPhase] = useState('start'); // start | live | review
  const [previewUrl, setPreviewUrl] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [error, setError] = useState(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  useEffect(() => {
    if (!disabled) return;
    stopStream();
    setPhase('start');
    setCapturedBlob(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setError(null);
  }, [disabled]);

  // The <video> element only mounts once phase becomes 'live', so the stream
  // must be attached here (after render) rather than immediately after
  // getUserMedia resolves, when the ref is still null.
  useEffect(() => {
    if (phase !== 'live' || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => {});
  }, [phase]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setPhase('live');
    } catch {
      setError('Camera access was denied. Please allow camera permission to continue.');
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    // Mirror the frame so the capture matches the mirrored live preview.
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        stopStream();
        setPhase('review');
      },
      'image/jpeg',
      0.9,
    );
  };

  const retake = () => {
    setCapturedBlob(null);
    setPreviewUrl(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedBlob) onConfirm(capturedBlob);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <canvas ref={canvasRef} hidden />

      {phase === 'start' && (
        <button
          type="button"
          onClick={startCamera}
          disabled={disabled}
          className="flex aspect-square w-full max-w-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:text-gray-400"
        >
          <Camera className="h-8 w-8" />
          <span className="text-sm font-medium">Start camera</span>
        </button>
      )}

      {phase === 'live' && (
        <div className="flex w-full max-w-56 flex-col items-center gap-4">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className="aspect-square w-full scale-x-[-1] rounded-2xl bg-black object-cover"
          />
          <button
            type="button"
            onClick={capture}
            className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-4 border-gray-200 bg-black transition hover:opacity-90"
            title="Capture"
          >
            <span className="sr-only">Capture selfie</span>
          </button>
        </div>
      )}

      {phase === 'review' && (
        <>
          <img
            src={previewUrl}
            alt="Selfie preview"
            className="aspect-square w-full max-w-56 rounded-2xl object-cover"
          />
          <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={retake}
              disabled={submitting}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1 sm:py-2.5"
            >
              <RotateCcw className="h-4 w-4" />
              Retake
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1 sm:py-2.5"
            >
              {submitting ? 'Submitting…' : 'Confirm & Acknowledge'}
            </button>
          </div>
        </>
      )}

      {error && <p className="text-center text-xs text-red-500">{error}</p>}

      {disabled && phase === 'start' && (
        <p className="text-center text-xs text-gray-400">
          Agree to the consent above to start your camera.
        </p>
      )}
    </div>
  );
}
