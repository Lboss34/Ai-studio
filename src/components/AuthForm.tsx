/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Phone, Shield, ArrowRight, UserPlus, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleToggle = (loginState: boolean) => {
    setIsLogin(loginState);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const apiRoute = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { email, password }
      : { fullName, email, phone, password };

    try {
      const response = await fetch(apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'شيء ما سار بشكل خاطئ، يرجى المحاولة لاحقاً');
      }

      if (isLogin) {
        setSuccessMsg('تم تسجيل الدخول بنجاح! جاري التوجيه...');
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 800);
      } else {
        setSuccessMsg('تم تسجيل حسابك بنجاح! جاري تسجيل الدخول تلقائياً...');
        // Auto-login after registration
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" id="auth-panel-container">
      {/* Outer border highlighting Cosmic space */}
      <div className="bg-[#101725] rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden backdrop-blur-lg">
        
        {/* Amber space glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand visual header inside card */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4 shadow-inner">
            <Shield className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1 font-space">
            بوابة النفاذ الآمن
          </h2>
          <p className="text-xs text-slate-400">
            يرجى إدخال بيانات الاعتماد للاتصال بالشبكة التفاعلية
          </p>
        </div>

        {/* Tab Header Selector */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-900 mb-6 relative">
          <button
            type="button"
            className={`flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all ${
              isLogin ? 'text-amber-400 bg-[#162032] border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => handleToggle(true)}
            id="auth-tab-login"
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all ${
              !isLogin ? 'text-amber-400 bg-[#162032] border border-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => handleToggle(false)}
            id="auth-tab-register"
          >
            عضوية جديدة
          </button>
        </div>

        {/* Status Alerts */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-xs text-red-400 rounded-xl text-right"
              id="auth-error-alert"
            >
              ⚠️ {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 rounded-xl text-right"
              id="auth-success-alert"
            >
              ✅ {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-main-form">
          
          {/* Register-Only Fields */}
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
                    الاسم الكامل كالتالي (في الهوية المعتمدة)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                      <UserIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      className="w-full bg-[#090e16]/80 border border-slate-800 rounded-xl py-3 pr-10 pl-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-all font-sans text-right"
                      placeholder="عبدالله محمد"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                      id="input-fullname"
                    />
                  </div>
                </div>

                {/* Telephone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
                    رقم الهاتف مع رمز الدولة
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      className="w-full bg-[#090e16]/80 border border-slate-800 rounded-xl py-3 pr-10 pl-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-all font-mono text-left"
                      placeholder="+966 50 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={!isLogin}
                      dir="ltr"
                      id="input-phone"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shared Fields (Email) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                className="w-full bg-[#090e16]/80 border border-slate-800 rounded-xl py-3 pr-10 pl-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-all font-mono text-left"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                id="input-email"
              />
            </div>
          </div>

          {/* Shared Fields (Password) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
              كلمة المرور المشفرة
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                className="w-full bg-[#090e16]/80 border border-slate-800 rounded-xl py-3 pr-10 pl-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 transition-all font-sans text-right"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="input-password"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            id="auth-submit-btn"
          >
            {loading ? (
              <span className="inline-block h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                <Key className="h-4 w-4 text-slate-950" />
                <span>دخول آمن للبوابة</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 text-slate-950" />
                <span>إنشاء وتفعيل عضوية جديدة</span>
              </>
            )}
          </button>

        </form>

        <div className="mt-6 pt-5 border-t border-slate-900 text-center">
          <p className="text-[11px] text-slate-500">
            تخضع هذه البيانات لبروتوكول تشفير معقد بقوة AES-256 لحماية النطاق الاستثماري.
          </p>
        </div>

      </div>
    </div>
  );
}
