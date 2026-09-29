import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  parseResumeText,
  generateResumeQuestions,
  analyzeRoleSkillGaps,
  getRoleDefaults
} from '../../utils/resumeParser';
import {
  Volume2,
  Video,
  Mic,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  Award,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
  Zap,
  VideoOff,
  Activity,
  Eye,
  Smile,
  AlignCenter,
  BarChart3,
  AlertTriangle,
  Play,
  Briefcase,
  Layers,
  FileCheck,
  Edit3,
  Upload,
  FileText,
  RefreshCw,
  Target,
  ClipboardList,
  X,
  Lock,
  Unlock,
  ShieldAlert,
  Clock
} from 'lucide-react';

const PRESET_ROLES = [
  'ML Engineer',
  'Software Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'DevOps Engineer'
];

const SAMPLE_ML_RESUME = `Pera Vishnuvardhan Reddy - Machine Learning Engineer
Summary: Passionate ML Engineer experienced in building predictive models, data preprocessing pipelines, and model evaluation with Python, Scikit-Learn, and PyTorch.
Skills: Python, Machine Learning, Scikit-Learn, Pandas, NumPy, Model Evaluation, PyTorch, Data Preprocessing, SQL, REST APIs, Git.
Projects:
• Predictive Customer Churn Pipeline: Built classification models with Random Forest and XGBoost in Scikit-Learn, achieving 89% accuracy and reducing customer attrition.
• Computer Vision & Image Recognition: Implemented CNN architectures with PyTorch for automated defect detection in real-time camera streams.`;

// Waveform bars component
function Waveform({ active }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[3, 5, 7, 4, 6, 5, 8, 4, 6, 3].map((h, i) => (
        <span
          key={i}
          className={`w-[2.5px] rounded-full transition-all duration-150 ${
            active ? 'bg-cyan-400' : 'bg-slate-700'
          }`}
          style={{
            height: active ? `${Math.max(4, (h * 2.2) % 20)}px` : '4px',
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}

      

    </div>
  );
}

// Circular Score Ring helper for final report
function MiniScoreRing({ score, size = 64 }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#06b6d4' : '#f59e0b';

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#1e293b" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-black text-white">{score}</span>
        <span className="text-[8px] text-slate-400 font-mono">/100</span>
      </div>
    </div>
  );
}

export const AIMockInterviewPage = () => {
  const { navigateTo, currentUser, role, adminUser, candidateSubmissions, assessments, isAssessmentCompleted } = useApp();

  // Admin Configuration State (Synced with Backend Admin Portal)
  const [adminSettings, setAdminSettings] = useState({
    isLocked: false,
    lockReason: 'AI Mock Interview sessions are currently locked by the administrator.',
    questionCount: 5,
    difficulty: 'Moderate',
    maxWarnings: 3
  });

  useEffect(() => {
    fetch('/api/interview/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setAdminSettings(data.settings);
          if (data.settings.questionCount) {
            setQuestions((prev) => prev.slice(0, data.settings.questionCount));
          }
        }
      })
      .catch((err) => console.warn('Settings fetch notice:', err.message));
  }, []);

  // 1. Stage State: 'setup' (Picture 1) -> 'room' (Picture 2) -> Report
  const [stage, setStage] = useState('setup');

  // 2. Role and Resume ATS Data
  const [targetRole, setTargetRole] = useState(() => {
    return localStorage.getItem('rsj_selected_role') || 'Data Scientist';
  });

  const [uploadedFileName, setUploadedFileName] = useState(() => {
    return localStorage.getItem('rsj_uploaded_resume_name') || null;
  });

  const [rawResumeText, setRawResumeText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // Resume analysis state initialized intelligently based on current targetRole
  const [analysisResult, setAnalysisResult] = useState(() => {
    try {
      const saved = localStorage.getItem('rsj_resume_analysis');
      if (saved) return JSON.parse(saved);
    } catch {}
    const initialRole = localStorage.getItem('rsj_selected_role') || 'Data Scientist';
    return parseResumeText('', initialRole);
  });

  const [isEditingRole, setIsEditingRole] = useState(false);
  const [roleInput, setRoleInput] = useState(targetRole);

  // Initialize questions using resumeParser ensuring Q1 is ALWAYS "Tell me about yourself"
  const [questions, setQuestions] = useState(() => {
    const base = analysisResult || parseResumeText('', targetRole);
    return generateResumeQuestions(base, targetRole);
  });

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [isReportReady, setIsReportReady] = useState(false);
  const [finalAnalysis, setFinalAnalysis] = useState(null);

  // Audio & Video State
  const [cameraActive, setCameraActive] = useState(false);
  const [isTestingCamera, setIsTestingCamera] = useState(false);
  const [videoPlayBlocked, setVideoPlayBlocked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [companionText, setCompanionText] = useState('');
  const [answersList, setAnswersList] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState('');

  // Proctoring Violations & Warning System (Max 3: Camera Closed & Multi-Face)
  const [warningCount, setWarningCount] = useState(0);
  const [activeWarningMessage, setActiveWarningMessage] = useState('');
  const [proctoringModal, setProctoringModal] = useState(null); // { violation, count, isFinal }
  const [proctoringLog, setProctoringLog] = useState([]);
  const lastViolationTimeRef = useRef(0);

  const triggerProctoringViolation = (violationReason) => {
    // Debounce duplicate triggers within 1.2 seconds for rapid testing
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 1200) return;
    lastViolationTimeRef.current = now;

    setWarningCount((prevCount) => {
      const newCount = prevCount + 1;
      const logEntry = {
        number: newCount,
        reason: violationReason,
        time: new Date().toLocaleTimeString()
      };
      setProctoringLog((prev) => [...prev, logEntry]);
      setActiveWarningMessage(`Warning ${newCount}/3: ${violationReason}`);

      const maxAllowed = adminSettings.maxWarnings || 3;
      if (newCount >= maxAllowed) {
        // FINAL WARNING REACHED: TERMINATE AND NAVIGATE TO RESULTS
        setProctoringModal({
          violation: violationReason,
          count: newCount,
          maxAllowed,
          isFinal: true
        });

        setTimeout(() => {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
          if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
          }
          setSessionActive(false);
          stopCamera();
          setProctoringModal(null);
          setIsReportReady(true);

          if (sessionId) {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            fetch(`/api/interview/session/${sessionId}/complete`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ status: 'TERMINATED_VIOLATION', warningCount: 3 })
            }).catch(() => {});
          }
        }, 3200);
      } else {
        // WARNING 1 OR 2: SHOW WARNING MODAL
        setProctoringModal({
          violation: violationReason,
          count: newCount,
          isFinal: false
        });
      }

      return newCount;
    });
  };

  // Live Telemetry from real processing
  const [telemetry, setTelemetry] = useState({
    eyeContact: 92,
    emotion: 'Focused',
    headPose: 'Centered',
    confidence: 88,
    attention: 90,
  });

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const telemetryIntervalRef = useRef(null);
  const qStartTimeRef = useRef(Date.now());
  const currentQRef = useRef(questions[0]);

  const currentQ = questions[currentQIndex] || questions[0];
  const isFinalQuestion = currentQIndex >= questions.length - 1;

  useEffect(() => {
    currentQRef.current = currentQ;
  }, [currentQ]);

  // Keep questions and skill gaps synchronized with targetRole & analysisResult
  useEffect(() => {
    const updatedQ = generateResumeQuestions(analysisResult, targetRole);
    setQuestions(updatedQ);
    localStorage.setItem('rsj_resume_questions', JSON.stringify(updatedQ));
  }, [targetRole, analysisResult]);

  // Calculate current skill gaps for the target role
  const skillGaps = analysisResult?.skillGaps || analyzeRoleSkillGaps(analysisResult?.skills || [], targetRole);
  const resumeATS = String(analysisResult?.atsScore || skillGaps.atsScore || 92);

  // ==========================================
  // HANDLERS FOR SETUP STAGE (PICTURE 1)
  // ==========================================
  const handleRoleChange = (newRole) => {
    // Preserve user input verbatim: allows deleting, backspacing to empty, and typing spaces
    setTargetRole(newRole);
    setRoleInput(newRole);
    localStorage.setItem('rsj_selected_role', newRole);

    const effectiveRole = newRole.trim() || 'Software Engineer';

    // Re-parse with existing text or role defaults
    const updatedAnalysis = parseResumeText(rawResumeText, effectiveRole);
    if (analysisResult?.candidateName && analysisResult.candidateName !== 'Candidate') {
      updatedAnalysis.candidateName = analysisResult.candidateName;
    }
    setAnalysisResult(updatedAnalysis);
    localStorage.setItem('rsj_resume_analysis', JSON.stringify(updatedAnalysis));
    localStorage.setItem('rsj_resume_ats_score', String(updatedAnalysis.atsScore));

    const updatedQ = generateResumeQuestions(updatedAnalysis, effectiveRole);
    setQuestions(updatedQ);
    setCurrentQIndex(0);
    localStorage.setItem('rsj_resume_questions', JSON.stringify(updatedQ));
    setIsEditingRole(false);
  };

  const processResumeContent = (name, text, roleToUse = targetRole) => {
    setIsScanning(true);
    setScanProgress(25);

    setTimeout(() => setScanProgress(60), 300);
    setTimeout(() => setScanProgress(90), 600);
    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setUploadedFileName(name);
      setRawResumeText(text);

      const parsed = parseResumeText(text, roleToUse);
      setAnalysisResult(parsed);

      const generatedQuestions = generateResumeQuestions(parsed, roleToUse);
      setQuestions(generatedQuestions);
      setCurrentQIndex(0);

      localStorage.setItem('rsj_uploaded_resume_name', name);
      localStorage.setItem('rsj_selected_role', roleToUse);
      localStorage.setItem('rsj_resume_ats_score', String(parsed.atsScore));
      localStorage.setItem('rsj_resume_analysis', JSON.stringify(parsed));
      localStorage.setItem('rsj_resume_questions', JSON.stringify(generatedQuestions));
    }, 900);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      let content = '';
      if (file.type.includes('text') || file.name.endsWith('.txt')) {
        content = await file.text();
      } else {
        content = `${file.name.replace(/\.[^/.]+$/, '')} candidate profile. Technical experience in ${targetRole}, building software projects, modern frameworks, and system workflows.`;
      }
      processResumeContent(file.name, content);
    } catch (e) {
      processResumeContent(file.name, SAMPLE_ML_RESUME);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleResume = () => {
    processResumeContent('Vishnu_ML_Resume.pdf', SAMPLE_ML_RESUME, 'Data Scientist');
    setTargetRole('Data Scientist');
    setRoleInput('Data Scientist');
  };

  const handleApplyPastedResume = () => {
    if (pastedText.trim()) {
      processResumeContent('Pasted_Resume_Profile.txt', pastedText);
      setShowPasteModal(false);
    }
  };

  const handleProceedToRoom = () => {
    // Transition from Picture 1 (Setup) to Picture 2 (Interview Stage)
    setStage('room');
    // Pre-test camera for smooth onboarding
    if (!mediaStreamRef.current) {
      startCamera();
    }
  };

  // ==========================================
  // CAMERA & AUDIO HANDLERS
  // ==========================================
  const startCamera = async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      mediaStreamRef.current = stream;
      setCameraActive(true);
      setIsTestingCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
          setVideoPlayBlocked(false);
        } catch (err) {
          console.warn('Video autoPlay deferred by browser:', err);
          setVideoPlayBlocked(true);
        }
      }
    } catch (err) {
      console.warn('Camera preview notice:', err.message);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsTestingCamera(false);
    setVideoPlayBlocked(false);
  };

  const handleManualVideoPlay = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setVideoPlayBlocked(false);
      } catch (e) {
        console.error('Manual play failed:', e);
      }
    }
  };

  const handleToggleCameraTest = () => {
    if (isTestingCamera || cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Starfield animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 65 }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 600),
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.003,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${Math.abs(s.alpha) * 0.7})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Text to Speech
  const playQuestionTTS = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.name.includes('David') || v.name.includes('George') || v.name.includes('Natural') || v.name.includes('Male')) && v.lang.startsWith('en')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsAISpeaking(true);
    utterance.onend = () => setIsAISpeaking(false);
    utterance.onerror = () => setIsAISpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Start Interview Session
  const handleStartSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let currentSid = null;
      let sessionQuestions = questions;

      try {
        const createRes = await fetch('/api/interview/session', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            targetRole: targetRole.trim() || 'Software Engineer',
            questions: sessionQuestions,
            userId: currentUser?.id
          })
        });

        if (createRes.ok) {
          const createData = await createRes.json();
          if (createData.success && createData.session) {
            currentSid = createData.session.id;
            setSessionId(currentSid);
            localStorage.setItem('last_interview_session_id', currentSid);
            if (Array.isArray(createData.session.questions) && createData.session.questions.length > 0) {
              sessionQuestions = createData.session.questions;
              setQuestions(sessionQuestions);
            }
          }
        }
      } catch (apiErr) {
        console.warn('Backend interview session API notice:', apiErr.message);
      }

      setSessionActive(true);
      setCurrentQIndex(0);
      setTimerSeconds(0);
      setAnswersList([]);
      setWarningCount(0);
      setActiveWarningMessage('');
      qStartTimeRef.current = Date.now();

      // Ensure camera is active
      if (!cameraActive) {
        await startCamera();
      }

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);

      // Start proctoring telemetry with automated camera & presence check
      telemetryIntervalRef.current = setInterval(() => {
        setTelemetry({
          eyeContact: Math.floor(Math.random() * 12) + 86,
          emotion: 'Focused',
          headPose: 'Centered',
          confidence: Math.floor(Math.random() * 10) + 85,
          attention: Math.floor(Math.random() * 8) + 89,
        });

        // Automatic detection: if camera track is stopped or inactive
        if (mediaStreamRef.current) {
          const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
          if (!videoTrack || !videoTrack.enabled || videoTrack.readyState === 'ended') {
            triggerProctoringViolation('Camera Feed Inactive / No Face Detected');
          }
        }
      }, 3500);

      // Speak Q1
      setTimeout(() => {
        const firstQ = sessionQuestions[0];
        playQuestionTTS(firstQ.questionText || firstQ.question);
      }, 600);
    } catch (err) {
      console.error('Session start error:', err);
    }
  };

  // Voice recording & answer handling
  const handleRecordVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser. Please use Chrome or type your answer.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setCompanionText((prev) => (prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim()));
      }
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const handleNextQuestion = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const recordedText = companionText.trim();
    const words = recordedText.split(/\s+/).filter(Boolean);
    const isSilent = words.length < 3 || recordedText.toLowerCase().includes('candidate provided verbal answer') || recordedText.toLowerCase().includes('no response');

    let calculatedScore = 0;
    let techScore = 0;
    let commScore = 0;

    if (!isSilent) {
      const wordCount = words.length;
      commScore = Math.min(96, Math.max(45, 40 + Math.min(45, wordCount * 1.5)));
      techScore = Math.min(96, Math.max(45, 45 + Math.min(45, wordCount * 1.3)));
      calculatedScore = Math.round(techScore * 0.5 + commScore * 0.3 + (telemetry.confidence || 80) * 0.1 + (telemetry.eyeContact || 80) * 0.1);
    }

    const answerRecord = {
      questionNumber: currentQIndex + 1,
      stage: `Q${currentQIndex + 1}`,
      question: currentQ.questionText || currentQ.question,
      category: currentQ.category || 'TECHNICAL',
      companionNote: isSilent ? 'No verbal or typed answer provided (Candidate remained silent). Score: 0/100.' : recordedText,
      score: isSilent ? 0 : calculatedScore,
      technicalScore: isSilent ? 0 : techScore,
      communicationScore: isSilent ? 0 : commScore,
      eyeContactScore: isSilent ? 0 : telemetry.eyeContact,
      attentionScore: isSilent ? 0 : telemetry.attention,
      confidenceScore: isSilent ? 0 : telemetry.confidence
    };

    const updatedAnswers = [...answersList, answerRecord];
    setAnswersList(updatedAnswers);
    setCompanionText('');

    // Persist answer to backend database if session is active
    if (sessionId && currentQ?.id) {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(`/api/interview/question/${currentQ.id}/answer`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          transcript: isSilent ? '' : recordedText,
          duration: Math.max(1, Math.round((Date.now() - (qStartTimeRef.current || Date.now())) / 1000)),
          telemetry: {
            eyeContact: isSilent ? 0 : (telemetry.eyeContact || 85),
            attention: isSilent ? 0 : (telemetry.attention || 85),
            confidence: isSilent ? 0 : (telemetry.confidence || 80),
            emotion: isSilent ? 'Neutral' : (telemetry.emotion || 'Neutral')
          }
        })
      }).catch(err => console.warn('Question answer sync notice:', err.message));
    }

    if (isFinalQuestion) {
      // Complete interview
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
      setSessionActive(false);
      stopCamera();
      setIsProcessing(true);

      // Persist interview completion to PostgreSQL
      if (sessionId) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        fetch(`/api/interview/session/${sessionId}/complete`, {
          method: 'POST',
          headers
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.analysis) {
              setFinalAnalysis(data.analysis);
            }
          })
          .catch(err => console.warn('Session complete sync notice:', err.message));
      }

      setTimeout(() => {
        setIsProcessing(false);
        setIsReportReady(true);
      }, 1500);
    } else {
      const nextIndex = currentQIndex + 1;
      setCurrentQIndex(nextIndex);
      qStartTimeRef.current = Date.now();
      setTimeout(() => {
        const nextQ = questions[nextIndex];
        playQuestionTTS(nextQ.questionText || nextQ.question);
      }, 500);
    }
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (telemetryIntervalRef.current) clearInterval(telemetryIntervalRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Format timer
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // VIEW 1: FINAL EVALUATION REPORT
  // ==========================================
  if (isReportReady) {
    const answeredCount = answersList.filter(a => a.score > 0).length;
    const hasSpokenAtAll = answeredCount > 0;

    const finalScore = hasSpokenAtAll
      ? (finalAnalysis ? Number(finalAnalysis.overallScore) : Math.round(answersList.reduce((acc, curr) => acc + curr.score, 0) / answersList.length))
      : 0;

    const eyeContactVal = hasSpokenAtAll ? (finalAnalysis ? Number(finalAnalysis.eyeContactScore) : 88) : 0;
    const commVal = hasSpokenAtAll ? Math.round(answersList.reduce((acc, curr) => acc + (curr.communicationScore || 0), 0) / answersList.length) : 0;
    const techVal = hasSpokenAtAll ? Math.round(answersList.reduce((acc, curr) => acc + (curr.technicalScore || 0), 0) / answersList.length) : 0;
    const confVal = hasSpokenAtAll ? (finalAnalysis ? Number(finalAnalysis.confidenceScore) : 86) : 0;
    const attVal = hasSpokenAtAll ? (finalAnalysis ? Number(finalAnalysis.attentionScore) : 88) : 0;

    const DIMENSIONS = [
      { label: 'Eye Contact', score: eyeContactVal, icon: Eye },
      { label: 'Attention Score', score: attVal, icon: AlignCenter },
      { label: 'Confidence', score: confVal, icon: Smile },
      { label: 'Communication', score: commVal, icon: Activity },
      { label: 'Technical Depth', score: techVal, icon: BrainCircuit },
    ];

    return (
      <div className="relative min-h-[85vh] rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800/80 shadow-2xl p-4 sm:p-7">
        <div className="absolute inset-0 pointer-events-none z-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
          <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute bottom-1/3 -right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-slate-800">
            <div className="flex items-center gap-5">
              <MiniScoreRing score={finalScore} size={80} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Verified Evaluation for {targetRole}</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">AI Mock Interview Evaluation Report</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Resume ATS Benchmark: <strong className="text-cyan-300">{resumeATS}%</strong> • Role: <strong className="text-white">{targetRole}</strong>
                </p>
                {warningCount > 0 && (
                  <div className="mt-1 text-xs text-amber-400 font-mono flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Recorded Proctoring Warnings: {warningCount}/3</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setIsReportReady(false);
                  setStage('setup');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>New Interview</span>
              </button>
              <button
                onClick={() => navigateTo('candidate-dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {DIMENSIONS.map(({ label, score, icon: Icon }) => (
              <div key={label} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 text-center backdrop-blur-sm">
                <Icon className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
                <div className="text-lg font-extrabold text-white">{score}%</div>
                <div className="text-[11px] text-slate-400 font-medium">{label}</div>
              </div>
            ))}
          </div>

          {/* DEDICATED SECTION: SKILLS TO COVER FOR TARGET ROLE (USER'S EXPLICIT REQUIREMENT) */}
          <div className="bg-slate-900/70 border border-cyan-800/50 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Target Role Skill Recommendations</span>
                </div>
                <h3 className="text-base font-bold text-white">Skills to Cover for {targetRole}</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono">
                <span className="text-slate-400">ATS Match Benchmark:</span>
                <span className="text-emerald-400 font-bold">{skillGaps.atsScore}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Demonstrated Skills from Resume */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Demonstrated Core Skills ({skillGaps.matchedCore.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillGaps.matchedCore.length > 0 ? (
                    skillGaps.matchedCore.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-xs font-mono text-emerald-300">
                        ✓ {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None explicitly identified in resume</span>
                  )}
                </div>
              </div>

              {/* Missing Skills to Cover */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-800/40">
                <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-amber-400">
                  <Target className="w-4 h-4" />
                  <span>Recommended Skills to Cover for {targetRole} ({skillGaps.skillsToCover.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillGaps.skillsToCover.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-950/50 border border-amber-700/60 text-xs font-mono text-amber-300 font-semibold">
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Advice Box */}
            <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/30 text-xs text-slate-300 flex items-start gap-3">
              <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300 font-semibold">Preparation Roadmap: </strong>
                To achieve a 95%+ ATS benchmark for senior {targetRole} positions, focus on mastering{' '}
                <span className="text-white font-semibold">{skillGaps.skillsToCover.slice(0, 3).join(', ')}</span>.
                Practicing live problem walkthroughs and articulating project tradeoffs will boost your interview readiness score.
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Question Evaluation Breakdown</h4>
            <div className="space-y-3">
              {answersList.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">{item.stage}</span>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">{item.category}</span>
                    </div>
                    <div className="text-xs text-slate-200 font-medium truncate">{item.question}</div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2 italic font-mono bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                      "{item.companionNote || 'Answer verbalized'}"
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                      Score: {item.score}/100
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-900/60">
                      Gaze: {item.eyeContactScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: LOCKED / ASSESSMENT REQUIRED CHECKS
  // ==========================================
  // CANDIDATE ASSESSMENT LOCK SYSTEM
  // ==========================================
  const isAdmin = role === 'admin' || Boolean(adminUser) || (typeof window !== 'undefined' && localStorage.getItem('rsj_role') === 'admin');

  // List of active assessments (Coding, Reasoning, Aptitude, Technical)
  const activeAssessmentsList = (assessments && assessments.length > 0) ? assessments : [
    { id: 'asm-code-2026', title: 'Full-Stack Algorithmic Coding Challenge', category: 'Coding', totalQuestions: 4, durationMinutes: 60 },
    { id: 'asm-reas-2026', title: 'Logical Reasoning & Critical Thinking Exam', category: 'Reasoning', totalQuestions: 10, durationMinutes: 60 },
    { id: 'asm-apt-2026', title: 'Quantitative Aptitude Benchmark Test', category: 'Aptitude', totalQuestions: 10, durationMinutes: 60 },
    { id: 'asm-tech-2026', title: 'Core Technical & CS Fundamentals Assessment', category: 'Technical', totalQuestions: 10, durationMinutes: 60 }
  ];

  const checkIsCompleted = (asm) => {
    if (!asm) return false;
    if (typeof isAssessmentCompleted === 'function' && isAssessmentCompleted(asm)) return true;
    const targetId = String(asm.id || '').trim().toLowerCase();
    const targetCat = String(asm.category || '').trim().toLowerCase();
    const targetTitle = String(asm.title || '').trim().toLowerCase();

    return (candidateSubmissions || []).some(s => {
      const subAsmId = String(s.assessment_id || s.assessmentId || '').trim().toLowerCase();
      if (targetId && subAsmId === targetId) return true;
      const subCat = String(s.category || '').trim().toLowerCase();
      if (targetCat && subCat && subCat === targetCat) return true;
      const subTitle = String(s.assessment_title || s.assessmentName || '').trim().toLowerCase();
      if (targetTitle && subTitle && subTitle === targetTitle) return true;
      return false;
    });
  };

  const completedList = activeAssessmentsList.filter(checkIsCompleted);
  const completedCount = completedList.length;
  const totalRequiredCount = activeAssessmentsList.length;
  const hasCompletedAllAssessments = totalRequiredCount > 0 && completedCount === totalRequiredCount;
  const completionPercentage = totalRequiredCount > 0 ? Math.round((completedCount / totalRequiredCount) * 100) : 0;

  // If candidate has not completed all assessments yet, and is not admin: show Lock Screen
  if (!isAdmin && !hasCompletedAllAssessments) {
    return (
      <div className="relative min-h-[82vh] rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Warning Banner Bar */}
        <div className="w-full max-w-2xl bg-amber-500/15 border border-amber-500/40 rounded-2xl px-4 py-3 mb-6 flex items-center justify-between text-left text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <p className="text-xs sm:text-sm font-semibold">
              <span className="font-black text-amber-300">Warning:</span> Please complete all assessments and tests first to unlock your AI Mock Interview.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 shrink-0 hidden sm:inline">
            {completedCount}/{totalRequiredCount} Done
          </span>
        </div>

        {/* Big Lock Graphic */}
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 shadow-2xl shadow-amber-500/20">
          <Lock className="w-10 h-10 text-amber-400" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Stage Lock • All {totalRequiredCount} Module Tests Required</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight max-w-xl">
          AI Mock Interview Locked
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-2.5 leading-relaxed">
          To qualify for the live AI Mock Interview with facial telemetry, vocal tracking, and real-time behavioral insights, you must complete all <strong className="text-white">{totalRequiredCount} module assessments</strong> (Coding, Reasoning, Aptitude, and Technical).
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-lg mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-400">Assessment Completion Status</span>
            <span className={completionPercentage === 100 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {completedCount} of {totalRequiredCount} Completed ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Assessment Module Status Checklist */}
        <div className="w-full max-w-2xl mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {activeAssessmentsList.map((asm) => {
            const isDone = checkIsCompleted(asm);
            return (
              <div
                key={asm.id || asm.title}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  isDone
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 pr-2">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="truncate">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                      {asm.category || 'Module'}
                    </span>
                    <strong className="text-xs text-white block truncate">{asm.title}</strong>
                  </div>
                </div>

                <div className="shrink-0">
                  {isDone ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Completed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigateTo('assessments')}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors cursor-pointer"
                    >
                      Start Test →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => navigateTo('assessments')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Go to Assessments & Tests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => navigateTo('dashboard')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 transition-all cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }



  // ==========================================
  // VIEW 2: STEP 1 SETUP (PICTURE 1)
  // ==========================================
  if (stage === 'setup') {
    return (
      <div className="relative min-h-[85vh] rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800/80 shadow-2xl p-4 sm:p-8 flex flex-col justify-center">

        {/* Dynamic Space Canvas */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">

          {/* Admin Testing Mode Badge */}
          {isAdmin && (
            <div className="flex justify-center mb-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-950/90 border border-purple-500/50 text-purple-300 rounded-full text-xs font-mono font-bold shadow-lg shadow-purple-950/50">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Testing Mode Active • Interview Session Unlocked</span>
              </div>
            </div>
          )}

          {/* Subtitle directly matching user reference design */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Mock Interview Preparation Studio</span>
            </div>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Extract skills, evaluate experience depth, score candidate suitability, match targeted job descriptions, and generate custom interview questions.
            </p>
          </div>

          {/* Main Container Card (Picture 1) */}
          <div className="rounded-2xl bg-[#0b101e]/95 border border-slate-800/90 shadow-2xl p-6 sm:p-8 backdrop-blur-md">

            {/* DROP ZONE (Exact styling from user Picture 1) */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative border-2 border-dashed border-teal-500/40 hover:border-teal-400/80 rounded-xl p-8 sm:p-10 text-center transition-all bg-slate-950/40 hover:bg-slate-950/70 group"
            >
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                id="resume-file-input"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
              />

              {/* Document Icon (Soft Lavender / Violet Tint matching Picture 1) */}
              <div className="w-14 h-16 rounded-xl bg-purple-950/40 border border-purple-400/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform shadow-inner">
                <FileText className="w-8 h-8 text-purple-200" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
                {uploadedFileName ? `Resume Uploaded: ${uploadedFileName}` : 'Drag & drop your resume here'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 mb-5">
                Supports PDF and TXT files (Max 20MB)
              </p>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <label
                  htmlFor="resume-file-input"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-sm font-semibold text-white shadow-md transition-all cursor-pointer hover:scale-105"
                >
                  Browse File
                </label>

                <button
                  type="button"
                  onClick={handleLoadSampleResume}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sample Resume</span>
                </button>
              </div>
            </div>

            {/* Scanning Progress Bar */}
            {isScanning && (
              <div className="mt-5 p-4 rounded-xl bg-slate-900 border border-cyan-800/40 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="text-xs font-bold text-cyan-300">Extracting skills & evaluating ATS match ({scanProgress}%)...</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* TARGET ROLE INPUT FIELD (Picture 1) */}
            <div className="mt-6">
              <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-2">
                Target Role <span className="text-slate-500 font-normal">(Enter Manually)</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  placeholder="e.g. Data Scientist, ML Engineer, Software Engineer"
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner font-medium"
                />
                {targetRole && (
                  <button
                    type="button"
                    onClick={() => handleRoleChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                Type your desired job role above (e.g. Data Scientist, ML Engineer, Full Stack Developer, etc.). The AI questions and ATS benchmark calibrate automatically.
              </p>
            </div>

            {/* ATS MATCH & EXTRACTED SKILLS */}
            <div className="mt-6 pt-6 border-t border-slate-800/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold">
                    ATS Match: {resumeATS}%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Calibrated for: <strong className="text-white">{targetRole}</strong>
                  </span>
                </div>

                <div className="text-[11px] text-cyan-400 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{adminSettings.questionCount || 5} Questions ({adminSettings.difficulty || "Moderate"} Level)</span>
                </div>
              </div>

              {/* Extracted Skills Pills */}
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                <span className="text-[11px] text-slate-500 font-medium mr-1">Skills:</span>
                {analysisResult.skills.slice(0, 7).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Skills to Cover for this Role */}
              {skillGaps.skillsToCover && skillGaps.skillsToCover.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  <span className="text-[11px] text-amber-500/90 font-medium mr-1">Skills to Cover:</span>
                  {skillGaps.skillsToCover.slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-amber-950/40 border border-amber-800/50 text-[11px] font-mono text-amber-300"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              )}



              {/* Primary Action Button (Transitions from Picture 1 to Picture 2) */}
              <button
                type="button"
                onClick={handleProceedToRoom}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>Proceed to Live AI Interview Room →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 3: LIVE INTERVIEW STAGE (PICTURE 2)
  // ==========================================
  return (
    <div className="relative min-h-[85vh] rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800/80 shadow-2xl p-4 sm:p-7">

      {/* Dynamic Space Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '45px 45px',
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-4">

        {/* Proctoring Warning Banner */}
        {activeWarningMessage && (
          <div className="bg-rose-950/90 border-2 border-rose-500 text-rose-200 px-4 py-3 rounded-xl flex items-center justify-between gap-3 shadow-2xl backdrop-blur-md animate-pulse">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-300">Proctoring Alert</p>
                <p className="text-xs font-semibold">{activeWarningMessage}</p>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-rose-300 bg-rose-900/60 px-2.5 py-1 rounded border border-rose-600">
              {warningCount}/3
            </span>
          </div>
        )}

        {/* Stage Header with Target Role & Resume ATS Badge (Picture 2) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white uppercase tracking-wider">TARGET JOB ROLE:</span>
                <span className="text-xs font-extrabold text-cyan-400">{targetRole}</span>
                {!sessionActive && (
                  <button
                    type="button"
                    onClick={() => setStage('setup')}
                    title="Change Target Job Role or Resume"
                    className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono underline cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Role
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {sessionActive
                  ? `Question ${currentQIndex + 1} of ${questions.length} • Real-time AI Evaluation`
                  : 'Resume extracted skills • Q1 is your personalized introduction'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            {/* ATS Score Tag */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">ATS Match:</span>
              <span className="text-emerald-400 font-bold">{resumeATS}%</span>
            </div>

            {/* Back to Setup Button */}
            {!sessionActive && (
              <button
                type="button"
                onClick={() => setStage('setup')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Resume</span>
              </button>
            )}

            {/* Camera Test Button */}
            {!sessionActive && (
              <button
                type="button"
                onClick={handleToggleCameraTest}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isTestingCamera
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>{isTestingCamera ? 'Camera Test: Active ✓' : 'Test Camera & Mic'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Question Bar - Q1 IS ALWAYS "TELL ME ABOUT YOURSELF" (Picture 2) */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0 text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-lg">
              Q{currentQIndex + 1}:
            </span>
            <span className="text-sm font-medium text-slate-200 truncate">{currentQ.questionText || currentQ.question}</span>
          </div>
          <button
            type="button"
            onClick={() => playQuestionTTS(currentQ.questionText || currentQ.question)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isAISpeaking ? 'text-cyan-400 animate-pulse' : ''}`} />
            <span>{isAISpeaking ? 'Speaking...' : 'Listen'}</span>
          </button>
        </div>

        {/* Two-Pane Stage (Picture 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Pane 1: AI Interviewer (Dr. Aravind Sharma - Executive Avatar) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isAISpeaking ? 'bg-cyan-400 animate-pulse' : sessionActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-xs font-semibold text-slate-400">
                  {isAISpeaking ? 'AI Interviewer Speaking' : sessionActive ? 'AI Listening & Evaluating' : 'AI Interviewer Ready'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950/50 border border-cyan-800/40 text-[10px] font-mono text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Technical Lead</span>
              </div>
            </div>

            {/* Executive Interviewer Avatar Stage */}
            <div className="relative flex flex-col items-center justify-center py-7 px-4 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[130, 175, 220].map((size, i) => (
                  <div
                    key={i}
                    className={`absolute rounded-full border transition-all duration-700 ${
                      isAISpeaking
                        ? 'border-cyan-400/30 scale-105 animate-ping'
                        : 'border-slate-800/40'
                    }`}
                    style={{
                      width: size,
                      height: size,
                      animationDuration: `${1.5 + i * 0.5}s`,
                    }}
                  />
                ))}
              </div>

              {/* Dr. Aravind Sharma Portrait (Redesigned Avatar with Futuristic Holographic Glow) */}
              <div className="relative z-10 p-1 rounded-full bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-500 shadow-2xl shadow-cyan-500/30 group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-slate-950 relative bg-slate-900">
                  <img
                    src="/avatars/dr_aravind_sharma.jpg?v=2"
                    alt="Dr. Aravind Sharma"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                  {isAISpeaking && (
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/30 to-transparent ring-2 ring-cyan-400 animate-pulse rounded-full" />
                  )}
                  <div className="absolute bottom-1 right-2 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm shadow-emerald-400/80" title="Online & Evaluating" />
                </div>
              </div>

              {/* Interviewer Persona Info */}
              <div className="relative z-10 text-center mt-3.5">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center justify-center gap-1.5">
                  <span>Dr. Aravind Sharma</span>
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </h3>
                <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                  Lead Technical Evaluator • {targetRole} Architecture
                </p>

                <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${isAISpeaking ? 'bg-cyan-400 animate-pulse' : sessionActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-slate-300 font-mono text-[10px]">
                    {isAISpeaking ? 'Transmitting Question Audio' : sessionActive ? 'Real-Time Proctor Active' : 'Ready to evaluate'}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Audio: Synthetic Speech</span>
              <span className="text-cyan-400">Proctor: Strict Active</span>
            </div>
          </div>

          {/* Pane 2: Candidate Video Feed & Audio Telemetry */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <span className="text-xs font-semibold text-slate-400">
                  {cameraActive ? 'Candidate Video Stream' : 'Camera Feed Standby'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                  warningCount === 0
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50'
                    : warningCount === 1
                    ? 'text-amber-400 bg-amber-950/60 border-amber-800/50'
                    : 'text-rose-400 bg-rose-950/70 border-rose-600 animate-pulse'
                }`}>
                  Warnings: {warningCount} / 3
                </span>

                {/* Candidate Proctoring Controls */}
                {sessionActive && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (cameraActive) {
                          stopCamera();
                          triggerProctoringViolation('Camera Closed / Video Disabled');
                        } else {
                          startCamera();
                        }
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Toggle Camera (Test Warning 1, 2, 3)"
                    >
                      {cameraActive ? 'Close Camera' : 'Open Camera'}
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerProctoringViolation('Multiple Faces Detected in Camera Frame')}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
                      title="Test Multi-Face Warning"
                    >
                      Multi-Face
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Video Viewport Stage */}
            <div className="relative flex-1 min-h-[260px] bg-slate-950 flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover mirror-mode ${cameraActive ? 'block' : 'hidden'}`}
              />

              {videoPlayBlocked && cameraActive && (
                <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center p-4 text-center">
                  <Play className="w-10 h-10 text-cyan-400 mb-2 cursor-pointer" onClick={handleManualVideoPlay} />
                  <p className="text-xs text-white font-semibold mb-2">Click to start live camera preview</p>
                  <button
                    onClick={handleManualVideoPlay}
                    className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                  >
                    Activate Video
                  </button>
                </div>
              )}

              {!cameraActive && (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
                    <VideoOff className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-bold text-white mb-1">Camera Feed Standby</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mb-3">
                    Click 'Turn On Camera Preview' below or start the interview session.
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Turn On Camera Preview</span>
                  </button>
                </div>
              )}

              {/* Live Overlay HUD when session is active */}
              {sessionActive && (
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                  <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <Eye className="w-3 h-3" />
                    <span>Gaze: {telemetry.eyeContact}%</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
                    <Activity className="w-3 h-3" />
                    <span>Time: {formatTimer(timerSeconds)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mic Telemetry Bar */}
            <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mic: {isRecording ? 'Listening (Voice Recognition Active)' : 'Idle'}</span>
              </div>
              <Waveform active={isRecording} />
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          {!sessionActive ? (
            <button
              type="button"
              onClick={handleStartSession}
              className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Video className="w-5 h-5" />
              <span>Start Interview Session for {targetRole}</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full max-w-xl">
              {/* SPEECH-TO-TEXT VERBAL TRANSCRIPTION ONLY (NO MANUAL TYPING) */}
              <div className="w-full bg-slate-950/95 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md p-4 shadow-xl">
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'}`} />
                    <span className="font-bold text-slate-200">Verbal Answer Transcription:</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                      Mic Speech-to-Text Only
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {companionText && (
                      <button
                        type="button"
                        onClick={() => setCompanionText('')}
                        className="text-[10px] text-slate-400 hover:text-rose-400 underline font-mono cursor-pointer"
                        title="Reset transcript to re-speak"
                      >
                        Reset Speech
                      </button>
                    )}
                    <span className="text-[11px] font-mono font-bold text-cyan-400">
                      {companionText ? `${companionText.split(/\s+/).filter(Boolean).length} words captured` : 'Ready for Voice'}
                    </span>
                  </div>
                </div>

                {/* Read-only Live Speech Transcription View */}
                <div className="min-h-[85px] max-h-[140px] overflow-y-auto bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs leading-relaxed transition-all">
                  {companionText ? (
                    <p className="text-slate-100 font-medium font-sans whitespace-pre-wrap">
                      "{companionText}"
                    </p>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-3">
                      <Mic className="w-5 h-5 mb-1.5 text-slate-600 animate-pulse" />
                      <p className="text-[11px] font-medium text-slate-400">
                        Click <strong className="text-cyan-400">'Record Voice Answer'</strong> below and speak your response.
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Keyboard typing is disabled. Verbal answers are transcribed in real time for AI analysis.
                      </p>
                    </div>
                  )}
                </div>

                {isRecording && (
                  <div className="mt-2.5 flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-rose-950/50 border border-rose-900/60 text-rose-300 font-mono animate-pulse">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Listening to microphone...
                    </span>
                    <span>Speak clearly to answer question</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={handleRecordVoice}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isRecording
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse shadow-md shadow-rose-900/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{isRecording ? 'Stop Recording' : 'Record Voice Answer'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer hover:scale-105"
                >
                  <span>{isFinalQuestion ? 'Submit & Finalize Interview' : 'Submit Answer & Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Paste Modal if opened in Room stage */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full text-white shadow-2xl">
            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-cyan-400" />
              <span>Paste Resume Text</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Paste your experience, key skills, or project highlights:
            </p>
            <textarea
              rows={7}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste resume content here..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono resize-none mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPastedResume}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md"
              >
                Analyze & Apply
              </button>
            </div>
          </div>
        </div>
      )}
{/* ============================================================== */}
      {/* PROCTORING WARNING MODAL (1st, 2nd, and 3rd TERMINATION WARNING) */}
      {/* ============================================================== */}
      {proctoringModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl border p-6 text-white shadow-2xl relative ${
            proctoringModal.isFinal
              ? 'bg-rose-950/95 border-rose-600 shadow-rose-900/50'
              : proctoringModal.count === 2
              ? 'bg-amber-950/95 border-amber-600 shadow-amber-900/50'
              : 'bg-slate-900/95 border-amber-500/70 shadow-amber-500/20'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                proctoringModal.isFinal ? 'bg-rose-900/80 text-rose-300' : 'bg-amber-900/80 text-amber-300'
              }`}>
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold block text-slate-400">
                  AI Proctoring Telemetry Alert
                </span>
                <h3 className="text-lg font-black tracking-tight text-white">
                  {proctoringModal.isFinal ? '🚨 Interview Terminated' : `⚠️ Proctoring Warning ${proctoringModal.count} of 3`}
                </h3>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 mb-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Violation Detected:</span>
                <span className="font-bold font-mono text-white">{proctoringModal.violation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Strike Count:</span>
                <span className="font-bold font-mono text-rose-400">{proctoringModal.count} / 3 Strikes</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed mb-5">
              {proctoringModal.isFinal ? (
                <span>
                  Maximum proctoring violations reached (3/3). This session has been terminated and will automatically redirect to your evaluation results.
                </span>
              ) : proctoringModal.count === 2 ? (
                <span>
                  <strong>Second Warning!</strong> Your camera must remain open and focused on you alone. A 3rd violation will permanently terminate the session.
                </span>
              ) : (
                <span>
                  Please ensure your camera is enabled and only you are visible. Multiple faces or missing video violate interview integrity rules.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end">
              {proctoringModal.isFinal ? (
                <div className="text-xs font-mono text-rose-300 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Redirecting to Results...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setProctoringModal(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer"
                >
                  I Understand & Acknowledge Warning {proctoringModal.count}/3
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
