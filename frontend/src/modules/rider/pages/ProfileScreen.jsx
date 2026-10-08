import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { GlassCard } from '../components/GlassCard';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useNavigate } from 'react-router-dom';

export default function ProfileScreen() {
  const { user, logout, kycStatus, fetchProfile, uploadProfileDocuments } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const { activePlan } = useSubscriptionStore();
  const isDark = theme === 'dark';
  
  const [activeUploadField, setActiveUploadField] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/rider/auth/phone');
  };

  const handleViewDocument = (label) => {
    const keyMap = {
      'Selfie': 'selfie',
      'Aadhaar Front': 'aadhaarFront',
      'Aadhaar Back': 'aadhaarBack',
      'Driving License': 'drivingLicense',
      'Certificate': 'certificate'
    };
    const key = keyMap[label];
    const docUrl = key ? user?.kycDetails?.[key] : null;
      
    if (docUrl) {
      window.open(docUrl, '_blank');
    } else {
      alert(`Viewing verified ${label} document...`);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeUploadField) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("File too large. Please upload a file under 15MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append(activeUploadField, file);
      
      const res = await uploadProfileDocuments(formData);
      if (res.success) {
        alert(`${activeUploadField} uploaded successfully!`);
      } else {
        alert(res.message || "Failed to upload document");
      }
    } catch (err) {
      alert("Error uploading file");
    } finally {
      setUploading(false);
      setActiveUploadField(null);
      e.target.value = ''; // Reset file input
    }
  };

  const sections = [
    ...(activePlan ? [{
      title: 'Current Subscription',
      items: [
        { label: 'My Plan', value: activePlan.label || activePlan.name || 'Standard', color: '#39FF14' },
        { label: 'Usage Status', value: 'Active' }
      ]
    }] : []),
    {
      title: 'Verified Documents',
      items: [
        { 
            label: 'KYC Status', 
            value: kycStatus.toUpperCase(), 
            color: kycStatus === 'rejected' ? '#EF4444' : '#39FF14', 
            canView: false 
        },
        { 
            label: 'Selfie', 
            value: user?.kycDetails?.selfie ? 'Uploaded' : 'Not Uploaded', 
            color: user?.kycDetails?.selfie ? '#39FF14' : (isDark ? '#4b5563' : '#94a3b8'), 
            canView: !!user?.kycDetails?.selfie,
            canUpload: !user?.kycDetails?.selfie,
            fieldKey: 'selfie'
        },
        { 
            label: 'Aadhaar Front', 
            value: user?.kycDetails?.aadhaarFront ? 'Uploaded' : 'Not Uploaded', 
            color: user?.kycDetails?.aadhaarFront ? '#39FF14' : (isDark ? '#4b5563' : '#94a3b8'), 
            canView: !!user?.kycDetails?.aadhaarFront,
            canUpload: !user?.kycDetails?.aadhaarFront,
            fieldKey: 'aadhaarFront'
        },
        { 
            label: 'Aadhaar Back', 
            value: user?.kycDetails?.aadhaarBack ? 'Uploaded' : 'Not Uploaded', 
            color: user?.kycDetails?.aadhaarBack ? '#39FF14' : (isDark ? '#4b5563' : '#94a3b8'), 
            canView: !!user?.kycDetails?.aadhaarBack,
            canUpload: !user?.kycDetails?.aadhaarBack,
            fieldKey: 'aadhaarBack'
        },
        { 
            label: 'Driving License', 
            value: user?.kycDetails?.drivingLicense ? 'Uploaded' : 'Not Uploaded', 
            color: user?.kycDetails?.drivingLicense ? '#39FF14' : (isDark ? '#4b5563' : '#94a3b8'), 
            canView: !!user?.kycDetails?.drivingLicense,
            canUpload: !user?.kycDetails?.drivingLicense,
            fieldKey: 'drivingLicense'
        },
        {
            label: 'Certificate',
            value: user?.kycDetails?.certificate ? 'Uploaded' : 'Not Uploaded',
            color: user?.kycDetails?.certificate ? '#39FF14' : (isDark ? '#4b5563' : '#94a3b8'),
            canView: !!user?.kycDetails?.certificate,
            canUpload: !user?.kycDetails?.certificate,
            fieldKey: 'certificate'
        }
      ]
    },
    {
      title: 'Legal & Support',
      items: [
        { 
            label: 'Terms of Service', 
            value: 'View Terms', 
            color: isDark ? '#9ca3af' : '#64748b', 
            canView: true,
            link: 'https://flexigoemobility.com/terms'
        },
        { 
            label: 'Privacy Policy', 
            value: 'View Policy', 
            color: isDark ? '#9ca3af' : '#64748b', 
            canView: true,
            link: 'https://flexigoemobility.com/privacy-policy'
        }
      ]
    }
  ];

  return (
    <PageWrapper className="flex flex-col p-6 pt-2 pb-24">
      {/* Hidden file input for uploading */}
      <input 
        type="file" 
        id="document-upload" 
        className="hidden" 
        accept="image/*,.pdf" 
        onChange={handleFileUpload} 
      />
      <div className="mb-10 flex flex-col items-center">
        <div className="relative mb-6">
          <div className={`absolute inset-0 bg-flexigo-teal/20 rounded-full blur-2xl transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-40'}`} />
          <div className="w-28 h-28 rounded-full border-4 border-flexigo-teal/40 overflow-hidden relative z-10 p-1">
            <div className={`w-full h-full rounded-full flex items-center justify-center transition-colors duration-500 ${isDark ? 'bg-white/10' : 'bg-slate-100'
              }`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="1" className="w-16 h-16 opacity-40">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
              </svg>
            </div>
          </div>
        </div>
        <h2 className={`text-2xl font-heading font-black transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
          }`}>{user?.name || 'Flexigo Rider'}</h2>
        <p className={`text-sm mt-1 transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-slate-500'
          }`}>+91 {user?.phone || '9876543210'}</p>
      </div>

      <div className="space-y-8 flex-1">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] px-2 transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-slate-400'
              }`}>{section.title}</h3>
            <GlassCard className={`divide-y transition-colors duration-500 overflow-hidden border shadow-xl ${isDark ? 'divide-white/05' : 'divide-slate-100'
              }`}>
              {section.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-5">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[10px] uppercase font-black tracking-widest transition-colors duration-500 ${isDark ? 'text-gray-500' : 'text-slate-400'
                      }`}>{item.label}</span>
                    <span
                      className={`font-black text-sm transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      style={item.color ? { color: item.color } : {}}
                    >
                      {item.value}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.canUpload && (
                      <button
                        onClick={() => {
                          setActiveUploadField(item.fieldKey);
                          setTimeout(() => {
                            document.getElementById('document-upload').click();
                          }, 50);
                        }}
                        disabled={uploading}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${isDark
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 shadow-sm'
                          }`}
                      >
                        {uploading && activeUploadField === item.fieldKey ? 'Uploading...' : 'Upload'}
                      </button>
                    )}
                    {item.canView && (
                      <button
                        onClick={() => item.link ? window.open(item.link, '_blank') : handleViewDocument(item.label)}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${isDark
                            ? 'bg-white/5 border-white/10 text-flexigo-teal hover:bg-white/10'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 shadow-sm'
                          }`}
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        ))}

        <div className="mt-6">
          <button
            className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-[0.98] border ${isDark
                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                : 'bg-red-50 border border-red-100 text-red-600 shadow-sm'
              }`}
            onClick={handleLogout}
          >
            Logout Securely
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
