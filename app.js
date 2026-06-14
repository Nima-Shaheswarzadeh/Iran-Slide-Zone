let allMods = [];
let currentCategory = 'latest';
let currentSubFilter = 'all';
let openCategoryTree = null;   
let isMuted = false;
let currentLang = 'fa'; // 'fa' or 'en'
let cardImageIndexes = {}; 

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// ترجمه‌های کامل سیستم هاب ایران اسلاید زون طبق نام‌های درخواستی شما
const locales = {
    fa: {
        title: "ایران اسلاید زون",
        welcomeDesc: "پلتفرم فوق‌حرفه‌ای و اختصاصی شبیه‌سازی و مدیریت مودهای بهینه شده بازی Assetto Corsa زنده متصل به کلاود بورد.",
        launchBtn: "LAUNCH MOD HUB",
        audioOn: "صدا: روشن",
        audioOff: "صدا: خاموش",
        searchPlaceholder: "جستجو پیشرفته در دیتابیس...",
        latestLabel: "جدیدترین‌ها (۹ پست آخر)",
        adminLeaderboard: "🏆 جدول ادمین‌های فعال",
        copyright: "تمامی حقوق و کپی‌رایت برای نیما شهسوارزاده محفوظ است.",
        noItem: "هیچ موردی پیدا نشد.",
        downloadMod: "DOWNLOAD MOD",
        specifications: "SPECIFICATIONS",
        modalDesc: "توضیحات و بررسی فنی:",
        modalTags: "تگ‌های متادیتا:",
        modalDev: "توسعه و تست",
        toastThemeDark: "حالت شب فعال شد 🌙",
        toastThemeLight: "حالت روز فعال شد ☀️",
        toastLangFa: "زبان به فارسی تغییر یافت 🇮🇷",
        toastLangEn: "Language changed to English 🇬🇧",
        toastSwap: "تصویر استک ورق خورد 🔄",
        activeMods: "مود فعال",
        exitHub: "خروج از هاب"
    },
    en: {
        title: "IRAN SLIDE ZONE",
        welcomeDesc: "Ultra-premium and exclusive simulation platform for assetto corsa optimized mods, live connected to cloud dashboard.",
        launchBtn: "LAUNCH MOD HUB",
        audioOn: "Audio: ON",
        audioOff: "Audio: OFF",
        searchPlaceholder: "Advanced database search...",
        latestLabel: "Latest Updates (Last 9 Posts)",
        adminLeaderboard: "🏆 Active Admins Leaderboard",
        copyright: "All rights and copyright reserved for Nima Shahsavarzadeh.",
        noItem: "No matching mods found.",
        downloadMod: "DOWNLOAD MOD",
        specifications: "SPECIFICATIONS",
        modalDesc: "Technical Description:",
        modalTags: "Metadata Tags:",
        modalDev: "Developer",
        toastThemeDark: "Dark Mode Activated 🌙",
        toastThemeLight: "Light Mode Activated ☀️",
        toastLangFa: "زبان به فارسی تغییر یافت 🇮🇷",
        toastLangEn: "Language changed to English 🇬🇧",
        toastSwap: "Card image stacked 🔄",
        activeMods: "Active Mods",
        exitHub: "Exit Mod Hub"
    }
};

function playSound(type) {
    if (isMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode); gainNode.connect(audioCtx.destination);
        if (type === 'click') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'flip') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(260, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(480, audioCtx.currentTime + 0.11);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.11);
            osc.start(); osc.stop(audioCtx.currentTime + 0.11);
        }
    } catch (e) { console.log(e); }
}

function showToast(message) {
    const toast = document.getElementById('toastNotice');
    document.getElementById('toastText').innerText = message;
    toast.classList.add('toast-show');
    setTimeout(() => { toast.classList.remove('toast-show'); }, 1000); // انیمیشن خودکار خروج دقیقاً بعد از ۱ ثانیه
}

function toggleThemeMode() {
    playSound('click');
    const html = document.getElementById('htmlTag');
    const icon = document.querySelector('#themeBtn i');
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        icon.className = 'fas fa-sun';
        showToast(locales[currentLang].toastThemeLight);
    } else {
        html.classList.add('dark');
        icon.className = 'fas fa-moon';
        showToast(locales[currentLang].toastThemeDark);
    }
}

function toggleLanguage() {
    playSound('click');
    currentLang = currentLang === 'fa' ? 'en' : 'fa';
    
    const html = document.getElementById('htmlTag');
    if(currentLang === 'en') {
        html.dir = 'ltr'; html.lang = 'en';
        document.getElementById('langBtn').innerText = 'FA';
    } else {
        html.dir = 'rtl'; html.lang = 'fa';
        document.getElementById('langBtn').innerText = 'EN';
    }
    
    updateDOMTranslations();
    showToast(locales[currentLang].toastLangEn);
}

function updateDOMTranslations() {
    const t = locales[currentLang];
    document.getElementById('welcomeTitle').innerText = t.title;
    document.getElementById('welcomeDesc').innerText = t.welcomeDesc;
    document.getElementById('welcomeBtn').innerHTML = `LAUNCH MOD HUB <i class="fas ${currentLang === 'fa'?'fa-chevron-left':'fa-chevron-right'} mr-2"></i>`;
    document.getElementById('lblAudioState').innerText = isMuted ? t.audioOff : t.audioOn;
    document.getElementById('searchBar').placeholder = t.searchPlaceholder;
    document.getElementById('mainFooter').innerText = t.copyright;
    document.getElementById('sideLeaderboardBtn').querySelector('span').innerText = t.adminLeaderboard;
    document.getElementById('modalDescTitle').innerText = t.modalDesc;
    document.getElementById('modalTagsTitle').innerText = t.modalTags;
    document.getElementById('modalAuthorTitle').innerText = t.modalDev;
    document.getElementById('exitHubBtn').innerHTML = currentLang==='fa' ? '<i class="fas fa-arrow-right ml-1"></i> خروج از هاب' : 'Exit Mod Hub <i class="fas fa-arrow-left ml-1"></i>';

    renderExplorerTree();
    filterAndRender();
}

function toggleMute() {
    isMuted = !isMuted;
    const t = locales[currentLang];
    document.getElementById('lblAudioState').innerText = isMuted ? t.audioOff : t.audioOn;
    document.querySelector('#audioToggleBtn i').className = isMuted ? 'fas fa-volume-mute ml-1' : 'fas fa-volume-up ml-1';
}

// ساختار دقیقاً منطبق با دیتابیس ۴تایی اصیل شما بدون افزونه اضافه
const mainCategories = [
    { id: 'cars', label: 'Cars Library', icon: '🚗', img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=400' },
    { id: 'maps', label: 'Maps Library', icon: '🗺️', img: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=400' },
    { id: 'graphics', label: 'Graphics Library', icon: '🌠', img: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=400' },
    { id: 'apps', label: 'Apps / HUD', icon: '📲', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400' }
];

const SPREADSHEET_ID = "1RFi_Luu7Ip9IWrhI8KaSOlhaPEVSn7RZKAzdi-JZmSA"; 
const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

async function init() {
    // پیش‌فرض لود اولیه با دارک مود گیمینگ پریمیوم ایران اسلاید زون
    document.getElementById('htmlTag').classList.add('dark'); 
    await fetchModsFromSheets();
    renderCategoriesMenu();
    window.addEventListener('hashchange', handleRouting);
    handleRouting(); 
}

// خواندن اطلاعات کاملاً هماهنگ با فرمول جدید: ستون ۶ و ۷ و ۸ برای تصاویر متوالی استک
async function fetchModsFromSheets() {
    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        const text = await response.text();
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        const rows = jsonData.table.rows;
        
        allMods = rows.map((row, idx) => {
            const cells = row.c;
            return {
                id: cells[0] ? String(cells[0].v) : String(idx),
                title: cells[1] ? String(cells[1].v) : '',
                category: cells[2] ? String(cells[2].v).toLowerCase().trim() : '',
                brand: cells[3] ? String(cells[3].v) : '',
                subcategory: cells[4] ? String(cells[4].v) : '',
                // ستون‌های ۶، ۷ و ۸ دیتابیس جدید شما برای تخصیص مستقیم به استک سه‌تایی تصویر:
                image1: cells[5] ? String(cells[5].v) : '',
                image2: cells[6] ? String(cells[6].v) : '',
                image3: cells[7] ? String(cells[7].v) : '',
                size: cells[8] ? String(cells[8].v) : '',
                version: cells[9] ? String(cells[9].v) : '1.0',
                download: cells[10] ? String(cells[10].v) : '#',
                description: cells[11] ? String(cells[11].v) : '',
                author: {
                    name: cells[12] ? String(cells[12].v) : 'Admin',
                    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cells[12] ? cells[12].v : 'Admin')}`
                },
                tags: cells[13] ? String(cells[13].v).split(',').map(t => t.trim()) : ['mod']
            };
        }).filter(item => item.id && item.title).reverse(); 
    } catch (e) { console.error(e); }
}

function renderCategoriesMenu() {
    const grid = document.getElementById('categoriesMenuGrid');
    grid.innerHTML = '';
    mainCategories.forEach(cat => {
        grid.innerHTML += `
            <div onclick="navigateTo('gallery', '${cat.id}')" class="sidebar-folder relative h-40 rounded-2xl overflow-hidden cursor-pointer group dark:bg-white/5 bg-black/5 border dark:border-white/5 border-black/5 hover:scale-[1.02]">
                <img src="${cat.img}" class="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-5 group-hover:opacity-25 transition-all duration-500 blur-[0.2px]">
                <div class="absolute inset-0 bg-gradient-to-t dark:from-zoneBg from-white via-transparent to-transparent flex flex-col justify-end p-5">
                    <span class="text-2xl mb-1">${cat.icon}</span>
                    <h3 class="font-black text-xs tracking-wide">${cat.label}</h3>
                </div>
            </div>
        `;
    });
}

function renderExplorerTree() {
    const treeContainer = document.getElementById('explorerTree');
    treeContainer.innerHTML = '';
    const t = locales[currentLang];

    const latestActive = (currentCategory === 'latest') ? 'bg-zoneAccent text-white font-black shadow-md' : 'text-gray-400 hover:bg-black/5 dark:hover:bg-white/5';
    treeContainer.innerHTML += `
        <div onclick="navigateTo('gallery', 'latest')" class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${latestActive}">
            <div class="flex items-center gap-2.5">
                <i class="fas fa-layer-group text-[11px] opacity-80"></i> <span>${t.latestLabel}</span>
            </div>
            <span class="text-[9px] bg-black/30 px-2 py-0.5 rounded-md text-gray-400 border border-white/5">${Math.min(allMods.length, 9)}</span>
        </div>
    `;

    mainCategories.forEach(cat => {
        const isCurrentCat = (currentCategory === cat.id);
        const isOpen = (openCategoryTree === cat.id);
        const catClass = (isCurrentCat && currentSubFilter === 'all') ? 'bg-black/5 dark:bg-white/5 text-zoneGlow font-black border-r-2 border-zoneAccent' : 'text-gray-400 hover:bg-black/5 dark:hover:bg-white/5';
        
        let subItemsHtml = '';
        let subs = [];
        if (cat.id === 'cars') subs = [...new Set(allMods.filter(m => m.category === 'cars').map(m => m.brand))].filter(Boolean);
        if (cat.id === 'maps') subs = [...new Set(allMods.filter(m => m.category === 'maps').map(m => m.subcategory))].filter(Boolean);

        if (subs.length > 0) {
            subItemsHtml = `<div class="submenu-transition ${isOpen ? 'submenu-open' : ''} flex flex-col pr-4 my-1 border-r dark:border-white/5 border-black/5 mr-2 gap-1">`;
            subs.forEach(sub => {
                const isSubActive = (currentCategory === cat.id && currentSubFilter === sub);
                const subClass = isSubActive ? 'text-zoneGlow font-black bg-black/5 dark:bg-white/5' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300';
                const count = allMods.filter(m => m.category === cat.id && (m.brand === sub || m.subcategory === sub)).length;

                subItemsHtml += `
                    <div onclick="navigateTo('gallery', '${cat.id}', '${sub}')" class="px-2.5 py-2 rounded-lg text-[11px] cursor-pointer transition-all flex items-center justify-between ${subClass}">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-folder-open text-[10px] opacity-40"></i> <span>${sub}</span>
                        </div>
                        <span class="text-[8px] font-mono opacity-40">${count}</span>
                    </div>
                `;
            });
            subItemsHtml += `</div>`;
        }

        treeContainer.innerHTML += `
            <div class="flex flex-col">
                <div onclick="toggleTreeFolder('${cat.id}')" class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${catClass}">
                    <div class="flex items-center gap-2.5">
                        <span class="text-xs opacity-80">${cat.icon}</span> <span>${cat.label}</span>
                    </div>
                    <i class="fas ${isOpen ? 'fa-angle-down' : 'fa-angle-left'} text-[9px] opacity-40"></i>
                </div>
                ${subItemsHtml}
            </div>
        `;
    });
}

function toggleTreeFolder(catId) {
    if (openCategoryTree === catId) {
        openCategoryTree = null;
        navigateTo('gallery', catId, 'all');
    } else {
        openCategoryTree = catId;
        navigateTo('gallery', catId, 'all');
    }
}

function handleRouting() {
    const hash = window.location.hash || '#home';
    if (hash === '#home') showPage('welcomePage');
    else if (hash === '#categories') showPage('categoriesPage');
    else if (hash.startsWith('#gallery')) {
        const parts = hash.split('/');
        currentCategory = parts[1] || 'latest';
        currentSubFilter = parts[2] || 'all';
        if(currentCategory !== 'latest') openCategoryTree = currentCategory;
        showPage('galleryPage');
        renderExplorerTree();
        filterAndRender();
    }
}

function navigateTo(state, cat = '', sub = '') {
    playSound('click');
    if (state === 'home') window.location.hash = '#home';
    else if (state === 'categories') window.location.hash = '#categories';
    else if (state === 'gallery') {
        if (cat === 'latest') window.location.hash = '#gallery/latest';
        else if (cat) window.location.hash = `#gallery/${cat}/${sub || 'all'}`;
    }
}

function showPage(pageId) {
    document.getElementById('welcomePage').classList.add('hidden');
    document.getElementById('categoriesPage').classList.add('hidden');
    document.getElementById('galleryPage').classList.add('hidden');
    document.getElementById('mainHeader').classList.add('hidden');

    document.getElementById(pageId).classList.remove('hidden');
    if (pageId === 'galleryPage') document.getElementById('mainHeader').classList.remove('hidden');
}

// سیستم رندر متقارن استک فیزیکی مورب تصاویر
function renderCards(mods) {
    const grid = document.getElementById('modsGrid');
    grid.innerHTML = '';
    const t = locales[currentLang];

    if (mods.length === 0) {
        grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-xs py-16">${t.noItem}</p>`;
        return;
    }

    mods.forEach((mod, index) => {
        cardImageIndexes[index] = 0;

        // فراخوانی تصاویر پشت سر هم از ستون‌های ۶، ۷ و ۸ دیتابیس جدید شما
        const img1 = mod.image1 || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=400';
        const img2 = mod.image2 || img1;
        const img3 = mod.image3 || img1;

        const cardBox = document.createElement('div');
        cardBox.className = "stagger-card flex flex-col gap-3"; 
        cardBox.style.animationDelay = `${index * 0.04}s`;
        
        cardBox.innerHTML = `
            <div class="card-perspective" id="stack-container-${index}">
                <div class="img-layer" id="layer-A-${index}" style="z-index: 3; transform: translate(0px, 0px) scale(1); opacity: 1;">
                    <img src="${img1}" class="w-full h-full object-cover select-none">
                </div>
                <div class="img-layer" id="layer-B-${index}" style="z-index: 2; transform: translate(-10px, -10px) rotate(1.5deg) scale(0.97); opacity: 0.65;">
                    <img src="${img2}" class="w-full h-full object-cover select-none">
                </div>
                <div class="img-layer" id="layer-C-${index}" style="z-index: 1; transform: translate(-20px, -20px) rotate(3deg) scale(0.94); opacity: 0.35;">
                    <img src="${img3}" class="w-full h-full object-cover select-none">
                </div>
            </div>

            <div class="mt-2 flex flex-col gap-2 px-1">
                <h3 class="font-black text-sm dark:text-white text-gray-900 truncate ${currentLang==='fa'?'text-right':'text-left'}">${mod.title}</h3>
                
                <div class="flex justify-between items-center dark:bg-[#11121c]/80 bg-white px-3 py-2 rounded-xl text-[10px] text-gray-400 dark:border-white/5 border-black/5 shadow-sm">
                    <div class="flex items-center gap-3 font-medium">
                        <span><i class="fas fa-hdd text-zoneGlow ml-1"></i>${mod.size}</span>
                        <span><i class="fas fa-code-branch text-zoneGlow ml-1"></i>v${mod.version}</span>
                    </div>
                    <span class="font-black text-zoneGlow uppercase text-[9px] bg-zoneAccent/10 px-2 py-0.5 rounded-md border border-zoneAccent/20">${mod.brand || mod.category}</span>
                </div>
            </div>

            <div class="w-full flex gap-2">
                <button onclick="openInfoModal(event, ${index})" class="w-12 h-12 dark:bg-white/5 bg-black/5 hover:bg-black/10 dark:hover:bg-white/10 border dark:border-white/5 border-black/5 rounded-xl flex items-center justify-center text-zoneGlow text-base transition-all active:scale-95">
                    <i class="fas fa-bars-staggered"></i>
                </button>
                
                <a href="${mod.download}" target="_blank" onclick="playSound('click'); event.stopPropagation();" class="btn-launch flex-1 h-12 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2">
                    <i class="fas fa-download text-xs"></i> ${t.downloadMod}
                </a>

                <button onclick="swapCardImages(${index})" class="w-12 h-12 dark:bg-white/5 bg-black/5 hover:bg-black/10 dark:hover:bg-white/10 border dark:border-white/5 border-black/5 rounded-xl flex items-center justify-center text-amber-500 text-base transition-all active:scale-95">
                    <i class="fas fa-images"></i>
                </button>
            </div>
        `;
        grid.appendChild(cardBox);
    });
}

// الگوریتم انیمیشن فیزیکی کج ورق زدن (Slanted Swap)
function swapCardImages(cardIdx) {
    playSound('flip');
    showToast(locales[currentLang].toastSwap);
    
    const layerA = document.getElementById(`layer-A-${cardIdx}`);
    const layerB = document.getElementById(`layer-B-${cardIdx}`);
    const layerC = document.getElementById(`layer-C-${cardIdx}`);
    let currentIdx = cardImageIndexes[cardIdx]; 
    
    let topLayer, middleLayer, bottomLayer;
    if (currentIdx === 0) {
        topLayer = layerA; middleLayer = layerB; bottomLayer = layerC;
    } else if (currentIdx === 1) {
        topLayer = layerB; middleLayer = layerC; bottomLayer = layerA;
    } else {
        topLayer = layerC; middleLayer = layerA; bottomLayer = layerB;
    }
    
    topLayer.classList.add('slanted-swap-out');
    
    middleLayer.style.zIndex = "3";
    middleLayer.style.transform = "translate(0px, 0px) scale(1)";
    middleLayer.style.opacity = "1";
    
    bottomLayer.style.zIndex = "2";
    bottomLayer.style.transform = "translate(-10px, -10px) rotate(1.5deg) scale(0.97)";
    bottomLayer.style.opacity = "0.65";
    
    setTimeout(() => {
        topLayer.style.zIndex = "1";
        topLayer.style.transform = "translate(-20px, -20px) rotate(3deg) scale(0.94)";
        topLayer.style.opacity = "0.35";
        topLayer.classList.remove('slanted-swap-out');
    }, 450);
    
    cardImageIndexes[cardIdx] = (currentIdx + 1) % 3;
}

function filterAndRender() {
    const search = document.getElementById('searchBar').value.toLowerCase();
    let filtered = [];

    if (currentCategory === 'latest') {
        filtered = allMods.slice(0, 9);
    } else {
        filtered = allMods.filter(m => {
            const matchCat = (m.category === currentCategory);
            const matchSub = (currentSubFilter === 'all' || m.brand === currentSubFilter || m.subcategory === currentSubFilter);
            return matchCat && matchSub;
        });
    }

    if (search) {
        filtered = filtered.filter(m => m.title.toLowerCase().includes(search) || m.tags.some(t => t.toLowerCase().includes(search)));
    }

    renderCards(filtered);
}

function openInfoModal(event, index) {
    playSound('click');
    event.stopPropagation(); 
    const cardContainer = event.currentTarget.closest('.stagger-card');
    const cardTitle = cardContainer.querySelector('h3').innerText.trim();
    const mod = allMods.find(m => m.title.trim() === cardTitle);
    if(!mod) return;

    document.getElementById('infoModalTitle').innerText = mod.title.toUpperCase();
    document.getElementById('infoModalDesc').innerText = mod.description || "...";
    document.getElementById('infoModalAuthor').innerText = mod.author.name;
    document.getElementById('infoModalAvatar').src = mod.author.avatar;
    document.getElementById('infoModalCategory').innerText = mod.category;
    
    const tagsBox = document.getElementById('infoModalTags'); tagsBox.innerHTML = '';
    mod.tags.forEach(t => {
        if(t) tagsBox.innerHTML += `<span class="bg-black/30 dark:bg-black/50 border dark:border-white/5 border-black/5 text-gray-400 text-[10px] px-2.5 py-0.5 rounded-md">#${t}</span>`;
    });

    document.getElementById('infoModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('infoModalContainer').classList.remove('scale-95'), 10);
}

function closeInfoModal() {
    document.getElementById('infoModalContainer').classList.add('scale-95');
    setTimeout(() => document.getElementById('infoModal').classList.add('hidden'), 200);
}

function openLeaderboard() {
    playSound('click');
    const counts = {};
    allMods.forEach(m => { const name = m.author.name || 'Admin'; counts[name] = (counts[name] || 0) + 1; });

    const sortedAdmins = Object.keys(counts).map(name => {
        return { name: name, count: counts[name] };
    }).sort((a, b) => b.count - a.count);

    const listContainer = document.getElementById('leaderboardList'); listContainer.innerHTML = '';
    const t = locales[currentLang];

    sortedAdmins.forEach((admin, idx) => {
        let badge = `<span class="text-xs font-bold text-gray-400 dark:bg-white/5 bg-black/5 w-6 h-6 rounded-full flex items-center justify-center border border-white/5">${idx + 1}</span>`;
        if (idx === 0) badge = `<span class="text-base">🥇</span>`;
        if (idx === 1) badge = `<span class="text-base">🥈</span>`;
        if (idx === 2) badge = `<span class="text-base">🥉</span>`;

        listContainer.innerHTML += `
            <div class="flex items-center justify-between p-3 dark:bg-white/5 bg-black/5 rounded-xl border dark:border-white/5 border-black/5">
                <div class="flex items-center gap-3">
                    ${badge}
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(admin.name)}" class="w-5 h-5 rounded-full dark:bg-black/40 bg-gray-200">
                    <span class="text-xs font-black">${admin.name}</span>
                </div>
                <span class="text-[10px] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">${admin.count} ${t.activeMods}</span>
            </div>
        `;
    });

    document.getElementById('leaderboardModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('leaderboardContainer').classList.remove('scale-95'), 10);
}

function closeLeaderboard() {
    document.getElementById('leaderboardContainer').classList.add('scale-95');
    setTimeout(() => document.getElementById('leaderboardModal').classList.add('hidden'), 200);
}

document.getElementById('searchBar').addEventListener('input', filterAndRender);
window.addEventListener('DOMContentLoaded', init);
