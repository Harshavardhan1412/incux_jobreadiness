import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BrainCircuit,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  GraduationCap,
  Globe,
  MapPin,
  Compass,
  Briefcase,
  Loader2,
  BarChart3,
  Trophy
} from 'lucide-react';

import accentureLogo from '../../assets/accenture.png';
import capgeminiLogo from '../../assets/capgemini.png';
import cognizantLogo from '../../assets/Cognizant.png';
import deloitteLogo from '../../assets/Deloitte.png';
import hclLogo from '../../assets/hcl.png';
import ibmLogo from '../../assets/ibm.png';
import infosysLogo from '../../assets/infosys.png';
import ltiLogo from '../../assets/ltiMindtree.png';
import tcsLogo from '../../assets/tcs.png';
import techMahindraLogo from '../../assets/tech mahindra.png';
import wiproLogo from '../../assets/wipro.png';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_MOBILE_REGEX = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;

const INDIAN_STATES = [
  'Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra', 'Tamil Nadu',
  'Delhi NCR', 'Uttar Pradesh', 'Gujarat', 'West Bengal', 'Kerala',
  'Punjab', 'Rajasthan', 'Madhya Pradesh', 'Haryana', 'Odisha', 'Other State'
];

const POPULAR_BRANCHES = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication (ECE)',
  'Electrical & Electronics (EEE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Artificial Intelligence & Data Science (AI & DS)',
  'Computer Science & Business Systems (CSBS)',
  'Others'
];

const SPECIALIZATIONS = [
  'Artificial Intelligence & Machine Learning (AI/ML)',
  'Data Science & Analytics',
  'Full-Stack Web Development',
  'Cyber Security & Cryptography',
  'Cloud Computing & DevOps',
  'Mobile App Development (Android/iOS)',
  'Internet of Things (IoT) & Embedded Systems',
  'Core Computer Science & Algorithms',
  'Others'
];

// Company Logo Constellation Data for Left Panel Arc
const COMPANY_ARC_LOGOS = [
  { 
    name: 'Accenture', 
    role: 'ASE · Advanced ASE',
    logo: accentureLogo, 
    color: '#A100FF', 
    marginOffset: 'ml-0 sm:ml-1',
    cardBg: 'bg-[#0F172A]',
    borderColor: 'border-[#A100FF]/60',
    shadowGlow: 'shadow-[0_12px_24px_rgba(161,0,255,0.35)]',
    imgStyle: 'filter brightness-125 contrast-125 scale-105',
    floatClass: 'animate-float-1'
  },
  { 
    name: 'Capgemini', 
    role: 'Analyst · Software Eng.',
    logo: capgeminiLogo, 
    color: '#0070AD', 
    marginOffset: 'ml-3 sm:ml-7',
    cardBg: 'bg-white',
    borderColor: 'border-white/60',
    shadowGlow: 'shadow-[0_12px_24px_rgba(0,112,173,0.3)]',
    imgStyle: 'filter contrast-110',
    floatClass: 'animate-float-2'
  },
  { 
    name: 'Cognizant', 
    role: 'GenC · GenC Pro · Next',
    logo: cognizantLogo, 
    color: '#00A3E0', 
    marginOffset: 'ml-7 sm:ml-14',
    cardBg: 'bg-white',
    borderColor: 'border-white/60',
    shadowGlow: 'shadow-[0_12px_24px_rgba(0,163,224,0.3)]',
    imgStyle: 'filter contrast-110',
    floatClass: 'animate-float-3'
  },
  { 
    name: 'TCS', 
    role: 'Ninja · Digital · Prime',
    logo: tcsLogo, 
    color: '#E21936', 
    marginOffset: 'ml-9 sm:ml-18',
    cardBg: 'bg-white',
    borderColor: 'border-rose-500/60',
    shadowGlow: 'shadow-[0_12px_24px_rgba(226,25,54,0.35)]',
    imgStyle: 'filter brightness-105 contrast-125 scale-105',
    floatClass: 'animate-float-4'
  },
  { 
    name: 'Infosys', 
    role: 'SE · DSE · Specialist',
    logo: infosysLogo, 
    color: '#007CC3', 
    marginOffset: 'ml-7 sm:ml-14',
    cardBg: 'bg-white',
    borderColor: 'border-white/60',
    shadowGlow: 'shadow-[0_12px_24px_rgba(0,124,195,0.3)]',
    imgStyle: 'filter contrast-110',
    floatClass: 'animate-float-2'
  },
  { 
    name: 'Wipro', 
    role: 'Project Eng. · Turbo',
    logo: wiproLogo, 
    color: '#883399', 
    marginOffset: 'ml-3 sm:ml-7',
    cardBg: 'bg-white',
    borderColor: 'border-white/60',
    shadowGlow: 'shadow-[0_12px_24px_rgba(136,51,153,0.3)]',
    imgStyle: 'filter contrast-110',
    floatClass: 'animate-float-5'
  },
  { 
    name: 'Deloitte', 
    role: 'Analyst · Advisory',
    logo: deloitteLogo, 
    color: '#86BC25', 
    marginOffset: 'ml-0 sm:ml-1',
    cardBg: 'bg-white',
    borderColor: 'border-white/60',
    shadowGlow: 'shadow-[0_12px_24px_rgba(134,188,37,0.3)]',
    imgStyle: 'filter contrast-110',
    floatClass: 'animate-float-1'
  },
];

export const SignupPage = () => {
  const { registerCandidate, navigateTo, addToast } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNo: '',
    collegeName: '',
    branch: '',
    specialization: '',
    country: '',
    state: '',
    city: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time validations
  const validateField = (field, value) => {
    let errorMsg = '';
    if (field === 'name') {
      if (!value.trim()) errorMsg = 'Full name is required';
      else if (value.trim().length < 2) errorMsg = 'Name must be at least 2 characters';
    }
    if (field === 'email') {
      if (!value.trim()) errorMsg = 'Email address is required';
      else if (!EMAIL_REGEX.test(value.trim())) errorMsg = 'Enter a valid email address (e.g. john@university.edu)';
    }
    if (field === 'phoneNo') {
      const clean = value.replace(/[\s\-]/g, '');
      if (!value.trim()) errorMsg = 'Indian mobile number is required';
      else if (!INDIAN_MOBILE_REGEX.test(clean)) errorMsg = 'Enter a valid 10-digit Indian mobile (starts with 6,7,8,9)';
    }
    if (field === 'collegeName') {
      if (!value.trim()) errorMsg = 'College name is required';
    }
    if (field === 'branch') {
      if (!value.trim()) errorMsg = 'Branch is required';
    }
    if (field === 'specialization') {
      if (!value.trim()) errorMsg = 'Specialization is required';
    }
    if (field === 'state') {
      if (!value.trim()) errorMsg = 'State is required';
    }
    if (field === 'city') {
      if (!value.trim()) errorMsg = 'City is required';
    }
    if (field === 'password') {
      if (!value) errorMsg = 'Password is required';
      else if (value.length < 6) errorMsg = 'Password must be at least 6 characters';
    }
    if (field === 'confirmPassword') {
      if (value !== formData.password) errorMsg = 'Passwords do not match';
    }

    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    validateField(name, val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all mandatory fields
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim() || !EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Valid email is required';
    }
    const cleanMobile = formData.phoneNo.replace(/[\s\-]/g, '');
    if (!formData.phoneNo.trim() || !INDIAN_MOBILE_REGEX.test(cleanMobile)) {
      newErrors.phoneNo = 'Valid 10-digit  Mobile number required';
    }
    if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms of Service';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (addToast) addToast('Please fix the highlighted errors before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await registerCandidate({
        name: formData.name.trim(),
        fullName: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: cleanMobile,
        phoneNo: cleanMobile,
        college: formData.collegeName.trim(),
        collegeName: formData.collegeName.trim(),
        branch: formData.branch,
        specialization: formData.specialization,
        country: formData.country,
        state: formData.state,
        city: formData.city.trim(),
        password: formData.password
      });

      if (!success && addToast) {
        // error notification handled inside registerCandidate
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password Strength Calculator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 66, label: 'Moderate', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const pwdStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex font-sans antialiased text-[#111827]">

      {/* Embedded Keyframe Animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(7px); }
        }
        @keyframes pulseParticle {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        .animate-float-1 { animation: float1 5.5s ease-in-out infinite; }
        .animate-float-2 { animation: float2 6.5s ease-in-out infinite; }
        .animate-float-3 { animation: float1 4.8s ease-in-out infinite 1s; }
        .animate-float-4 { animation: float2 5.8s ease-in-out infinite 1.5s; }
        .animate-float-5 { animation: float1 6.2s ease-in-out infinite 2s; }
        .animate-particle { animation: pulseParticle 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-float-1, .animate-float-2, .animate-float-3, .animate-float-4, .animate-float-5, .animate-particle {
            animation: none !important;
          }
        }
      `}</style>

      {/* Left Panel — Career Opportunities Visual Section (50–54% Desktop Width) */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[54%] bg-[#060D1A] text-white flex-col justify-between p-8 xl:p-12 relative overflow-hidden select-none border-r border-[#0D182E]">
        
        {/* Background Visuals — Atmospheric Ambient Glows & Arc Curve */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-[#3157D5]/25 via-[#6366F1]/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-[#818CF8]/20 via-[#A855F7]/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

          {/* Sweeping Arc Path Background */}
          <svg className="absolute right-8 top-12 bottom-12 w-80 h-full opacity-35" viewBox="0 0 200 700" fill="none">
            <path d="M 20 20 Q 190 350 20 680" stroke="url(#arcGlow)" strokeWidth="2.5" strokeDasharray="7 7" />
            <defs>
              <linearGradient id="arcGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3157D5" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#818CF8" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#C084FC" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Top Header — JobReady Branding & Live Pulse Indicator */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={() => navigateTo('hero')}
            className="inline-flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3157D5] to-[#6366F1] flex items-center justify-center text-white shadow-lg shadow-[#3157D5]/40 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">
                Job<span className="text-[#6C7CFF]">Ready</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase mt-1 block">
                Prepare · Practice · Get Hired
              </span>
            </div>
          </div>

          {/* Floating Metric Badge */}
          <div className="hidden xl:flex items-center gap-2 bg-[#0E1A30]/90 border border-slate-700/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-slate-200 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">98.4%</span>
            <span className="text-slate-400">Eligibility Accuracy</span>
          </div>
        </div>

        {/* Middle Section — Two Column Split Inside Left Panel */}
        <div className="relative z-10 grid grid-cols-12 gap-6 items-center my-auto py-4">
          
          {/* Left Column: Headline, Description, Benefits */}
          <div className="col-span-7 space-y-6">
            
            {/* Section Tag & Headline */}
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-indigo-300 uppercase mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>OFFICIAL HIRING MATRIX</span>
              </div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.10]">
                Your next <br />
                <span className="bg-gradient-to-r from-[#6C7CFF] via-[#818CF8] to-[#E087FF] bg-clip-text text-transparent">
                  career move
                </span> <br />
                starts here.
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                Master company cutoffs, benchmark your readiness against actual 10th/12th/Graduation criteria, and unlock top roles.
              </p>
            </div>

            {/* Benefits Feature Items */}
            <div className="space-y-3.5 pt-1">
              {/* Feature 1 */}
              <div className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#12203A] to-[#1E2E4A] border border-slate-700/80 flex items-center justify-center shrink-0 text-[#818CF8] shadow-md mt-0.5 group-hover:border-indigo-400/50 transition-colors">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">Real Company Eligibility Matrix</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">Matched directly against academic & test score cutoffs</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#12203A] to-[#1E2E4A] border border-slate-700/80 flex items-center justify-center shrink-0 text-[#818CF8] shadow-md mt-0.5 group-hover:border-indigo-400/50 transition-colors">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">Live Gap & Target Analytics</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">Know exactly how many marks you need to clear cutoffs</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#12203A] to-[#1E2E4A] border border-slate-700/80 flex items-center justify-center shrink-0 text-[#818CF8] shadow-md mt-0.5 group-hover:border-indigo-400/50 transition-colors">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">Industry Standard Assessments</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">Practice Aptitude, Reasoning, Technical & Coding</p>
                </div>
              </div>
            </div>

            {/* Bottom Floating Stats Pill */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-4 text-xs">
              <div>
                <span className="text-white font-extrabold block text-sm">10+</span>
                <span className="text-slate-400 text-[10px]">Hiring Partners</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-emerald-400 font-extrabold block text-sm">100%</span>
                <span className="text-slate-400 text-[10px]">Verified Cutoffs</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sweeping Arc of 3D Company Logo Cards */}
          <div className="col-span-5 flex flex-col items-start justify-center space-y-3 relative pl-1">
            {COMPANY_ARC_LOGOS.map((item) => (
              <div
                key={item.name}
                className={`flex items-center gap-3 ${item.marginOffset} ${item.floatClass} transition-all duration-300 hover:scale-110 hover:-translate-y-1 group cursor-pointer`}
              >
                {/* 3D High-Contrast Logo Card */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.cardBg} rounded-2xl p-2 shadow-xl ${item.shadowGlow} border ${item.borderColor} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-2 relative overflow-hidden`}>
                  <img
                    src={item.logo}
                    alt={item.name}
                    className={`w-full h-full object-contain ${item.imgStyle}`}
                  />
                  {/* Glass Gloss Refinement Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60 pointer-events-none" />
                </div>

                {/* 3D Glassmorphic Company Name & Role Pill */}
                <div className="bg-[#101D34]/95 border border-slate-700/80 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[11px] font-semibold text-slate-100 flex flex-col shadow-lg group-hover:border-indigo-400/80 transition-all group-hover:translate-x-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                    <span className="font-bold text-white text-xs">{item.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-normal pl-3.5 leading-tight">{item.role}</span>
                </div>
              </div>
            ))}

            {/* Many More Opportunities Handwriting Tag */}
            <div className="pt-2 pl-4 flex items-center gap-1.5 text-[#818CF8] text-[11px] font-semibold italic opacity-90">
              <span>More hiring patterns active</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#818CF8] animate-pulse" />
            </div>
          </div>

        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 pt-4 border-t border-[#0E1A2E] flex items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} JobReady Platform. All rights reserved.</span>
          <span className="text-slate-400 font-medium">Candidate Portal v2.4</span>
        </div>
      </div>

      {/* Right Panel — Signup Form Container */}
      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-[460px] mx-auto space-y-6">

          {/* Mobile-only Brand Logo Header */}
          <div className="lg:hidden flex items-center justify-between pb-1">
            <div
              onClick={() => navigateTo('hero')}
              className="inline-flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[#3157D5] flex items-center justify-center text-white">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-[#111827]">JobReady</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs">
            
            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#111827] tracking-tight">
                Create your account
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Start your journey towards becoming job ready.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Full name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-white border text-sm text-[#111827] placeholder-slate-400 rounded-xl outline-none transition-colors ${
                      errors.name
                        ? 'border-rose-500 ring-2 ring-rose-500/15'
                        : 'border-[#E5E7EB] focus:border-[#3157D5] focus:ring-2 focus:ring-[#3157D5]/15'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* 2. Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Email address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className={`w-full pl-9 pr-9 py-2.5 bg-white border text-sm text-[#111827] placeholder-slate-400 rounded-xl outline-none transition-colors ${
                      errors.email
                        ? 'border-rose-500 ring-2 ring-rose-500/15'
                        : formData.email && EMAIL_REGEX.test(formData.email)
                        ? 'border-emerald-500 ring-2 ring-emerald-500/15'
                        : 'border-[#E5E7EB] focus:border-[#3157D5] focus:ring-2 focus:ring-[#3157D5]/15'
                    }`}
                  />
                  {formData.email && EMAIL_REGEX.test(formData.email) && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {errors.email ? (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-[#6B7280]">Format: username@domain.com</p>
                )}
              </div>

              {/* 3. Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Phone number <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-semibold text-slate-500 select-none flex items-center gap-1">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    maxLength={13}
                    placeholder="10-digit mobile number"
                    className={`w-full pl-16 pr-9 py-2.5 bg-white border text-sm text-[#111827] placeholder-slate-400 rounded-xl outline-none transition-colors ${
                      errors.phoneNo
                        ? 'border-rose-500 ring-2 ring-rose-500/15'
                        : formData.phoneNo && INDIAN_MOBILE_REGEX.test(formData.phoneNo.replace(/[\s\-]/g, ''))
                        ? 'border-emerald-500 ring-2 ring-emerald-500/15'
                        : 'border-[#E5E7EB] focus:border-[#3157D5] focus:ring-2 focus:ring-[#3157D5]/15'
                    }`}
                  />
                  {formData.phoneNo && INDIAN_MOBILE_REGEX.test(formData.phoneNo.replace(/[\s\-]/g, '')) && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {errors.phoneNo && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phoneNo}
                  </p>
                )}
              </div>

              {/* 4. College Name */}
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  College name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="Enter your college or university"
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-white border text-sm text-[#111827] placeholder-slate-400 rounded-xl outline-none transition-colors ${
                      errors.collegeName
                        ? 'border-rose-500 ring-2 ring-rose-500/15'
                        : 'border-[#E5E7EB] focus:border-[#3157D5] focus:ring-2 focus:ring-[#3157D5]/15'
                    }`}
                  />
                </div>
                {errors.collegeName && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.collegeName}
                  </p>
                )}
              </div>

              {/* Branch & Specialization Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 5. Branch */}
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Branch / Stream <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-white border text-sm text-[#111827] rounded-xl outline-none transition-colors appearance-none cursor-pointer ${
                        errors.branch
                          ? 'border-rose-500 ring-2 ring-rose-500/15'
                          : 'border-[#E5E7EB] focus:border-[#3157D5] focus:ring-2 focus:ring-[#3157D5]/15'
                      }`}
                    >
                      <option value="">Select Branch</option>
                      {POPULAR_BRANCHES.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  {errors.branch && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.branch}
                    </p>
                  )}
                </div>

                {/* 6. Specialization */}
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Specialization <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-white border text-sm text-[#111827] rounded-xl outline-none transition-colors appearance-none cursor-pointer ${
                        errors.specialization
                          ? 'border-rose-500 ring-2 ring-rose-500/15'
                          : 'border-[#E5E7EB] focus:border-[#3157D5] focus:ring-2 focus:ring-[#3157D5]/15'
                      }`}
                    >
                      <option value="">Select Specialization</option>
                      {SPECIALIZATIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {errors.specialization && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.specialization}
                    </p>
                  )}
                </div>
              </div>

              {/* Country, State & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 7. Country */}
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5E7EB] text-sm text-[#111827] placeholder-slate-400 rounded-xl outline-none focus:border-[#3157D5] focus:ring-2 focus:ring-[#3157D5]/15 transition-colors"
                    />
                  </div>
                </div>

                {/* 8. State */}
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Compass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border text-sm text-[#111827] rounded-xl outline-none transition-colors appearance-none cursor-pointer ${
                        errors.state
                          ? 'border-rose-500 ring-2 ring-rose-500/15'
                          : 'border-[#E5E7EB] focus:border-[#3157D5] focus:ring-2 focus:ring-[#3157D5]/15'
                      }`}
                    >
                      <option value="">State</option>
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  {errors.state && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.state}
                    </p>
                  )}
                </div>

                {/* 9. City */}
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border text-sm text-[#111827] placeholder-slate-400 rounded-xl outline-none transition-colors ${
                        errors.city
                          ? 'border-rose-500 ring-2 ring-rose-500/15'
                          : 'border-[#E5E7EB] focus:border-[#3157D5] focus:ring-2 focus:ring-[#3157D5]/15'
                      }`}
                    />
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      className={`w-full pl-9 pr-9 py-2.5 bg-white border text-sm text-[#111827] placeholder-slate-400 rounded-xl outline-none transition-colors ${
                        errors.password
                          ? 'border-rose-500 ring-2 ring-rose-500/15'
                          : 'border-[#E5E7EB] focus:border-[#3157D5] focus:ring-2 focus:ring-[#3157D5]/15'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#6B7280]">Strength:</span>
                        <span className="font-semibold text-[#111827]">{pwdStrength.label}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                          style={{ width: `${pwdStrength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Confirm password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className={`w-full pl-9 pr-9 py-2.5 bg-white border text-sm text-[#111827] placeholder-slate-400 rounded-xl outline-none transition-colors ${
                        errors.confirmPassword
                          ? 'border-rose-500 ring-2 ring-rose-500/15'
                          : 'border-[#E5E7EB] focus:border-[#3157D5] focus:ring-2 focus:ring-[#3157D5]/15'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-[#E5E7EB] text-[#3157D5] focus:ring-[#3157D5] cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-xs text-[#6B7280] leading-relaxed cursor-pointer">
                  I agree to the <span className="text-[#3157D5] hover:underline font-medium">Terms of Service</span> and <span className="text-[#3157D5] hover:underline font-medium">Privacy Policy</span>. My data will be stored securely.
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.agreeTerms}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-[#3157D5] hover:bg-[#2545B8] text-white rounded-xl font-medium text-sm shadow-xs transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

            </form>

            {/* Login Link Footer */}
            <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center text-xs text-[#6B7280]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigateTo('login')}
                className="font-semibold text-[#3157D5] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
