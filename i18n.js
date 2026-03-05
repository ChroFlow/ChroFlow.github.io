/* ChroFlow i18n — All user-facing strings
 * Key convention: section.element[.modifier] (flat dot notation)
 * To add a language: add a new top-level key (e.g. "zh": { ... })
 * Engine lives in main.js → applyTranslations(lang)
 */
const I18N = {
  en: {
    /* ── Navigation ─────────────────────────────────────────── */
    "nav.features":   "Features",
    "nav.download":   "Download",
    "nav.pricing":    "Pricing",
    "nav.faq":        "FAQ",
    "nav.contact":    "Contact",

    /* ── Hero ───────────────────────────────────────────────── */
    "hero.cta":       "Download Free",

    /* ── Pain points ────────────────────────────────────────── */
    "pain.q1": "You were busy all day<br>Where did your time actually go?",
    "pain.q2": "You wrote it down<br>Why can't you find it a month later?",
    "pain.q3": "You use three apps to stay organized<br>Why does it still feel exhausting?",

    /* ── Solution intro ─────────────────────────────────────── */
    "solution.title":    "ChroFlow keeps your time & thoughts in one place",
    "solution.tagline":  "Capture freely ｜ Look back clearly ｜ Stay in flow",
    "solution.founder":  "Built by a Harvard-trained researcher, for thinkers and builders whose best work doesn't happen in meetings",

    /* ── Core features ──────────────────────────────────────── */
    "features.heading":  "How ChroFlow works",
    "features.f1.title": "Daily Notes",
    "features.f1.desc":  "Write freely, every day. Notes auto-organize by date, so your thoughts always have a home.",
    "features.f2.title": "How the Timer Works",
    "features.f2.desc":  "① Select category<br>② Add item<br>③ Start / Pause<br>④ Drag down to finish",
    "features.f3.title": "Organize by Category",
    "features.f3.desc":  "Color-coded categories | Switch in a click",
    "features.f4.title": "Daily Notes Tagged by Categories",
    "features.f4.desc":  "Images | Link | LaTeX | Todo | Code",
    "features.f5.title": "All Yout Time in A Glance",
    "features.f5.desc":  "Detailed breakdown brings you back to the scene",
    "features.f6.title": "More Insights",
    "features.f7.title": "All Your Thoughts in A Line",
    "features.f7.desc":  "High-speed Filter & Focus in one click",

    /* ── Download ───────────────────────────────────────────── */
    "download.title":    "Download ChroFlow",
    "download.sub":      "Free to start | No account required",
    "download.mac":      "Download for Mac",
    "download.mac.sub":  "Apple Silicon · macOS 13+",
    "download.win":      "Download for Windows",
    "download.win.sub":  "Windows 10+",
    "download.note":     "Intel Mac build also available.",

    /* ── Install guide ──────────────────────────────────────── */
    "guide.mac.title": "Opening ChroFlow on Mac",
    "guide.mac.note":  "Because ChroFlow is not yet on the Mac App Store, macOS will block it on the first launch. This is normal — here's how to open it in a few clicks:",
    "guide.mac.s1":    "Open the downloaded .dmg file. Drag the ChroFlow icon into the Applications folder.",
    "guide.mac.s2":    "Go to your Applications folder and double-click ChroFlow. macOS will show a warning saying it can't be opened — click OK to dismiss it.",
    "guide.mac.s3":    "Open System Settings (the gear icon in your Dock, or click the Apple menu → System Settings).",
    "guide.mac.s4":    "Click Privacy & Security in the sidebar, then scroll down. You'll see: \"ChroFlow was blocked from use because it is not from an identified developer.\" Click Open Anyway.",
    "guide.mac.s5":    "Enter your Mac password when prompted, then click Open Anyway once more.",
    "guide.mac.s6":    "ChroFlow is now open! From now on, just double-click it to launch normally.",

    "guide.win.title": "Installing ChroFlow on Windows",
    "guide.win.note":  "Windows may show a SmartScreen warning because ChroFlow is a new app. This is normal — here's how to get past it safely:",
    "guide.win.s1":    "Double-click the downloaded .exe installer.",
    "guide.win.s2":    "If a blue screen appears saying \"Windows protected your PC\", click More info (the small link near the bottom of the message).",
    "guide.win.s3":    "A Run anyway button will appear — click it to start the installer.",
    "guide.win.s4":    "Follow the installation steps. Once done, ChroFlow will appear in your Start menu.",
    "guide.win.tip":   "No system settings were changed — you don't need to adjust anything after installation.",

    /* ── Pricing ────────────────────────────────────────────── */
    "pricing.heading":       "Simple pricing",
    "pricing.sub":           "Start free | Unlock Pro when you're ready",

    "pricing.lite.name":     "Lite",
    "pricing.lite.price":    "Free",
    "pricing.lite.price.sub":"free forever",
    "pricing.lite.f1":       "4 categories",
    "pricing.lite.f2":       "20-day timeline",
    "pricing.lite.f3":       "Advanced search & filters",
    "pricing.lite.f4":       "Local storage for data privacy",
    "pricing.lite.f5":       "Relay via the cloud you choose",
    "pricing.lite.f6":       "Export report with watermark",
    "pricing.lite.cta":      "Download Free",

    "pricing.pro.name":      "Pro",
    "pricing.pro.onetime":   "One-time purchase",
    "pricing.pro.original":  "$79",
    "pricing.pro.earlybird": "Early Bird — 50% off",
    "pricing.pro.price":     "$40",
    "pricing.pro.price.sub": "lifetime access on 2 devices",
    "pricing.pro.f1":        "Everything in Lite, plus:",
    "pricing.pro.f2":        "Unlimited number of categories",
    "pricing.pro.f3":        "Unlimited timeline history",
    "pricing.pro.f4":        "Export without watermark",
    "pricing.pro.cta":       "Get Pro",
    "pricing.pro.badge":     "Most popular",

    /* ── Testimonials ───────────────────────────────────────── */
    "testimonials.heading":  "What people are saying",
    "testimonials.t1.quote": "I used to end the day wondering where all the time went. Now I just log it as I go — or fill it in at the end of the day — and the dyed calendar tells me exactly what happened.",
    "testimonials.t1.author":"— Sarah K., researcher",
    "testimonials.t2.quote": "I've lost count of how many times I wrote something down and couldn't find it weeks later. With ChroFlow I just search the timeline and it's there, with context.",
    "testimonials.t2.author":"— Marcus T., writer",
    "testimonials.t3.quote": "I had a notes app, a time tracker, and a calendar. ChroFlow replaced all three. Everything is in one place and my data stays on my machine.",
    "testimonials.t3.author":"— Yuna L., product designer",

    /* ── FAQ ────────────────────────────────────────────────── */
    "faq.heading": "Questions we get asked",
    "faq.q1.q":   "Can I import meetings from Google Calendar or Outlook?",
    "faq.q1.a":   "No — and that's intentional. Meetings are time you owe to others. ChroFlow is for the time that's yours. You can always log a meeting manually if you want it in your dyed calendar.",
    "faq.q2.q":   "Is there automatic cloud sync?",
    "faq.q2.a":   "We have no servers. Your data never passes through us. If you want to sync across devices, point them all at the same folder in your own cloud — Dropbox, iCloud, whatever you trust. ChroFlow's algorithm handles the rest, cleanly, without conflicts.",
    "faq.q3.q":   "Can I export my data?",
    "faq.q3.a":   "Yes. Any ChroLine search result can be exported as a self-contained webpage — ready to share as a weekly report or archive. Your data is plain files on your machine. You own it completely.",

    /* ── Contact ────────────────────────────────────────────── */
    "contact.heading":  "Get in touch",
    "contact.lead":     "Questions, feedback, or just want to say hello?",
    "contact.email":    "hello@chroflow.app",

    /* ── Footer ─────────────────────────────────────────────── */
    "footer.copy":    "© 2026 ChroFlow. All rights reserved.",
    "footer.privacy": "Privacy",
    "footer.contact": "Contact",
  },

  zh: {
    /* ── Navigation ─────────────────────────────────────────── */
    "nav.features":   "功能特点",
    "nav.download":   "下载",
    "nav.pricing":    "价格",
    "nav.faq":        "常见问题",
    "nav.contact":    "联系我们",

    /* ── Hero ───────────────────────────────────────────────── */
    "hero.cta":       "免费下载",

    /* ── Pain points ────────────────────────────────────────── */
    "pain.q1": "忙碌了一整天<br>时间究竟去哪了？",
    "pain.q2": "你明明记下来了<br>为什么一个月后找不到了？",
    "pain.q3": "你用了三个软件来整理日程<br>为什么还是觉得精疲力竭？",

    /* ── Solution intro ─────────────────────────────────────── */
    "solution.title":    "ChroFlow 让你的时间与思路归于一处",
    "solution.tagline":  "自由记录 ｜ 清晰回顾 ｜ 保持专注",
    "solution.founder":  "由哈佛研究者打造，专为那些最好的工作不在会议中发生的思考者与创造者",

    /* ── Core features ──────────────────────────────────────── */
    "features.heading":  "ChroFlow 如何运作",
    "features.f1.title": "每日笔记",
    "features.f1.desc":  "每天自由书写。笔记按日期自动整理，你的想法永远有个家。",
    "features.f2.title": "计时器使用方法",
    "features.f2.desc":  "① 选择分类<br>② 添加事项<br>③ 开始 / 暂停<br>④ 下滑完成",
    "features.f3.title": "按分类整理",
    "features.f3.desc":  "颜色标注分类 | 一键切换",
    "features.f4.title": "分类标注的每日笔记",
    "features.f4.desc":  "图片 | 链接 | LaTeX | 待办 | 代码",
    "features.f5.title": "一览你的所有时间",
    "features.f5.desc":  "详细的时间分解，带你重回当时的场景",
    "features.f6.title": "更多洞察",
    "features.f7.title": "一线串起你的所有思绪",
    "features.f7.desc":  "高速筛选，一键聚焦",

    /* ── Download ───────────────────────────────────────────── */
    "download.title":    "下载 ChroFlow",
    "download.sub":      "免费开始 | 无需注册账号",
    "download.mac":      "Mac 版下载",
    "download.mac.sub":  "Apple Silicon · macOS 13+",
    "download.win":      "Windows 版下载",
    "download.win.sub":  "Windows 10+",
    "download.note":     "Intel Mac 版本同样可用。",

    /* ── Install guide ──────────────────────────────────────── */
    "guide.mac.title": "在 Mac 上打开 ChroFlow",
    "guide.mac.note":  "由于 ChroFlow 尚未上架 Mac App Store，macOS 首次启动时会拦截它。这是正常现象——以下是几步打开它的方法：",
    "guide.mac.s1":    "打开下载的 .dmg 文件，将 ChroFlow 图标拖入「应用程序」文件夹。",
    "guide.mac.s2":    "前往「应用程序」文件夹，双击 ChroFlow。macOS 会显示无法打开的警告——点击「好」关闭它。",
    "guide.mac.s3":    "打开「系统设置」（Dock 中的齿轮图标，或点击苹果菜单 → 系统设置）。",
    "guide.mac.s4":    "在侧边栏点击「隐私与安全性」，向下滚动，你会看到：「ChroFlow 因来自不明身份的开发者而被阻止使用。」点击「仍要打开」。",
    "guide.mac.s5":    "在提示时输入 Mac 密码，然后再次点击「仍要打开」。",
    "guide.mac.s6":    "ChroFlow 现已打开！以后双击即可正常启动。",

    "guide.win.title": "在 Windows 上安装 ChroFlow",
    "guide.win.note":  "由于 ChroFlow 是新应用，Windows 可能会显示 SmartScreen 警告。这是正常现象——以下是安全绕过的方法：",
    "guide.win.s1":    "双击下载的 .exe 安装程序。",
    "guide.win.s2":    "如果出现蓝色屏幕显示「Windows 已保护你的电脑」，点击「更多信息」（消息底部的小链接）。",
    "guide.win.s3":    "会出现「仍要运行」按钮——点击它启动安装程序。",
    "guide.win.s4":    "按照安装步骤操作。完成后，ChroFlow 会出现在你的「开始」菜单中。",
    "guide.win.tip":   "未更改任何系统设置——安装后无需做任何调整。",

    /* ── Pricing ────────────────────────────────────────────── */
    "pricing.heading":       "简单明了的定价",
    "pricing.sub":           "免费开始 | 准备好了再升级 Pro",

    "pricing.lite.name":     "轻量版",
    "pricing.lite.price":    "免费",
    "pricing.lite.price.sub":"永久免费",
    "pricing.lite.f1":       "4 个分类",
    "pricing.lite.f2":       "20 天时间线",
    "pricing.lite.f3":       "高级搜索与筛选",
    "pricing.lite.f4":       "本地存储保护数据隐私",
    "pricing.lite.f5":       "通过你选择的云服务中转",
    "pricing.lite.f6":       "带水印导出报告",
    "pricing.lite.cta":      "免费下载",

    "pricing.pro.name":      "专业版",
    "pricing.pro.onetime":   "一次性购买",
    "pricing.pro.original":  "$79",
    "pricing.pro.earlybird": "早鸟价 — 5折",
    "pricing.pro.price":     "$40",
    "pricing.pro.price.sub": "2 台设备终身使用",
    "pricing.pro.f1":        "包含轻量版全部功能，另加：",
    "pricing.pro.f2":        "无限分类数量",
    "pricing.pro.f3":        "无限时间线历史",
    "pricing.pro.f4":        "无水印导出",
    "pricing.pro.cta":       "获取专业版",
    "pricing.pro.badge":     "最受欢迎",

    /* ── Testimonials ───────────────────────────────────────── */
    "testimonials.heading":  "用户怎么说",
    "testimonials.t1.quote": "我以前每天结束时都在想时间去哪了。现在我随手记录，或者在一天结束时补填——染色日历告诉我发生了什么。",
    "testimonials.t1.author":"— Sarah K.，研究员",
    "testimonials.t2.quote": "我记不清多少次写下了什么，却在几周后找不到。用 ChroFlow 只需搜索时间线，它就在那里，连上下文都保留着。",
    "testimonials.t2.author":"— Marcus T.，作家",
    "testimonials.t3.quote": "我曾用过笔记应用、时间追踪器和日历。ChroFlow 替代了这三个。所有内容都在一处，数据留在我的设备上。",
    "testimonials.t3.author":"— Yuna L.，产品设计师",

    /* ── FAQ ────────────────────────────────────────────────── */
    "faq.heading": "常见问题",
    "faq.q1.q":   "我可以从 Google 日历或 Outlook 导入会议吗？",
    "faq.q1.a":   "不能——这是有意为之。会议是你欠给别人的时间。ChroFlow 是为你自己的时间服务的。如果你想把会议记入染色日历，可以手动添加。",
    "faq.q2.q":   "有自动云同步吗？",
    "faq.q2.a":   "我们没有服务器。你的数据从不经过我们。如果想跨设备同步，只需将所有设备指向你自己云存储中的同一文件夹——Dropbox、iCloud，或任何你信任的服务。ChroFlow 的算法会干净利落地处理其余的事，不产生冲突。",
    "faq.q3.q":   "我可以导出数据吗？",
    "faq.q3.a":   "可以。任何 ChroLine 搜索结果都可以导出为独立网页——可作为周报或存档分享。你的数据是本地的普通文件，完全归你所有。",

    /* ── Contact ────────────────────────────────────────────── */
    "contact.heading":  "联系我们",
    "contact.lead":     "有问题、反馈，或只是想打个招呼？",
    "contact.email":    "hello@chroflow.app",

    /* ── Footer ─────────────────────────────────────────────── */
    "footer.copy":    "© 2026 ChroFlow. 保留所有权利。",
    "footer.privacy": "隐私政策",
    "footer.contact": "联系我们",
  },
};
