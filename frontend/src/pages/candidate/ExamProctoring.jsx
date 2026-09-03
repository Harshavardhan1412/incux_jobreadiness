import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { setProctoringStream, stopProctoringStream } from '../../utils/proctoring';
import {
  BrainCircuit,
  VideoOff,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const ExamProctoring = () => {
  const { activeAssessment, beginExam, navigateTo } = useApp();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const keepAliveRef = useRef(false);

  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [micAllowed, setMicAllowed] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [micError, setMicError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const requestAccess = async () => {
    setIsRequesting(true);
    setCameraError('');
    setMicError('');
    setCameraAllowed(false);
    setMicAllowed(false);
    stopProctoringStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;
      setProctoringStream(stream);
      setCameraAllowed(true);
      setMicAllowed(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraError('Camera and/or microphone permission was denied.');
        setMicError('Camera and/or microphone permission was denied.');
      } else if (err?.name === 'NotFoundError') {
        setCameraError('No camera device found.');
        setMicError('No microphone device found.');
      } else {
        setCameraError('Could not access camera/microphone. Please try again.');
        setMicError('Could not access camera/microphone. Please try again.');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    requestAccess();
    // Only release the stream on unmount if we did NOT proceed into the exam.
    return () => {
      if (!keepAliveRef.current) {
        stopProctoringStream();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBeginExam = () => {
    keepAliveRef.current = true;
    beginExam();
  };

  const handleBack = () => {
    stopProctoringStream();
    navigateTo('exam-instructions');
  };

  const allGranted = cameraAllowed && micAllowed;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                {activeAssessment?.title || 'Technical Assessment'}
              </h1>
              <p className="text-[11px] text-slate-500">Proctoring Setup</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Camera & Microphone Check
          </h2>
          <p className="text-sm text-slate-600">
            Please grant camera and microphone access so we can verify your identity for proctoring.
          </p>
        </div>

        {/* Live Camera Preview */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-card relative">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full aspect-video object-cover"
          />
          {/* Overlay when not granted */}
          {!allGranted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/70">
              {isRequesting ? (
                <>
                  <RefreshCw className="w-10 h-10 text-brand-400 animate-spin mb-3" />
                  <p className="text-white font-semibold">Requesting permission...</p>
                  <p className="text-slate-400 text-xs mt-1">Allow camera & microphone in the browser prompt.</p>
                </>
              ) : (
                <>
                  <VideoOff className="w-10 h-10 text-slate-400 mb-3" />
                  <p className="text-white font-semibold">Camera & Mic Not Connected</p>
                  <p className="text-slate-400 text-xs mt-1">Click the button below to enable.</p>
                </>
              )}
            </div>
          )}
        </div>

        {!allGranted && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-700 leading-relaxed">
              {cameraError || micError || 'Camera & microphone are required.'}{' '}
              Click <strong>Try Again</strong> to re-trigger the browser permission prompt and allow
              both Camera and Microphone.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            onClick={handleBack}
            className="sm:flex-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          {!allGranted && (
            <button
              onClick={requestAccess}
              disabled={isRequesting}
              className="sm:flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRequesting ? 'animate-spin' : ''}`} />
              Try Again
            </button>
          )}
          <button
            onClick={handleBeginExam}
            disabled={!allGranted}
            className="sm:flex-1 px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Continue to Exam
          </button>
        </div>

        {!allGranted && (
          <p className="text-center text-xs text-slate-500">
            You must enable both camera and microphone to begin the exam.
          </p>
        )}
      </main>
    </div>
  );
};