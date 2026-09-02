import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, AlertTriangle } from 'lucide-react';

export const MediaPreviewWidget = ({ stream }) => {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    if (stream) {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      if (videoTracks.length > 0) {
        setCameraActive(videoTracks[0].readyState === 'live');
        videoTracks[0].onended = () => {
          setCameraActive(false);
          setWarningMessage('Camera connection interrupted.');
        };
      }

      if (audioTracks.length > 0) {
        setMicActive(audioTracks[0].readyState === 'live');
        audioTracks[0].onended = () => {
          setMicActive(false);
          setWarningMessage('Microphone connection interrupted.');
        };
      }
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg p-2.5 w-44 flex flex-col gap-2">
      {/* Unobtrusive Live Video Preview */}
      <div className="relative w-full h-24 bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-slate-950/80 rounded text-[9px] font-bold text-white flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span>LIVE</span>
        </div>
      </div>

      {/* Device Status Pills */}
      <div className="space-y-1 text-[10px] font-bold">
        <div className={`flex items-center justify-between px-2 py-1 rounded-lg border ${
          cameraActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          <div className="flex items-center gap-1">
            <Camera className="w-3 h-3" />
            <span>{cameraActive ? '✓ Camera Active' : 'Camera Disconnected'}</span>
          </div>
        </div>

        <div className={`flex items-center justify-between px-2 py-1 rounded-lg border ${
          micActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          <div className="flex items-center gap-1">
            <Mic className="w-3 h-3" />
            <span>{micActive ? '✓ Microphone Active' : 'Mic Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Connection Warning Banner if Disconnected */}
      {warningMessage && (
        <div className="p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[9px] text-rose-800 font-bold flex items-center gap-1 animate-pulse leading-tight">
          <AlertTriangle className="w-3 h-3 text-rose-600 flex-shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}
    </div>
  );
};
