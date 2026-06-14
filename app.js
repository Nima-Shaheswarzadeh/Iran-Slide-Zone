let allMods = [];
let currentCategory = 'latest';
let currentSubFilter = 'all';
let openCategoryTree = null;   
let isMuted = false;

// برای هر کارت وضعیت عکسِ در حال نمایش (0 یا 1 یا 2) را نگه می‌دارد
let cardImageIndexes = {}; 

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (isMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'flip') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(250, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.12);
            gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
            osc.start(); osc.stop(audioCtx.currentTime + 0.12);
        }
    } catch (e) { console.log(e); }
}

function toggleMute() {
    isMuted = !isMuted;
    document.querySelector('#audioToggleBtn span').innerText = isMuted ? 'صدا: خاموش' : 'صدا: روشن';
    document.querySelector('#audioToggleBtn i').className = isMuted ? 'fas fa-volume-mute ml-1' : 'fas fa-volume-up ml-1';
}

const SPREADSHEET_ID = "1RFi_Luu7Ip9IWrhI8KaSOlhaPEVSn7RZKAzdi-JZmSA"; 
const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

const mainCategories = [
    { id: 'cars', label: 'Cars Library', icon: '🚗', img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=400' },
    { id: 'maps', label: 'Maps Library', icon: '🗺️', img: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=400' },
    { id: 'csp', label: 'CSP Patches', icon: '👨‍💻', img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=400' },
    { id: 'graphics', label: 'Graphics Sol', icon: '🌠', img: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=400' },
    { id: 'servers', label: 'Online Rooms', icon: '🌐', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400' },
    { id: 'apps', label: 'Apps / HUD', icon: '📲', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400' },
    { id: 'drivers', label: 'Skins & Suits', icon: '👥', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=400' }
];

async function init() {
    await fetchModsFromSheets();
    renderCategoriesMenu();
    window.addEventListener('hashchange', handleRouting);
    handleRouting(); 
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
                image: cells[5] ? String(cells[5].v) : '',
                backImage: cells[6] ? String(cells[6].v) : '',
                // ستون سیزدهم (M) در لایه جدید دیتابیس برای عکس سوم تعبیه شده است
                extraImage: cells[12] ? String(cells[12].v) : '', 
                size: cells[7] ? String(cells[7].v) : '',
                version: cells[8] ? String(cells[8].v) : '1.0',
                download: cells[9] ? String(cells[9].v) : '#',
                description: cells[10] ? String(cells[10].v) : '',
                author: {
                    name: cells[11] ? String(cells[11].v) : 'Admin',
                    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cells[11] ? cells[11].v : 'Admin')}`
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
            <div onclick="navigateTo('gallery', '${cat.id}')" class="sidebar-folder relative h-32 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02]">
                <img src="${cat.img}" class="absolute inset-0 w-full h-full object-cover opacity-5 group-hover:opacity-10 group-hover:scale-105 transition-all duration-500 blur-[0.5px]">
                <div class="absolute inset-0 bg-gradient-to-t from-zoneBg to-transparent flex flex-col justify-end p-5">
                    <span class="text-xl mb-1">${cat.icon}</span>
                    <h3 class="font-black text-xs text-white tracking-wide">${cat.label}</h3>
                </div>
            </div>
        `;
    });
}

function renderExplorerTree() {
    const treeContainer = document.getElementById('explorerTree');
    treeContainer.innerHTML = '';

    const latestActive = (currentCategory === 'latest') ? 'bg-zoneAccent text-white font-black shadow-lg shadow-zoneAccent/20' : 'text-gray-400 hover:bg-white/5';
    treeContainer.innerHTML += `
        <div onclick="navigateTo('gallery', 'latest')" class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${latestActive}">
            <div class="flex items-center gap-2.5">
                <i class="fas fa-layer-group text-[11px] opacity-80"></i> <span>جدیدترین‌ها (۹ پست آخر)</span>
            </div>
            <span class="text-[9px] bg-black/40 px-2 py-0.5 rounded-md text-gray-400 border border-white/5">${Math.min(allMods.length, 9)}</span>
        </div>
    `;

    mainCategories.forEach(cat => {
        const isCurrentCat = (currentCategory === cat.id);
        const isOpen = (openCategoryTree === cat.id);
        const catClass = (isCurrentCat && currentSubFilter === 'all') ? 'bg-white/5 text-zoneGlow font-black border-r-2 border-zoneAccent' : 'text-gray-400 hover:bg-white/5';
        
        let subItemsHtml = '';
        let subs = [];
        if (cat.id === 'cars') subs = [...new Set(allMods.filter(m => m.category === 'cars').map(m => m.brand))].filter(Boolean);
        if (cat.id === 'maps') subs = [...new Set(allMods.filter(m => m.category === 'maps').map(m => m.subcategory))].filter(Boolean);

        if (subs.length > 0) {
            subItemsHtml = `<div class="submenu-transition ${isOpen ? 'submenu-open' : ''} flex flex-col pr-4 my-1 border-r border-white/5 mr-2 gap-1">`;
            subs.forEach(sub => {
                const isSubActive = (currentCategory === cat.id && currentSubFilter === sub);
                const subClass = isSubActive ? 'text-zoneGlow font-black bg-white/5' : 'text-gray-500 hover:text-gray-300';
                const count = allMods.filter(m => m.category === cat.id && (m.brand === sub || m.subcategory === sub)).length;

                subItemsHtml += `
                    <div onclick="navigateTo('gallery', '${cat.id}', '${sub}')" class="px-2.5 py-2 rounded-lg text-[11px] cursor-pointer transition-all flex items-center justify-between ${subClass}">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-folder-open text-[10px] opacity-50"></i> <span>${sub}</span>
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

function showPage(pageId) {
    document.getElementById('welcomePage').classList.add('hidden');
    document.getElementById('categoriesPage').classList.add('hidden');
    document.getElementById('galleryPage').classList.add('hidden');
    document.getElementById('mainHeader').classList.add('hidden');

    document.getElementById(pageId).classList.remove('hidden');
    if (pageId === 'galleryPage') document.getElementById('mainHeader').classList.remove('hidden');
}

// رندر کارت‌ها با ساختار متقارن، اطلاعات تفکیک شده پایینی و استک سه تایی متحرک
function renderCards(mods) {
    const grid = document.getElementById('modsGrid');
    grid.innerHTML = '';

    if (mods.length === 0) {
        grid.innerHTML = `<p class="text-gray-500 col-span-full text-center text-xs py-16">هیچ موردی پیدا نشد.</p>`;
        return;
    }

    mods.forEach((mod, index) => {
        // ریست یا مقداردهی اولیه ایندکس تصویر کارت روی عکس اول (0)
        cardImageIndexes[index] = 0;

        // اگر آدرس تصاویر فرعی خالی بود، برای جلوگیری از خرابی استک از تصویر اصلی استفاده کند
        const img1 = mod.image || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=400';
        const img2 = mod.backImage || img1;
        const img3 = mod.extraImage || img1;

        const cardBox = document.createElement('div');
        cardBox.className = "stagger-card flex flex-col gap-3"; 
        cardBox.style.animationDelay = `${index * 0.05}s`;
        
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
                <h3 class="font-black text-sm text-white truncate text-right">${mod.title}</h3>
                
                <div class="flex justify-between items-center bg-[#11121c]/80 backdrop-blur-md px-3 py-2 rounded-xl text-[10px] text-gray-400 border border-white/5">
                    <div class="flex items-center gap-3 font-medium">
                        <span><i class="fas fa-hdd text-zoneGlow ml-1"></i>${mod.size}</span>
                        <span><i class="fas fa-code-branch text-zoneGlow ml-1"></i>v${mod.version}</span>
                    </div>
                    <span class="font-black text-zoneGlow uppercase text-[9px] bg-zoneAccent/10 px-2 py-0.5 rounded-md border border-zoneAccent/20">${mod.brand || mod.category}</span>
                </div>
            </div>

            <div class="w-full flex gap-2">
                <button onclick="openInfoModal(event, ${index})" title="توضیحات مود" class="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center text-zoneGlow text-base transition-all active:scale-95">
                    <i class="fas fa-bars-staggered"></i>
                </button>
                
                <a href="${mod.download}" target="_blank" onclick="playSound('click'); event.stopPropagation();" class="btn-launch flex-1 h-12 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2">
                    <i class="fas fa-download text-xs"></i> DOWNLOAD MOD
                </a>

                <button onclick="swapCardImages(${index})" title="تصویر بعدی استک" class="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center text-amber-400 text-base transition-all active:scale-95">
                    <i class="fas fa-images"></i>
                </button>
            </div>
        `;
        grid.appendChild(cardBox);
    });
}

// منطق فوق‌پریمیوم انیمیشن Slanted Swap برای ورق زدن ۳ کارت متوالی
function swapCardImages(cardIdx) {
    playSound('flip');
    
    const layerA = document.getElementById(`layer-A-${cardIdx}`);
    const layerB = document.getElementById(`layer-B-${cardIdx}`);
    const layerC = document.getElementById(`layer-C-${cardIdx}`);
    
    let currentIdx = cardImageIndexes[cardIdx]; // 0 یا 1 یا 2
    
    // مشخص کردن اینکه در حال حاضر کدام المان روی استک (Z-index 3) قرار دارد
    let topLayer, middleLayer, bottomLayer;
    
    if (currentIdx === 0) {
        topLayer = layerA; middleLayer = layerB; bottomLayer = layerC;
    } else if (currentIdx === 1) {
        topLayer = layerB; middleLayer = layerC; bottomLayer = layerA;
    } else {
        topLayer = layerC; middleLayer = layerA; bottomLayer = layerB;
    }
    
    // مرحله ۱: فعال کردن افکت فیزیکی خروج کجکی (مورب) برای کارت بالایی
    topLayer.classList.add('slanted-swap-out');
    
    // مرحله ۲: جابجایی ترنزیشن‌ها و تغییر استایل لایه‌های باقی مانده همزمان با خروج کارت اصلی
    middleLayer.style.zIndex = "3";
    middleLayer.style.transform = "translate(0px, 0px) scale(1)";
    middleLayer.style.opacity = "1";
    
    bottomLayer.style.zIndex = "2";
    bottomLayer.style.transform = "translate(-10px, -10px) rotate(1.5deg) scale(0.97)";
    bottomLayer.style.opacity = "0.65";
    
    // مرحله ۳: پس از اتمام انیمیشن خروج، کارت برمی‌گردد و در انتهای استک (Z-index 1) مستقر می‌شود
    setTimeout(() => {
        topLayer.style.zIndex = "1";
        topLayer.style.transform = "translate(-20px, -20px) rotate(3deg) scale(0.94)";
        topLayer.style.opacity = "0.35";
        topLayer.classList.remove('slanted-swap-out');
    }, 500);
    
    // بروزرسانی امین امن ایندکس استک کارت برای سیکل‌های بعدی
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
    document.getElementById('infoModalDesc').innerText = mod.description || "توضیحات و بررسی فنی برای این ماژول ثبت نشده است.";
    document.getElementById('infoModalAuthor').innerText = mod.author.name;
    document.getElementById('infoModalAvatar').src = mod.author.avatar;
    document.getElementById('infoModalCategory').innerText = mod.category;
    
    const tagsBox = document.getElementById('infoModalTags');
    tagsBox.innerHTML = '';
    mod.tags.forEach(t => {
        if(t) tagsBox.innerHTML += `<span class="bg-black/50 border border-white/5 text-gray-400 text-[10px] px-2.5 py-0.5 rounded-md">#${t}</span>`;
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
    allMods.forEach(m => {
        const name = m.author.name || 'Admin';
        counts[name] = (counts[name] || 0) + 1;
    });

    const sortedAdmins = Object.keys(counts).map(name => {
        return { name: name, count: counts[name] };
    }).sort((a, b) => b.count - a.count);

    const listContainer = document.getElementById('leaderboardList');
    listContainer.innerHTML = '';

    sortedAdmins.forEach((admin, idx) => {
        let badge = `<span class="text-xs font-bold text-gray-500 bg-white/5 w-6 h-6 rounded-full flex items-center justify-center border border-white/5">${idx + 1}</span>`;
        if (idx === 0) badge = `<span class="text-base">🥇</span>`;
        if (idx === 1) badge = `<span class="text-base">🥈</span>`;
        if (idx === 2) badge = `<span class="text-base">🥉</span>`;

        listContainer.innerHTML += `
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
                <div class="flex items-center gap-3">
                    ${badge}
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(admin.name)}" class="w-5 h-5 rounded-full bg-black/40">
                    <span class="text-xs font-black text-white">${admin.name}</span>
                </div>
                <span class="text-[11px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">${admin.count} مود فعال</span>
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
