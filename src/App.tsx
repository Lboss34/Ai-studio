/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  ShieldAlert, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  DollarSign, 
  Wallet, 
  RefreshCw, 
  Key, 
  Users, 
  Layers, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Copy, 
  Coins, 
  ExternalLink, 
  Activity, 
  Network,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Lock,
  Unlock,
  Radio
} from 'lucide-react';
import Header from './components/Header';
import AuthForm from './components/AuthForm';
import { User, QuizQuestion, DatabaseMetrics } from './types';

export default function App() {
  // Session User
  const [user, setUser] = useState<User | null>(null);
  
  // Tab Routing
  const [activeTab, setActiveTab] = useState<string>('quiz');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Quiz interactive state
  const [quizQuestion, setQuizQuestion] = useState<any | null>(null);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<any | null>(null);

  // Upgrade form state
  const [customTxId, setCustomTxId] = useState<string>('');
  const [upgradeLoading, setUpgradeLoading] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Admin access & panel status
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string>('');
  const [adminMetrics, setAdminMetrics] = useState<DatabaseMetrics | null>(null);
  const [adminUsersList, setAdminUsersList] = useState<User[]>([]);
  const [adminActionLoading, setAdminActionLoading] = useState<string | null>(null);

  // Manual Override Inputs (index-mapped or email-mapped)
  const [overrideInputs, setOverrideInputs] = useState<Record<string, { balance: string; tasks: string }>>({});

  // Simulated live blockchain feed for a pristine bento experience
  const [blockNumber, setBlockNumber] = useState<number>(39841297);
  const [gasPrice, setGasPrice] = useState<string>('3.01');

  // Load user from localStorage on start
  useEffect(() => {
    const savedUser = localStorage.getItem('elite_auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Sync user state immediately with backend
        syncUserState(parsed.email);
      } catch (err) {
        localStorage.removeItem('elite_auth_user');
      }
    }

    // Check if path is /admin
    if (window.location.pathname.includes('admin')) {
      setIsAdminMode(true);
    }

    // Live blockchain simulator
    const interval = setInterval(() => {
      setBlockNumber(prev => prev + 1);
      setGasPrice((3.00 + Math.random() * 0.15).toFixed(2));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Fetch / Sync state from server
  const syncUserState = async (email: string) => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('elite_auth_user', JSON.stringify(data.user));
      }
    } catch (e) {
      console.error('Error syncing user state', e);
    }
  };

  // Keep Quiz synced when tasksCompleted or user changes
  useEffect(() => {
    if (user && activeTab === 'quiz') {
      fetchCurrentQuestion();
    }
  }, [user?.tasksCompleted, activeTab, user?.email]);

  // Fetch current question for the user
  const fetchCurrentQuestion = async () => {
    if (!user) return;
    setQuizLoading(true);
    try {
      const res = await fetch(`/api/quiz/question?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setQuizQuestion(data);
        // Reset sub states
        setSelectedOption(null);
        setHasSubmitted(false);
        setSubmitResult(null);
      }
    } catch (err) {
      console.error('Error loading question', err);
    } finally {
      setQuizLoading(false);
    }
  };

  // Submit Answer to server
  const handleQuizSubmit = async () => {
    if (!user || selectedOption === null || hasSubmitted) return;
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          selectedIndex: selectedOption
        })
      });
      const data = await res.json();
      setSubmitResult(data);
      setHasSubmitted(true);

      // Refresh user states
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('elite_auth_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Error sending quiz submission', err);
    }
  };

  // Submit Upgrade TxID
  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !customTxId.trim()) return;
    
    setUpgradeLoading(true);
    try {
      const res = await fetch('/api/upgrade/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          customTxId: customTxId.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('elite_auth_user', JSON.stringify(data.user));
        setCustomTxId('');
        alert('تم إرسال طلب الترقية بنجاح! جاري المراجعة بكتل البلوكشين.');
      } else {
        alert(data.error || 'فشل إرسال الطلب');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ أثناء إرسال المعاملة');
    } finally {
      setUpgradeLoading(false);
    }
  };

  // User auth handler
  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem('elite_auth_user', JSON.stringify(authenticatedUser));
    syncUserState(authenticatedUser.email);
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('elite_auth_user');
    setIsAdminMode(false);
    setIsAdminAuthenticated(false);
    setAdminPasscode('');
    setActiveTab('quiz');
  };

  // Admin Access request
  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    try {
      // Test admin metrics to verify passcode
      const res = await fetch('/api/admin/metrics', {
        headers: {
          'x-admin-passcode': adminPasscode
        }
      });
      if (res.ok) {
        setIsAdminAuthenticated(true);
        fetchAdminData();
      } else {
        const err = await res.json();
        setAdminError(err.error || 'رمز مرور خاطئ بالخادم');
      }
    } catch (e) {
      setAdminError('فشل الاتصال بالخادم للتحقق من الصلاحيات');
    }
  };

  const fetchAdminData = async () => {
    try {
      // Metrics
      const mRes = await fetch('/api/admin/metrics', {
        headers: { 'x-admin-passcode': adminPasscode }
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        setAdminMetrics(mData);
      }

      // Users
      const uRes = await fetch('/api/admin/users', {
        headers: { 'x-admin-passcode': adminPasscode }
      });
      if (uRes.ok) {
        const uData = await uRes.json();
        setAdminUsersList(uData.users);

        // Prepopulate overrides state
        const initialInputs: Record<string, { balance: string; tasks: string }> = {};
        uData.users.forEach((u: User) => {
          initialInputs[u.email] = {
            balance: u.balance.toString(),
            tasks: u.tasksCompleted.toString()
          };
        });
        setOverrideInputs(initialInputs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Approvals/Rejections/Overrides
  const changeUpgradeStatus = async (userEmail: string, action: 'approve' | 'reject') => {
    setAdminActionLoading(userEmail + '-' + action);
    try {
      const res = await fetch(`/api/admin/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': adminPasscode
        },
        body: JSON.stringify({ userEmail })
      });
      if (res.ok) {
        await fetchAdminData();
        // If current user is modified, sync their local UI state as well
        if (user && user.email.toLowerCase() === userEmail.toLowerCase()) {
          syncUserState(user.email);
        }
      } else {
        alert('فشلت العملية على الخادم');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdminActionLoading(null);
    }
  };

  const handleManualOverride = async (userEmail: string) => {
    const vals = overrideInputs[userEmail];
    if (!vals) return;
    setAdminActionLoading(userEmail + '-override');
    try {
      const res = await fetch('/api/admin/override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': adminPasscode
        },
        body: JSON.stringify({
          userEmail,
          newBalance: vals.balance,
          newTasksCompleted: vals.tasks
        })
      });
      if (res.ok) {
        alert('تم تحديث بيانات العضو بنجاح!');
        await fetchAdminData();
        if (user && user.email.toLowerCase() === userEmail.toLowerCase()) {
          syncUserState(user.email);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'فشل التعديل اليدوي');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdminActionLoading(null);
    }
  };

  // Helper copy to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => {
      setCopyFeedback(false);
    }, 2000);
  };

  // Withdraw simulation states for high fidelity
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>('');
  const [withdrawSuccessState, setWithdrawSuccessState] = useState<boolean>(false);
  const [withdrawTxMsg, setWithdrawTxMsg] = useState<string>('');
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);

  const handleWithdrawRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAddress.startsWith('0x') || withdrawAddress.length < 30) {
      alert('الرجاء إدخال عنوان محفظة BEP-20 (BNB Smart Chain) صحيح يبدأ بـ 0x');
      return;
    }
    const amt = parseFloat(withdrawAmountInput);
    if (isNaN(amt) || amt <= 0 || amt > (user?.balance || 0)) {
      alert('الرجاء إدخال مبلغ سحب صحيح ومتاح في رصيدك');
      return;
    }

    setWithdrawLoading(true);
    setTimeout(() => {
      setWithdrawLoading(false);
      setWithdrawSuccessState(true);
      const generatedTx = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setWithdrawTxMsg(generatedTx);
      
      // Instantly deduct balance & Sync on server simulation
      if (user) {
        const nextBal = user.balance - amt;
        // Fire simulated override to preserve between tab switches
        fetch('/api/admin/override', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-passcode': adminPasscode || 'EliteAdmin2026'
          },
          body: JSON.stringify({
            userEmail: user.email,
            newBalance: nextBal
          })
        }).then(() => {
          syncUserState(user.email);
        });
      }
    }, 2200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans" dir="rtl" id="elite-root-layout">
      
      {/* Header element */}
      <Header 
        user={user} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6" id="bento-main-container">
        
        {/* If Not Logged In, display Auth Gate */}
        {!user && !isAdminMode && (
          <div className="flex-grow flex items-center justify-center py-12">
            <div className="w-full">
              <div className="text-center mb-6">
                <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full uppercase tracking-wider glow-amber inline-block">
                  🏛️ الاستحقاق المالي النخبوي اللامركزي
                </span>
                <h1 className="text-4xl font-extrabold text-white mt-3 font-space">
                  بوابة ثراء النخبة
                </h1>
                <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">
                  قم بإنشاء حسابك العادي، وابدأ بالإجابة على التحديات لتحقيق عوائد مادية، وقم بالترقية لنظام النخبة لتفعيل الأرصدة والسحوبات الفورية.
                </p>
              </div>
              <AuthForm onAuthSuccess={handleAuthSuccess} />
            </div>
          </div>
        )}

        {/* If Admin Mode chosen */}
        {isAdminMode && (
          <div className="w-full">
            {!isAdminAuthenticated ? (
              /* Passcode Check Panel */
              <div className="max-w-md mx-auto bg-[#111823] border border-amber-500/30 rounded-3xl p-8 mt-12 text-center shadow-xl">
                <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4">
                  <Lock className="h-7 w-7 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 font-space">لوحة المشرف المحصنة</h2>
                <p className="text-xs text-slate-400 mb-6">يرجى إدخال كلمة المرور السرية للمشرف (أو استخدام الافتراضي 'EliteAdmin2026')</p>
                
                {adminError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-xs text-red-400 rounded-xl">
                    {adminError}
                  </div>
                )}

                <form onSubmit={handleAdminVerify} className="space-y-4">
                  <input
                    type="password"
                    placeholder="رقم المرور السري الكوني"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-center text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/10"
                    id="admin-auth-submit"
                  >
                    فتح النظام والمراقبة
                  </button>
                </form>
              </div>
            ) : (
              /* Admin Authenticated Dashboard */
              <div className="space-y-6">
                
                {/* Admin Header Title */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white font-space flex items-center gap-3">
                      <span className="p-2 bg-amber-500 text-slate-950 rounded-xl"><Key className="h-6 w-6"/></span>
                      الإدارة الكونية والتحكيم المالي
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">تعديل الأرصدة يدوياً، تفعيل تراخيص BEP-20، ومراجعة سجل المستخدمين المفعلين.</p>
                  </div>
                  <button 
                    onClick={fetchAdminData}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 rounded-lg hover:border-amber-500/40 text-slate-300"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    تحديث قاعدة البيانات
                  </button>
                </div>

                {/* Database Metrics Bento Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Metric 1 */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-bold block">إجمالي الأعضاء</span>
                    <div className="flex items-baseline justify-between mt-3">
                      <span className="text-3xl font-bold text-white font-mono">{adminMetrics?.totalUsers || 0}</span>
                      <Users className="h-5 w-5 text-amber-500/80" />
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-bold block">إجمالي محصلة الأرصدة للجميع</span>
                    <div className="flex items-baseline justify-between mt-3">
                      <span className="text-3xl font-bold text-emerald-400 font-mono">${adminMetrics?.totalBalances.toFixed(2) || '0.00'}</span>
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-bold block">طلبات التفعيل المعلقة (USDT)</span>
                    <div className="flex items-baseline justify-between mt-3">
                      <span className={`text-3xl font-bold font-mono ${adminMetrics?.pendingActivations ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                        {adminMetrics?.pendingActivations || 0}
                      </span>
                      <Activity className="h-5 w-5 text-amber-400" />
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-bold block">إجمالي التحديات المعرفية المجابة</span>
                    <div className="flex items-baseline justify-between mt-3">
                      <span className="text-3xl font-bold text-slate-350 font-mono">{adminMetrics?.totalTasksCompleted || 0}</span>
                      <Layers className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>

                </div>

                {/* Priority Pending List Section */}
                <div className="bg-[#111823] border border-slate-800 rounded-3xl p-6 shadow-md">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    طلبات الترقية المتأهبة للمراجعة والتدقيق اليدوي (شبكة BEP-20)
                  </h3>

                  {adminUsersList.filter(u => u.manualDepositStatus === 'pending').length === 0 ? (
                    <div className="p-8 text-center bg-[#090e16]/60 rounded-2xl border border-dashed border-slate-850">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">لا يوجد طلبات تفعيل معلقة حالياً في طابور المعالجة.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="border-b border-slate-805 text-slate-400 uppercase font-mono">
                            <th className="py-3 px-4">المسجل</th>
                            <th className="py-3 px-4">رقم السجل / الجوال</th>
                            <th className="py-3 px-4">العنوان المعاد / TxID</th>
                            <th className="py-3 px-4">التحكم الفوري بالترقية</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {adminUsersList.filter(u => u.manualDepositStatus === 'pending').map((u) => (
                            <tr key={u.email} className="hover:bg-slate-950/40">
                              <td className="py-4 px-4 font-bold text-white">
                                {u.fullName} <br />
                                <span className="text-[10px] text-slate-500 tracking-wider font-mono">{u.email}</span>
                              </td>
                              <td className="py-4 px-4 text-slate-300 font-mono">{u.phone}</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-amber-500">{u.customTxId}</span>
                                  <button onClick={() => handleCopyToClipboard(u.customTxId)} className="p-1 hover:bg-slate-800 rounded">
                                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-4 px-4 flex gap-1.5">
                                <button
                                  onClick={() => changeUpgradeStatus(u.email, 'approve')}
                                  disabled={adminActionLoading !== null}
                                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-slate-950 hover:shadow-md transition-all text-[11px]"
                                >
                                  قبول المعاملة الفوري ✓
                                </button>
                                <button
                                  onClick={() => changeUpgradeStatus(u.email, 'reject')}
                                  disabled={adminActionLoading !== null}
                                  className="px-3 py-2 bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-all text-[11px]"
                                >
                                  رفض الطلب ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Overrides Table Row Panel */}
                <div className="bg-[#111823] border border-slate-800 rounded-3xl p-6 shadow-md">
                  <h3 className="text-lg font-bold text-white mb-2">تحديث الأرصدة وتعديل إنجاز المهام يدوياً</h3>
                  <p className="text-xs text-slate-400 mb-4">يتيح هذا القسم للمستشار تصحيح عوائد المستخدمين أو زيادة رصيدهم لتخطي Milestones لغرض الاختبار المباشر لآلية السحب.</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono">
                          <th className="py-2 px-3">العضو كلياً</th>
                          <th className="py-2 px-3 text-center">الرصيد للتعديل ($)</th>
                          <th className="py-2 px-3 text-center">عدد المهام المنجزة</th>
                          <th className="py-2 px-3">حالة الحساب</th>
                          <th className="py-2 px-3 text-left">التحكم المباشر</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {adminUsersList.map((u) => {
                          const inputVals = overrideInputs[u.email] || { balance: '0', tasks: '0' };
                          return (
                            <tr key={u.email} className="hover:bg-slate-950/40">
                              <td className="py-3 px-3 font-bold text-white">
                                {u.fullName} <br />
                                <span className="text-[10px] text-slate-500 font-mono">{u.email}</span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={inputVals.balance}
                                  onChange={(e) => {
                                    setOverrideInputs({
                                      ...overrideInputs,
                                      [u.email]: { ...inputVals, balance: e.target.value }
                                    });
                                  }}
                                  className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center font-mono text-emerald-400"
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="number"
                                  value={inputVals.tasks}
                                  onChange={(e) => {
                                    setOverrideInputs({
                                      ...overrideInputs,
                                      [u.email]: { ...inputVals, tasks: e.target.value }
                                    });
                                  }}
                                  className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center font-mono text-amber-500"
                                />
                              </td>
                              <td className="py-3 px-3">
                                {u.depositStatus ? (
                                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold">نشط مالي</span>
                                ) : (
                                  <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] font-bold">محدود عادي</span>
                                )}
                                {u.manualDepositStatus === 'pending' && (
                                  <span className="block text-[9px] text-amber-400 animate-pulse mt-1">تأكيد معلق بالبلوكشين</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-[10px] text-left">
                                <button
                                  onClick={() => handleManualOverride(u.email)}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/30 text-white rounded font-semibold transition-all"
                                >
                                  تحديث يدوي ⚙️
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* If Logged In Standard View (Active Tabs content inside Bento layout) */}
        {user && !isAdminMode && (
          <div className="flex-grow space-y-6">
            
            {/* Dynamic Welcome Message */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80 gap-3">
              <div>
                <h2 className="text-xl font-bold text-white font-space flex items-center gap-2">
                  <span>مرحباً بك في عالم النخبة،</span>
                  <span className="text-amber-400 bg-gradient-to-l from-amber-400 to-amber-200 bg-clip-text text-transparent">{user.fullName}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  المعرف الرقمي للمحفظة: <span className="font-mono text-slate-500">{user.email}</span> • انضممت في: <span className="font-mono text-slate-500">{new Date(user.createdAt).toLocaleDateString('ar-SA')}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-[11px] font-bold bg-[#090e16]/80 text-amber-400 border border-amber-500/20 shadow-sm">
                  عقد الشبكة: BNB Smart Chain (BEP-20)
                </span>
                <span className="inline-flex items-center px-4 py-1 rounded-full text-[11px] font-bold bg-[#090e16]/80 text-emerald-400 border border-emerald-500/20 shadow-sm">
                  مستوى الصيانة: نشط ومحمي
                </span>
              </div>
            </div>

            {/* Main Bento Grid Container */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* Stat Card 1: Wallet Balance Bento (4 cols) */}
              <div className="col-span-12 lg:col-span-4 bg-[#111823] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700/60 transition-all shadow-inner">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                    <Wallet className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    {user.depositStatus ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase">
                        النخبة نشط ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase">
                        بانتظار الترقية
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-slate-400 text-xs font-bold mb-1">الرصيد المشفر المتراكم</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white font-mono leading-none">${user.balance.toFixed(2)}</span>
                    <span className="text-emerald-400 text-xs font-mono font-bold">+ ${user.tasksCompleted % 2 === 0 ? '5.00' : '3.00'} التالية</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    تتحقق أرباحك لحظياً مباشرة فور تقديم إجابة منطقية للتحدي المتسلسل اليومي.
                  </p>
                </div>
              </div>

              {/* Stat Card 2: Progress Milestone Bento (8 cols) */}
              <div className="col-span-12 lg:col-span-8 bg-[#111823] border border-amber-500/10 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden hover:border-amber-500/20 transition-all">
                <div className="absolute top-0 left-0 w-36 h-36 bg-amber-500/5 blur-[50px] pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-amber-400" />
                      الهدف والتقدم نحو تحصيل الأرباح النقدية
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      يجب إكمال 100 مهمة بنجاح، وامتلاك عضوية النخبة وتفعيلها لفتح بوابة سحب الأرصدة التراكمية.
                    </p>
                  </div>
                  <div className="text-left bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-xl">
                    <span className="text-xl font-bold text-amber-400 font-mono tracking-tighter">
                      {user.tasksCompleted} / 100
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {/* Progress Bar with glowing target */}
                  <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-l from-amber-500 to-amber-600 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all duration-300 relative"
                      style={{ width: `${Math.min(user.tasksCompleted, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%)] bg-[length:15px_15px] animate-pulse"></div>
                    </div>
                  </div>

                  {/* Level labels */}
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                    <span>بداية المسيرة الرقمية</span>
                    <span className={`${user.tasksCompleted >= 50 ? 'text-amber-500' : 'text-slate-500'}`}>منتصف المرحلة (50)</span>
                    <span className={`${user.tasksCompleted >= 100 ? 'text-emerald-400' : 'text-slate-500'} flex items-center gap-1`}>
                      {user.tasksCompleted >= 100 ? 'تم التأهيل بنجاح 🎉' : 'عتبة السحب النخبوية (100)'}
                    </span>
                  </div>
                </div>

                {/* Checklist Summary */}
                <div className="mt-4 pt-3 border-t border-slate-950/80 flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-0.5 rounded-full ${user.tasksCompleted >= 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={user.tasksCompleted >= 100 ? 'text-slate-300' : 'text-slate-500'}>
                      إكمال 100 مهمة معرفية بالصندوق (مكتمل {user.tasksCompleted}/100)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className={`p-0.5 rounded-full ${user.depositStatus ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={user.depositStatus ? 'text-slate-300' : 'text-slate-500'}>
                      تنشيط رخصة تفعيل النخبة لتدقيق الحساب (USDT)
                    </span>
                  </div>
                </div>

              </div>

              {/* Dynamic Content Switching Panels (Quiz vs Upgrade vs Stats vs Withdraw) */}
              
              {activeTab === 'quiz' && (
                <div className="col-span-12 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 min-h-[420px]" id="tab-content-quiz">
                  
                  {!user.depositStatus && user.tasksCompleted >= 5 ? (
                    <div className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-6" id="limit-lockscreen">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl scale-125 animate-pulse" />
                        <div className="relative p-6 bg-slate-950 border-2 border-amber-500/40 rounded-full text-amber-500 shadow-md">
                          <Lock className="h-10 w-10" />
                        </div>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-relaxed font-space mb-3">
                        عذراً، ينبغي تفعيل ترقيتك للمتابعة!
                      </h3>
                      
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                        لقد أكملت بنجاح كامل الحصة الترحيبية المجانية المقدرة بـ <span className="text-amber-400 font-bold">5 مهام</span> وحصلت فيها على عائد تراكمي مقدر بـ <span className="text-emerald-400 font-bold">${user.balance.toFixed(2)} USDT</span>.
                        <br />
                        <span className="text-slate-400 text-xs mt-2 block">
                          لمواصلة أداء المهام المعرفية الإضافية (وصولاً إلى 100 مهمة بالمسيرة) وتحرير بوابة السحب الآمن، يتطلب النظام تنشيط رخصة النخبة الذكية عبر أداء إيداع تفاعلي لمرة واحدة بمقدار 22.00 USDT.
                        </span>
                      </p>

                      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl w-full mb-6">
                        <div className="flex justify-around items-center gap-4 text-center">
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">رصيدك المتراكم حالياً</span>
                            <span className="text-lg font-bold text-emerald-400 font-mono">${user.balance.toFixed(2)}</span>
                          </div>
                          <div className="w-px h-8 bg-slate-800" />
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">المهام المكتملة</span>
                            <span className="text-lg font-semibold text-white">5 / 100</span>
                          </div>
                          <div className="w-px h-8 bg-slate-800" />
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">حالة الحساب الحالي</span>
                            <span className="text-xs font-bold text-amber-500 animate-pulse">مطلوب ترقية ⚠️</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                        <button
                          onClick={() => setActiveTab('upgrade')}
                          className="flex-grow py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 text-center cursor-pointer"
                          id="goto-upgrade-tab-btn"
                        >
                          تفعيل رخصة النخبة بالـ 22$ الآن 👋
                        </button>
                        <button
                          onClick={() => setActiveTab('stats')}
                          className="py-3.5 px-5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium rounded-xl transition-all text-center cursor-pointer"
                          id="goto-stats-tab-btn"
                        >
                          عرض الأرباح والإحصائيات
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Quiz Top Action row */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono font-bold">
                            التحدي رقم #{ (user.tasksCompleted + 1) }
                          </span>
                          <span className="h-4 w-px bg-slate-705" />
                          <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                            <Sparkles className="h-3.5 w-3.5" />
                            الجائزة الفورية: ${(user.tasksCompleted % 2 === 0 ? 5.00 : 3.00).toFixed(2)} USDT
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 hidden sm:block">
                          لا توجد فترات انتظار متبقية. يمكنك الإجابة بالتتالي!
                        </p>
                      </div>

                      {/* Loading overlay for quizzes */}
                      {quizLoading ? (
                        <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
                          <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                          <p className="text-sm text-slate-400 font-medium">جاري مزامنة الكتلة وسحب التحدي المالي المفتوح...</p>
                        </div>
                      ) : quizQuestion ? (
                        <div className="flex-grow flex flex-col justify-between">
                          
                          {/* Question Main heading */}
                          <div className="max-w-3xl mx-auto text-center my-6">
                            <HelpCircle className="h-8 w-8 text-amber-500/30 mx-auto mb-3" />
                            <h4 className="text-xl sm:text-2xl font-extrabold text-white leading-relaxed font-space">
                              {quizQuestion.question}
                            </h4>
                          </div>

                          {/* Options Grid Layout */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full mb-6">
                            {quizQuestion.options.map((option: string, idx: number) => {
                              let optionStyle = 'bg-slate-900/60 border-slate-800 text-slate-350 hover:bg-slate-800/40 hover:border-slate-700 hover:text-white';
                              
                              if (selectedOption === idx) {
                                optionStyle = 'bg-amber-500/10 border-amber-500 text-amber-400 ring-2 ring-amber-500/15';
                              }

                              if (hasSubmitted) {
                                // If correct result is processed
                                if (submitResult?.correct) {
                                  if (selectedOption === idx) {
                                    optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/20';
                                  }
                                } else {
                                  if (selectedOption === idx) {
                                    optionStyle = 'bg-red-500/10 border-red-500 text-red-400 ring-2 ring-red-500/20';
                                  }
                                }
                              }

                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (!hasSubmitted) {
                                      setSelectedOption(idx);
                                    }
                                  }}
                                  disabled={hasSubmitted}
                                  className={`py-4 px-5 rounded-2xl border text-right font-medium transition-all duration-150 flex items-center justify-between text-sm cursor-pointer ${optionStyle}`}
                                >
                                  <span>{option}</span>
                                  <span className="font-mono text-xs opacity-40 ml-1">
                                    {idx === 0 ? 'أ' : idx === 1 ? 'ب' : idx === 2 ? 'ج' : 'د'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Answer Feedback Alerts / Explanations */}
                          <AnimatePresence>
                            {hasSubmitted && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-5 rounded-2xl max-w-3xl mx-auto w-full border ${
                                  submitResult?.correct 
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' 
                                    : 'bg-red-500/5 border-red-500/20 text-red-300'
                                } text-right text-xs sm:text-sm space-y-2 mb-6`}
                              >
                                <div className="flex items-center gap-2 font-bold mb-1">
                                  {submitResult?.correct ? (
                                    <>
                                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                      <span>ممتاز! إجابة دقيقة وحكيمة.</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-5 w-5 text-red-400" />
                                      <span>إجابة خاطئة حالياً!</span>
                                    </>
                                  )}
                                </div>
                                <p className="leading-relaxed opacity-90">
                                  {submitResult?.correct 
                                    ? submitResult.explanation
                                    : submitResult?.message
                                  }
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Action trigger row */}
                          <div className="flex justify-center gap-4 border-t border-slate-800/60 pt-5">
                            {!hasSubmitted ? (
                              <button
                                onClick={handleQuizSubmit}
                                disabled={selectedOption === null}
                                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-950 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                              >
                                تأكيد الإجابة وإقرار المعاملة الكونية
                              </button>
                            ) : (
                              <button
                                onClick={fetchCurrentQuestion}
                                className="px-8 py-3.5 bg-slate-800 hover:bg-slate-750 font-bold text-white rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                              >
                                <span>تحميل التحدي المعرفي التالي</span>
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                        </div>
                      ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center">
                          <p className="text-sm text-slate-400">انتهت الجعبة الحالية للأسئلة بالسرور. يرجى المتابعة لاحقاً!</p>
                        </div>
                      )}
                    </>
                  )}

                </div>
              )}

              {activeTab === 'stats' && (
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="tab-content-stats">
                  
                  {/* Stats Card A: Core Status */}
                  <div className="bg-[#111823] border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between min-h-[180px] hover:border-slate-700 transition-all">
                    <div>
                      <div className="p-2 bg-amber-500/10 rounded-xl w-fit border border-amber-500/20">
                        <Coins className="h-5 w-5 text-amber-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-400 mt-4">عائدات التدريب المعرفي</h4>
                      <p className="text-2xl font-bold text-white mt-1 font-mono">${(user.balance).toFixed(2)} USDT</p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-mono block">سيبدأ السحب لحظياً بعد إنهاء 100 مهمة بالصندوق.</span>
                  </div>

                  {/* Stats Card B: Level Status */}
                  <div className="bg-[#111823] border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between min-h-[180px] hover:border-slate-700 transition-all">
                    <div>
                      <div className="p-2 bg-emerald-500/10 rounded-xl w-fit border border-emerald-500/20">
                        <ShieldCheck className="h-5 w-5 text-emerald-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-400 mt-4">ترخيص النخبة (VIP License)</h4>
                      <div className="mt-1">
                        {user.depositStatus ? (
                          <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            مفعل بالبلوكشين ✓
                          </span>
                        ) : user.manualDepositStatus === 'pending' ? (
                          <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                            معاملة معلقة جاري مراجعتها
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                            غير مفعل حالياً
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-550 mt-2 block">يتطلب الترقية دفع 22.00 USDT يدوي لعنوان المحفظة.</span>
                  </div>

                  {/* Stats Card C: Task Completeness */}
                  <div className="bg-[#111823] border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between min-h-[180px] hover:border-slate-700 transition-all">
                    <div>
                      <div className="p-2 bg-blue-500/10 rounded-xl w-fit border border-blue-500/20">
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-400 mt-4">نسبة التأهل للإنجاز الكلي</h4>
                      <p className="text-2xl font-bold text-white mt-1 font-mono">{Math.min(user.tasksCompleted, 100)}%</p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 block">المرحلة المتبقية: {Math.max(100 - user.tasksCompleted, 0)} من المهام لتأكيد الموثوقية.</span>
                  </div>

                  {/* Stats Card D: Blockchain RPC node simulator */}
                  <div className="bg-[#111823] border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between min-h-[180px] hover:border-slate-700 transition-all">
                    <div>
                      <div className="p-2 bg-slate-800 rounded-xl w-fit border border-slate-700">
                        <Radio className="h-5 w-5 text-amber-500" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-400 mt-4">عقود معالجة BSC (Live)</h4>
                      <div className="space-y-1 mt-2.5">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <span>ارتفاع الكتلة:</span>
                          <span className="font-bold text-white tracking-wider">{blockNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <span>سعر الغاز (Gwei):</span>
                          <span className="font-bold text-amber-400">{gasPrice}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-1 font-bold">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                      <span>اتصال الخادم مؤمن بالكامل بشهادة SSL</span>
                    </div>
                  </div>

                </div>
              )}

              {activeTab === 'upgrade' && (
                <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6" id="tab-content-upgrade">
                  
                  {/* Left Column: Form activation (7 cols) */}
                  <div className="lg:col-span-7 bg-[#111823] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-white font-space">
                        طلب تفعيل واشتراك رخصة النخبة (USDT)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        قم بإرسال رسوم الترقية والبالغة <span className="text-amber-400 font-bold">22.00 USDT</span> عبر شبكة <span className="text-emerald-400 font-bold">BNB Smart Chain (BEP-20)</span> إلى المحفظة الرسمية الموجودة في اللوحة الجانبية، ثم قم بتضمين رقم المعاملة للتحقق السريع.
                      </p>
                    </div>

                    {/* Step instructions */}
                    <div className="space-y-3 bg-[#090e16]/80 p-4 rounded-2xl border border-slate-850">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">خطوات المصادقة الموثقة يدويًا:</p>
                      <ul className="text-xs text-slate-300 space-y-2 list-decimal list-inside pr-1">
                        <li>احصل على العنوان الرسمي لـ EliteWealth من الحقل في اليسار.</li>
                        <li>افتح محفظتك المشفرة المفضلة (Trust Wallet, MetaMask, Binance).</li>
                        <li>ابدأ معاملة إرسال جديدة لعملة <span className="font-bold text-emerald-400">USDT</span> على شبكة <span className="font-bold text-amber-500">BEP-20</span> بمقدار <span className="font-bold text-white">22.00$</span> حصرياً.</li>
                        <li>انسخ معرف المعاملة (TxID) أو عنوان المحفظة التي قمت بالإرسال منها، وأدخله في النموذج أدناه كإثبات رسمي للدفع.</li>
                      </ul>
                    </div>

                    {/* Submit Form */}
                    <form onSubmit={handleUpgradeSubmit} className="space-y-4">
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-350 mb-1.5">
                          عنوان الإرسال الخاص بك أو رقم المعاملة على البلوكشين (TxID)
                        </label>
                        <input
                          type="text"
                          required
                          value={customTxId}
                          onChange={(e) => setCustomTxId(e.target.value)}
                          placeholder="مثال: 0x6e9f69201fcdf104b901a... أو محفظتك الشخصية"
                          className="w-full bg-[#090e16] border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                          dir="ltr"
                          id="upgrade-txid-input"
                        />
                      </div>

                      {user.manualDepositStatus === 'pending' && (
                        /* Beautiful Warning alert box */
                        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex gap-3 items-start animate-pulse" id="activation-pending-alert">
                          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-amber-200 leading-tight">
                              ⏳ انتظر قبول طلبك... يجري مطابقة المعاملة اليدوية بالبلوكشين حالياً.
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                              يقوم المدقق والمشرف بمطابقة عنوان الإرسال والتحويل في شبكة BSC، والتحقق من القيمة المدفوعة لتفعيل رخصتكم بأسرع وقت. يرجى عدم تكرار إرسال الطلبات لتجنب الغاء الترخيص.
                            </p>
                          </div>
                        </div>
                      )}

                      {user.manualDepositStatus === 'approved' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 flex gap-2 items-center">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <p className="text-xs text-emerald-300 font-bold">
                            تهانينا العارمة! رخصة النخبة الخاصة بك مفعلة بشكل رسمي ومصادق بالكامل!
                          </p>
                        </div>
                      )}

                      {user.manualDepositStatus === 'rejected' && (
                        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex gap-3 items-start">
                          <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-red-300 font-bold">⚠️ تم رفض طلب الدفع السابق لعدم العثور على القيود بالبلوكشين.</p>
                            <p className="text-[10px] text-slate-400 mt-1">يرجى مراجعة المعاملة وإرسال الـ TxID الصحيح مجدداً لتفعيل العضوية.</p>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={upgradeLoading || user.manualDepositStatus === 'pending'}
                        className="w-full py-4 bg-gradient-to-l from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-extrabold rounded-2xl text-sm transition-all shadow-lg active:scale-95 cursor-pointer block text-center"
                        id="payment-submit-btn"
                      >
                        {upgradeLoading ? 'جاري إرسال المعاملة...' : 'تم الدفع وتأكيد الطلب'}
                      </button>

                    </form>

                  </div>

                  {/* Right Column: Address and quick info (5 cols) */}
                  <div className="lg:col-span-5 bg-[#111823] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest block">محفظة الاستقبال المعتمدة</h4>
                      <p className="text-xs text-slate-500 mt-0.5">قم بإرسال المقابل إلى هذا العنوان تماماً</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-4">
                      
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">الشبكة:</span>
                        <span className="text-xs text-amber-500 font-bold">BNB Smart Chain (BEP-20)</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">مبلغ التحويل الدقيق:</span>
                        <span className="text-base font-bold text-white font-mono">$22.00 USDT</span>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">عنوان محفظة الإيداع المخصصة:</span>
                        <div className="flex items-center gap-2 bg-[#090e16] p-3 rounded-xl border border-slate-850">
                          <code className="text-stone-300 text-xs font-mono select-all truncate">
                            0x456B3b925D926066b91DD3f0EC4494b6285E5a74
                          </code>
                          <button
                            onClick={() => handleCopyToClipboard('0x456B3b925D926066b91DD3f0EC4494b6285E5a74')}
                            className="p-1.5 hover:bg-slate-800 text-amber-500 rounded-lg transition-colors shrink-0"
                            title="نسخ العنوان"
                            id="copy-address-btn"
                          >
                            {copyFeedback ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        {copyFeedback && (
                          <span className="text-[10px] text-emerald-400 block mt-1 text-right">✓ تم نسخ عنوان المحفظة الذكية بنجاح</span>
                        )}
                      </div>

                    </div>

                    {/* Disclaimer text */}
                    <div className="text-[10px] text-slate-500 space-y-1.5">
                      <p>⚠️ أي إيداع على شبكات مختلفة غير مدعومة مثل TRC-20 أو Ethereum قد يؤدي لفقدان الأصول بشكل دائم في فضاء البلوكشين.</p>
                      <p>🔒 يتم تأمين ومراقبة جميع مدفوعات الرخص بواسطة مشرفي النخبة مع تدقيق دوري فوري.</p>
                    </div>

                  </div>

                </div>
              )}

              {activeTab === 'withdraw' && (
                <div className="col-span-12" id="tab-content-withdraw">
                  
                  {/* Gate check for Withdrawal (Tasks >= 100 AND activate Elite License) */}
                  { (user.tasksCompleted < 100 || !user.depositStatus) ? (
                    
                    /* Locked state layout card */
                    <div className="bg-[#111823] border border-slate-800 rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-6">
                      
                      <div className="relative mx-auto w-20 h-20 bg-amber-500/5 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
                        <Lock className="h-10 w-10 text-amber-400" />
                        <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white font-space">
                          أهلاً بك؛ بوابة السحب والإعفاء الضريبي مقفلة حالياً
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                          نظام السحب المحصن يخضع لقوانين النخبة الموثقة من المشرفين لضمان المصداقية والتحقق من إتمام مهام التدريب كاملة والتأهيل البشري.
                        </p>
                      </div>

                      {/* Display checklist status card */}
                      <div className="bg-[#090e16]/80 p-5 rounded-2xl border border-slate-850 max-w-md mx-auto space-y-3.5 text-right text-xs">
                        
                        <div className="flex justify-between items-center pb-2 border-b border-slate-900/40">
                          <span className="font-bold text-slate-400">متطلبات فتح بوابة السحب:</span>
                          <span className="text-[10px] text-amber-500 font-bold uppercase">قيد الفحص</span>
                        </div>

                        {/* Obligation 1 */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {user.tasksCompleted >= 100 ? (
                              <div className="p-0.5 rounded-full bg-emerald-500/15 text-emerald-400"><Check className="h-3 w-3" /></div>
                            ) : (
                              <div className="p-0.5 rounded-full bg-red-550/15 text-red-400 animate-pulse">✕</div>
                            )}
                            <span className={user.tasksCompleted >= 100 ? 'text-slate-350' : 'text-slate-500'}>
                              إنجاز 100 مهمة معرفية بنجاح
                            </span>
                          </div>
                          <span className="font-mono font-bold text-amber-500">{user.tasksCompleted} / 100</span>
                        </div>

                        {/* Obligation 2 */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {user.depositStatus ? (
                              <div className="p-0.5 rounded-full bg-emerald-500/15 text-emerald-400"><Check className="h-3 w-3" /></div>
                            ) : (
                              <div className="p-0.5 rounded-full bg-red-550/15 text-red-400 animate-pulse">✕</div>
                            )}
                            <span className={user.depositStatus ? 'text-slate-350' : 'text-slate-500'}>
                              تفعيل ترخيص عضوية النخبة (USDT)
                            </span>
                          </div>
                          <span className="font-semibold text-xs">
                            {user.depositStatus ? (
                              <span className="text-emerald-400">مفعل ✓</span>
                            ) : user.manualDepositStatus === 'pending' ? (
                              <span className="text-amber-400">معلق بالبلوكشين ⏳</span>
                            ) : (
                              <span className="text-red-450">غير مفعل ✕</span>
                            )}
                          </span>
                        </div>

                      </div>

                      <div className="pt-2">
                        {!user.depositStatus ? (
                          <button
                            onClick={() => setActiveTab('upgrade')}
                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
                          >
                            اذهب لتفعيل تراخيص النخبة الآن
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTab('quiz')}
                            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
                          >
                            متابعة الإجابة على التحديات ({user.tasksCompleted}/100)
                          </button>
                        )}
                      </div>

                    </div>

                  ) : (
                    
                    /* Unlocked withdrawal layout */
                    <div className="bg-[#111823] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
                      
                      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                          <Unlock className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white font-space">
                            تهانينا العارمة! بوابة السحب والتمويل مفتوحة بالكامل
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            لقد اجتزت التقييم وبوابة الفلترة بنجاح. يمكنك الآن تحويل أرباحك إلى أي محفظة تدعم شبكة BNB Smart Chain.
                          </p>
                        </div>
                      </div>

                      {withdrawSuccessState ? (
                        /* Withdrawal success simulation state */
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                          <div>
                            <h4 className="text-lg font-bold text-emerald-300">تمت معالجة أمر الصرف والتحويل بنجاح!</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                              تم إرسال سحوباتكم النقدية بنجاح إلى شبكة البلوكشين. يرجى انتظار تأكيدات الكتل بالبلوكشين للظهور في محفظتكم الذكية.
                            </p>
                          </div>

                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 max-w-md mx-auto text-right space-y-2 text-xs font-mono">
                            <div className="flex justify-between">
                              <span className="text-slate-500">مبلغ التحويل:</span>
                              <span className="text-white font-bold">${withdrawAmountInput} USDT</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">الشبكة:</span>
                              <span className="text-amber-500">BNB Smart Chain (BEP-20)</span>
                            </div>
                            <div className="flex flex-col gap-1 pt-2 border-t border-slate-900">
                              <span className="text-slate-500 text-[10px]">معرف المعاملة (TxID):</span>
                              <span className="text-emerald-400 text-[10px] break-all">{withdrawTxMsg}</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              setWithdrawSuccessState(false);
                              setWithdrawAddress('');
                              setWithdrawAmountInput('');
                            }}
                            className="px-6 py-2 bg-slate-800 text-stone-300 hover:text-white rounded-lg text-xs"
                          >
                            طلب عملية سحب أخرى
                          </button>
                        </div>
                      ) : (
                        /* Request withdrawal form */
                        <form onSubmit={handleWithdrawRequest} className="space-y-4">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Available to withdraw balance display */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
                              <span className="text-xs text-slate-450 block font-semibold">الرصيد الكلي القابل للصرف:</span>
                              <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-3">${user.balance.toFixed(2)}</p>
                              <span className="text-[10px] text-slate-650 mt-2">مستحقات المهام المكتملة {user.tasksCompleted} تحدي بالبوابة.</span>
                            </div>

                            {/* Payout constraints card */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs text-slate-450 space-y-1">
                              <p className="font-bold text-slate-300 mb-1">تعليمات السحب الفوري:</p>
                              <p>• الحد الأدنى لكل طلب هو 10$ USDT.</p>
                              <p>• لا توجد أي عمولات إضافية من نظام النخبة.</p>
                              <p>• المعالجة تجري تلقائياً عبر العقود الذكية خلال 30 دقيقة كحد أقصى.</p>
                            </div>

                          </div>

                          {/* Inputs */}
                          <div className="space-y-4 pt-2">
                            
                            <div>
                              <label className="block text-xs font-semibold text-slate-350 mb-1.5">
                                عنوان محفظتك لاستقبال أرباح الـ USDT (BEP-20 Network)
                              </label>
                              <input
                                type="text"
                                required
                                value={withdrawAddress}
                                onChange={(e) => setWithdrawAddress(e.target.value)}
                                placeholder="ابدأ بـ 0x... واكتب عنوان المحفظة بدقة"
                                className="w-full bg-[#090e16] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                                dir="ltr"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-355 mb-1.5">
                                المبلغ المراد إخراجه وصرفه بالدولار الرقمي ($)
                              </label>
                              <input
                                type="number"
                                required
                                min="10"
                                step="0.01"
                                max={user.balance}
                                value={withdrawAmountInput}
                                onChange={(e) => setWithdrawAmountInput(e.target.value)}
                                placeholder="مثال: 50.00"
                                className="w-full bg-[#090e16] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                                dir="ltr"
                              />
                            </div>

                          </div>

                          <button
                            type="submit"
                            disabled={withdrawLoading}
                            className="w-full py-4 bg-gradient-to-l from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 disabled:opacity-40 text-stone-950 font-extrabold rounded-2xl text-sm transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                          >
                            {withdrawLoading ? (
                              <>
                                <span className="inline-block h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                <span>جاري تفعيل العقد الذكي وإطلاق الأصول...</span>
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="h-4 w-4" />
                                <span>تأكيد طلب السحب وتحويل الأرصدة فوراً</span>
                              </>
                            )}
                          </button>

                        </form>
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Footer Element */}
      <footer className="border-t border-slate-900 bg-[#070a11] py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-550 gap-3">
          
          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span>اتصال الخادم المالي آمن بقوة SSL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span>نظام البلوكشين نشط ومستقر</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500">
            EliteWealth v4.2.0-Cosmic &copy; 2026 جميع الحقوق محفوظة لـ "بوابة ثراء النخبة"
          </div>

        </div>
      </footer>

    </div>
  );
}
