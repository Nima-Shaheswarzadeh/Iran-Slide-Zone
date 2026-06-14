let allMods = [];
let currentCategory = 'latest';
let currentSubFilter = 'all';
let openCategoryTree = null;   

const SPREADSHEET_ID = "1RFi_Luu7Ip9IWrhI8KaSOlhaPEVSn7RZKAzdi-JZmSA"; 
const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

const mainCategories = [
    { id: 'cars', label: 'Cars', icon: '🚗', img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=400' },
    { id: 'maps', label: 'Maps', icon: '🗺️', img: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=400' },
    { id: 'csp', label: 'CSP', icon: '👨‍💻', img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=400' },
    { id: 'graphics', label: 'Graphics', icon: '🌠', img: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=400' },
    { id: 'servers', label: 'Servers', icon: '🌐', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400' },
    { id: 'apps', label: 'Apps', icon: '📲', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400' },
    { id: 'drivers', label: 'Drivers', icon: '👥', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=400' }
];

async function init() {
    await fetchModsFromSheets();
    renderCategoriesMenu();
    
    // گوش به زنگ بودن تغییرات هش URL برای جلوگیری از پریدن صفحه موقع رفرش
    window.addEventListener('hashchange', handleRouting);
    handleRouting(); 
}

// سیستم مسیردهی بر پایه هش (SPA Hash Router) کاملا پیشرفته
function handleRouting() {
    const hash = window.location.hash || '#home';
    
    if (hash === '#home') {
        showPage('welcomePage');
    } else if (hash === '#categories') {
        showPage('categoriesPage');
    } else if (hash.startsWith('#gallery')) {
        // ساختار هش: #gallery/cars/IKCO
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
        
        allMods = rows.map(row => {
            const cells = row.c;
            return {
                id: cells[0] ? String(cells[0].v) : '',
                title: cells[1] ? String(cells[1].v) : '',
                category: cells[2] ? String(cells[2].v).toLowerCase().trim() : '',
                brand: cells[3] ? String(cells[3].v) : '',
                subcategory: cells[4] ? String(cells[4].v) : '',
                image: cells[5] ? String(cells[5].v) : '',
                backImage: (cells[6] && cells[6].v) ? String(cells[6].v) : (cells[5] ? String(cells[5].v) : ''),
                size: cells[7] ? String(cells[7].v) : '',
                version: cells[8] ? String(cells[8].v) : '1.0',
                download: cells[9] ? String(cells[9].v) : '#',
                description: cells[10] ? String(cells[10].v) : '',
                author: {
                    name: cells[11] ? String(cells[11].v) : 'Admin',
                    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cells[11] ? cells[11].v : 'Admin')}`
                },
                tags: cells[12] ? String(cells[12].v).split(',').map(t => t.trim()) : ['mod']
            };
        }).filter(item => item.id && item.title).reverse(); 
    } catch (e) {
        console.error("خطا در ارتباط با شیت:", e);
    }
}

function renderCategoriesMenu() {
    const grid = document.getElementById('categoriesMenuGrid');
    grid.innerHTML = '';
    mainCategories.forEach(cat => {
        grid.innerHTML += `
            <div onclick="navigateTo('gallery', '${cat.id}')" class="relative h-28 rounded-xl overflow-hidden cursor-pointer group border border-[#1e2030] bg-[#12131c]">
                <img src="${cat.img}" class="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:scale-105 group-hover:opacity-5 transition-all duration-300 blur-[1px]">
                <div class="absolute inset-0 bg-gradient-to-t from-[#0b0c10] to-transparent flex flex-col justify-end p-4">
                    <span class="text-base mb-1">${cat.icon}</span>
                    <h3 class="font-bold text-xs text-white">${cat.label}</h3>
                </div>
            </div>
        `;
    });
}

// رندر سایدبار منیجر همراه با شمارشگر و افکت آکاردئونی بسیار روان
function renderExplorerTree() {
    const treeContainer = document.getElementById('explorerTree');
    treeContainer.innerHTML = '';

    const latestActive = (currentCategory === 'latest') ? 'bg-cmAccent text-white font-bold' : 'text-gray-400 hover:bg-[#1e2030]/50';
    treeContainer.innerHTML += `
        <div onclick="navigateTo('gallery', 'latest')" class="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all ${latestActive}">
            <div class="flex items-center gap-2">
                <i class="fas fa-history text-[11px]"></i> <span>جدیدترین مودها (۹ اخیر)</span>
            </div>
            <span class="text-[9px] bg-[#0b0c10]/60 px-1.5 py-0.5 rounded text-gray-400">${Math.min(allMods.length, 9)}</span>
        </div>
    `;

    mainCategories.forEach(cat => {
        const isCurrentCat = (currentCategory === cat.id);
        const isOpen = (openCategoryTree === cat.id);
        const catClass = (isCurrentCat && currentSubFilter === 'all') ? 'bg-[#1e2030] text-cmAccent font-bold' : 'text-gray-400 hover:bg-[#1e2030]/40';
        
        let subItemsHtml = '';
        let subs = [];
        if (cat.id === 'cars') subs = [...new Set(allMods.filter(m => m.category === 'cars').map(m => m.brand))].filter(Boolean);
        if (cat.id === 'maps') subs = [...new Set(allMods.filter(m => m.category === 'maps').map(m => m.subcategory))].filter(Boolean);

        if (subs.length > 0) {
            subItemsHtml = `<div id="sub-folder-${cat.id}" class="submenu-transition ${isOpen ? 'submenu-open' : ''} flex flex-col pr-4 my-0.5 border-r border-[#1e2030] mr-2 gap-0.5">`;
            subs.forEach(sub => {
                const isSubActive = (currentCategory === cat.id && currentSubFilter === sub);
                const subClass = isSubActive ? 'text-cmAccent font-bold bg-cmAccent/5' : 'text-gray-500 hover:text-gray-300';
                const count = allMods.filter(m => m.category === cat.id && (m.brand === sub || m.subcategory === sub)).length;

                subItemsHtml += `
                    <div onclick="navigateTo('gallery', '${cat.id}', '${sub}')" class="px-2 py-1.5 rounded-md text-[11px] cursor-pointer transition-all flex items-center justify-between ${subClass}">
                        <div class="flex items-center gap-1.5">
                            <i class="fas fa-folder text-[10px] opacity-60"></i> <span>${sub}</span>
                        </div>
                        <span class="text-[8px] font-mono opacity-40">${count}</span>
                    </div>
                `;
            });
            subItemsHtml += `</div>`;
        }

        treeContainer.innerHTML += `
            <div class="flex flex-col mt-0.5">
                <div onclick="toggleTreeFolder('${cat.id}')" class="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all ${catClass}">
                    <div class="flex items-center gap-2">
                        <span class="text-xs">${cat.icon}</span> <span>${cat.label}</span>
                    </div>
                    <i class="fas ${isOpen ? 'fa-chevron-down' : 'fa-chevron-left'} text-[8px] opacity-40"></i>
                </div>
                ${subItemsHtml}
            </div>
        `;
    });
}

// مدیریت باز و بسته شدن پوشه با قابلیت انیمیشن آکاردئونی و لغو فیلتر ریز
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

// رندر کارت‌ها بر اساس استاندارد کاملا جدید فیکس شده (تمام مشخصات فنی روی کارت)
function renderCards(mods) {
    const grid = document.getElementById('modsGrid');
    grid.innerHTML = '';

    if (mods.length === 0) {
        grid.innerHTML = `<p class="text-gray-500 col-span-full text-center text-xs py-12">هیچ مودی در این بخش پیدا نشد.</p>`;
        return;
    }

    mods.forEach((mod, index) => {
        const cardBox = document.createElement('div');
        cardBox.className = "flex flex-col gap-3.5"; 
        
        cardBox.innerHTML = `
            <div class="card-perspective h-52 w-full relative">
                <div class="absolute -top-10 left-0 right-0 z-20 flex justify-between px-2 pointer-events-none">
                    <div class="pill-anim bg-[#12131c]/90 border border-[#1e2030] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl shadow-md truncate max-w-[60%]">
                        ${mod.title}
                    </div>
                    <div class="pill-anim bg-[#12131c]/90 border border-[#1e2030] text-gray-300 text-[10px] px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 max-w-[38%]" style="animation-delay: 0.1s;">
                        <img src="${mod.author.avatar}" class="w-3.5 h-3.5 rounded-full bg-[#0b0c10]">
                        <span class="truncate text-cmAccent font-bold">By ${mod.author.name}</span>
                    </div>
                    <div class="flow-line h-4 -bottom-4"></div>
                </div>

                <div class="card-inner w-full h-full cursor-pointer" id="card-${index}" onclick="handleCardClick(event, ${index})">
                    
                    <div class="card-front bg-[#12131c] border border-[#1e2030]">
                        <img src="${mod.image}" class="w-full h-full object-cover select-none" loading="lazy">
                        
                        <div class="absolute bottom-2 right-2 left-2 flex justify-between items-center bg-[#0b0c10]/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] text-gray-300 border border-[#1e2030]/60">
                            <div class="flex items-center gap-3">
                                <span><i class="fas fa-hdd text-cmAccent ml-1"></i>${mod.size}</span>
                                <span><i class="fas fa-code-branch text-cmAccent ml-1"></i>v${mod.version}</span>
                            </div>
                            <span class="font-bold text-white uppercase text-[9px] bg-cmAccent/30 px-2 py-0.5 rounded-md border border-cmAccent/20">${mod.brand || mod.category}</span>
                        </div>
                    </div>

                    <div class="card-back bg-[#12131c] border border-cmAccent/20">
                        <img src="${mod.backImage}" class="w-full h-full object-cover select-none" loading="lazy">
                        <div class="absolute top-2 left-2 bg-[#0b0c10]/70 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] text-cmAccent font-bold border border-[#1e2030]">
                            نمای عقب <i class="fas fa-sync-alt mr-1 text-[8px]"></i>
                        </div>
                    </div>

                </div>
            </div>

            <div class="w-full flex gap-2">
                <button onclick="openInfoModal(event, ${index})" class="w-11 h-11 bg-[#12131c] hover:bg-[#1e2030] border border-[#1e2030] rounded-xl flex items-center justify-center text-cmAccent text-base transition-all shadow-md group">
                    <i class="fas fa-info-circle group-hover:scale-110 transition-transform"></i>
                </button>
                <a href="${mod.download}" target="_blank" onclick="event.stopPropagation();" class="btn-download-glow flex-1 h-11 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2">
                    <i class="fas fa-cloud-download-alt animate-bounce"></i> دانلود مستقیم مود
                </a>
            </div>
        `;
        grid.appendChild(cardBox);
    });
}

function handleCardClick(event, index) {
    const card = document.getElementById(`card-${index}`);
    card.classList.toggle('card-flipped');
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
    event.stopPropagation(); 
    const cardContainer = event.currentTarget.closest('.flex-col');
    const cardTitle = cardContainer.querySelector('.pill-anim').innerText.trim();
    const mod = allMods.find(m => m.title.trim() === cardTitle);
    
    if(!mod) return;

    document.getElementById('infoModalTitle').innerText = mod.title;
    document.getElementById('infoModalDesc').innerText = mod.description || "توضیحاتی برای این مود ثبت نشده است.";
    document.getElementById('infoModalAuthor').innerText = mod.author.name;
    document.getElementById('infoModalAvatar').src = mod.author.avatar;
    document.getElementById('infoModalCategory').innerText = mod.category;
    
    const tagsBox = document.getElementById('infoModalTags');
    tagsBox.innerHTML = '';
    mod.tags.forEach(t => {
        if(t) tagsBox.innerHTML += `<span class="bg-[#0b0c10] border border-[#1e2030] text-gray-400 text-[10px] px-2 py-0.5 rounded-md">#${t}</span>`;
    });

    document.getElementById('infoModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('infoModalContainer').classList.remove('scale-95'), 10);
}

function closeInfoModal() {
    document.getElementById('infoModalContainer').classList.add('scale-95');
    setTimeout(() => document.getElementById('infoModal').classList.add('hidden'), 200);
}

document.getElementById('searchBar').addEventListener('input', filterAndRender);
window.addEventListener('DOMContentLoaded', init);
