let allMods = [];
let currentCategory = 'all';
let currentSubFilter = 'all';
let openCategoryTree = null; // برای ثبت دسته‌بندی باز شده در سایدبار

// شناسه گوگل شیت خودت را دقیقاً اینجا بگذار
const SPREADSHEET_ID = "1A2B3C4D5E6F7G8H9I0J"; 
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
    showPage('welcomePage');
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
        }).filter(item => item.id && item.title);
    } catch (e) {
        console.error("خطا در لود زنده داده‌ها از گوگل شیت:", e);
    }
}

function renderCategoriesMenu() {
    const grid = document.getElementById('categoriesMenuGrid');
    grid.innerHTML = '';
    mainCategories.forEach(cat => {
        grid.innerHTML += `
            <div onclick="openCategory('${cat.id}')" class="relative h-32 rounded-2xl overflow-hidden cursor-pointer group border border-gray-800/70 shadow-md">
                <img src="${cat.img}" class="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 group-hover:opacity-15 transition-all duration-500 blur-[1px]">
                <div class="absolute inset-0 bg-gradient-to-t from-brandBg via-brandBg/30 to-transparent flex flex-col justify-end p-4">
                    <span class="text-lg mb-1">${cat.icon}</span>
                    <h3 class="font-bold text-xs text-brandBlue">${cat.label}</h3>
                </div>
            </div>
        `;
    });
}

// ساخت سیستم منوی درختی سایدبار (مشابه فایل اکسپلورر ویندوز)
function renderExplorerTree() {
    const treeContainer = document.getElementById('explorerTree');
    treeContainer.innerHTML = '';

    // گزینه نمایش همه موارد در بالای فایل اکسپلورر
    const allActive = (currentCategory === 'all') ? 'bg-brandBlue text-brandDark font-bold' : 'text-gray-400 hover:bg-brandDark/50';
    treeContainer.innerHTML += `
        <div onclick="selectTreeCategory('all')" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${allActive}">
            <i class="fas fa-hdd"></i> <span>Root (همه مودها)</span>
        </div>
    `;

    mainCategories.forEach(cat => {
        const isCurrent = (currentCategory === cat.id);
        const isOpen = (openCategoryTree === cat.id);
        const catClass = isCurrent ? 'bg-brandDark text-brandBlue font-bold border-r-2 border-brandBlue' : 'text-gray-400 hover:bg-brandDark/40';
        
        let subItemsHtml = '';
        
        // اگر دسته بندی باز بود، زیر مجموعه‌ها (برند یا کشور) رندر شوند
        if (isOpen) {
            let subs = [];
            if (cat.id === 'cars') subs = [...new Set(allMods.filter(m => m.category === 'cars').map(m => m.brand))].filter(Boolean);
            if (cat.id === 'maps') subs = [...new Set(allMods.filter(m => m.category === 'maps').map(m => m.subcategory))].filter(Boolean);

            subItemsHtml = `<div class="flex flex-col pr-4 mt-1 gap-0.5 border-r border-gray-800/60 mr-2">`;
            subs.forEach(sub => {
                const isSubActive = (currentSubFilter === sub);
                const subClass = isSubActive ? 'text-brandBlue font-bold bg-brandBlue/5' : 'text-gray-500 hover:text-gray-300';
                subItemsHtml += `
                    <div onclick="selectTreeSub('${cat.id}', '${sub}', event)" class="px-2 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all flex items-center gap-1.5 ${subClass}">
                        <i class="fas fa-angle-left text-[9px]"></i> <span>${sub}</span>
                    </div>
                `;
            });
            subItemsHtml += `</div>`;
        }

        treeContainer.innerHTML += `
            <div class="flex flex-col">
                <div onclick="toggleTreeCategory('${cat.id}')" class="flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${catClass}">
                    <div class="flex items-center gap-2">
                        <span>${cat.icon}</span> <span>${cat.label}</span>
                    </div>
                    <i class="fas ${isOpen ? 'fa-chevron-down' : 'fa-chevron-left'} text-[10px] opacity-60"></i>
                </div>
                ${subItemsHtml}
            </div>
        `;
    });
}

function showPage(pageId) {
    document.getElementById('welcomePage').classList.add('hidden');
    document.getElementById('categoriesPage').classList.add('hidden');
    document.getElementById('galleryPage').classList.add('hidden');
    document.getElementById('mainHeader').classList.add('hidden');

    document.getElementById(pageId).classList.remove('hidden');
    if (pageId === 'galleryPage') document.getElementById('mainHeader').classList.remove('hidden');
}

function openCategory(catId) {
    currentCategory = catId;
    openCategoryTree = catId; // خودکار زیرمنو باز شود
    currentSubFilter = 'all';
    showPage('galleryPage');
    renderExplorerTree();
    filterAndRender();
}

// مدیریت کلیک روی دسته‌بندی اصلی در سایدبار
function toggleTreeCategory(catId) {
    if (openCategoryTree === catId) {
        // کلیک مجدد: بستن زیرمجموعه و نشان دادن کل موارد دسته‌بندی بدون فیلتر فرعی
        openCategoryTree = null;
        currentCategory = catId;
        currentSubFilter = 'all';
    } else {
        openCategoryTree = catId;
        currentCategory = catId;
        currentSubFilter = 'all';
    }
    renderExplorerTree();
    filterAndRender();
}

function selectTreeCategory(catId) {
    currentCategory = catId;
    openCategoryTree = (catId === 'all') ? null : catId;
    currentSubFilter = 'all';
    renderExplorerTree();
    filterAndRender();
}

function selectTreeSub(catId, subName, event) {
    event.stopPropagation(); // جلوگیری از بسته شدن منوی مادری
    currentCategory = catId;
    currentSubFilter = subName;
    renderExplorerTree();
    filterAndRender();
}

// رندر فلش کارت‌ها با لبه‌های کاملاً گرد، نسبت عکس ۴:۳ افقی، و دکمه‌های پایینی ثابت در لایه بیرونی
function renderCards(mods) {
    const grid = document.getElementById('modsGrid');
    grid.innerHTML = '';

    if (mods.length === 0) {
        grid.innerHTML = `<p class="text-gray-500 col-span-full text-center text-xs py-12">هیچ مودی در این بخش پیدا نشد.</p>`;
        return;
    }

    mods.forEach((mod, index) => {
        const cardBox = document.createElement('div');
        cardBox.className = "flex flex-col gap-3"; // سبد نگه‌دارنده کارت و دکمه‌ها برای چسبیدن به هم
        
        cardBox.innerHTML = `
            <div class="card-perspective h-56 w-full relative">
                <div class="absolute -top-10 left-0 right-0 z-20 flex justify-center">
                    <div class="acrylic border border-gray-800/80 text-gray-200 text-[11px] font-bold px-4 py-1.5 rounded-xl shadow-lg truncate max-w-[85%] text-center">
                        ${mod.title}
                    </div>
                    <div class="flow-line h-4 -bottom-4"></div>
                </div>

                <div class="card-inner w-full h-full cursor-pointer" id="card-${index}" onclick="handleCardClick(event, ${index})">
                    
                    <div class="card-front bg-brandDark/40 border border-gray-800/60 relative">
                        <img src="${mod.image}" class="w-full h-full object-cover" loading="lazy">
                        <div class="absolute bottom-2 right-2 left-2 flex justify-between items-center bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] text-gray-400">
                            <span><i class="fas fa-hdd ml-1 text-brandBlue"></i>${mod.size}</span>
                            <span class="uppercase text-brandBlue font-bold">${mod.brand || mod.category}</span>
                        </div>
                    </div>

                    <div class="card-back bg-brandDark/50 border border-brandBlue/20 relative">
                        <img src="${mod.backImage}" class="w-full h-full object-cover" loading="lazy">
                        <div class="absolute bottom-2 right-2 left-2 flex justify-between items-center bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] text-gray-400">
                            <span><i class="fas fa-code-branch ml-1 text-brandBlue"></i>v${mod.version}</span>
                            <span class="text-emerald-400">نمای عقب <i class="fas fa-sync mr-1"></i></span>
                        </div>
                    </div>

                </div>
            </div>

            <div class="w-full flex gap-2">
                <button onclick="openInfoModal(event, ${index})" class="w-11 h-11 bg-brandDark/60 hover:bg-brandDark border border-gray-800 rounded-xl flex items-center justify-center text-brandBlue text-sm transition-all shadow-md">
                    <i class="fas fa-info-circle"></i>
                </button>
                <a href="${mod.download}" target="_blank" onclick="event.stopPropagation();" class="flex-1 h-11 bg-brandBlue hover:bg-blue-600 text-brandDark font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brandBlue/5 transition-all">
                    <i class="fas fa-cloud-download-alt"></i> دانلود مستقیم مود
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
    const filtered = allMods.filter(m => {
        const matchCat = (currentCategory === 'all' || m.category === currentCategory);
        const matchSub = (currentSubFilter === 'all' || m.brand === currentSubFilter || m.subcategory === currentSubFilter);
        const matchSearch = m.title.toLowerCase().includes(search) || m.tags.some(t => t.toLowerCase().includes(search));
        return matchCat && matchSub && matchSearch;
    });
    renderCards(filtered);
}

// مدیریت کلیک دکمه اطلاعات و لود محتوایی درون پاپ‌آپ
function openInfoModal(event, index) {
    event.stopPropagation(); // جلوگیری از چرخش کارت پشت دکمه
    const mod = allMods[index];
    
    document.getElementById('infoModalTitle').innerText = mod.title;
    document.getElementById('infoModalDesc').innerText = mod.description || "توضیحاتی برای این مود ثبت نشده است.";
    document.getElementById('infoModalAuthor').innerText = mod.author.name;
    document.getElementById('infoModalAvatar').src = mod.author.avatar;
    document.getElementById('infoModalCategory').innerText = mod.category;
    
    const tagsBox = document.getElementById('infoModalTags');
    tagsBox.innerHTML = '';
    mod.tags.forEach(t => {
        if(t) tagsBox.innerHTML += `<span class="bg-brandDark border border-gray-800 text-gray-400 text-[10px] px-2 py-0.5 rounded-md">#${t}</span>`;
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
