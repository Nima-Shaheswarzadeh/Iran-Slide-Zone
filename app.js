let allMods = [];
let currentCategory = 'latest';
let currentSubFilter = 'all';
let openCategoryTree = {}; 
let isMuted = false;
let currentLang = 'fa'; 
let cardImageIndexes = {}; 

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const mainCategories = [
    { id: 'cars', labelFa: 'خودرو', labelEn: 'Car', icon: '🚗', img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=400' },
    { id: 'maps', labelFa: 'نقشه', labelEn: 'Map', icon: '🗺️', img: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=400' },
    { id: 'apps', labelFa: 'برنامه', labelEn: 'App', icon: '📲', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400' },
    { id: 'csp', labelFa: 'کانفیگ', labelEn: 'CSP', icon: '⚙️', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400' },
    { id: 'drivers', labelFa: 'درایور', labelEn: 'Driver', icon: '🕴️', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=400' },
    { id: 'servers', labelFa: 'سرور', labelEn: 'Server', icon: '🖥️', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400' },
    { id: 'graphics', labelFa: 'گرافیک', labelEn: 'Graphic', icon: '🌠', img: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=400' }
];

const locales = {
    fa: {
        title: "ایران اسلاید زون",
        welcomeDesc: "پلتفرم فوق‌حرفه‌ای و اختصاصی شبیه‌سازی و مدیریت مودهای بهینه شده بازی Assetto Corsa زنده متصل به کلاود بورد.",
        launchBtn: "LAUNCH MOD HUB",
        audioOn: "صدا: روشن",
        audioOff: "صدا: خاموش",
        searchPlaceholder: "جستجو پیشرفته در دیتابیس...",
        latestLabel: "جدیدترین‌ها (۹ پست آخر)",
        adminLeaderboard: "لیدربرد ادمین ها",
        explorerTitle: "مدیریت فایل‌ها",
        popupLeaderboardTitle: "لیدربرد ادمین ها",
        copyright: "تمامی حقوق و کپی‌رایت برای نیما شهسوارزاده محفوظ است.",
        noItem: "هیچ موردی پیدا نشد.",
        downloadMod: "دانلود مود",
        specifications: "SPECIFICATIONS",
        modalDesc: "توضیحات و بررسی فنی:",
        modalTags: "تگ‌های متادیتا:",
        modalDev: "سازنده مود:",
        activeMods: "پست", 
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
        adminLeaderboard: "Active Admins Leaderboard",
        explorerTitle: "Mod Navigation",
        popupLeaderboardTitle: "LEADERBOARD",
        copyright: "All rights and copyright reserved for Nima Shahsavarzadeh.",
        noItem: "No matching mods found.",
        downloadMod: "DOWNLOAD MOD",
        specifications: "SPECIFICATIONS",
        modalDesc: "Technical Description:",
        modalTags: "Metadata Tags:",
        modalDev: "Developer:",
        activeMods: "Post",
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
            osc.type = 'sine'; osc.frequency.setValueAtTime(550, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.08);
            gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
            osc.start(); osc.stop(audioCtx.currentTime + 0.08);
        } else if (type === 'flip') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(240, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
        }
    } catch (e) { console.log(e); }
}

function toggleThemeMode() {
    playSound('click');
    const html = document.getElementById('htmlTag');
    const icon = document.querySelector('#themeBtn i');
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        icon.className = 'fas fa-sun';
    } else {
        html.classList.add('dark');
        icon.className = 'fas fa-moon';
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
    document.getElementById('explorerTitleTag').querySelector('span').innerText = t.explorerTitle;
    document.getElementById('lbPopupTitle').innerHTML = `<i class="fas fa-crown text-xs"></i> ` + t.popupLeaderboardTitle;
    document.getElementById('modalDescTitle').innerText = t.modalDesc;
    document.getElementById('modalTagsTitle').innerText = t.modalTags;
    document.getElementById('modalDevTitle').innerText = t.modalDev;
    document.getElementById('exitHubBtn').innerHTML = currentLang==='fa' ? '<i class="fas fa-arrow-right ml-1"></i> خروج از هاب' : 'Exit Mod Hub <i class="fas fa-arrow-left ml-1"></i>';

    renderCategoriesMenu();
    renderExplorerTree();
    filterAndRender();
}

function toggleMute() {
    isMuted = !isMuted;
    const t = locales[currentLang];
    document.getElementById('lblAudioState').innerText = isMuted ? t.audioOff : t.audioOn;
    document.querySelector('#audioToggleBtn i').className = isMuted ? 'fas fa-volume-mute ml-1' : 'fas fa-volume-up ml-1';
}

const SPREADSHEET_ID = "1RFi_Luu7Ip9IWrhI8KaSOlhaPEVSn7RZKAzdi-JZmSA"; 
const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

async function init() {
    document.getElementById('htmlTag').classList.add('dark'); 
    mainCategories.forEach(c => openCategoryTree[c.id] = false); 
    await fetchModsFromSheets();
    renderCategoriesMenu();
    window.addEventListener('hashchange', handleRouting);
    handleRouting(); 
    updateDOMTranslations();
}

// 🎯 انطباق دقیق ستون‌ها طبق نقشه دریافتی تایید شده (A=0 تا O=14)
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
                brand: cells[3] ? String(cells[3].v).trim() : '',
                subcategory: cells[4] ? String(cells[4].v).trim() : '',
                image1: cells[5] ? String(cells[5].v) : '',
                image2: cells[6] ? String(cells[6].v) : '',
                image3: cells[7] ? String(cells[7].v) : '',
                size: cells[8] ? String(cells[8].v) : '',
                creator: cells[9] ? String(cells[9].v) : 'Unknown',
                download: cells[10] ? String(cells[10].v) : '#',
                description: cells[11] ? String(cells[11].v) : '',
                adminName: cells[12] ? String(cells[12].v) : 'Admin',
                tags: cells[13] ? String(cells[13].v).split(',').map(t => t.trim()) : ['mod'],
                password: cells[14] ? String(cells[14].v) : ''
            };
        }).filter(item => item.id && item.title).reverse(); 
    } catch (e) { console.error(e); }
}

function renderCategoriesMenu() {
    const grid = document.getElementById('categoriesMenuGrid');
    grid.innerHTML = '';
    mainCategories.forEach(cat => {
        const currentTitle = currentLang === 'fa' ? cat.labelFa : cat.labelEn;
        grid.innerHTML += `
            <div onclick="navigateTo('gallery', '${cat.id}')" class="relative h-32 sm:h-36 rounded-2xl overflow-hidden cursor-pointer group dark:bg-white/5 bg-black/5 border dark:border-white/5 border-black/5 hover:scale-[1.01] transition-all duration-200">
                <img src="${cat.img}" class="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-all duration-300 blur-[0.2px]">
                <div class="absolute inset-0 bg-gradient-to-t dark:from-zoneBg from-white via-transparent to-transparent flex flex-col justify-end p-4">
                    <span class="text-2xl mb-1">${cat.icon}</span>
                    <h3 class="font-black text-xs sm:text-sm tracking-wide">${currentTitle}</h3>
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
        <div onclick="navigateTo('gallery', 'latest')" class="flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${latestActive}">
            <div class="flex items-center gap-2">
                <i class="fas fa-layer-group text-[10px] opacity-80"></i> <span>${t.latestLabel}</span>
            </div>
            <span class="text-[9px] bg-black/30 px-1.5 py-0.5 rounded-md text-gray-400 border border-white/5">${Math.min(allMods.length, 9)}</span>
        </div>
    `;

    mainCategories.forEach(cat => {
        const isCurrentCat = (currentCategory === cat.id);
        const isOpen = openCategoryTree[cat.id];
        const catClass = (isCurrentCat && currentSubFilter === 'all') ? 'bg-black/5 dark:bg-white/5 text-zoneGlow font-black border-r-2 border-zoneAccent' : 'text-gray-400 hover:bg-black/5 dark:hover:bg-white/5';
        const currentTitle = currentLang === 'fa' ? cat.labelFa : cat.labelEn;

        let subItemsHtml = '';
        let subs = [];
        if (cat.id === 'cars') subs = [...new Set(allMods.filter(m => m.category === 'cars').map(m => m.brand))].filter(Boolean);
        else subs = [...new Set(allMods.filter(m => m.category === cat.id).map(m => m.subcategory))].filter(Boolean);

        if (subs.length > 0) {
            subItemsHtml = `<div class="submenu-transition ${isOpen ? 'submenu-open' : ''} flex flex-col pr-3 my-1 border-r dark:border-white/5 border-black/5 mr-2 gap-0.5">`;
            subs.forEach(sub => {
                const isSubActive = (currentCategory === cat.id && currentSubFilter === sub);
                const subClass = isSubActive ? 'text-zoneGlow font-black bg-black/5 dark:bg-white/5' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300';
                const count = allMods.filter(m => m.category === cat.id && (m.brand === sub || m.subcategory === sub)).length;

                subItemsHtml += `
                    <div onclick="navigateTo('gallery', '${cat.id}', '${sub}')" class="px-2 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all flex items-center justify-between ${subClass}">
                        <div class="flex items-center gap-1.5">
                            <i class="fas fa-folder-open text-[9px] opacity-40"></i> <span>${sub}</span>
                        </div>
                        <span class="text-[8px] font-mono opacity-40">${count}</span>
                    </div>
                `;
            });
            subItemsHtml += `</div>`;
        }

        treeContainer.innerHTML += `
            <div class="flex flex-col">
                <div class="flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${catClass}">
                    <div onclick="navigateTo('gallery', '${cat.id}', 'all')" class="flex items-center gap-2 flex-1">
                        <span class="text-xs opacity-80">${cat.icon}</span> <span>${currentTitle}</span>
                    </div>
                    ${subs.length > 0 ? `
                    <div onclick="toggleTreeFolder(event, '${cat.id}')" class="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-all">
                        <i class="fas ${isOpen ? 'fa-angle-down' : 'fa-angle-left'} text-[9px] opacity-60"></i>
                    </div>` : ''}
                </div>
                ${subItemsHtml}
            </div>
        `;
    });
}

function toggleTreeFolder(event, catId) {
    event.stopPropagation(); 
    playSound('click');
    openCategoryTree[catId] = !openCategoryTree[catId];
    renderExplorerTree();
}

function handleRouting() {
    const hash = window.location.hash || '#home';
    if (hash === '#home') showPage('welcomePage');
    else if (hash === '#categories') showPage('categoriesPage');
    else if (hash.startsWith('#gallery')) {
        const parts = hash.split('/');
        currentCategory = parts[1] || 'latest';
        currentSubFilter = parts[2] || 'all';
        if(currentCategory !== 'latest') openCategoryTree[currentCategory] = true;
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

function renderCards(mods) {
    const grid = document.getElementById('modsGrid');
    grid.innerHTML = '';
    const t = locales[currentLang];

    if (mods.length === 0) {
        grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-xs py-12">${t.noItem}</p>`;
        return;
    }

    mods.forEach((mod) => {
        const trueGlobalIndex = allMods.findIndex(m => m.id === mod.id);
        cardImageIndexes[trueGlobalIndex] = 0; // تصویر فعال اولیه

        const img1 = mod.image1 || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=400';
        const img2 = mod.image2 || img1;
        const img3 = mod.image3 || img1;

        const cardBox = document.createElement('div');
        cardBox.className = "stagger-card flex flex-col gap-3 relative pt-4"; 
        
        const currentCatObj = mainCategories.find(c => c.id === mod.category);
        const displayLabel = currentCatObj ? (currentLang === 'fa' ? currentCatObj.labelFa : currentCatObj.labelEn) : mod.category;

        cardBox.innerHTML = `
            <div class="absolute top-[-20px] left-1/2 -translate-x-1/2 z-20 bg-slate-900 dark:bg-slate-950 text-white border border-indigo-500/40 px-4 py-1 rounded-full text-[11px] font-black shadow-lg whitespace-nowrap">
                ${mod.title}
                <div class="hanging-string"></div>
            </div>

            <div class="card-perspective neon-card-flow" id="stack-container-${trueGlobalIndex}">
                <div class="img-layer" id="layer-0-${trueGlobalIndex}" style="z-index: 3; opacity: 1; transform: translate(0, 0) scale(1);">
                    <img src="${img1}" class="w-full h-full object-cover pointer-events-none">
                </div>
                <div class="img-layer" id="layer-1-${trueGlobalIndex}" style="z-index: 2; opacity: 0.5; transform: translate(-8px, -8px) scale(0.98);">
                    <img src="${img2}" class="w-full h-full object-cover pointer-events-none">
                </div>
                <div class="img-layer" id="layer-2-${trueGlobalIndex}" style="z-index: 1; opacity: 0; transform: translate(-16px, -16px) scale(0.96);">
                    <img src="${img3}" class="w-full h-full object-cover pointer-events-none">
                </div>
            </div>

            <div class="mt-0.5 flex flex-col gap-2 px-1">
                <div class="flex justify-between items-center dark:bg-[#11121c]/80 bg-white px-3 py-2 rounded-xl text-[10px] text-gray-400 dark:border-white/5 border-black/5 shadow-sm">
                    <div class="flex items-center gap-3 font-medium">
                        <span><i class="fas fa-hdd text-zoneGlow ml-1"></i>${mod.size}</span>
                        <span class="text-indigo-400 font-bold"><i class="fas fa-user-shield ml-1"></i>${mod.adminName}</span>
                    </div>
                    <span class="font-black text-zoneGlow uppercase text-[9px] bg-zoneAccent/10 px-2 py-0.5 rounded-md border border-zoneAccent/20">${mod.brand || displayLabel}</span>
                </div>
            </div>

            <div class="w-full flex gap-1.5">
                <button onclick="openInfoModal(event, ${trueGlobalIndex})" class="w-10 h-10 dark:bg-white/5 bg-black/5 hover:bg-black/10 dark:hover:bg-white/10 border dark:border-white/5 border-black/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white text-xs transition-all active:scale-95">
                    <i class="fas fa-info"></i>
                </button>
                
                <button onclick="copyPassword(event, '${mod.password}')" class="w-10 h-10 dark:bg-white/5 bg-black/5 hover:bg-black/10 dark:hover:bg-white/10 border dark:border-white/5 border-black/5 rounded-xl flex items-center justify-center text-amber-500 text-xs transition-all active:scale-95" title="Copy Password">
                    <i class="fas fa-key"></i>
                </button>

                <a href="${mod.download}" target="_blank" onclick="playSound('click'); event.stopPropagation();" class="btn-download-rgb flex-1 h-10 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2">
                    <i class="fas fa-download text-xs"></i> ${t.downloadMod}
                </a>

                <button onclick="swapCardImages(${trueGlobalIndex})" class="w-10 h-10 dark:bg-white/5 bg-black/5 hover:bg-black/10 dark:hover:bg-white/10 border dark:border-white/5 border-black/5 rounded-xl flex items-center justify-center text-indigo-400 text-xs transition-all active:scale-95">
                    <i class="fas fa-images"></i>
                </button>
            </div>
        `;
        grid.appendChild(cardBox);
    });
}

function copyPassword(event, pass) {
    event.stopPropagation();
    playSound('click');
    if(!pass) return;
    navigator.clipboard.writeText(pass);
}

// 🎯 مکانیزم بهینه اسلاید تصاویر چرخشی ۳ تایی بدون لگ و هنگی
function swapCardImages(cardIdx) {
    playSound('flip');
    const currentIdx = cardImageIndexes[cardIdx]; 
    const nextIdx = (currentIdx + 1) % 3; 
    
    const layerCurrent = document.getElementById(`layer-${currentIdx}-${cardIdx}`);
    const layerNext = document.getElementById(`layer-${nextIdx}-${cardIdx}`);
    const layerThird = document.getElementById(`layer-${(nextIdx + 1) % 3}-${cardIdx}`);

    layerCurrent.classList.add('slanted-swap-out');
    
    layerNext.style.zIndex = "3";
    layerNext.style.transform = "translate(0, 0) scale(1)";
    layerNext.style.opacity = "1";
    
    layerThird.style.zIndex = "2";
    layerThird.style.transform = "translate(-8px, -8px) scale(0.98)";
    layerThird.style.opacity = "0.5";

    setTimeout(() => {
        layerCurrent.style.zIndex = "1";
        layerCurrent.style.transform = "translate(-16px, -16px) scale(0.96)";
        layerCurrent.style.opacity = "0";
        layerCurrent.classList.remove('slanted-swap-out');
    }, 400);
    
    cardImageIndexes[cardIdx] = nextIdx;
}

function filterAndRender() {
    const search = document.getElementById('searchBar').value.toLowerCase().trim();
    let filtered = [];

    if (currentCategory === 'latest') {
        filtered = allMods.slice(0, 9);
    } else {
        filtered = allMods.filter(m => {
            const matchCat = (m.category === currentCategory.toLowerCase().trim());
            const matchSub = (currentSubFilter === 'all' || m.brand.toLowerCase() === currentSubFilter.toLowerCase() || m.subcategory.toLowerCase() === currentSubFilter.toLowerCase());
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
    
    const mod = allMods[index];
    if(!mod) return;

    const currentCatObj = mainCategories.find(c => c.id === mod.category);
    const displayLabel = currentCatObj ? (currentLang === 'fa' ? currentCatObj.labelFa : currentCatObj.labelEn) : mod.category;

    document.getElementById('infoModalTitle').innerText = mod.title.toUpperCase();
    document.getElementById('infoModalDesc').innerText = mod.description || "...";
    document.getElementById('infoModalCreator').innerText = mod.creator; 
    document.getElementById('infoModalCategory').innerText = displayLabel.toUpperCase();
    
    const tagsBox = document.getElementById('infoModalTags'); tagsBox.innerHTML = '';
    mod.tags.forEach(t => {
        if(t) tagsBox.innerHTML += `<span class="bg-black/30 dark:bg-black/50 border dark:border-white/5 border-black/5 text-gray-400 text-[10px] px-2.5 py-0.5 rounded-md">#${t}</span>`;
    });

    document.getElementById('infoModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('infoModalContainer').classList.remove('scale-95'), 10);
}

function closeInfoModal() {
    document.getElementById('infoModalContainer').classList.add('scale-95');
    setTimeout(() => document.getElementById('infoModal').classList.add('hidden'), 150);
}

function openLeaderboard() {
    playSound('click');
    const counts = {};
    allMods.forEach(m => { const name = m.adminName || 'Admin'; counts[name] = (counts[name] || 0) + 1; });

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
            <div class="flex items-center justify-between p-2.5 dark:bg-white/5 bg-black/5 rounded-xl border dark:border-white/5 border-black/5">
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
    setTimeout(() => document.getElementById('leaderboardModal').classList.add('hidden'), 150);
}

document.getElementById('searchBar').addEventListener('input', filterAndRender);
window.addEventListener('DOMContentLoaded', init);
