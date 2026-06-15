/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

// ESM to CJS path compatibility helpers
const getCurrentFilePath = () => {
  try {
    return fileURLToPath(import.meta.url);
  } catch {
    return __filename || '';
  }
};

const getCurrentDirectoryPath = () => {
  try {
    return path.dirname(getCurrentFilePath());
  } catch {
    return __dirname || process.cwd();
  }
};

const __filenameCompat = getCurrentFilePath();
const __dirnameCompat = getCurrentDirectoryPath();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database with simple File System persistent writing
const DB_FILE = path.join(process.cwd(), 'elite_users_db.json');

// Static Arabic quiz questions configuration
const QUESTIONS_BANK = [
  {
    id: 1,
    question: "ما هو أسرع جسم كوني في الكون يعتمد على سرعة الضوء الخالصة في الفراغ الكوني؟",
    options: ["الثقوب السوداء اللامعة", "الفوتونات (جسيمات الضوء)", "الكويكبات في حزام كايبر", "المذنبات الغازية الثلجية"],
    correctIndex: 1,
    explanation: "تتحرك الفوتونات بأقصى سرعة ممكنة علمياً في الكون وهي سرعة الضوء التقريبية (300,000 كم/ثانية)."
  },
  {
    id: 2,
    question: "في عالم الكريبتو والأصول الرقمية، كم هي رسوم معاملة التحويل لشبكة BEP-20 مقارنةً بشبكات ERC-20 الأساسية؟",
    options: ["رسوم BEP-20 أقل بكثير وبأجزاء من السنت", "متطابقة تماماً وتعتمد على نفس الغاز", "رسوم BEP-20 أعلى بكثير بعشرات المرات", "كلاهما مجاني بنسبة 100% وبدون رسوم نهائياً"],
    correctIndex: 0,
    explanation: "تتميز شبكة BEP-20 (Binance Smart Chain) برسوم تحويل وعمولات غاز اقتصادية للغاية مقارنة بشبكة إيثيريوم الأساسية."
  },
  {
    id: 3,
    question: "إذا كانت محفظتك المشفرة تحتوي على 100 USDT وقمت بإرسال رسوم الترقية 22 USDT، فما هي النسبة المئوية التقريبية المتبقية في محفظتك؟",
    options: ["88% من إجمالي المحفظة", "78% من إجمالي المحفظة", "22% من إجمالي المحفظة", "50% من إجمالي المحفظة"],
    correctIndex: 1,
    explanation: "الرصيد المتبقي هو 78 USDT مما يمثل بالضبط 78% من رصيدك الأصلي البالغ 100 USDT."
  },
  {
    id: 4,
    question: "ما هو الرمز الرياضي للامركزية المالية المطلقة والاستقلال الكلي عن البنوك المركزية الكلاسيكية؟",
    options: ["أنظمة تصفح الاستثمار Web1", "قواعد بيانات الذكاء الاصطناعي الموجهة", "العملات الرقمية المشفرة الموزعة بتقنية الند-للند", "بطاقات الائتمان البلاستيكية الصادرة حكومياً"],
    correctIndex: 2,
    explanation: "العملات الرقمية المبنية على شبكات البلوكشين تحقق مبدأ الند للند لتوفير استقلال تام واستمرارية ماليّة دون سلطات وسيطة."
  },
  {
    id: 5,
    question: "إذا كان مشروع استثماري عالي النمو يحقق ربحاً يبلغ 5% يومياً بشكل تراكمي، كم يوماً يلزم تقريباً لمضاعفة رأس المال الأصلي؟",
    options: ["حوالي 5 أيام فقط لسرعة المضاعفة", "حوالي 15 يوماً طبقاً لقاعدة 72 الرياضية", "حوالي 30 يوماً متواصلة", "100 يوم على الأقل من العمل البطيء"],
    correctIndex: 1,
    explanation: "باستخدام قاعدة 72 التراكمية، فإن (72 تقسيم 5) يعطي حوالي 14.4 يوماً لمضاعفة رصيدك بالكامل."
  },
  {
    id: 6,
    question: "في شبكة البلوكشين الذكية لمجموعة BNB Smart Chain، ما هو معيار التوكن الأساسي المعتمد للتحويلات اليدوية السريعة؟",
    options: ["ERC-20 (إيثيريوم الأم)", "BEP-20 (سلسلة بي إن بي)", "TRC-20 (سلسلة ترون المخصصة)", "ERC-721 (الرموز الفريدة)"],
    correctIndex: 1,
    explanation: "معيار BEP-20 هو المعيار الافتراضي الصادر عن BNB Smart Chain لتداول ونقل الأصول والعملات المستقرة كـ USDT."
  },
  {
    id: 7,
    question: "ما هو المفهوم الحقيقي لعملية تعدين العملات الرقمية لإنتاج كتل التجزئة (Crypto Mining)؟",
    options: ["حفر مناجم عميقة لاستخراج المعادن النفيسة", "حل خوارزميات رياضية معقدة عبر عتاد حوسبة عالي لتأمين الشبكة وتأكيد المعاملات", "تخمين الكلمات السرية للمحافظ العشوائية", "عملية طباعة نقوش ورقية مذهبة"],
    correctIndex: 1,
    explanation: "التعدين الرقمي يرتكز على بروتوكول إثبات العمل لحل التحديات الحسابية وتدقيق بلوكات المعاملات لتوليد العملة وتأمين حماية الشبكة."
  },
  {
    id: 8,
    question: "إذا كان معدل التضخم السنوي في قطاعٍ استهلاكي يبلغ 10%، فبعد كم سنة تفقد الكتلة النقدية المخزنة نصف قدرتها الشرائية الفعلية؟",
    options: ["سنتين فقط نتيجة السرعة القصوى لضرب العملة", "حوالي 7 سنوات باحتساب الفائدة التراكمية المركبة", "15 سنة هادئة", "50 سنة من التآكل البطيء في السوق"],
    correctIndex: 1,
    explanation: "وفقاً لصيغة المضاعفة والتآكل المركب (قاعدة 72): 72 مقسومة على 10 تساوي 7.2 سنة ليتراجع النصف تقريباً."
  },
  {
    id: 9,
    question: "ما هي الميزة الفائقة التي تؤمنها 'العقود الذكية' (Smart Contracts) للخدمات اللامركزية الحديثة؟",
    options: ["تتطلب إدارة ومراقبة مستمرة من موظفي البنك", "تنفذ الشروط المتفق عليها تلقائياً ودون إمكانية للتعديل أو إلغاء الوسيط البشري", "تحتاج لمصادقة كرتونية وطوابع بريدية", "تتميز بكونها قابلة للإبطال بنقرة واحدة من أي طرف منفرد"],
    correctIndex: 1,
    explanation: "تكتب العقود الذكية برمجياً على البلوكشين وتنفذ نفسها ذاتياً فور تحقق الشروط المقررة دون تدخل بشري ثالث."
  },
  {
    id: 10,
    question: "أي الكيانات المالية التالية تدير أرصدة وتعاملات بنظام الند للند (P2P) بالكامل ودون الاعتماد على خادم مركزي؟",
    options: ["البنوك التجارية وفروع الشركات الكبرى", "محافظ العملات الرقمية المشفرة اللامركزية والأجهزة المحمية بالأرقام السرية", "البورصة العقارية المركزية", "شركات التأمين التجاري الكلاسيكي"],
    correctIndex: 1,
    explanation: "المحافظ اللامركزية تتيح للند التفاعل وإرسال الأصول مع الند الآخر مباشرة عبر بروتوكولات موزعة بلا سيطرة مركزية."
  }
];

interface UserRecord {
  fullName: string;
  email: string;
  phone: string;
  balance: number;
  tasksCompleted: number;
  depositStatus: boolean;
  manualDepositStatus: 'none' | 'pending' | 'approved' | 'rejected';
  customTxId: string;
  password?: string;
  createdAt: string;
}

// Global user state initialized from file if exists
let usersDb: Record<string, UserRecord> = {};

function loadUsers() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      usersDb = JSON.parse(data);
      console.log(`Database loaded successfully with ${Object.keys(usersDb).length} users.`);
    } else {
      usersDb = {};
      fs.writeFileSync(DB_FILE, JSON.stringify(usersDb, null, 2));
    }
  } catch (err) {
    console.error('Error reading/writing DB file, relying on in-memory db', err);
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(usersDb, null, 2));
  } catch (err) {
    console.error('Error persisting database', err);
  }
}

// Initial DB load
loadUsers();

// Interface for DB operations to easily support offline JSON & Real Cloud Firestore
interface DBAdapter {
  getUser(email: string): Promise<UserRecord | null>;
  saveUser(email: string, user: UserRecord): Promise<void>;
  getAllUsers(): Promise<UserRecord[]>;
}

class JSONFileDbAdapter implements DBAdapter {
  async getUser(email: string): Promise<UserRecord | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return usersDb[normalizedEmail] || null;
  }
  async saveUser(email: string, user: UserRecord): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    usersDb[normalizedEmail] = user;
    saveUsers();
  }
  async getAllUsers(): Promise<UserRecord[]> {
    return Object.values(usersDb);
  }
}

let dbAdapter: DBAdapter = new JSONFileDbAdapter();
let isFirestoreMode = false;

async function setupDatabaseAdapter() {
  const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    try {
      const configData = fs.readFileSync(firebaseConfigPath, 'utf-8');
      const firebaseConfig = JSON.parse(configData);
      
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, doc, getDoc, setDoc, getDocs, collection } = await import('firebase/firestore');
      
      const firebaseApp = initializeApp(firebaseConfig);
      const firestore = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
      
      class FirestoreDbAdapter implements DBAdapter {
        private fsdb = firestore;
        async getUser(email: string): Promise<UserRecord | null> {
          const normalizedEmail = email.trim().toLowerCase();
          try {
            const docRef = doc(this.fsdb, 'users', normalizedEmail);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              return docSnap.data() as UserRecord;
            }
          } catch (err) {
            console.error('Error fetching user from Firestore:', err);
          }
          return null;
        }
        async saveUser(email: string, user: UserRecord): Promise<void> {
          const normalizedEmail = email.trim().toLowerCase();
          try {
            const docRef = doc(this.fsdb, 'users', normalizedEmail);
            await setDoc(docRef, user);
          } catch (err) {
            console.error('Error saving user to Firestore:', err);
            throw err;
          }
        }
        async getAllUsers(): Promise<UserRecord[]> {
          try {
            const querySnapshot = await getDocs(collection(this.fsdb, 'users'));
            const list: UserRecord[] = [];
            querySnapshot.forEach((docSnap) => {
              list.push(docSnap.data() as UserRecord);
            });
            return list;
          } catch (err) {
            console.error('Error listing users from Firestore:', err);
            return [];
          }
        }
      }
      
      const firestoreAdapter = new FirestoreDbAdapter();
      dbAdapter = firestoreAdapter;
      isFirestoreMode = true;
      console.log('✅ Connected successfully to REAL cloud database (Firestore).');
      
      // Perform automated, seamless migration from elite_users_db.json
      try {
        const localUsers = Object.values(usersDb);
        if (localUsers.length > 0) {
          console.log(`Syncing ${localUsers.length} existing users to Firebase...`);
          for (const u of localUsers) {
            const extUser = await firestoreAdapter.getUser(u.email);
            if (!extUser) {
              await firestoreAdapter.saveUser(u.email, u);
            }
          }
          console.log('🎉 Database sync & migration completed.');
        }
      } catch (migrationErr) {
        console.error('Database migration sync warning:', migrationErr);
      }
      
    } catch (err) {
      console.error('🚨 Failed to initialize Firestore SDK, falling back to local database mode:', err);
      dbAdapter = new JSONFileDbAdapter();
      isFirestoreMode = false;
    }
  } else {
    console.log('⚠️ No firebase-applet-config.json was found. Operating in local-file mode. (Please accept terms in the build assistant panel to link Firestore if needed).');
  }
}

// API REST routes
// ----------------

// Register
app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  if (!fullName || !email || !phone || !password) {
    return res.status(400).json({ error: 'الرجاء ملء جميع الحقول المطلوبة للتسجيل' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await dbAdapter.getUser(normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'عذراً، هذا البريد الإلكتروني مسجل مسبقاً لدينا' });
  }

  const newUser: UserRecord = {
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    balance: 0.00,
    tasksCompleted: 0,
    depositStatus: false,
    manualDepositStatus: 'none',
    customTxId: '',
    password: password,
    createdAt: new Date().toISOString()
  };

  await dbAdapter.saveUser(normalizedEmail, newUser);

  const { password: _, ...safeUser } = newUser;
  return res.json({ success: true, user: safeUser });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await dbAdapter.getUser(normalizedEmail);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  }

  const { password: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// Update specific task state & active user sync
app.post('/api/users/me', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'مطلوب بريد إلكتروني صالح للمزامنة' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await dbAdapter.getUser(normalizedEmail);
  if (!user) {
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  }

  const { password: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// Get quiz question based on task limit context (circular wrap)
app.get('/api/quiz/question', async (req, res) => {
  const email = (req.query.email as string || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'يرجى تسجيل الدخول للحصول على الأسئلة المعرفية' });
  }

  const user = await dbAdapter.getUser(email);
  if (!user) {
    return res.status(404).json({ error: 'المستخدم غير متوفر' });
  }

  // Enforce 5-task limit for non-upgraded users
  if (!user.depositStatus && user.tasksCompleted >= 5) {
    return res.status(403).json({ 
      error: 'LIMIT_REACHED', 
      message: 'لقد استنفدت الحد الأقصى للمهام المجانية (5 مهام). يرجى الاشتراك وتفعيل ترخيص النخبة ($22.00 USDT) لمواصلة جني الأرباح وفتح بقية المهام.' 
    });
  }

  const questionIndex = user.tasksCompleted % QUESTIONS_BANK.length;
  const currentQuestion = QUESTIONS_BANK[questionIndex];

  // Return question, options and index info, but mask correctIndex for security
  res.json({
    id: currentQuestion.id,
    question: currentQuestion.question,
    options: currentQuestion.options,
    currentIndex: user.tasksCompleted,
    rewardAmount: user.tasksCompleted % 2 === 0 ? 5.00 : 3.00
  });
});

// Submit quiz and calculate instant prize
app.post('/api/quiz/submit', async (req, res) => {
  const { email, selectedIndex } = req.body;
  if (!email || selectedIndex === undefined) {
    return res.status(400).json({ error: 'معلومات الإرسال غير كاملة' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await dbAdapter.getUser(normalizedEmail);
  if (!user) {
    return res.status(404).json({ error: 'المستخدم غير موجود بالخادم' });
  }

  // Enforce 5-task limit for non-upgraded users
  if (!user.depositStatus && user.tasksCompleted >= 5) {
    return res.status(403).json({ 
      error: 'لقد استنفدت الحد الأقصى للماهية المجانية (5 مهام). يرجى تفعيل ترخيص النخبة لمتابعة العمل والوصول لـ 100 مهمة.' 
    });
  }

  const questionIndex = user.tasksCompleted % QUESTIONS_BANK.length;
  const currentQuestion = QUESTIONS_BANK[questionIndex];

  if (selectedIndex === currentQuestion.correctIndex) {
    // Reward amount calculations: $5 even, $3 odd index
    const reward = user.tasksCompleted % 2 === 0 ? 5.00 : 3.00;
    
    user.balance += reward;
    user.tasksCompleted += 1;
    await dbAdapter.saveUser(normalizedEmail, user);

    const { password: _, ...safeUser } = user;
    return res.json({
      correct: true,
      reward,
      user: safeUser,
      explanation: currentQuestion.explanation,
      nextIndex: user.tasksCompleted
    });
  } else {
    // Wrong answer, no progress
    const { password: _, ...safeUser } = user;
    return res.json({
      correct: false,
      user: safeUser,
      message: 'إجابة خاطئة! حاول مجدداً لتحصيل الأرباح النخبوية والارتقاء في الفراغ الكوني.'
    });
  }
});

// Upgrade activation registration (BEP-20 Manual Crypto payment)
app.post('/api/upgrade/submit', async (req, res) => {
  const { email, customTxId } = req.body;
  if (!email || !customTxId) {
    return res.status(400).json({ error: 'يرجى إدخال عنوان الإرسال أو رقم المعاملة TxID بشكل صحيح' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await dbAdapter.getUser(normalizedEmail);
  if (!user) {
    return res.status(404).json({ error: 'المستخدم غير مسجل' });
  }

  user.customTxId = customTxId.trim();
  user.manualDepositStatus = 'pending';
  await dbAdapter.saveUser(normalizedEmail, user);

  const { password: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// Admin features
// ADMIN_PASSCODE environment variable fallback
const getAdminPasscode = () => {
  return process.env.ADMIN_PASSCODE || 'EliteAdmin2026';
};

// Middlewares to auth admin passcode
const adminGate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const passcode = req.headers['x-admin-passcode'] as string;
  if (passcode !== getAdminPasscode()) {
    return res.status(403).json({ error: 'غير مصرح بالدخول! رمز الأمان الكوني خاطئ.' });
  }
  next();
};

app.get('/api/admin/metrics', adminGate, async (req, res) => {
  const users = await dbAdapter.getAllUsers();
  const totalUsers = users.length;
  const totalBalances = users.reduce((acc, curr) => acc + curr.balance, 0);
  const pendingActivations = users.filter(u => u.manualDepositStatus === 'pending').length;
  const totalTasksCompleted = users.reduce((acc, curr) => acc + curr.tasksCompleted, 0);

  res.json({
    totalUsers,
    totalBalances,
    pendingActivations,
    totalTasksCompleted
  });
});

app.get('/api/admin/users', adminGate, async (req, res) => {
  const usersRaw = await dbAdapter.getAllUsers();
  const users = usersRaw.map(({ password: _, ...u }) => u);
  res.json({ users });
});

app.post('/api/admin/approve', adminGate, async (req, res) => {
  const { userEmail } = req.body;
  if (!userEmail) return res.status(400).json({ error: 'البريد الإلكتروني للمستخدم مطلوب' });

  const normalizedEmail = userEmail.trim().toLowerCase();
  const user = await dbAdapter.getUser(normalizedEmail);
  if (!user) return res.status(404).json({ error: 'المستخدم غير متوفر' });

  user.manualDepositStatus = 'approved';
  user.depositStatus = true;
  await dbAdapter.saveUser(normalizedEmail, user);

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.post('/api/admin/reject', adminGate, async (req, res) => {
  const { userEmail } = req.body;
  if (!userEmail) return res.status(400).json({ error: 'البريد الإلكتروني للمستخدم مطلوب' });

  const normalizedEmail = userEmail.trim().toLowerCase();
  const user = await dbAdapter.getUser(normalizedEmail);
  if (!user) return res.status(404).json({ error: 'المستخدم غير متوفر' });

  user.manualDepositStatus = 'rejected';
  user.depositStatus = false;
  await dbAdapter.saveUser(normalizedEmail, user);

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.post('/api/admin/override', adminGate, async (req, res) => {
  const { userEmail, newBalance, newTasksCompleted } = req.body;
  if (!userEmail) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

  const normalizedEmail = userEmail.trim().toLowerCase();
  const user = await dbAdapter.getUser(normalizedEmail);
  if (!user) return res.status(404).json({ error: 'المستخدم غير متوفر في قاعدة البيانات' });

  if (newBalance !== undefined) {
    user.balance = parseFloat(newBalance);
  }
  if (newTasksCompleted !== undefined) {
    user.tasksCompleted = parseInt(newTasksCompleted, 10);
  }

  await dbAdapter.saveUser(normalizedEmail, user);

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Setup dev and production servers
async function startServer() {
  await setupDatabaseAdapter();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EliteWealth Server starting at http://0.0.0.0:${PORT}`);
  });
}

startServer();
