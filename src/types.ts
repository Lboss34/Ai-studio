/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  fullName: string;
  email: string;
  phone: string;
  balance: number;
  tasksCompleted: number; // User must complete exactly 100 to unlock withdrawal
  depositStatus: boolean;  // Elite active or not
  manualDepositStatus: 'none' | 'pending' | 'approved' | 'rejected';
  customTxId: string;
  password?: string; // Stored securely in memory/db
  createdAt: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DatabaseMetrics {
  totalUsers: number;
  totalBalances: number;
  pendingActivations: number;
  totalTasksCompleted: number;
}
