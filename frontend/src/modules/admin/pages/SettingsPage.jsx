import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, Save, Key, AlertCircle, CheckCircle2, RefreshCw, Smartphone, Database } from 'lucide-react';
import axios from 'axios';
import api from '../../../lib/axios';

const SettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [updating, setUpdating] = useState(false);
  const [appVersions, setAppVersions] = useState([]);
  const [versionSaving, setVersionSaving] = useState(null);
  const [systemSettings, setSystemSettings] = useState({ securityDepositAmount: 2800 });
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    const fetchAppVersions = async () => {
      try {
        const res = await api.get('/admin/app-versions');
        if (res.data.success) setAppVersions(res.data.versions);
      } catch (e) {
        console.error('Failed to fetch app versions:', e);
      }
    };
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data.success && res.data.settings) {
          setSystemSettings({ securityDepositAmount: res.data.settings.securityDepositAmount || 2800 });
        }
      } catch (e) {
        console.error('Failed to fetch settings:', e);
      }
    };
    fetchAppVersions();
    fetchSettings();
  }, []);

  const handleVersionUpdate = async (platform) => {
    const record = appVersions.find(v => v.platform === platform);
    if (!record) return;
    setVersionSaving(platform);
    try {
      const res = await api.put(`/admin/app-versions/${platform}`, {
        version: record.version,
        playStoreUrl: record.playStoreUrl,
        forceUpdate: record.forceUpdate
      });
      if (res.data.success) {
        setAppVersions(prev => prev.map(v => v.platform === platform ? res.data.version : v));
      }
    } catch (e) {
      alert('Failed to update version');
    } finally {
      setVersionSaving(null);
    }
  };

  const handleSettingsUpdate = async () => {
    setSettingsSaving(true);
    try {
      const res = await api.put('/admin/settings', systemSettings);
      if (res.data.success) {
        alert('System settings updated successfully!');
      }
    } catch (e) {
      alert('Failed to update system settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/v1/admin/profile');
        if (res.data.success) {
          setProfile(res.data.admin);
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setStatus({ type: 'error', message: 'New passwords do not match!' });
      return;
    }
    if (passwords.new.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters!' });
      return;
    }

    setUpdating(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await axios.put('http://localhost:5000/api/v1/admin/update-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });

      if (res.data.success) {
        setStatus({ type: 'success', message: 'Password updated successfully!' });
        setPasswords({ current: '', new: '', confirm: '' });
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Error updating password' 
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">System Settings</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage administrative security and account preferences</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
           <Shield className="text-emerald-500" size={16} />
           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Security Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
               <User className="text-emerald-500" size={32} />
            </div>
            <h3 className="font-black text-lg text-[var(--text-primary)]">{profile?.name}</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">{profile?.role}</span>
            <p className="text-xs text-[var(--text-tertiary)] font-medium">{profile?.email}</p>
          </motion.div>
        </div>

        {/* Change Password Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--border-subtle)]">
            <Lock className="text-emerald-500" size={20} />
            <h2 className="font-black text-[var(--text-primary)] uppercase tracking-wider">Security Credentials</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-1">Current Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={16} />
                <input 
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-1">New Password</label>
                <input 
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl py-3 px-4 outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                  placeholder="New password"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] ml-1">Confirm New Password</label>
                <input 
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl py-3 px-4 outline-none focus:border-emerald-500 transition-all text-sm font-medium"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            {status.message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-3 p-4 rounded-xl text-xs font-bold ${
                  status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}
              >
                {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {status.message}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={updating}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${
                updating 
                  ? 'bg-[var(--border-subtle)] text-[var(--text-tertiary)] cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30'
              }`}
            >
              {updating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  Update Credentials
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* App Version Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--border-subtle)]">
          <Smartphone className="text-emerald-500" size={20} />
          <div>
            <h2 className="font-black text-[var(--text-primary)] uppercase tracking-wider">App Version Control</h2>
            <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-0.5">Manage Play Store update prompts for Rider & Franchise apps</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['rider', 'franchise'].map(platform => {
            const record = appVersions.find(v => v.platform === platform) || { version: '1.0.0', playStoreUrl: '', forceUpdate: true };
            return (
              <div key={platform} className="p-5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                      {platform === 'rider' ? 'Rider App' : 'Franchise App'}
                    </span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                    v{record.version}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Latest Version</label>
                    <input
                      type="text"
                      value={record.version}
                      onChange={(e) => setAppVersions(prev => prev.map(v => v.platform === platform ? { ...v, version: e.target.value } : v))}
                      placeholder="e.g. 1.0.1"
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg py-2 px-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Play Store URL</label>
                    <input
                      type="text"
                      value={record.playStoreUrl}
                      onChange={(e) => setAppVersions(prev => prev.map(v => v.platform === platform ? { ...v, playStoreUrl: e.target.value } : v))}
                      placeholder="https://play.google.com/store/apps/..."
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg py-2 px-3 text-[10px] font-bold outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Force Update</label>
                    <button
                      type="button"
                      onClick={() => setAppVersions(prev => prev.map(v => v.platform === platform ? { ...v, forceUpdate: !v.forceUpdate } : v))}
                      className={`w-10 h-5 rounded-full transition-all relative ${record.forceUpdate ? 'bg-emerald-500' : 'bg-[var(--border-subtle)]'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${record.forceUpdate ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleVersionUpdate(platform)}
                  disabled={versionSaving === platform}
                  className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {versionSaving === platform ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Save size={12} /> Save Version</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Platform Parameters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--border-subtle)]">
          <Database className="text-emerald-500" size={20} />
          <div>
            <h2 className="font-black text-[var(--text-primary)] uppercase tracking-wider">Platform Parameters</h2>
            <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-0.5">Manage global variables and monetary thresholds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl space-y-4">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Security Deposit Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">₹</span>
                <input
                  type="number"
                  value={systemSettings.securityDepositAmount}
                  onChange={(e) => setSystemSettings({ ...systemSettings, securityDepositAmount: Number(e.target.value) })}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg py-2 pl-8 pr-3 text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSettingsUpdate}
              disabled={settingsSaving}
              className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {settingsSaving ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={12} /> Save Settings</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
