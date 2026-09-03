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
  Loader2
} from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">

      {/* Subtle Ambient Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">

        {/* Top Header Logo */}
        <div className="text-center mb-6">
          <div
            onClick={() => navigateTo('hero')}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white shadow-xl shadow-brand-500/20 mb-3 ring-4 ring-slate-100 cursor-pointer group"
          >
            <BrainCircuit className="w-8 h-8 group-hover:scale-105 transition-transform" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Join ReadySet<span className="text-brand-600">Job</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Assess your aptitude, reasoning, and technical job-readiness with AI analytics and PostgreSQL backend integration.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 relative">

          <div className="border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-brand-600" />
                Candidate Registration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Please provide your details below to create your student account.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Row 1: Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Full Name"
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border text-sm text-slate-900 placeholder-slate-400 rounded-xl outline-none transition-all ${errors.name ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20'
                      }`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
              </div>

              {/* 2. Email Address (with Validation) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Email Address"
                    className={`w-full pl-10 pr-9 py-2.5 bg-white border text-sm text-slate-900 placeholder-slate-400 rounded-xl outline-none transition-all ${errors.email ? 'border-rose-500 ring-2 ring-rose-500/20' : formData.email && EMAIL_REGEX.test(formData.email) ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20'
                      }`}
                  />
                  {formData.email && EMAIL_REGEX.test(formData.email) && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {errors.email ? (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">Format: username@domain.com</p>
                )}
              </div>

            </div>

            {/* Row 2: Phone No (Indian Validation) & College Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* 3. Phone No (Indian Validation) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Phone No <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-slate-500 select-none flex items-center gap-1">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    maxLength={13}
                    className={`w-full pl-16 pr-9 py-2.5 bg-white border text-sm text-slate-900 placeholder-slate-400 rounded-xl outline-none transition-all ${errors.phoneNo ? 'border-rose-500 ring-2 ring-rose-500/20' : formData.phoneNo && INDIAN_MOBILE_REGEX.test(formData.phoneNo.replace(/[\s\-]/g, '')) ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20'
                      }`}
                  />
                  {formData.phoneNo && INDIAN_MOBILE_REGEX.test(formData.phoneNo.replace(/[\s\-]/g, '')) && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {errors.phoneNo ? (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phoneNo}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">10-digit Indian mobile number starting with 6,7,8,9</p>
                )}
              </div>

              {/* 4. College Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  4. College Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    placeholder="Enter College Name"
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border text-sm text-slate-900 placeholder-slate-400 rounded-xl outline-none transition-all ${errors.collegeName ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20'
                      }`}
                  />
                </div>
                {errors.collegeName && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.collegeName}</p>}
              </div>

            </div>

            {/* Row 3: Branch & Specialization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* 5. Branch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  5. Branch / Stream <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 text-sm text-slate-900 rounded-xl outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Branch / Stream</option>
                    {POPULAR_BRANCHES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                {errors.branch && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.branch}</p>}
              </div>

              {/* 6. Specialization */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  6. Specialization <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 text-sm text-slate-900 rounded-xl outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Specialization</option>
                    {SPECIALIZATIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                {errors.specialization && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.specialization}</p>}
              </div>

            </div>

            {/* Row 4: Country, State & City */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* 7. Country */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  7. Country <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter Country"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 text-sm text-slate-900 rounded-xl outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>

              {/* 8. State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  8. State <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Compass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 text-sm text-slate-900 rounded-xl outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                {errors.state && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.state}</p>}
              </div>

              {/* 9. City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  9. City <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter City"
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border text-sm text-slate-900 placeholder-slate-400 rounded-xl outline-none transition-all ${errors.city ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20'
                      }`}
                  />
                </div>
                {errors.city && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.city}</p>}
              </div>

            </div>

            {/* Row 5: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border text-sm text-slate-900 placeholder-slate-400 rounded-xl outline-none transition-all ${errors.password ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Strength:</span>
                      <span className="font-bold text-slate-700">{pwdStrength.label}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${pwdStrength.color}`} style={{ width: `${pwdStrength.score}%` }} />
                    </div>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border text-sm text-slate-900 placeholder-slate-400 rounded-xl outline-none transition-all ${errors.confirmPassword ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
              </div>

            </div>

            {/* Terms Agreement Checkbox */}
            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                I agree to the <span className="text-brand-600 hover:underline font-semibold">Terms of Service</span> and <span className="text-brand-600 hover:underline font-semibold">Privacy Policy</span>. My data will be stored securely.
              </label>
            </div>
            {errors.agreeTerms && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.agreeTerms}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => navigateTo('login')}
                className="font-bold text-brand-600 hover:underline inline-flex items-center gap-1"
              >
                Sign In
              </button>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
