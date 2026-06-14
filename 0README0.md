```markdown
<div align="center">

  <span class="text-6xl">🏎️</span>
  <h1 align="center">🏁 IRAN SLIDE ZONE 🏁</h1>
  <p align="center"><b>Premium & High-Performance Assetto Corsa Mod Hub Launcher</b></p>

  <img src="https://img.shields.io/badge/Version-3.0.0--Beta-indigo?style=for-the-badge&logo=github" alt="Version">
  <img src="https://img.shields.io/badge/Architecture-Modular%20ES6-cyan?style=for-the-badge" alt="Architecture">
  <img src="https://img.shields.io/badge/Database-Google%20Sheets%20Live-emerald?style=for-the-badge&logo=googlesheets" alt="Database">
  <img src="https://img.shields.io/badge/Theme-Pure%20Dark%20Cyberpunk-ff0055?style=for-the-badge" alt="Theme">

  <br>
  <p align="center">
    <b>پلتفرم اختصاصی، فوق‌سریع و زنده مدیریت و ویترین مودهای بهینه‌شده بازی Assetto Corsa</b>
  </p>
</div>

---

## ⚡ ویژگی‌های کلیدی پلتفرم (Key Features)

* **🌐 اتصال زنده به کلاود (Live Cloud Sync):** متصل به دیتابیس گوگل شیت به صورت بدون واسطه و آنی بدون نیاز به سرورهای گران‌قیمت Backend.
* **🧩 ساختار ماژولار و اصولی (Three-File Architecture):** تفکیک کامل لایه‌های پردازشی در قالب `index.html`، `style.css` و `app.js` جهت افزایش سرعت رندر مرورگر و کَش بهینه.
* **🕰️ پلاک هوشمند هدر (Smart Header Engine):** مجهز به ساعت دیجیتال محلی زنده ثانیه‌ای به همراه سیستم تشخیص خودکار کشور کاربر (Geo-Flag Detection) بر اساس منطقه زمانی.
* **📸 انیمیشن بُر زدن سه‌بعدی (3D Slanted Card Swapper):** سیستم لایه‌ای تعویض عکس کارت‌ها با نرخ فریم بالا و افکت نرم سینمایی $0.75s$ برای نمایش خلاقانه جزئیات مودها.
* **👑 لیدربرد مستقل ادمین‌ها (Admin Leaderboard):** شمارشگر پویا و رتبه‌بندی ادمین‌های فعال دیتابیس بر اساس تعداد پست‌ها به صورت پاپ‌آور نئونی مجزا.
* **🔊 سیستم صوتی اینتراکتیو (Web Audio API Synthesizer):** شبیه‌سازی جلوه‌های صوتی کلیک و فلیپ تصاویر به صورت فرکانسی بدون استفاده از فایل صوتی خارجی و سنگین.
* **🌈 انیمیشن‌های RGB دائمی (Constant Neon Flows):** حفظ پویایی جلوه‌های بصری دکمه‌های دانلود متحرک در تمام شرایط و اسکلتون لودینگ هماهنگ.

---

## 📂 ساختار درختی پروژه (Project Tree)

```plaintext
├── 📄 index.html      # ساختار اصلی هاب، پاپ‌آورها و لایه‌بندی کامپوننت‌ها
├── 🎨 style.css       # استایل‌های نئونی، انیمیشن‌های سه‌بعدی و Shimmer لودینگ
├── ⚙️ app.js          # منطق روتینگ، ارتباط با API شیت، فیلتر پیشرفته و وب‌آدیو
└── 📝 README.md       # مستندات و راهنمای راه‌اندازی پروژه

```

---

## 📊 نقشه‌راه دیتابیس گوگل شیت (Google Sheet Architecture)

برای کارکرد صحیح سیستم، ستون‌های گوگل شیت شما باید دقیقاً به ترتیب ساختار ماتریسی زیر تنظیم شده باشند:

| ستون | نام فیلد | نوع داده | توضیحات |
| --- | --- | --- | --- |
| **A** | `ID` | Number / Text | شناسه یکتای مود |
| **B** | `Title` | Text | نام بزرگ و اصلی مود |
| **C** | `Category` | Text (lowercase) | دسته‌بندی اصلی (cars, maps, apps, csp, ...) |
| **D** | `Brand` | Text | برند خودرو (مخصوص دسته‌بندی Cars) |
| **E** | `Subcategory` | Text | زیرمجموعه فرعی (مخصوص سایر دسته‌بندی‌ها) |
| **F** | `Image1` | URL | تصویر لایه اول (اصلی) |
| **G** | `Image2` | URL | تصویر لایه دوم |
| **H** | `Image3` | URL | تصویر لایه سوم |
| **I** | `Size` | Text | حجم فایل (مثال: 140MB) |
| **J** | `Creator` | Text | سازنده یا توسعه‌دهنده مود |
| **K** | `Download` | URL | لینک مستقیم دانلود مود |
| **L** | `Description` | Text | توضیحات فنی و بررسی مود در پاپ‌آور |
| **M** | `AdminName` | Text | نام ادمین ثبت‌کننده (جهت لیدربرد) |
| **N** | `Tags` | Text (Comma Separated) | تگ‌ها برای جستجو (مثال: drift, pack, iran) |
| **O** | `Password` | Text | رمز فایل zip در صورت وجود |

---

## 🛠️ نحوه راه‌اندازی و استفاده (Installation & Setup)

1. **دانلود فایل‌ها:** هر سه فایل `index.html`، `style.css` و `app.js` را در یک پوشه قرار دهید.
2. **تنظیم دیتابیس:** در فایل `app.js` خط ثابت زیر را پیدا کنید و شناسه شیت خود را جایگزین کنید:
```javascript
const SPREADSHEET_ID = "YOUR_SHARED_SPREADSHEET_ID_HERE";

```


3. **اجرا:** فایل `index.html` را از طریق یک پورت محلی (مثل Live Server در VS Code) اجرا کنید تا از قابلیت‌های روتینگ هش (`#`) و وب‌آدیو به درستی پشتیبانی شود.

---

## 💻 مشخصات فنی توسعه (Tech Stack)

* **Framework:** Tailwind CSS (تزریق داینامیک نسخه‌ پرفورمنس)
* **Icons:** FontAwesome v6.4.0 (نئون و متحرک)
* **Font:** YekanBakh (فونت بهینه‌سازی شده وب)
* **Core Engine:** Vanilla JavaScript ES6 (بدون وابستگی و قفل رم)

---

## 🚫 قوانین کپی‌رایت و محدودیت‌های استفاده (Terms of Use & Copyright)

> ### 🔒 اخطار جدی معنوی و قانونی
> 
> 
> این پروژه با **صرف زمان طولانی، زحمت فراوان و اهدافی کاملاً مشخص** به صورت اختصاصی برای جامعه سیم‌ریسینگ طراحی و کدنویسی شده است.
> * **🔓 صرفاً جهت استفاده کاربری:** این پلتفرم و هاب دانلود، تنها و تنها برای استفاده شخصی کاربران جهت **مشاهده، بررسی فنی و دانلود مودهای بازی** باز است.
> * **⛔ ممنوعیت هرگونه کپی‌برداری:** هرگونه استخراج کدها، الگوبرداری از ساختار سه فایلی و انیمیشن‌های سه‌بعدی کارت‌ها، کپی‌برداری از ایده هدر هوشمند، بازنشر فرانت‌اند پروژه به نام خود یا استفاده‌های تجاری و تبلیغاتی از اجزای این سند **کاملاً ممنوع بوده و با متخلفین برخورد جدی خواهد شد.**
> 
> 

---
