import { useState } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import { Eye, EyeOff } from 'lucide-react';

export function AnimatedInput({
  label,
  type = 'text',
  value,
  onChange,
  name,
  placeholder,
  maxLength,
  prefix,
  className = '',
  autoFocus = false,
  inputMode,
  disabled = false,
  variant = 'default', // 'default' | 'minimal'
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const baseStyles = variant === 'minimal' 
    ? (focused ? 'border-flexigo-teal' : 'border-transparent bg-transparent')
    : (focused 
        ? 'border-flexigo-teal shadow-[0_0_16px_rgba(57,255,20,0.15)] overflow-hidden' 
        : isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200 shadow-inner');

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={`block text-[10px] mb-2 font-black tracking-[0.2em] uppercase transition-colors duration-500 ${
          isDark ? 'text-gray-500' : 'text-slate-500'
        }`}>
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center rounded-xl border transition-all duration-500 ${baseStyles}`}
      >
        {prefix && (
          <span className={`pl-4 font-black select-none text-lg transition-colors duration-500 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>{prefix}</span>
        )}
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          inputMode={inputMode}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 bg-transparent px-4 py-4 outline-none text-lg font-black tracking-wider w-full transition-colors duration-500 ${
            isDark ? 'text-white placeholder:text-gray-600' : 'text-slate-900 placeholder:text-slate-400'
          }`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`pr-4 pl-2 focus:outline-none transition-colors duration-500 ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}

// OTP pin boxes
export function OTPInput({ length = 6, value, onChange }) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/, '');
    const newDigits = [...digits];
    newDigits[index] = val;
    onChange(newDigits.join(''));
    if (val && index < length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.06 }}
        >
          <input
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-2xl font-black rounded-xl outline-none transition-all duration-500 border-2 ${
              d 
                ? 'border-flexigo-teal bg-flexigo-teal/10 shadow-[0_0_12px_#39FF1444]' 
                : isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
            } ${
              isDark && d ? 'text-white' : isDark ? 'text-gray-400' : d ? 'text-slate-900' : 'text-slate-500'
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}
