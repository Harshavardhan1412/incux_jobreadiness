import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BrainCircuit,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  TrendingUp,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  GraduationCap,
  FileCheck,
  FileText
} from 'lucide-react';

export const SignupPage = () => {
  const { registerCandidate, navigateTo } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    college: '',
    degree: '',
    branch: '',
    graduationYear: '2026',
    primarySkill: '',
    agreeTerms: false,
    resumeFile: null,
    tenthCertificate: null,
    twelfthCertificate: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1: return { score: 25, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
      case 2: return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
      case 3: return { score: 75, label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' };
      case 4: return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
      default: return { score: 0, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    }
  };

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+?[\d\s-]{10,15}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.college.trim()) newErrors.college = 'College/University is required';
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch/Specialization is required';
    if (!formData.graduationYear) newErrors.graduationYear = 'Select graduation year';
    if (!formData.primarySkill.trim()) newErrors.primarySkill = 'Primary skill / domain is required';

    // Compulsory Certificate validations
    if (!formData.tenthCertificate) {
      newErrors.tenthCertificate = '10th Class Marksheet / Certificate is required';
    }
    if (!formData.twelfthCertificate) {
      newErrors.twelfthCertificate = '12th / Intermediate Certificate is required';
    }

    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to terms & policy';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsRegistered(true);
      setTimeout(() => {
        registerCandidate(formData);
      }, 1200);
    }, 1000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, resumeFile: file.name }));
    }
  };

  const handleTenthUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, tenthCertificate: file.name }));
      if (errors.tenthCertificate) {
        setErrors(prev => ({ ...prev, tenthCertificate: null }));
      }
    }
  };

  const handleTwelfthUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, twelfthCertificate: file.name }));
      if (errors.twelfthCertificate) {
        setErrors(prev => ({ ...prev, twelfthCertificate: null }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDE: Platform Branding & Value Proposition */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6 pt-4 lg:pt-10 lg:sticky lg:top-8">
          <div 
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ReadySet<span className="text-brand-600">Job</span>
              </span>
              <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                AI Readiness Platform
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Build Your Career With Confidence
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Assess your skills, understand your strengths, identify skill gaps, and become job-ready with AI-powered personalized roadmaps.
            </p>
          </div>

          {/* Value Props Cards */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Standardized Tri-Module Assessments</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Quantitative Aptitude, Logical Reasoning, and Technical Engineering challenges.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-600 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">AI Deep Performance Diagnosis</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Instant topic-level gap analysis, radar metrics, and a tailored 7-day plan.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Official Job-Readiness Certificate</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Share verifiable scores with partner recruiters, college placement cells, and hiring managers.</p>
              </div>
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700">Quick Test Profile</span>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    fullName: 'Sarah Chen',
                    email: 'sarah.chen@stanford.edu',
                    mobile: '+91 98765 43210',
                    password: 'Password@123',
                    confirmPassword: 'Password@123',
                    college: 'National Institute of Tech',
                    degree: 'B.Tech',
                    branch: 'Computer Science',
                    graduationYear: '2026',
                    primarySkill: 'Fullstack Web Development',
                    agreeTerms: true,
                    resumeFile: 'sarah_chen_resume.pdf',
                    tenthCertificate: 'sarah_chen_10th_marksheet.pdf',
                    twelfthCertificate: 'sarah_chen_12th_certificate.pdf'
                  });
                  setErrors({});
                }}
                className="text-brand-600 hover:text-brand-700 font-bold hover:underline"
              >
                Auto-Fill Sample
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Click auto-fill to instantly populate verified sample candidate data.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Clean Registration Card */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 relative overflow-hidden">
            
            {isRegistered ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Registration Successful!</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Your candidate profile has been initialized. Redirecting you to your Job Readiness Dashboard...
                </p>
                <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Candidate Registration</h2>
                  <p className="text-xs text-slate-500 mt-1">Create your profile to start aptitude & technical assessments.</p>
                </div>

                {/* Section 1: Personal & Account */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Account & Contact Details
                  </h3>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. John Doe"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm rounded-xl border ${
                          errors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-brand-500'
                        } focus:ring-2 focus:ring-brand-500/20 outline-none transition-all`}
                      />
                    </div>
                    {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Email & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@university.edu"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm rounded-xl border ${
                            errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-brand-500'
                          } focus:ring-2 focus:ring-brand-500/20 outline-none transition-all`}
                        />
                      </div>
                      {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={formData.mobile}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          placeholder="+91 98765 43210"
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm rounded-xl border ${
                            errors.mobile ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-brand-500'
                          } focus:ring-2 focus:ring-brand-500/20 outline-none transition-all`}
                        />
                      </div>
                      {errors.mobile && <p className="text-[11px] text-rose-500 mt-1">{errors.mobile}</p>}
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Min. 8 characters"
                          className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm rounded-xl border ${
                            errors.password ? 'border-rose-400' : 'border-slate-200 focus:border-brand-500'
                          } focus:ring-2 focus:ring-brand-500/20 outline-none transition-all`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Re-enter password"
                          className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm rounded-xl border ${
                            errors.confirmPassword ? 'border-rose-400' : 'border-slate-200 focus:border-brand-500'
                          } focus:ring-2 focus:ring-brand-500/20 outline-none transition-all`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-[11px] text-rose-500 mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-500">Password Strength:</span>
                        <span className={strength.text}>{strength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Academic & Professional Profile */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Academic & Experience Background
                  </h3>

                  {/* College / University */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      College / University <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        placeholder="e.g. ABC Institute of Technology"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm rounded-xl border ${
                          errors.college ? 'border-rose-400' : 'border-slate-200 focus:border-brand-500'
                        } focus:ring-2 focus:ring-brand-500/20 outline-none transition-all`}
                      />
                    </div>
                    {errors.college && <p className="text-[11px] text-rose-500 mt-1">{errors.college}</p>}
                  </div>

                  {/* Degree & Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Degree <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        placeholder="e.g. B.Tech / B.E. / MCA"
                        className={`w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm rounded-xl border ${
                          errors.degree ? 'border-rose-400' : 'border-slate-200 focus:border-brand-500'
                        } focus:ring-2 focus:ring-brand-500/20 outline-none transition-all`}
                      />
                      {errors.degree && <p className="text-[11px] text-rose-500 mt-1">{errors.degree}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Branch / Specialization <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        placeholder="e.g. Computer Science"
                        className={`w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm rounded-xl border ${
                          errors.branch ? 'border-rose-400' : 'border-slate-200 focus:border-brand-500'
                        } focus:ring-2 focus:ring-brand-500/20 outline-none transition-all`}
                      />
                      {errors.branch && <p className="text-[11px] text-rose-500 mt-1">{errors.branch}</p>}
                    </div>
                  </div>

                  {/* Graduation Year & Experience Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Graduation Year <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.graduationYear}
                        onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-slate-800"
                      >
                        <option value="2027">2027 (Upcoming)</option>
                        <option value="2026">2026 (Final Year)</option>
                        <option value="2025">2025 (Recent Graduate)</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Primary Skill / Domain <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.primarySkill}
                        onChange={(e) => setFormData({ ...formData, primarySkill: e.target.value })}
                        placeholder="e.g. Java, Python, React, Data Science"
                        className={`w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm rounded-xl border ${
                          errors.primarySkill ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-brand-500'
                        } focus:ring-2 focus:ring-brand-500/20 outline-none transition-all`}
                      />
                      {errors.primarySkill && <p className="text-[11px] text-rose-500 mt-1">{errors.primarySkill}</p>}
                    </div>
                  </div>

                  {/* Academic Certificates Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 10th Certificate */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          10th Class Certificate <span className="text-rose-500">*</span>
                        </label>
                        <label className={`flex items-center justify-between p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          errors.tenthCertificate
                            ? 'border-rose-400 bg-rose-50/50 hover:bg-rose-50'
                            : formData.tenthCertificate
                            ? 'border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/60'
                            : 'border-slate-200 hover:border-brand-400 bg-slate-50/50 hover:bg-brand-50/30'
                        }`}>
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {formData.tenthCertificate ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className={`text-xs font-medium truncate ${formData.tenthCertificate ? 'text-emerald-900 font-bold' : 'text-slate-600'}`}>
                              {formData.tenthCertificate || 'Upload 10th Marksheet'}
                            </span>
                          </div>
                          {formData.tenthCertificate && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                              Attached
                            </span>
                          )}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleTenthUpload}
                            className="hidden"
                          />
                        </label>
                        {errors.tenthCertificate && (
                          <p className="text-[11px] text-rose-500 mt-1 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" /> {errors.tenthCertificate}
                          </p>
                        )}
                      </div>

                      {/* 12th Certificate */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          12th / Diploma Certificate <span className="text-rose-500">*</span>
                        </label>
                        <label className={`flex items-center justify-between p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          errors.twelfthCertificate
                            ? 'border-rose-400 bg-rose-50/50 hover:bg-rose-50'
                            : formData.twelfthCertificate
                            ? 'border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/60'
                            : 'border-slate-200 hover:border-brand-400 bg-slate-50/50 hover:bg-brand-50/30'
                        }`}>
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {formData.twelfthCertificate ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className={`text-xs font-medium truncate ${formData.twelfthCertificate ? 'text-emerald-900 font-bold' : 'text-slate-600'}`}>
                              {formData.twelfthCertificate || 'Upload 12th Certificate'}
                            </span>
                          </div>
                          {formData.twelfthCertificate && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                              Attached
                            </span>
                          )}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleTwelfthUpload}
                            className="hidden"
                          />
                        </label>
                        {errors.twelfthCertificate && (
                          <p className="text-[11px] text-rose-500 mt-1 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" /> {errors.twelfthCertificate}
                          </p>
                        )}
                      </div>
                    </div>

                  {/* Optional Resume Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Upload Resume <span className="text-slate-400 font-normal">(Optional PDF/DOCX)</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-brand-50/30 transition-all">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-600 font-medium truncate max-w-xs">
                        {formData.resumeFile ? formData.resumeFile : 'Choose file or drag & drop (Max 5MB)'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      I agree to the <span className="text-brand-600 font-medium hover:underline">Terms & Conditions</span> and <span className="text-brand-600 font-medium hover:underline">Privacy Policy</span>.
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="text-[11px] text-rose-500 mt-1">{errors.agreeTerms}</p>}
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] disabled:bg-brand-300 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Login */}
                <div className="text-center pt-2 text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigateTo('login')}
                    className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    Login
                  </button>
                  <span className="mx-2 text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => navigateTo('admin-login')}
                    className="font-bold text-slate-700 hover:text-slate-900 hover:underline"
                  >
                    Admin Portal
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
