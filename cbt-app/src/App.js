import React, { useState, useEffect, useCallback } from 'react';

// =============== تمام داده‌ها (دقیقاً از فایل اصلی) ================
const AYAH_LIST = [
  "إِنَّ مَعَ الْعُسْرِ يُسْرًا (انشراح، ۶)",
  "وَلَا تَهِنُوا وَلَا تَحْزَنُوا (آل‌عمران، ۱۳۹)",
  "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا (طلاق، ۲)",
  "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ (طلاق، ۳)",
  "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا (انشراح، ۵-۶)",
  "رَبَّنَا لَا تُزِغْ قُلُوبَنَا (آل‌عمران، ۸)",
  "وَالَّذِينَ جَاهَدُوا فِينَا (عنکبوت، ۶۹)",
  "إِنَّ اللَّهَ لَا يُغَيِّرُ (رعد، ۱۱)",
  "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ (ضحی، ۵)",
  "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ (رعد، ۲۸)",
  "وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا (اسراء، ۸۵)",
  "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ (بقره، ۱۵۳)",
  "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ (یوسف، ۸۷)",
  "إِنَّهُ مَن يَتَّقِ وَيَصْبِرْ (یوسف، ۹۰)",
  "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا (بقره، ۲۵۰)",
  "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ (آل‌عمران، ۱۷۳)",
  "إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا (فتح، ۱)",
  "وَنُنَزِّلُ مِنَ الْقُرْآنِ (اسراء، ۸۲)",
  "وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ (یوسف، ۷۶)",
  "قُلْ هُوَ اللَّهُ أَحَدٌ (توحید، ۱)",
  "رَبَّنَا لَا تُؤَاخِذْنَا (بقره، ۲۸۶)",
  "وَمَن يُطِعِ اللَّهَ وَرَسُولَهُ (نساء، ۱۳)",
  "وَتَوَكَّلْ عَلَى اللَّهِ (احزاب، ۳)",
  "وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ (عنکبوت، ۷)",
  "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا (بقره، ۱۵۳)",
  "وَلَا تَدْعُ مَعَ اللَّهِ إِلَٰهًا آخَرَ (قصص، ۸۸)",
  "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ (نحل، ۹۰)",
  "وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا (اسراء، ۳۷)",
  "وَاخْفِضْ جَنَاحَكَ (شعراء، ۲۱۵)",
  "وَإِمَّا يَنزَغَنَّكَ مِنَ الشَّيْطَانِ (اعراف، ۲۰۰)",
  "رَبَّنَا اغْفِرْ لَنَا (حشر، ۱۰)"
];

const POEM_LIST = [
  "گهی ز درد برآید، گهی ز درمانم\nکه من به هر چه خدا خواهد، همانم",
  "چو ماهی بر لب دریا، چو مرغی بر سر شاخه\nبه امید خدا باشیم، اگر چه باشیم در سختی",
  "به امید خدا باش که هر شب سحری\nبرسد ابر کرم، بر سر هر خاکسری",
  "هر که را یار خدا باشد، چه غم از غصه‌ی روز\nکه خدا یار غم اوست در این دیر کهن",
  "دل اگر دریای درد است، خداوند کریم\nهمه را می‌کند از لطف خودش پر گهر",
  "چو دل را به خدا بسپاری، همه غمها برود\nهمه شب را به سحر تبدیل کند، این هنر است",
  "سحر خیزان که در خلوت به دریا می‌رسند\nز لطف حق همه پیدا و همه پیدا شوند",
  "من آن مرغ نیم که از قفس گریخته‌ام\nبه بال عشق، خدا را صدا می‌زنم",
  "به یاد حق دل آرام گیرد\nز غمها جان من رام گیرد",
  "اگر با خدا باشی، غم نیست\nکه او هست و غم از پیش تو رانده",
  "دل شکسته‌ام از درد غم، ولی به خدا\nکه امیدم به کرمهای تو، ای بی‌نظیر",
  "خداوند آن کند که صلاح دل ماست\nنه آنچه ما می‌خواهیم، آنچه او خواهد راست",
  "اگر از دست رفتی، دست بردار\nکه او بازت دهد، هر چند دشوار",
  "بیا تا دل به دریا زنیم و از غم رهیم\nبه یمن لطف حق، شاد و خرّم همیشیم",
  "ز چرخ فلک هیچ غم نیست مرا\nکه یار من اوست، اوست ملجأ و پناه",
  "توکل بر خدا کن، کار را ساز\nکه او داند چه نیکوست این تراز",
  "خدایا به تو رو آوردم از خلق\nکه تو هم خالق و هم رازق این خلق",
  "به یاد حق توان زیست، به یاد او توان مرد\nکه او را ذکر، درمان همه درهاست",
  "اگر غم باشد، اندک غم شمارش\nکه حق بر درد، درمان دارد بسیار",
  "چه نیکو گفتم آن عارف که: از غم\nنترس، زیرا که حق با صابران است",
  "دل اگر خسته شد، یاد خدا کن\nکه او درمان هر درد بلا کن",
  "به هر سختی که باشی، یاد حق کن\nکه او گشایش هر مشکل حق کن",
  "نه هر کس می‌دود در پی گشایش\nکه باید صبر پیشه کرد در این بوم",
  "خدایا تو مرا از خود رها کن\nکه هر جا باشم، یاد تو مرا بس",
  "بیا تا خوش دلی را پیشه سازیم\nز غمها دل به دریا بزنیم",
  "اگر تو را غمی، از یاد حق گوی\nکه حق درمان هر درد است، ای روی",
  "همه گویند که: صبر آید به کار\nکه حق صابران را دوست دارد بسیار",
  "به جز یاد تو نبود هیچ آرام\nخدایا تو بده ما را سرانجام",
  "دل از این زندگانی خسته شد باز\nکه حق باشد پناه و غمگسار",
  "به خدا بسپار خود را و دل خود\nکه او داند چه سازد با عمل خود",
  "خدایا تو بده ما را صبری\nکه تا سازیم با هر نامرادی"
];

const CBT_TASK_TEMPLATES = [
  ["ثبت خلق و خو (۱ تا ۱۰)", "شناسایی یک فکر منفی", "تمرین تنفس عمیق (۵ دقیقه)", "فعالیت لذت‌بخش", "نوشتن نکته مثبت"],
  ["ثبت خلق در ۳ بازه", "بررسی شواهد نگرانی", "آرام‌سازی عضلانی", "صحبت با دوست", "مرور اهداف"],
  ["ثبت خلق و انرژی", "جایگزینی باور منفی", "ذهن‌آگاهی (۵ دقیقه)", "قدم زدن", "نوشتن شکرگزاری"],
  ["ثبت خلق و افکار", "چالش با فکر منفی", "تنفس شمارشی", "فعالیت خلاقانه", "هدف برای فردا"],
  ["ثبت خلق و شدت", "بررسی تحریف‌ها", "شل شدن عضلات", "ارتباط با طبیعت", "جمله انگیزشی"],
  ["ثبت خلق و تنش", "تکنیک توقف فکر", "تمرکز بر لحظه حال", "کار نیک برای دیگری", "مرور دستاوردها"],
  ["ثبت خلق و خواب", "ارزیابی باور هسته‌ای", "تنفس دیافراگمی", "خواندن شعر", "برنامه فردا"]
];

const EXTRA_TASKS = [
  [{ "text": "تست جریان بصری", "type": "checkbox" }, { "text": "چند صفحه کتاب؟", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی آخرین بازمانده", "type": "checkbox" }, { "text": "چند صفحه کتاب؟", "type": "entry", "unit": "صفحه" }],
  [{ "text": "تست تشخیص اندازه", "type": "checkbox" }, { "text": "چند صفحه کتاب؟", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی ذهن متمرکز", "type": "checkbox" }, { "text": "چند صفحه کتاب؟", "type": "entry", "unit": "صفحه" }],
  [{ "text": "تست ستاره رنگین", "type": "checkbox" }, { "text": "چند صفحه کتاب؟", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی آخرین بازمانده", "type": "checkbox" }, { "text": "چند صفحه کتاب؟", "type": "entry", "unit": "صفحه" }, { "text": "فیلم ویل هانتینگ", "type": "checkbox" }],
  [{ "text": "تست جریان بصری", "type": "checkbox" }, { "text": "چند صفحه کتاب؟", "type": "entry", "unit": "صفحه" }, { "text": "فیلم دیروز", "type": "checkbox" }],
  [{ "text": "تست جریان بصری", "type": "checkbox" }, { "text": "چند صفحه کتاب تله شادمانی", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی آخرین بازمانده", "type": "checkbox" }, { "text": "چند صفحه کتاب تله شادمانی", "type": "entry", "unit": "صفحه" }],
  [{ "text": "تست تشخیص اندازه", "type": "checkbox" }, { "text": "چند صفحه کتاب تله شادمانی", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی مغز متمرکز", "type": "checkbox" }, { "text": "چند صفحه کتاب تله شادمانی", "type": "entry", "unit": "صفحه" }],
  [{ "text": "تست ستاره رنگین", "type": "checkbox" }, { "text": "چند صفحه کتاب تله شادمانی", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی آخرین بازمانده", "type": "checkbox" }, { "text": "چند صفحه کتاب تله شادمانی", "type": "entry", "unit": "صفحه" }, { "text": "فیلم همه چیز همه جا", "type": "checkbox" }],
  [{ "text": "تست جریان بصری", "type": "checkbox" }, { "text": "چند صفحه کتاب تله شادمانی", "type": "entry", "unit": "صفحه" }, { "text": "فیلم دیروز", "type": "checkbox" }],
  [{ "text": "بازی مغز متمرکز", "type": "checkbox" }, { "text": "چند صفحه کتاب راه هنرمند", "type": "entry", "unit": "صفحه" }],
  [{ "text": "تست تشخیص اندازه", "type": "checkbox" }, { "text": "چند صفحه کتاب راه هنرمند", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی آخرین بازمانده", "type": "checkbox" }, { "text": "چند صفحه کتاب راه هنرمند", "type": "entry", "unit": "صفحه" }],
  [{ "text": "تست ستاره رنگین", "type": "checkbox" }, { "text": "چند صفحه کتاب راه هنرمند", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی مغز متمرکز", "type": "checkbox" }, { "text": "چند صفحه کتاب راه هنرمند", "type": "entry", "unit": "صفحه" }],
  [{ "text": "تست جریان بصری", "type": "checkbox" }, { "text": "چند صفحه کتاب راه هنرمند", "type": "entry", "unit": "صفحه" }, { "text": "فیلم فریدا", "type": "checkbox" }],
  [{ "text": "بازی آخرین بازمانده", "type": "checkbox" }, { "text": "چند صفحه کتاب راه هنرمند", "type": "entry", "unit": "صفحه" }, { "text": "فیلم دیروز", "type": "checkbox" }],
  [{ "text": "تست تشخیص اندازه", "type": "checkbox" }, { "text": "چند صفحه کتاب ذهن فروپاشیده", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی مغز متمرکز", "type": "checkbox" }, { "text": "چند صفحه کتاب ذهن فروپاشیده", "type": "entry", "unit": "صفحه" }],
  [{ "text": "تست ستاره رنگین", "type": "checkbox" }, { "text": "چند صفحه کتاب ذهن فروپاشیده", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی آخرین بازمانده", "type": "checkbox" }, { "text": "چند صفحه کتاب ذهن فروپاشیده", "type": "entry", "unit": "صفحه" }],
  [{ "text": "تست جریان بصری", "type": "checkbox" }, { "text": "چند صفحه کتاب ذهن فروپاشیده", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی ذهن متمرکز", "type": "checkbox" }, { "text": "چند صفحه کتاب ذهن فروپاشیده", "type": "entry", "unit": "صفحه" }],
  [{ "text": "تست تشخیص اندازه", "type": "checkbox" }, { "text": "چند صفحه کتاب ذهن فروپاشیده", "type": "entry", "unit": "صفحه" }],
  [{ "text": "بازی آخرین بازمانده", "type": "checkbox" }, { "text": "چند صفحه کتاب ذهن فروپاشیده", "type": "entry", "unit": "صفحه" }],
  [{ "text": "تست ستاره رنگین", "type": "checkbox" }, { "text": "چند صفحه کتاب ذهن فروپاشیده", "type": "entry", "unit": "صفحه" }, { "text": "فیلم آریتی", "type": "checkbox" }],
  [{ "text": "بازی ذهن متمرکز", "type": "checkbox" }, { "text": "چند صفحه کتاب ذهن فروپاشیده", "type": "entry", "unit": "صفحه" }, { "text": "فیلم دیروز", "type": "checkbox" }]
];

const buildSingleData = () => {
  const data = [];
  for (let i = 0; i < 31; i++) {
    const ayah = AYAH_LIST[i % AYAH_LIST.length];
    const poem = POEM_LIST[i % POEM_LIST.length];
    const cbtTasks = CBT_TASK_TEMPLATES[i % CBT_TASK_TEMPLATES.length].map(t => ({ text: t, type: 'checkbox' }));
    const extraTasks = EXTRA_TASKS[i] || [];
    const tasks = cbtTasks.concat(extraTasks);
    data.push({ ayah, poem, tasks });
  }
  return data;
};

const buildDyadData = () => {
  return [{
    title: "جلسه ۱: آشنایی و اعتمادسازی",
    icon: "🤝",
    desc: "تمرینات جفتی برای ایجاد ارتباط مؤثر",
    tasks: [
      { text: "ثبت خلق‌وخو (هر دو نفر)", type: "checkbox" },
      { text: "تمرین جفتی: معرفی و آشنایی", type: "checkbox" },
      { text: "نوشتن یک نکته مثبت درباره شریک", type: "text" },
      { text: "گفتگوی ساختاریافته (۵ دقیقه)", type: "checkbox" },
      { text: "تکلیف مشارکتی برای جلسه بعد", type: "text" }
    ]
  }];
};

const buildGroupData = () => {
  return [{
    title: "جلسه ۱: معرفی و قوانین گروه",
    icon: "👋",
    desc: "تمرینات گروهی برای ایجاد هماهنگی",
    tasks: [
      { text: "ثبت خلق‌وخو (میانگین گروه)", type: "checkbox" },
      { text: "تمرین گروهی: معرفی اعضا", type: "checkbox" },
      { text: "نوشتن یک بازخورد برای گروه", type: "text" },
      { text: "بحث گروهی (۱۰ دقیقه)", type: "checkbox" },
      { text: "تکلیف گروهی برای جلسه بعد", type: "text" }
    ]
  }];
};

// =============== کامپوننت اصلی ================
const CBTPlanner = () => {
  const [currentProtocol, setCurrentProtocol] = useState('single');
  const [currentDay, setCurrentDay] = useState(0);
  const [progress, setProgress] = useState({});
  const [view, setView] = useState('home');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState({ show: false, message: '' });

  const getCurrentData = useCallback(() => {
    if (currentProtocol === 'single') return buildSingleData();
    if (currentProtocol === 'dyad') return buildDyadData();
    return buildGroupData();
  }, [currentProtocol]);

  const getTotalDays = useCallback(() => {
    if (currentProtocol === 'single') return 31;
    if (currentProtocol === 'dyad') return 1;
    return 1;
  }, [currentProtocol]);

  const getProtocolInfo = useCallback(() => {
    if (currentProtocol === 'single') {
      return { title: 'پلنر ۳۱ روزه CBT', icon: '🧑', subtitle: 'تمرینات شناختی-رفتاری شخصی', total: 31 };
    }
    if (currentProtocol === 'dyad') {
      return { title: 'پلنر دونفره', icon: '👫', subtitle: 'تمرینات جفتی و مشارکتی', total: 1 };
    }
    return { title: 'پلنر گروهی', icon: '👥', subtitle: 'جلسات گروهی و تعاملی', total: 1 };
  }, [currentProtocol]);

  // بارگذاری
  useEffect(() => {
    const savedProtocol = localStorage.getItem('cbt_protocol') || 'single';
    setCurrentProtocol(savedProtocol);
    const username = localStorage.getItem("username") || '';
    if (username) {
      try {
        const key = `cbt_progress_${username}_${savedProtocol}`;
        const data = localStorage.getItem(key);
        if (data) setProgress(JSON.parse(data));
      } catch (e) {}
    }
  }, []);

  // ذخیره
  useEffect(() => {
    const username = localStorage.getItem("username") || '';
    if (username && Object.keys(progress).length > 0) {
      const key = `cbt_progress_${username}_${currentProtocol}`;
      localStorage.setItem(key, JSON.stringify(progress));
    }
  }, [progress, currentProtocol]);

  // توابع
  const toggleTask = (dayIdx, taskIdx) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      if (!newProgress[dayIdx]) {
        const data = getCurrentData();
        const tasks = data[dayIdx]?.tasks || [];
        newProgress[dayIdx] = tasks.map(() => ({ done: false, value: '' }));
      }
      newProgress[dayIdx][taskIdx].done = !newProgress[dayIdx][taskIdx].done;
      return newProgress;
    });
  };

  const updateEntry = (dayIdx, taskIdx, value) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      if (!newProgress[dayIdx]) {
        const data = getCurrentData();
        const tasks = data[dayIdx]?.tasks || [];
        newProgress[dayIdx] = tasks.map(() => ({ done: false, value: '' }));
      }
      newProgress[dayIdx][taskIdx].value = value;
      return newProgress;
    });
  };

  const goToDay = (dayIdx) => {
    setCurrentDay(dayIdx);
    setView('day');
  };

  const goHome = () => setView('home');
  const goToReport = () => setView('report');
  const goToDayView = () => setView('day');
  
  const prevDay = () => {
    if (currentDay > 0) setCurrentDay(currentDay - 1);
  };
  
  const nextDay = () => {
    if (currentDay < getTotalDays() - 1) setCurrentDay(currentDay + 1);
  };

  const switchProtocol = (mode) => {
    if (mode === currentProtocol) return;
    setCurrentProtocol(mode);
    setCurrentDay(0);
    setProgress({});
    setView('home');
    const username = localStorage.getItem("username") || '';
    if (username) {
      try {
        const key = `cbt_progress_${username}_${mode}`;
        const data = localStorage.getItem(key);
        if (data) setProgress(JSON.parse(data));
      } catch (e) {}
    }
  };

  // محاسبات
  const calculateOverallProgress = () => {
    const total = getTotalDays();
    let totalTasks = 0, doneTasks = 0;
    for (let i = 0; i < total; i++) {
      const tasks = getCurrentData()[i]?.tasks || [];
      const prog = progress[i] || [];
      for (let j = 0; j < tasks.length; j++) {
        totalTasks++;
        if (prog[j]?.done || (prog[j]?.value && prog[j].value.trim() !== '')) doneTasks++;
      }
    }
    return totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;
  };

  const getDayProgress = (dayIdx) => {
    const tasks = getCurrentData()[dayIdx]?.tasks || [];
    const prog = progress[dayIdx] || [];
    let done = 0;
    for (let j = 0; j < tasks.length; j++) {
      if (prog[j]?.done || (prog[j]?.value && prog[j].value.trim() !== '')) done++;
    }
    return tasks.length > 0 ? Math.round(done / tasks.length * 100) : 0;
  };

  const calculateStats = () => {
    const total = getTotalDays();
    let totalTasks = 0, doneTasks = 0, daysCompleted = 0;
    const label = currentProtocol === 'single' ? 'روز' : 'جلسه';
    for (let dayIdx = 0; dayIdx < total; dayIdx++) {
      const tasks = getCurrentData()[dayIdx]?.tasks || [];
      const prog = progress[dayIdx] || [];
      let dayDone = 0;
      for (let j = 0; j < tasks.length; j++) {
        totalTasks++;
        if (prog[j]?.done || (prog[j]?.value && prog[j].value.trim() !== '')) {
          doneTasks++;
          dayDone++;
        }
      }
      if (dayDone === tasks.length) daysCompleted++;
    }
    const percent = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;
    let reportText = `═══════════════════════\n`;
    reportText += `${label}های کامل: ${daysCompleted} از ${total}\n`;
    reportText += `کارهای انجام شده: ${doneTasks} از ${totalTasks}\n`;
    reportText += `پیشرفت کلی: ${percent}%\n\n`;
    reportText += `───────────────\n`;
    reportText += `کارهای انجام‌نشده:\n`;
    reportText += 'همه کارها انجام شده! آفرین!';
    reportText += '\n\n═══════════════════════\n';
    reportText += 'ادامه بده!';
    return { total, totalTasks, doneTasks, daysCompleted, percent, reportText };
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    window.location.href = 'clinic.html';
  };

  const closeExitDialog = () => setShowExitDialog(false);
  const showExitDialogHandler = () => setShowExitDialog(true);

  // =============== استایل‌ها ================
  const styles = {
    container: {
      maxWidth: '500px',
      width: '100%',
      background: '#F5FBF5',
      borderRadius: '24px',
      padding: '20px',
      maxHeight: '96vh',
      overflowY: 'auto',
      boxShadow: '0 4px 16px rgba(46, 125, 50, 0.12)',
      position: 'relative',
      margin: '0 auto',
      direction: 'rtl',
      fontFamily: "'B Nazanin', 'Vazir', Tahoma, Arial, sans-serif"
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '14px',
      borderBottom: '3px solid #E8F5E9',
      marginBottom: '18px',
      position: 'relative',
    },
    backBtn: {
      background: 'none',
      border: 'none',
      padding: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      lineHeight: '1',
      outline: 'none',
      flexShrink: 0,
      zIndex: 10,
    },
    backBtnImg: {
      display: 'block',
      width: '32px',
      height: '32px',
      pointerEvents: 'none',
      userSelect: 'none',
    },
    title: {
      color: '#2E7D32',
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'center',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    },
    titleImg: {
      width: '22px',
      height: '22px',
      verticalAlign: 'middle',
    },
    reportBtn: {
      color: '#FFFFFF',
      fontSize: '14px',
      background: '#2E7D32',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      padding: '6px 14px',
      transition: 'all 0.3s ease',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    reportBtnImg: {
      width: '18px',
      height: '18px',
      verticalAlign: 'middle',
    },
    spacer: {
      width: '40px',
      flexShrink: 0,
    },
    protocolTabs: {
      display: 'flex',
      gap: '8px',
      margin: '4px 0 14px 0',
      background: '#E8F5E9',
      borderRadius: '14px',
      padding: '6px',
      border: '2px solid #A5D6A7',
    },
    protocolTab: {
      flex: 1,
      padding: '10px 6px',
      border: 'none',
      borderRadius: '10px',
      background: 'transparent',
      color: '#1B5E20',
      fontSize: '13px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center',
    },
    protocolTabActive: {
      background: '#2E7D32',
      color: 'white',
      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
    },
    tabSub: {
      display: 'block',
      fontSize: '9px',
      fontWeight: 'normal',
      opacity: 0.7,
      marginTop: '2px',
    },
    descText: {
      color: '#1B5E20',
      fontSize: '14px',
      lineHeight: '2.2',
      padding: '14px 16px',
      textAlign: 'center',
      background: '#E8F5E9',
      borderRadius: '14px',
      marginBottom: '16px',
      border: '2px solid #A5D6A7',
    },
    highlight: {
      color: '#2E7D32',
      fontWeight: 'bold',
    },
    items: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      marginTop: '8px',
    },
    itemSpan: {
      background: '#F1F8E9',
      padding: '3px 14px',
      borderRadius: '20px',
      fontSize: '13px',
      border: '1px solid #A5D6A7',
      color: '#2E7D32',
      fontWeight: 500,
    },
    dayGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '10px',
      margin: '14px 0',
    },
    dayBtn: {
      padding: '12px 4px',
      background: '#FFFFFF',
      border: '2px solid #A5D6A7',
      borderRadius: '12px',
      color: '#1B5E20',
      fontSize: '13px',
      fontWeight: 'bold',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      minHeight: '48px',
      position: 'relative',
    },
    dayBtnDone: {
      borderColor: '#2E7D32',
      background: '#E8F5E9',
    },
    smallText: {
      fontSize: '9px',
      color: '#1B5E20',
      display: 'block',
      marginTop: '2px',
      opacity: 0.6,
    },
    btn: {
      padding: '12px 20px',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minHeight: '44px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    },
    btnPrimary: {
      background: '#2E7D32',
      color: '#FFFFFF',
    },
    btnOutline: {
      background: 'transparent',
      color: '#2E7D32',
      border: '2px solid #A5D6A7',
    },
    statusBar: {
      background: '#E8F5E9',
      borderRadius: '12px',
      padding: '12px 18px',
      marginTop: '14px',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '13px',
      color: '#1B5E20',
      border: '2px solid #A5D6A7',
      fontWeight: 'bold',
    },
    score: {
      color: '#2E7D32',
      fontWeight: 'bold',
      fontSize: '15px',
      background: 'rgba(46, 125, 50, 0.1)',
      padding: '2px 14px',
      borderRadius: '20px',
    },
    ayahBox: {
      background: 'linear-gradient(135deg, #E8F5E9, #F1F8E9)',
      borderRadius: '14px',
      padding: '16px',
      textAlign: 'center',
      margin: '6px 0 10px',
      border: '2px solid #A5D6A7',
    },
    ayahText: {
      color: '#2E7D32',
      fontSize: '18px',
      fontWeight: 'bold',
      lineHeight: '2.2',
    },
    poemBox: {
      background: '#FFFFFF',
      borderRadius: '14px',
      padding: '16px',
      textAlign: 'center',
      margin: '6px 0 12px',
      border: '2px solid #A5D6A7',
    },
    poemText: {
      color: '#1B5E20',
      fontSize: '15px',
      lineHeight: '2.4',
      fontStyle: 'italic',
    },
    sessionHeaderBox: {
      background: 'linear-gradient(135deg, #E8F5E9, #F1F8E9)',
      borderRadius: '14px',
      padding: '16px',
      textAlign: 'center',
      margin: '6px 0 12px',
      border: '2px solid #A5D6A7',
    },
    sessionIcon: {
      fontSize: '32px',
      display: 'block',
      marginBottom: '4px',
    },
    sessionTitle: {
      color: '#2E7D32',
      fontSize: '18px',
      fontWeight: 'bold',
    },
    sessionDesc: {
      color: '#1B5E20',
      fontSize: '14px',
      opacity: 0.7,
      marginTop: '4px',
    },
    divider: {
      border: 'none',
      height: '2px',
      background: 'linear-gradient(to right, transparent, #A5D6A7, transparent)',
      margin: '12px 0',
    },
    tasksTitle: {
      color: '#2E7D32',
      fontSize: '16px',
      fontWeight: 'bold',
      padding: '8px 0 12px',
      textAlign: 'center',
    },
    tasksContainer: {
      padding: '0 4px',
    },
    taskItem: {
      background: '#F1F8E9',
      border: '2px solid #A5D6A7',
      borderRadius: '12px',
      padding: '12px 14px',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: 'all 0.3s ease',
    },
    taskCheckbox: {
      width: '22px',
      height: '22px',
      accentColor: '#2E7D32',
      cursor: 'pointer',
      flexShrink: 0,
      borderRadius: '6px',
    },
    taskText: {
      color: '#1B5E20',
      fontSize: '14px',
      flex: 1,
      lineHeight: '1.6',
    },
    taskTextDone: {
      color: '#2E7D32',
      textDecoration: 'line-through',
      opacity: 0.6,
    },
    taskInput: {
      flex: 1,
      padding: '6px 12px',
      background: '#FFFFFF',
      border: '2px solid #A5D6A7',
      borderRadius: '8px',
      color: '#1B5E20',
      fontSize: '13px',
      outline: 'none',
      minWidth: '50px',
      transition: 'all 0.3s ease',
    },
    unit: {
      color: '#1B5E20',
      fontSize: '12px',
      fontWeight: 'bold',
      background: '#E8F5E9',
      padding: '2px 10px',
      borderRadius: '20px',
      opacity: 0.7,
    },
    navButtons: {
      display: 'flex',
      gap: '12px',
      margin: '14px 0 10px',
    },
    reportText: {
      color: '#1B5E20',
      fontSize: '13px',
      lineHeight: '2.2',
      padding: '16px',
      background: '#E8F5E9',
      borderRadius: '14px',
      maxHeight: '380px',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap',
      border: '2px solid #A5D6A7',
      direction: 'ltr',
      textAlign: 'left',
      fontFamily: "'Courier New', monospace",
    },
    reportStats: {
      background: '#E8F5E9',
      borderRadius: '14px',
      padding: '14px',
      margin: '10px 0',
      border: '2px solid #A5D6A7',
    },
    statItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 0',
      fontSize: '14px',
      color: '#1B5E20',
    },
    statLabel: {
      fontWeight: 'bold',
    },
    statValue: {
      color: '#2E7D32',
      fontWeight: 'bold',
    },
    pageTitle: {
      color: '#2E7D32',
      fontSize: '22px',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '6px 0 12px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    pageTitleImg: {
      width: '28px',
      height: '28px',
      verticalAlign: 'middle',
    },
    exitDialogOverlay: {
      display: showExitDialog ? 'flex' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 9999,
      justifyContent: 'center',
      alignItems: 'center',
      backdropFilter: 'blur(2px)',
    },
    exitDialog: {
      background: '#F5FBF5',
      border: '2px solid #2E7D32',
      borderRadius: '16px',
      padding: '35px 30px 30px',
      maxWidth: '320px',
      width: '90%',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(46, 125, 50, 0.2)',
      position: 'relative',
      margin: '20px',
    },
    dialogTitle: {
      color: '#2E7D32',
      fontSize: '22px',
      fontWeight: 'bold',
      marginBottom: '10px',
      letterSpacing: '1px',
    },
    dialogMessage: {
      color: '#1F3B24',
      fontSize: '16px',
      marginBottom: '28px',
      lineHeight: '1.8',
    },
    dialogButtons: {
      display: 'flex',
      gap: '14px',
      justifyContent: 'center',
    },
    dialogBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      border: '1px solid #A5D6A7',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: '#F5FBF5',
      color: '#2E7D32',
    },
    dialogBtnIcon: {
      width: '20px',
      height: '20px',
    },
    saveIndicator: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#2E7D32',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      opacity: saveIndicator.show ? 1 : 0,
      transition: 'opacity 0.3s ease',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
    },
  };

  // =============== رندر ================
  return (
    <>
      <audio id="clickSound" src="audio/click.wav" preload="auto"></audio>

      {/* دیالوگ خروج */}
      <div style={styles.exitDialogOverlay}>
        <div style={styles.exitDialog}>
          <div style={styles.dialogTitle}>بازگشت به صفحه قبل</div>
          <div style={styles.dialogMessage}>آیا به صفحه قبل بازمی‌گردید؟</div>
          <div style={styles.dialogButtons}>
            <button style={{...styles.dialogBtn, background: '#2E7D32', color: '#FFFFFF'}} onClick={confirmExit}>
              <img src="check-circle.png" alt="Confirm" style={styles.dialogBtnIcon} />
              تایید
            </button>
            <button style={styles.dialogBtn} onClick={closeExitDialog}>
              <img src="cross-circle.png" alt="Cancel" style={styles.dialogBtnIcon} />
              انصراف
            </button>
          </div>
        </div>
      </div>

      {/* نشانگر ذخیره‌سازی */}
      <div style={styles.saveIndicator}>{saveIndicator.message}</div>

      {/* محتوای اصلی */}
      <div style={styles.container}>

        {/* ========== صفحه اصلی ========== */}
        {view === 'home' && (() => {
          const info = getProtocolInfo();
          const total = info.total;
          const overall = calculateOverallProgress();
          return (
            <>
              {/* هدر */}
              <div style={styles.header}>
                <button style={styles.backBtn} onClick={showExitDialogHandler}>
                  <img src="undog.png" alt="بازگشت" style={styles.backBtnImg} />
                </button>
                <span style={styles.title}>
                  <img src="calendar-week.png" alt="calendar" style={styles.titleImg} />
                  {info.icon} {info.title}
                </span>
                <button style={styles.reportBtn} onClick={goToReport}>
                  <img src="file-report.png" alt="report" style={styles.reportBtnImg} />
                  گزارش
                </button>
              </div>

              {/* تب‌های پروتکل */}
              <div style={styles.protocolTabs}>
                <button 
                  style={{...styles.protocolTab, ...(currentProtocol === 'single' ? styles.protocolTabActive : {})}} 
                  onClick={() => switchProtocol('single')}
                >
                  🧑 انفرادی
                  <span style={styles.tabSub}>۳۱ روز</span>
                </button>
                <button 
                  style={{...styles.protocolTab, ...(currentProtocol === 'dyad' ? styles.protocolTabActive : {})}} 
                  onClick={() => switchProtocol('dyad')}
                >
                  👫 دونفره
                  <span style={styles.tabSub}>۱ جلسه</span>
                </button>
                <button 
                  style={{...styles.protocolTab, ...(currentProtocol === 'group' ? styles.protocolTabActive : {})}} 
                  onClick={() => switchProtocol('group')}
                >
                  👥 گروهی
                  <span style={styles.tabSub}>۱ جلسه</span>
                </button>
              </div>

              {/* متن توضیح */}
              <div style={styles.descText}>
                <span style={styles.highlight}>{info.icon} {info.subtitle}</span>
                <div style={styles.items}>
                  <span style={styles.itemSpan}>{info.total} {currentProtocol === 'single' ? 'روز' : 'جلسه'}</span>
                  <span style={styles.itemSpan}>تمرینات {currentProtocol === 'single' ? 'شخصی' : currentProtocol === 'dyad' ? 'جفتی' : 'گروهی'}</span>
                  <span style={styles.itemSpan}>پیگیری پیشرفت</span>
                </div>
              </div>

              {/* شبکه روزها */}
              <div style={styles.dayGrid}>
                {Array.from({ length: total }, (_, i) => {
                  const tasks = getCurrentData()[i]?.tasks || [];
                  const prog = progress[i] || [];
                  const doneCount = prog.filter(t => t?.done === true || (t?.value && t.value.trim() !== '')).length;
                  const isDone = doneCount === tasks.length && tasks.length > 0;
                  const label = currentProtocol === 'single' ? `روز ${i+1}` : `جلسه ${i+1}`;
                  return (
                    <button 
                      key={i} 
                      style={{...styles.dayBtn, ...(isDone ? styles.dayBtnDone : {})}} 
                      onClick={() => goToDay(i)}
                    >
                      {label}
                      <span style={styles.smallText}>{doneCount}/{tasks.length}</span>
                      {isDone && <span style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: '#2E7D32',
                        color: 'white',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)',
                      }}>✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* دکمه گزارش */}
              <button style={{...styles.btn, ...styles.btnPrimary, width: '100%'}} onClick={goToReport}>
                <img src="file-report.png" alt="report" style={styles.reportBtnImg} />
                گزارش پیشرفت
              </button>

              {/* نوار وضعیت */}
              <div style={styles.statusBar}>
                <span>{info.total} {currentProtocol === 'single' ? 'روز' : 'جلسه'}</span>
                <span style={styles.score}>پیشرفت: {overall}%</span>
              </div>
            </>
          );
        })()}

        {/* ========== صفحه روز/جلسه ========== */}
        {view === 'day' && (() => {
          const data = getCurrentData();
          const dayData = data[currentDay];
          if (!dayData) return <div>خطا</div>;
          const tasks = dayData.tasks || [];
          const prog = progress[currentDay] || [];
          const label = currentProtocol === 'single' ? 'روز' : 'جلسه';
          return (
            <>
              {/* هدر */}
              <div style={styles.header}>
                <button style={styles.backBtn} onClick={goHome}>
                  <img src="undog.png" alt="بازگشت" style={styles.backBtnImg} />
                </button>
                <span style={styles.title}>
                  <img src="calendar-week.png" alt="calendar" style={styles.titleImg} />
                  {getProtocolInfo().icon} {label} {currentDay + 1}
                </span>
                <button style={styles.reportBtn} onClick={() => alert('گزارش روزانه')}>
                  <img src="file-report.png" alt="report" style={styles.reportBtnImg} />
                </button>
              </div>

              {/* تب‌های پروتکل */}
              <div style={styles.protocolTabs}>
                <button 
                  style={{...styles.protocolTab, ...(currentProtocol === 'single' ? styles.protocolTabActive : {})}} 
                  onClick={() => switchProtocol('single')}
                >
                  🧑 انفرادی
                  <span style={styles.tabSub}>۳۱ روز</span>
                </button>
                <button 
                  style={{...styles.protocolTab, ...(currentProtocol === 'dyad' ? styles.protocolTabActive : {})}} 
                  onClick={() => switchProtocol('dyad')}
                >
                  👫 دونفره
                  <span style={styles.tabSub}>۱ جلسه</span>
                </button>
                <button 
                  style={{...styles.protocolTab, ...(currentProtocol === 'group' ? styles.protocolTabActive : {})}} 
                  onClick={() => switchProtocol('group')}
                >
                  👥 گروهی
                  <span style={styles.tabSub}>۱ جلسه</span>
                </button>
              </div>

              {/* آیه و شعر یا جلسه */}
              {currentProtocol === 'single' ? (
                <>
                  <div style={styles.ayahBox}>
                    <div style={styles.ayahText}>{dayData.ayah || '🌸 با آرامش پیش برو'}</div>
                  </div>
                  <div style={styles.poemBox}>
                    <div style={styles.poemText}>
                      {(dayData.poem || 'هر روز فرصتی برای رشد است').split('\n').map((line, i) => (
                        <React.Fragment key={i}>{line}<br /></React.Fragment>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div style={styles.sessionHeaderBox}>
                  <span style={styles.sessionIcon}>{dayData.icon || '📋'}</span>
                  <div style={styles.sessionTitle}>{dayData.title || 'جلسه تمرین'}</div>
                  <div style={styles.sessionDesc}>{dayData.desc || 'تمرینات مشارکتی'}</div>
                </div>
              )}

              <hr style={styles.divider} />

              {/* عنوان تسک‌ها */}
              <div style={styles.tasksTitle}>
                ✅ {currentProtocol === 'single' ? 'کارهای روزانه' : currentProtocol === 'dyad' ? 'تمرینات جفتی' : 'تمرینات گروهی'}
              </div>

              {/* لیست تسک‌ها */}
              <div style={styles.tasksContainer}>
                {tasks.map((task, i) => {
                  const taskProg = prog[i] || { done: false, value: '' };
                  const done = taskProg.done || (taskProg.value && taskProg.value.trim() !== '');
                  return (
                    <div key={i} style={styles.taskItem}>
                      {task.type === 'checkbox' ? (
                        <>
                          <input
                            type="checkbox"
                            checked={done || false}
                            onChange={() => toggleTask(currentDay, i)}
                            style={styles.taskCheckbox}
                          />
                          <span style={{...styles.taskText, ...(done ? styles.taskTextDone : {})}}>
                            {task.text}
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={styles.taskText}>{task.text}</span>
                          <input
                            type="text"
                            value={taskProg.value || ''}
                            placeholder="..."
                            onChange={(e) => updateEntry(currentDay, i, e.target.value)}
                            style={styles.taskInput}
                          />
                          <span style={styles.unit}>{task.unit || ''}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* دکمه‌های ناوبری */}
              <div style={styles.navButtons}>
                <button 
                  style={{...styles.btn, ...styles.btnOutline, flex: 1}} 
                  onClick={prevDay} 
                  disabled={currentDay === 0}
                >
                  ◀ {label} قبل
                </button>
                <button 
                  style={{...styles.btn, ...styles.btnOutline, flex: 1}} 
                  onClick={nextDay} 
                  disabled={currentDay === getTotalDays() - 1}
                >
                  {label} بعد ▶
                </button>
              </div>

              {/* دکمه گزارش روز */}
              <button style={{...styles.btn, ...styles.btnPrimary, width: '100%'}} onClick={() => alert('گزارش روزانه')}>
                <img src="file-report.png" alt="report" style={styles.reportBtnImg} />
                گزارش این {label}
              </button>

              {/* نوار وضعیت */}
              <div style={styles.statusBar}>
                <span>{getProtocolInfo().icon} {label} {currentDay + 1}</span>
                <span style={styles.score}>{getDayProgress(currentDay)}%</span>
              </div>
            </>
          );
        })()}

        {/* ========== صفحه گزارش ========== */}
        {view === 'report' && (() => {
          const info = getProtocolInfo();
          const stats = calculateStats();
          const label = currentProtocol === 'single' ? 'روز' : 'جلسه';
          return (
            <>
              {/* هدر */}
              <div style={styles.header}>
                <button style={styles.backBtn} onClick={goHome}>
                  <img src="undog.png" alt="بازگشت" style={styles.backBtnImg} />
                </button>
                <span style={styles.title}>
                  <img src="file-report.png" alt="report" style={styles.titleImg} />
                  گزارش {info.title}
                </span>
                <span style={styles.spacer}></span>
              </div>

              {/* تب‌های پروتکل */}
              <div style={styles.protocolTabs}>
                <button 
                  style={{...styles.protocolTab, ...(currentProtocol === 'single' ? styles.protocolTabActive : {})}} 
                  onClick={() => switchProtocol('single')}
                >
                  🧑 انفرادی
                  <span style={styles.tabSub}>۳۱ روز</span>
                </button>
                <button 
                  style={{...styles.protocolTab, ...(currentProtocol === 'dyad' ? styles.protocolTabActive : {})}} 
                  onClick={() => switchProtocol('dyad')}
                >
                  👫 دونفره
                  <span style={styles.tabSub}>۱ جلسه</span>
                </button>
                <button 
                  style={{...styles.protocolTab, ...(currentProtocol === 'group' ? styles.protocolTabActive : {})}} 
                  onClick={() => switchProtocol('group')}
                >
                  👥 گروهی
                  <span style={styles.tabSub}>۱ جلسه</span>
                </button>
              </div>

              {/* عنوان */}
              <div style={styles.pageTitle}>
                <img src="file-report.png" alt="report" style={styles.pageTitleImg} />
                گزارش پیشرفت
              </div>

              {/* آمار */}
              <div style={styles.reportStats}>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>{label}های کامل شده</span>
                  <span style={styles.statValue}>{stats.daysCompleted} از {stats.total}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>کارهای انجام شده</span>
                  <span style={styles.statValue}>{stats.doneTasks} از {stats.totalTasks}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>پیشرفت کلی</span>
                  <span style={styles.statValue}>{stats.percent}%</span>
                </div>
              </div>

              {/* متن گزارش */}
              <div style={styles.reportText}>{stats.reportText}</div>

              {/* دکمه‌ها */}
              <div style={{ marginTop: '14px' }}>
                <button style={{...styles.btn, ...styles.btnPrimary, width: '100%'}} onClick={goHome}>
                  <img src="calendar-week.png" alt="home" style={styles.reportBtnImg} />
                  صفحه اصلی
                </button>
              </div>
              <button style={{...styles.btn, ...styles.btnOutline, width: '100%', marginTop: '8px'}} onClick={goToDayView}>
                <img src="calendar-week.png" alt="day" style={styles.reportBtnImg} />
                بازگشت به {label}
              </button>

              {/* نوار وضعیت */}
              <div style={styles.statusBar}>
                <span>گزارش</span>
                <span style={styles.score}>پیشرفت: {stats.percent}%</span>
              </div>
            </>
          );
        })()}
      </div>
    </>
  );
};

function App() {
  return <CBTPlanner />;
}

export default App;