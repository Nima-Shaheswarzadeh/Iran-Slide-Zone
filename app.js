// app.js

// ---------- STATE ----------
let allMods = [];
let currentCategory = null;      // e.g., 'cars', never 'all'
let currentSubFilter = 'all';
let openCategoryTree = null;     // currently open category in sidebar for sub-menus

// ---------- GOOGLE SHEETS ----------
const SPREADSHEET_ID = "1RFi_Luu7Ip9IWrhI8KaSOlhaPEVSn7RZKAzdi-JZmSA"; 
const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

// Main categories metadata
const mainCategories = [
    { id: 'cars',    label: 'Cars',     icon: '🚗', img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=400' },
    { id: 'maps',    label: 'Maps',     icon: '🗺️', img: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=400' },
    { id: 'csp',     label: 'CSP',      icon: '👨‍💻', img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=400' },
    { id: 'graphics',label: 'Graphics', icon: '🌠', img: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=400' },
    { id: 'servers', label: 'Servers',  icon: '🌐', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400' },
    { id: 'apps',    label: 'Apps',     icon: '📲', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400' },
    { id: 'drivers', label: 'Drivers',  icon: '👥', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=400' }
];

// Which categories have subdirectories (brands / countries)
const categoriesWithSubs = ['cars', 'maps'];

// ---------- INITIALIZATION ----------
async function init() {
    await fetchModsFromSheets();
    // Apply URL hash on load
    applyHash();
    window.addEventListener('hashchange', onHashChange);
}

// ---------- DATA FETCHING ----------
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
        }).filter(item => item.id && item.title);
    } catch (e) {
        console.error("خطا در لود زنده داده‌ها از گوگل شیت:", e);
        allMods = [];
    }
}

// ---------- HASH BASED ROUTING ----------
let ignoreNextHashChange = false;

function navigateTo(page, category = null, sub = null) {
    let hash = '';
    if (page === 'home') hash = '#home';
    else if (page === 'categories') hash = '#categories';
    else if (page === 'gallery' && category) {
        hash = '#gallery/' + category;
        if (sub) hash += '/' + sub;
    }
    // Prevent duplicate hash change causing extra render
    if (window.location.hash === hash) {
        // still apply state to ensure UI matches
        applyHashState();
        return;
    }
    ignoreNextHashChange = true;
    window.location.hash = hash;
    applyHashState();  // manual apply before hashchange fires
}

function onHashChange() {
    if (ignoreNextHashChange) {
        ignoreNextHashChange = false;
        return;
    }
    applyHashState();
}

function applyHash() {
    applyHashState();
}

function parseHash() {
    const hash = window.location.hash.slice(1); // remove '#'
    const parts = hash.split('/');
    let page = 'home';
    let category = null;
    let sub = null;

    if (parts[0] === 'categories') page = 'categories';
    else if (parts[0] === 'gallery' && parts[1]) {
        page = 'gallery';
        category = parts[1];
        if (parts[2]) sub = parts[2];
    }
    // else default 'home'
    return { page, category, sub };
}

function applyHashState() {
    const { page, category, sub } = parseHash();

    // Reset filter state
    currentCategory = category;
    currentSubFilter = sub || 'all';
    openCategoryTree = null; // will be set by rendering later if needed

    // Show correct page
    document.getElementById('welcomePage').classList.add('hidden');
    document.getElementById('categoriesPage').classList.add('hidden');
    document.getElementById('galleryPage').classList.add('hidden');
    document.getElementById('mainHeader').classList.add('hidden');

    if (page === 'home') {
        document.getElementById('welcomePage').classList.remove('hidden');
    } else if (page === 'categories') {
        document.getElementById('categoriesPage').classList.remove('hidden');
        renderCategoriesMenu();
    } else if (page === 'gallery' && category) {
        document.getElementById('galleryPage').classList.remove('hidden');
        document.getElementById('mainHeader').classList.remove('hidden');
        // If we have a category, maybe auto-open its tree
        if (categoriesWithSubs.includes(category)) {
            openCategoryTree = category;
        }
        renderExplorerTree();
        filterAndRender();
    }
}

// ---------- CATEGORIES GRID (landing -> selection) ----------
function renderCategoriesMenu() {
    const grid = document.getElementById('categoriesMenuGrid');
    grid.innerHTML = '';
    mainCategories.forEach(cat => {
        grid.innerHTML += `
            <div onclick="navigateTo('gallery', '${cat.id}')" class="relative h-32 rounded-2xl overflow-hidden cursor-pointer group border border-white/5 shadow-lg hover:shadow-accent/20 transition-all duration-300 hover:-translate-y-1">
                <img src="${cat.img}" class="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 group-hover:opacity-10 transition-all duration-700 blur-[1px]">
                <div class="absolute inset-0 bg-gradient-to-t from-primary-light via-primary-light/40 to-transparent flex flex-col justify-end p-4">
                    <span class="text-lg mb-1 drop-shadow">${cat.icon}</span>
                    <h3 class="font-bold text-xs text-accent">${cat.label}</h3>
                </div>
            </div>
        `;
    });
}

// ---------- SIDEBAR EXPLORER (ACCORDION) ----------
function renderExplorerTree() {
    const treeContainer = document.getElementById('explorerTree');
    treeContainer.innerHTML = '';

    mainCategories.forEach(cat => {
        const hasSubs = categoriesWithSubs.includes(cat.id);
        const isOpen = (openCategoryTree === cat.id);
        const isActive = (currentCategory === cat.id);
        const catClass = isActive ? 'bg-accent/10 text-accent font-bold border-r-2 border-accent' : 'text-gray-400 hover:bg-white/5';

        let subItemsHtml = '';
        if (hasSubs && isOpen) {
            let subs = [];
            if (cat.id === 'cars') {
                subs = [...new Set(allMods.filter(m => m.category === 'cars').map(m => m.brand))].filter(Boolean);
            } else if (cat.id === 'maps') {
                subs = [...new Set(allMods.filter(m => m.category === 'maps').map(m => m.subcategory))].filter(Boolean);
            }
            subItemsHtml = `<div class="sub-tree pr-4 ml-2 border-r border-white/5" id="sub-${cat.id}">`;
            subs.forEach(sub => {
                const subActive = (currentSubFilter === sub);
                const subClass = subActive ? 'text-accent font-bold bg-accent/10' : 'text-gray-500 hover:text-gray-200';
                subItemsHtml += `
                    <div onclick="selectSubFilter(event, '${cat.id}', '${sub}')" class="px-2 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all flex items-center gap-1.5 ${subClass}">
                        <i class="fas fa-angle-left text-[9px]"></i> <span>${sub}</span>
                    </div>`;
            });
            subItemsHtml += `</div>`;
        }

        treeContainer.innerHTML += `
            <div>
                <div onclick="${hasSubs ? `toggleTreeCategory('${cat.id}')` : `navigateTo('gallery', '${cat.id}')`}"
                     class="flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${catClass}">
                    <div class="flex items-center gap-2">
                        <span>${cat.icon}</span> <span>${cat.label}</span>
                    </div>
                    ${hasSubs ? `<i class="fas ${isOpen ? 'fa-chevron-down' : 'fa-chevron-left'} text-[10px] opacity-50"></i>` : ''}
                </div>
                ${subItemsHtml}
            </div>`;
    });

    // Trigger max-height animation for open sub-trees after DOM is ready
    requestAnimationFrame(() => {
        document.querySelectorAll('.sub-tree').forEach(sub => {
            const isOpen = sub.parentElement.querySelector('[class*="fa-chevron-down"]') !== null;
            if (isOpen) {
                sub.style.maxHeight = sub.scrollHeight + 'px';
            } else {
                sub.style.maxHeight = '0px';
            }
        });
    });
}

// Toggle a category in sidebar (only for categories with subs)
function toggleTreeCategory(catId) {
    if (openCategoryTree === catId) {
        // Close sub-menu and show all items of this category
        openCategoryTree = null;
        currentCategory = catId;
        currentSubFilter = 'all';
    } else {
        // Open this category's sub-menu
        openCategoryTree = catId;
        currentCategory = catId;
        currentSubFilter = 'all';
    }
    // Update hash
    navigateTo('gallery', currentCategory, currentSubFilter === 'all' ? undefined : currentSubFilter);
    // UI updated via hash -> applyHashState, but we call render and filter manually after hash change
    // The applyHashState will be called from navigateTo, which calls renderExplorerTree & filterAndRender.
}

// Sub filter click
function selectSubFilter(event, catId, sub) {
    event.stopPropagation();
    currentCategory = catId;
    currentSubFilter = sub;
    // Update hash
    navigateTo('gallery', catId, sub === 'all' ? undefined : sub);
}

// ---------- CARD RENDERING ----------
function renderCards(mods) {
    const grid = document.getElementById('modsGrid');
    grid.innerHTML = '';

    if (mods.length === 0) {
        grid.innerHTML = `<p class="text-gray-400 col-span-full text-center text-xs py-20">هیچ مودی در این بخش پیدا نشد.</p>`;
        return;
    }

    mods.forEach((mod, index) => {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = "flex flex-col gap-3 relative pt-8"; // pt-8 for pills

        // Floating pills
        cardWrapper.innerHTML = `
            <div class="absolute top-0 right-0 left-0 flex justify-between items-center px-2 z-10">
                <div class="mod-pill pill-animate max-w-[65%]" style="animation-delay: ${index * 0.08}s;" title="${mod.title}">${mod.title}</div>
                <div class="mod-pill pill-animate flex items-center gap-2" style="animation-delay: ${index * 0.08 + 0.03}s;">
                    <img src="${mod.author.avatar}" class="w-4 h-4 rounded-full object-cover border border-white/20">
                    <span class="truncate max-w-[80px]">${mod.author.name}</span>
                </div>
            </div>

            <div class="card-perspective h-56 w-full">
                <div class="card-inner w-full h-full cursor-pointer" id="card-${index}" onclick="flipCard(event, ${index})">
                    <!-- FRONT FACE -->
                    <div class="card-front bg-card-bg/40 border border-white/5 relative">
                        <img src="${mod.image}" class="w-full h-full object-cover" loading="lazy">
                        <div class="absolute bottom-0 right-0 left-0 bg-black/60 backdrop-blur-md px-3 py-1.5 flex items-center justify-between text-[10px] text-gray-300 border-t border-white/10 rounded-b-xl">
                            <span><i class="fas fa-hdd ml-1 text-accent"></i>${mod.size}</span>
                            <span><i class="fas fa-code-branch ml-1 text-accent"></i>${mod.version}</span>
                            <span class="uppercase font-bold text-accent">${mod.category}</span>
                            <span>${mod.brand || mod.subcategory || ''}</span>
                        </div>
                    </div>
                    <!-- BACK FACE (only rear image) -->
                    <div class="card-back bg-card-bg/40 border border-accent/10 relative">
                        <img src="${mod.backImage}" class="w-full h-full object-cover" loading="lazy">
                        <div class="absolute top-2 left-2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] text-gray-300 border border-white/10 flex items-center gap-1">
                            <i class="fas fa-sync-alt text-accent text-[8px]"></i> Rear View
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex gap-2">
                <button class="info-btn w-11 h-11 bg-card-bg/80 hover:bg-card-bg border border-white/5 rounded-xl flex items-center justify-center text-accent text-sm transition-all shadow-lg hover:shadow-accent/20" data-mod-index="${index}">
                    <i class="fas fa-info-circle"></i>
                </button>
                <a href="${mod.download}" target="_blank" class="download-btn flex-1 h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95">
                    <i class="fas fa-download"></i> دانلود مستقیم
                </a>
            </div>
        `;

        grid.appendChild(cardWrapper);
    });

    // Attach event listeners for download buttons (micro-interactions)
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const originalHref = this.getAttribute('href');
            const icon = this.querySelector('i');

            // Tactile scale down
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 150);

            // Change icon to wave and animate
            if (icon) {
                icon.className = 'fas fa-water download-wave';
                // After animation duration, open link
                setTimeout(() => {
                    window.open(originalHref, '_blank');
                    // Restore icon
                    icon.className = 'fas fa-download';
                }, 650);
            } else {
                window.open(originalHref, '_blank');
            }
        });
    });

    // Attach info button listeners
    document.querySelectorAll('.info-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const modIndex = parseInt(this.getAttribute('data-mod-index'));
            const mod = allMods.find(m => m.id === mods[modIndex].id); // find original mod
            if (mod) openInfoModal(mod);
        });
    });
}

// Card flip
function flipCard(event, index) {
    const card = document.getElementById(`card-${index}`);
    card.classList.toggle('card-flipped');
}

// ---------- FILTER & RENDER ----------
function filterAndRender() {
    const search = document.getElementById('searchBar').value.toLowerCase();
    const filtered = allMods.filter(m => {
        // currentCategory is never 'all', always a specific category
        const matchCat = (m.category === currentCategory);
        // sub filter: brand for cars, subcategory for maps, else 'all' ignores
        let matchSub = true;
        if (currentSubFilter !== 'all') {
            if (currentCategory === 'cars') matchSub = (m.brand === currentSubFilter);
            else if (currentCategory === 'maps') matchSub = (m.subcategory === currentSubFilter);
            else matchSub = true; // no sub filter for other categories
        }
        const matchSearch = m.title.toLowerCase().includes(search) || m.tags.some(t => t.toLowerCase().includes(search));
        return matchCat && matchSub && matchSearch;
    });
    renderCards(filtered);
}

// ---------- INFO MODAL ----------
function openInfoModal(mod) {
    document.getElementById('infoModalTitle').innerText = mod.title;
    document.getElementById('infoModalDesc').innerText = mod.description || "توضیحاتی برای این مود ثبت نشده است.";
    document.getElementById('infoModalAuthor').innerText = mod.author.name;
    document.getElementById('infoModalAvatar').src = mod.author.avatar;
    document.getElementById('infoModalCategory').innerText = mod.category;
    
    const tagsBox = document.getElementById('infoModalTags');
    tagsBox.innerHTML = '';
    mod.tags.forEach(t => {
        if(t) tagsBox.innerHTML += `<span class="bg-primary/80 border border-white/5 text-gray-300 text-[10px] px-2 py-0.5 rounded-md">#${t}</span>`;
    });

    document.getElementById('infoModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('infoModalContainer').classList.remove('scale-95'), 10);
}

function closeInfoModal() {
    document.getElementById('infoModalContainer').classList.add('scale-95');
    setTimeout(() => document.getElementById('infoModal').classList.add('hidden'), 200);
}

// ---------- SEARCH EVENT ----------
document.getElementById('searchBar').addEventListener('input', filterAndRender);

// ---------- START ----------
window.addEventListener('DOMContentLoaded', init);
