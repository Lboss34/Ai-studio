/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, LogOut, Wallet, Rocket, Award, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
}

export default function Header({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  isAdminMode,
  setIsAdminMode
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-[#0c121e]/90 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Details */}
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/10 border border-amber-500/30 shadow-inner">
              <Rocket className="h-6 w-6 text-amber-400 rotate-45" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-l from-amber-400 via-amber-200 to-white bg-clip-text text-transparent font-space">
                EliteWealth
              </h1>
              <span className="text-[10px] text-amber-500/80 font-mono tracking-widest block text-right">
                بوابة ثراء النخبة
              </span>
            </div>
          </div>

          {/* User Status Bar & Quick Metrics */}
          {user && !isAdminMode && (
            <div className="hidden md:flex items-center space-x-reverse space-x-6">
              
              {/* Wallet Info */}
              <div className="flex items-center space-x-reverse space-x-2.5 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">الرصيد المتاح</p>
                  <p className="text-sm font-bold text-emerald-400 glow-emerald font-mono">
                    ${user.balance.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Tasks Milestone Indicator */}
              <div className="flex items-center space-x-reverse space-x-2.5 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                  <Award className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">المهام المنجزة</p>
                  <p className="text-sm font-bold text-amber-400 glow-amber font-mono">
                    {user.tasksCompleted} / 100
                  </p>
                </div>
              </div>

              {/* Elite Badge Status */}
              <div>
                {user.depositStatus ? (
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    عضوية النخبة مفعلة
                  </span>
                ) : (
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 gap-1.5 animate-pulse">
                    <UserCheck className="h-4 w-4 text-amber-400" />
                    الحساب العادي
                  </span>
                )}
              </div>

            </div>
          )}

          {/* Action buttons (Logout, Admin Gateway, Tab buttons) */}
          <div className="flex items-center space-x-reverse space-x-3">
            {user ? (
              <>
                {/* Admin Mode Toggle */}
                <button
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`text-xs px-3.5 py-2 rounded-xl border transition-all duration-300 ${
                    isAdminMode
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
                  }`}
                  id="admin-toggle-btn"
                >
                  {isAdminMode ? 'الخروج من لوحة الإشراف' : 'لوحة الإشراف'}
                </button>

                {/* Normal Logout */}
                <button
                  onClick={onLogout}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                  title="تسجيل الخروج"
                  id="logout-btn"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="text-xs text-slate-500 px-3 py-1.5 bg-slate-900/50 rounded-lg">
                بوابة آمنة ومشفرة
              </div>
            )}
          </div>

        </div>

        {/* Tab Selection Area for logged in users (Client-mode tabs only, hidden in Admin view) */}
        {user && !isAdminMode && (
          <div className="flex border-t border-slate-800/60 py-2 justify-center md:justify-start gap-1 sm:gap-2">
            {[
              { id: 'quiz', label: 'المهمة المعرفية اليومية' },
              { id: 'stats', label: 'لوحة الأرباح والمقاييس' },
              { id: 'upgrade', label: 'تفعيل تراخيص النخبة (USDT)' },
              { id: 'withdraw', label: 'سحب الأرباح التراكمية' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'text-amber-400 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
                id={`tab-select-${tab.id}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-header-tab"
                    className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

      </div>
    </header>
  );
}
