import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { NeonButton } from '../components/NeonButton';
import { GlassCard } from '../components/GlassCard';

import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const steps = [
  { id: 1, title: 'Selfie', description: 'Take a clear selfie' },
  { id: 2, title: 'Identity', description: 'Upload your Aadhaar' },
  { id: 3, title: 'License', description: 'Driving permit' },
];

export default function OnboardingKYC() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('onboarding_step');
    return savedStep ? parseInt(savedStep) : 1;
  });
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState({
    selfie: null,
    aadhaarFront: null,
    aadhaarBack: null,
    license: null
  });
  const [previews, setPreviews] = useState({
    selfie: null,
    aadhaarFront: null,
    aadhaarBack: null,
    license: null
  });

  // Camera/Upload picker modal
  const [pickerModal, setPickerModal] = useState({ open: false, type: null, fileInputId: null });

  // Live camera (getUserMedia) state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraType, setCameraType] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // eKYC States
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [clientId, setClientId] = useState(null);
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [ekycLoading, setEkycLoading] = useState(false);

  // Refs for file inputs - no longer needed with label approach
  const selfieRef = useRef(null);
  const adhaarFrontRef = useRef(null);
  const adhaarBackRef = useRef(null);
  const licenseRef = useRef(null);

  const { updateKYC, phone, generateAadhaarOTP, verifyAadhaarOTP, user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // Detect if running inside Flutter InAppWebView
  const isFlutterApp = () => typeof window !== 'undefined' && !!window.flutter_inappwebview;

  // Handle camera via Flutter native handler (app) or show picker modal (web)
  const captureWithFlutter = async (type, fileInputId) => {
    try {
      console.log(`FLUTTER_CAM: Calling openCamera handler for [${type}]`);
      const result = await window.flutter_inappwebview.callHandler('openCamera');
      console.log(`FLUTTER_CAM: Result received for [${type}]:`, result?.success);

      if (result?.success && result?.base64) {
        const byteString = atob(result.base64);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const mimeType = result.mimeType || 'image/jpeg';
        const blob = new Blob([ab], { type: mimeType });
        const file = new File([blob], result.fileName || `${type}_photo.jpg`, { type: mimeType });

        setPreviews(prev => {
          if (prev[type]) URL.revokeObjectURL(prev[type]);
          return { ...prev, [type]: URL.createObjectURL(file) };
        });
        setUploads(prev => ({ ...prev, [type]: file }));
        console.log(`FLUTTER_CAM: Photo captured and stored for [${type}]`);
      } else {
        console.log(`FLUTTER_CAM: No photo returned for [${type}]`);
      }
    } catch (err) {
      console.error('FLUTTER_CAM: Error calling Flutter camera handler:', err);
      document.getElementById(fileInputId)?.click();
    }
  };

  const handleCameraCapture = (type, fileInputId) => {
    // Show picker modal for both web browser and flutter app
    setPickerModal({ open: true, type, fileInputId });
  };

  const closePickerModal = () => setPickerModal({ open: false, type: null, fileInputId: null });

  // Open live camera using getUserMedia
  const openWebCamera = async (type) => {
    closePickerModal();
    setCameraError(null);
    setCameraType(type);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      // Wait for videoRef to be available after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error('CAM_WEB: getUserMedia error:', err);
      setCameraError('Camera access denied. Please allow camera permission or use Gallery.');
    }
  };

  // Stop camera stream
  const stopWebCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    setCameraType(null);
    setCameraError(null);
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${cameraType}_photo.jpg`, { type: 'image/jpeg' });
      setPreviews(prev => {
        if (prev[cameraType]) URL.revokeObjectURL(prev[cameraType]);
        return { ...prev, [cameraType]: URL.createObjectURL(file) };
      });
      setUploads(prev => ({ ...prev, [cameraType]: file }));
      stopWebCamera();
    }, 'image/jpeg', 0.9);
  };

  useEffect(() => {
    console.log('INIT: Checking existing KYC status');

    // Prevent showing onboarding if already registered or KYC is approved
    if (user?.isRegistered || user?.kycStatus === 'approved') {
      navigate('/rider/home', { replace: true });
      return;
    }

    if (user?.kycDetails?.ekycVerified) {
      console.log('INIT: Aadhaar already verified in profile');
      setIsAadhaarVerified(true);
    }
  }, [user, navigate]);

  useEffect(() => {
    localStorage.setItem('onboarding_step', currentStep.toString());
    
    // Push state so hardware back button doesn't leave the page immediately
    window.history.pushState({ kycStep: currentStep }, '', window.location.href);
    
    const handlePopState = (e) => {
      if (currentStep > 1) {
        // Prevent leaving page, go back one step
        setCurrentStep(prev => prev - 1);
      } else {
        // Allow leaving if on step 1
        navigate(-1);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentStep, navigate]);

  const fileToBase64 = (file) => {
    console.log(`UTIL: Converting file to base64: ${file?.name}`);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (type, e) => {
    console.log(`FILE_CHANGE: Handling file upload for [${type}]`);
    const file = e.target.files?.[0];
    console.log(`FILE_CHANGE: Selected file name: ${file?.name}, size: ${file?.size}`);
    if (file) {
      // Revoke old preview URL to avoid memory leak
      setPreviews(prev => {
        if (prev[type]) URL.revokeObjectURL(prev[type]);
        return { ...prev, [type]: URL.createObjectURL(file) };
      });
      setUploads(prev => ({ ...prev, [type]: file }));
      console.log(`FILE_CHANGE: State + preview updated for [${type}]`);
    }
  };

  const handleSendAadhaarOTP = async () => {
    console.log('EKYC_UI: Initiating Aadhaar OTP Request');
    console.log('EKYC_UI: Aadhaar Number:', aadhaarNumber);
    if (aadhaarNumber.length !== 12) {
      console.log('EKYC_UI: Error - Aadhaar must be 12 digits');
      alert('Please enter valid 12-digit Aadhaar number');
      return;
    }
    setEkycLoading(true);
    console.log('EKYC_UI: Calling generateAadhaarOTP from store');
    try {
      const res = await generateAadhaarOTP(aadhaarNumber);
      console.log('EKYC_UI: Received response:', JSON.stringify(res));

      // Robust success check: either success flag is true OR message indicates success
      const isSuccess = res.success ||
        res.message === 'OTP Sent.' ||
        res.message?.toLowerCase().includes('success') ||
        res.message?.toLowerCase().includes('sent');

      if (isSuccess) {
        console.log('EKYC_UI: OTP request success confirmed');
        // Capture client_id or any variant of request ID
        const requestId = res.client_id || res.request_id || res.requestId || res.data?.request_id || res.data?.client_id;

        if (!requestId) {
          console.log('EKYC_UI: WARNING - No RequestID found in success response');
          alert('OTP sent, but no Verification ID received. Please contact support or try again.');
        }

        setClientId(requestId);
        setOtpSent(true);
        alert(res.message || 'OTP sent successfully');
      } else {
        console.log('EKYC_UI: OTP request failed:', res.message);
        alert(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.log('EKYC_UI: Unexpected error:', err.message);
      alert('Error sending OTP: ' + err.message);
    } finally {
      console.log('EKYC_UI: Resetting loading state');
      setEkycLoading(false);
    }
  };

  const handleVerifyAadhaarOTP = async () => {
    console.log('EKYC_UI: Initiating OTP Verification');
    console.log('EKYC_UI: OTP entered:', aadhaarOtp);
    if (aadhaarOtp.length < 6) {
      console.log('EKYC_UI: Error - OTP too short');
      alert('Please enter valid OTP');
      return;
    }
    setEkycLoading(true);
    console.log('EKYC_UI: Calling verifyAadhaarOTP with ClientID:', clientId);
    try {
      const res = await verifyAadhaarOTP(clientId, aadhaarOtp);
      console.log('EKYC_UI: Verification result:', JSON.stringify(res));

      const isSuccess = res.success ||
        res.message?.toLowerCase().includes('success') ||
        res.message?.toLowerCase().includes('verified');

      if (isSuccess) {
        console.log('EKYC_UI: Verification TRUE');
        setIsAadhaarVerified(true);
        alert(res.message || 'Aadhaar Verified Successfully!');
      } else {
        console.log('EKYC_UI: Verification FALSE:', res.message);
        alert(res.message || 'Verification failed');
      }
    } catch (err) {
      console.log('EKYC_UI: Unexpected verification error:', err.message);
      alert('Error verifying OTP: ' + err.message);
    } finally {
      console.log('EKYC_UI: Resetting loading state');
      setEkycLoading(false);
    }
  };

  const handleNext = async () => {
    console.log('ONBOARDING: handleNext triggered');
    console.log('ONBOARDING: Current step:', currentStep);
    if (currentStep < steps.length) {
      console.log('ONBOARDING: Moving to next step');
      setCurrentStep(prev => prev + 1);
    } else {
      console.log('ONBOARDING: Final step reached. Starting KYC update.');
      setLoading(true);
      try {
        console.log('ONBOARDING: Preparing FormData object');
        const formData = new FormData();
        formData.append('phone', phone || user?.phone || '');

        const appendField = (key, val) => {
          if (!val) return;
          if (val instanceof File || val instanceof Blob) {
            formData.append(key, val);
          } else if (typeof val === 'string') {
            formData.append(key, val);
          }
        };

        appendField('selfie', uploads.selfie);
        appendField('aadhaarFront', uploads.aadhaarFront);
        appendField('aadhaarBack', uploads.aadhaarBack);
        appendField('drivingLicense', uploads.license);

        console.log('ONBOARDING: FormData prepared. Calling updateKYC store method');
        const result = await updateKYC(formData);
        console.log('ONBOARDING: updateKYC result:', JSON.stringify(result));
        if (result.success) {
          console.log('ONBOARDING: Success! Navigating to /rider/plans');
          localStorage.removeItem('onboarding_step');
          navigate('/rider/plans');
        } else {
          console.log('ONBOARDING: Failed result. message:', result.message);
          alert(result.message);
        }
      } catch (error) {
        console.log('ONBOARDING: Error in final step try-catch:', error.message);
        alert('Error processing files. Please try again.');
      } finally {
        console.log('ONBOARDING: Setting loading to false');
        setLoading(false);
      }
    }
  };

  const canContinue = () => {
    console.log('VALIDATION: Checking if it can continue Step:', currentStep);
    if (currentStep === 1) {
      const res = !!uploads.selfie;
      console.log('VALIDATION: Step 1 Result:', res);
      return res;
    }
    if (currentStep === 2) {
      const res = !!uploads.aadhaarFront && !!uploads.aadhaarBack && isAadhaarVerified;
      console.log('VALIDATION: Step 2 Result:', res);
      return res;
    }
    if (currentStep === 3) {
      const res = !!uploads.license;
      console.log('VALIDATION: Step 3 Result:', res);
      return res;
    }
    return false;
  };

  return (
    <PageWrapper className="flex flex-col px-6 pt-8 pb-10">

      {/* Live Camera Modal (getUserMedia) */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            key="camera-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: '#000' }}
          >
            {/* Close button */}
            <button
              onClick={stopWebCamera}
              className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {cameraError ? (
              <div className="flex flex-col items-center gap-4 px-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" className="w-8 h-8">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-white text-sm font-bold">{cameraError}</p>
                <button
                  onClick={stopWebCamera}
                  className="mt-2 px-6 py-3 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest"
                >Close</button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ maxHeight: '80vh' }}
                />
                {/* Capture button */}
                <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                  <button
                    onClick={capturePhoto}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
                    style={{ background: 'rgba(57,255,20,0.2)', boxShadow: '0 0 20px #39FF14' }}
                  >
                    <div className="w-14 h-14 rounded-full bg-[#39FF14]" />
                  </button>
                </div>
                <p className="absolute bottom-36 left-0 right-0 text-center text-white/60 text-[10px] font-black uppercase tracking-widest">Tap to Capture</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera / Upload Picker Modal */}
      <AnimatePresence>
        {pickerModal.open && (
          <motion.div
            key="picker-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePickerModal}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              key="picker-sheet"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className={`w-full max-w-sm rounded-t-3xl p-6 pb-10 ${isDark ? 'bg-[#111] border-t border-white/10' : 'bg-white border-t border-slate-100 shadow-2xl'
                }`}
            >
              {/* Handle bar */}
              <div className="flex justify-center mb-5">
                <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-200'}`} />
              </div>

              <p className={`text-center text-[10px] font-black uppercase tracking-widest mb-6 ${isDark ? 'text-gray-400' : 'text-slate-500'
                }`}>Choose Option</p>

              <div className="grid grid-cols-2 gap-4 mb-5">
                {/* Camera Option — opens getUserMedia live camera or Flutter Camera */}
                <button
                  onClick={() => {
                    if (isFlutterApp()) {
                      closePickerModal();
                      captureWithFlutter(pickerModal.type, pickerModal.fileInputId);
                    } else {
                      openWebCamera(pickerModal.type);
                    }
                  }}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isDark
                    ? 'border-white/10 bg-white/5 hover:border-[#39FF14] hover:bg-[#39FF14]/10'
                    : 'border-slate-200 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#39FF14]/10">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-7 h-7">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-center ${isDark ? 'text-white' : 'text-slate-700'
                    }`}>Camera</span>
                </button>

                {/* Gallery/Upload Option */}
                <label
                  htmlFor={pickerModal.fileInputId}
                  onClick={closePickerModal}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isDark
                    ? 'border-white/10 bg-white/5 hover:border-[#39FF14] hover:bg-[#39FF14]/10'
                    : 'border-slate-200 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#39FF14]/10">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-7 h-7">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="8.5" cy="8.5" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="21 15 16 10 5 21" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest text-center ${isDark ? 'text-white' : 'text-slate-700'
                    }`}>Gallery</span>
                </label>
              </div>

              <button
                onClick={closePickerModal}
                className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isDark ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                  }`}
              >Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(prev => prev - 1);
              } else {
                navigate(-1);
              }
            }}
            className={`p-2 -ml-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-900'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className={`text-2xl font-heading font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
            }`}>KYC Verification</h1>
        </div>
        <div className="text-flexigo-teal font-black text-[10px] uppercase tracking-widest">Step {currentStep}/{steps.length}</div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-10">
        {steps.map((step) => (
          <div
            key={step.id}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{
              background: step.id <= currentStep ? '#39FF14' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              boxShadow: (step.id <= currentStep && isDark) ? '0 0 10px #39FF14' : 'none'
            }}
          />
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className={`text-xl font-heading font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
                }`}>Take a Selfie</h2>
              <p className={`text-sm leading-relaxed transition-colors duration-500 ${isDark ? 'text-gray-400' : 'text-slate-500'
                }`}>
                We need a clear photo of your face for identity verification. Please ensure your face is well-lit.
              </p>

              <div className="flex justify-center py-6">
                <input
                  id="selfie-input"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange('selfie', e)}
                />
                {/* Camera button - uses Flutter handler in app, file input on web */}
                <div
                  onClick={() => handleCameraCapture('selfie', 'selfie-input')}
                  className={`w-48 h-48 rounded-full border-2 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-500 overflow-hidden ${uploads.selfie ? 'border-flexigo-teal' :
                    isDark ? 'border-white/10 border-dashed bg-white/[0.02]' : 'border-slate-200 border-dashed bg-slate-50 shadow-sm'
                    }`}
                >
                  {previews.selfie ? (
                    <img src={previews.selfie} alt="Selfie Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-flexigo-teal/10">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-7 h-7">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest text-center px-4 ${isDark ? 'text-gray-400' : 'text-slate-400'
                        }`}>{isFlutterApp() ? 'Open Camera' : 'Camera / Upload'}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className={`text-xl font-heading font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
                }`}>Aadhaar e-KYC</h2>

              {!isAadhaarVerified ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest italic ml-1 transition-colors duration-500 ${isDark ? 'text-[#39FF14]' : 'text-emerald-600'
                      }`}>Aadhaar Number</label>
                    <input
                      type="text"
                      maxLength="12"
                      placeholder="XXXX XXXX XXXX"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      disabled={otpSent}
                      className={`w-full rounded-xl px-4 py-4 font-black tracking-[0.2em] outline-none transition-all border-2 ${isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-[#39FF14]'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 shadow-sm'
                        } ${otpSent ? 'opacity-50' : ''}`}
                    />
                  </div>

                  {otpSent && (
                    <div className="space-y-2">
                      <label className={`text-[10px] font-black uppercase tracking-widest italic ml-1 transition-colors duration-500 ${isDark ? 'text-[#39FF14]' : 'text-emerald-600'
                        }`}>Enter OTP</label>
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="XXXXXX"
                        value={aadhaarOtp}
                        onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, ''))}
                        className={`w-full rounded-xl px-4 py-4 font-black tracking-[0.5em] outline-none transition-all border-2 ${isDark
                          ? 'bg-white/5 border-white/10 text-white focus:border-[#39FF14]'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 shadow-sm'
                          }`}
                      />
                    </div>
                  )}

                  <NeonButton
                    size="full"
                    variant="green"
                    onClick={otpSent ? handleVerifyAadhaarOTP : handleSendAadhaarOTP}
                    disabled={ekycLoading || (otpSent ? !aadhaarOtp : !aadhaarNumber)}
                  >
                    {ekycLoading ? 'Wait...' : otpSent ? 'Verify OTP' : 'Send OTP'}
                  </NeonButton>

                  {otpSent && (
                    <button
                      type="button"
                      onClick={handleSendAadhaarOTP}
                      disabled={ekycLoading}
                      className={`w-full text-center text-[10px] font-black uppercase tracking-widest mt-2 transition-colors ${isDark ? 'text-flexigo-teal hover:text-white' : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                    >
                      Resend Aadhaar OTP
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-[#39FF14]/10 border-2 border-[#39FF14] rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#39FF14] rounded-full flex items-center justify-center shadow-neon-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" className="w-6 h-6">
                      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#39FF14]' : 'text-emerald-700'}`}>Verification Status</div>
                    <div className={`font-heading font-black italic ${isDark ? 'text-white' : 'text-slate-900'}`}>AADHAAR_VERIFIED</div>
                  </div>
                </div>
              )}

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className={`relative flex justify-center text-[8px] uppercase font-black tracking-[0.2em] px-2 bg-transparent transition-colors duration-500 ${isDark ? 'text-white/20' : 'text-slate-400'
                  }`}>And Upload Documents</div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <input
                  id="aadhaar-front-input"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange('aadhaarFront', e)}
                />
                <input
                  id="aadhaar-back-input"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange('aadhaarBack', e)}
                />

                <div className="space-y-2">
                  <p className={`text-[10px] font-black uppercase tracking-widest italic ml-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Aadhaar Front</p>
                  <div
                    onClick={() => handleCameraCapture('aadhaarFront', 'aadhaar-front-input')}
                    className={`p-4 rounded-2xl border-dashed border-2 flex items-center gap-4 cursor-pointer transition-all duration-500 ${uploads.aadhaarFront ? 'border-flexigo-teal bg-flexigo-teal/5' : isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
                      }`}
                  >
                    {previews.aadhaarFront ? (
                      <img src={previews.aadhaarFront} alt="Aadhaar Front" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-flexigo-teal/10 flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-6 h-6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${uploads.aadhaarFront ? 'text-flexigo-teal' : isDark ? 'text-gray-400' : 'text-slate-400'}`}>
                      {uploads.aadhaarFront ? 'Front Captured ✓ Tap to Retake' : isFlutterApp() ? 'Tap to Open Camera' : 'Tap — Camera / Upload Front'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className={`text-[10px] font-black uppercase tracking-widest italic ml-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Aadhaar Back</p>
                  <div
                    onClick={() => handleCameraCapture('aadhaarBack', 'aadhaar-back-input')}
                    className={`p-4 rounded-2xl border-dashed border-2 flex items-center gap-4 cursor-pointer transition-all duration-500 ${uploads.aadhaarBack ? 'border-flexigo-teal bg-flexigo-teal/5' : isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
                      }`}
                  >
                    {previews.aadhaarBack ? (
                      <img src={previews.aadhaarBack} alt="Aadhaar Back" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-flexigo-teal/10 flex-shrink-0">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-6 h-6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${uploads.aadhaarBack ? 'text-flexigo-teal' : isDark ? 'text-gray-400' : 'text-slate-400'}`}>
                      {uploads.aadhaarBack ? 'Back Captured ✓ Tap to Retake' : isFlutterApp() ? 'Tap to Open Camera' : 'Tap — Camera / Upload Back'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className={`text-xl font-heading font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
                }`}>Driving License</h2>
              <p className={`text-sm leading-relaxed transition-colors duration-500 ${isDark ? 'text-gray-400' : 'text-slate-500'
                }`}>
                Finally, please upload a clear copy of your driving license.
              </p>

              <input
                id="license-input"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange('license', e)}
              />
              <div
                onClick={() => handleCameraCapture('license', 'license-input')}
                className={`p-4 rounded-2xl border-dashed border-2 flex items-center gap-4 cursor-pointer transition-all duration-500 ${uploads.license ? 'border-flexigo-teal bg-flexigo-teal/5' :
                  isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
                  }`}
              >
                {previews.license ? (
                  <img src={previews.license} alt="License Preview" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-flexigo-teal/10 flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" className="w-6 h-6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                )}
                <span className={`text-[10px] font-black uppercase tracking-widest ${uploads.license ? 'text-flexigo-teal' : isDark ? 'text-gray-400' : 'text-slate-400'
                  }`}>
                  {uploads.license ? 'License Captured ✓ Tap to Retake' : isFlutterApp() ? 'Tap to Open Camera' : 'Tap — Camera / Upload License'}
                </span>
              </div>

              <button
                onClick={handleNext}
                disabled={loading}
                className={`w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isDark ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : 'Skip for now →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto">
        <NeonButton
          size="full"
          variant={canContinue() ? 'solid' : 'green'}
          onClick={handleNext}
          disabled={loading || (currentStep !== 3 && !canContinue())}
        >
          {loading ? 'Processing...' : currentStep === 3 ? (uploads.license ? 'Finish & Verify' : 'Finish without License') : 'Continue'}
        </NeonButton>
      </div>
    </PageWrapper>
  );
}
