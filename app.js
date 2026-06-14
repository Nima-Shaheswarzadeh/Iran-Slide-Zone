let allMods = [];
let currentCategory = 'all';
let currentSubFilter = 'all';

// ۷ دسته‌بندی کامل درخواستی شما با ایموجی و عکس پس‌زمینه
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
    await fetchMods();
    renderCategoriesMenu();
    renderQuickNav();
    showPage('welcomePage');
}

async function fetchMods() {
    try {
        const response = await fetch('data/mods.json');
        allMods = await response.json();
    } catch (e) {
        console.error("خطا در خواندن فایل داده:", e);
    }
}

// رندر صفحه منوی اصلی دسته‌بندی‌ها با گوشه‌های خمیده و پس‌زمینه مات
function renderCategoriesMenu() {
    const grid = document.getElementById('categoriesMenuGrid');
    grid.innerHTML = '';
    mainCategories.forEach(cat => {
        grid.innerHTML += `
            <div onclick="openCategory('${cat.id}')" class="relative h-36 rounded-2xl overflow-hidden cursor-pointer group border border-gray-800/80 shadow-md">
                <img src="${cat.img}" class="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 group-hover:opacity-15 transition-all duration-500 blur-[2px]">
                <div class="absolute inset-0 bg-gradient-to-t from-brandBg via-brandBg/40 to-transparent flex flex-col justify-end p-4">
                    <span class="text-xl mb-1">${cat.icon}</span>
                    <h3 class="font-bold text-sm text-brandBlue">${cat.label}</h3>
                </div>
            </div>
        `;
    });
}

// رندر دکمه‌های نوار سریع بالایی بدون ریلود
function renderQuickNav() {
    const nav = document.getElementById('quickNav');
    nav.innerHTML = `<button data-target="all" class="q-nav-btn px-4 py-2 bg-brandBlue text-brandDark font-bold rounded-xl text-xs transition-all">همه مودها</button>`;
    mainCategories.forEach(cat => {
        nav.innerHTML += `<button data-target="${cat.id}" class="q-nav-btn px-4 py-2 bg-brandDark text-gray-400 rounded-xl text-xs hover:bg-gray-800 transition-all">${cat.icon} ${cat.label}</button>`;
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
    currentSubFilter = 'all';

    document.querySelectorAll('.q-nav-btn').forEach(btn => {
        if(btn.getAttribute('data-target') === catId) {
            btn.className = "q-nav-btn px-4 py-2 bg-brandBlue text-brandDark font-bold rounded-xl text-xs transition-all";
        } else {
            btn.className = "q-nav-btn px-4 py-2 bg-brandDark text-gray-400 rounded-xl text-xs hover:bg-gray-800 transition-all";
        }
    });

    const triggerBox = document.getElementById('subFilterTriggerBox');
    const label = document.getElementById('activeSubFilterLabel');
    
    if (catId === 'cars') {
        triggerBox.classList.remove('hidden');
        label.innerText = "انتخاب برند خودرو (نمای اتوگالری کانتنت منیجر)";
    } else if (catId === 'maps') {
        triggerBox.classList.remove('hidden');
        label.innerText = "انتخاب کشور / موقعیت نقشه";
    } else {
        triggerBox.classList.add('hidden');
    }

    showPage('galleryPage');
    filterAndRender();
}

// باز کردن پاپ‌آپ استایل کانتنت منیجر دقیقاً مشابه تصویر ارسالی
function openSubFilterSelector() {
    const cmGrid = document.getElementById('cmGrid');
    const title = document.getElementById('cmModalTitle');
    cmGrid.innerHTML = '';

    if (currentCategory === 'cars') {
        title.innerText = "انتخاب برند خودرو";
        // دکمه ریست همه برندها
        const allCount = allMods.filter(m => m.category === 'cars').length;
        cmGrid.innerHTML += makeCmItem('all', 'همه برندها', 'https://api.dicebear.com/7.x/identicon/svg?seed=all', allCount);
        
        const brands = [...new Set(allMods.filter(m => m.category === 'cars').map(m => m.brand))];
        brands.forEach(b => {
            if(!b) return;
            const count = allMods.filter(m => m.category === 'cars' && m.brand === b).length;
            // تولید لوگوی فرضی شیک، در صورت وجود عکس واقعی جایگزین می‌شود
            const fakeLogo = `https://api.dicebear.com/7.x/initials/svg?seed=${b}&backgroundColor=101a40`;
            cmGrid.innerHTML += makeCmItem(b, b, fakeLogo, count);
        });
    } else if (currentCategory === 'maps') {
        title.innerText = "انتخاب کشور / موقعیت";
        const allCount = allMods.filter(m => m.category === 'maps').length;
        cmGrid.innerHTML += makeCmItem('all', 'همه کشورها', 'https://api.dicebear.com/7.x/identicon/svg?seed=map', allCount);

        const countries = [...new Set(allMods.filter(m => m.category === 'maps').map(m => m.subcategory))];
        countries.forEach(c => {
            if(!c) return;
            const count = allMods.filter(m => m.category === 'maps' && m.subcategory === c).length;
            const flagImg = `https://api.dicebear.com/7.x/initials/svg?seed=${c}&chars=1`;
            cmGrid.innerHTML += makeCmItem(c, c, flagImg, count);
        });
    }

    document.getElementById('cmModal').classList.remove('hidden');
}

function makeCmItem(id, name, logo, count) {
    return `
        <div onclick="selectSubFilter('${id}')" class="bg-[#161f33] border border-gray-800 hover:border-gray-600 rounded p-3 flex flex-col items-center justify-center text-center relative cursor-pointer group transition-all h-24">
            <span class="absolute top-1 right-1 text-[9px] text-gray-500 font-mono">${count}</span>
            <img src="${logo}" class="w-8 h-8 object-contain mb-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <span class="text-[11px] font-bold text-gray-300 truncate w-full">${name}</span>
        </div>
    `;
}

function selectSubFilter(subId) {
    currentSubFilter = subId;
    document.getElementById('activeSubFilterLabel').innerText = subId === 'all' ? 'همه موارد' : subId;
    closeSubFilterSelector();
    filterAndRender();
}

function closeSubFilterSelector() {
    document.getElementById('cmModal').classList.add('hidden');
}

// رندر فلش کارت‌ها با قابلیت چرخش بلور اکریلیک و پشت کارت ساده به خواست شما
function renderCards(mods) {
    const grid = document.getElementById('modsGrid');
    grid.innerHTML = '';

    if (mods.length === 0) {
        grid.innerHTML = `<p class="text-gray-500 col-span-full text-center text-xs py-12">هیچ مودی در این بخش پیدا نشد.</p>`;
        return;
    }

    mods.forEach((mod, index) => {
        const cardBox = document.createElement('div');
        cardBox.className = "card-perspective h-[420px] w-full relative";
        
        cardBox.innerHTML = `
            <div class="absolute -top-10 left-0 right-0 z-20 flex justify-center">
                <div class="acrylic border border-gray-700/50 text-gray-200 text-xs font-bold px-4 py-1.5 rounded-xl shadow-lg truncate max-w-[85%] text-center">
                    ${mod.title}
                </div>
                <div class="flow-line h-4 -bottom-4"></div>
            </div>

            <div class="card-inner w-full h-full cursor-pointer" id="card-${index}" onclick="handleCardClick(event, ${index})">
                
                <div class="card-front bg-brandDark/40 border border-gray-800/80 flex flex-col justify-between shadow-xl">
                    <div class="flex-1 flex flex-col relative">
                        <div class="w-full h-[55%] bg-gray-950 overflow-hidden relative">
                            <img src="${mod.image}" class="w-full h-full object-cover" loading="lazy">
                            <span class="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-[9px] px-2 py-0.5 rounded text-brandBlue uppercase">${mod.category}</span>
                        </div>
                        <div class="w-full h-[45%] bg-gray-900 border-t border-brandBg overflow-hidden">
                            <img src="${mod.backImage || mod.image}" class="w-full h-full object-cover" loading="lazy">
                        </div>
                    </div>
                    <div class="px-4 py-3 bg-brandBg/60 flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-800/40">
                        <span><i class="fas fa-hdd ml-1 text-brandBlue"></i>${mod.size}</span>
                        <span><i class="fas fa-code-branch ml-1 text-brandBlue"></i>v${mod.version}</span>
                    </div>
                </div>

                <div class="card-back acrylic-flip border border-brandBlue/30 p-4 flex flex-col justify-between shadow-2xl">
                    <div class="text-left">
                        <span class="text-[9px] bg-brandBg text-brandBlue font-bold px-2 py-0.5 rounded uppercase">
                            ${mod.category === 'cars' ? `🚗 ${mod.brand}` : `✨ ${mod.category}`}
                        </span>
                    </div>

                    <div class="flex-1 flex flex-col justify-center gap-3">
                        <p class="text-[11px] text-gray-300 text-justify line-clamp-6 leading-relaxed">
                            ${mod.description || 'توضیحات تکمیلی برای این مود ثبت نشده است.'}
                        </p>
                        
                        <button onclick="openModal(event, '${mod.title}', \`${mod.description}\`)" class="w-full bg-brandBg/80 hover:bg-gray-800 border border-gray-700/50 text-[10px] py-1.5 rounded-lg text-gray-400">
                            مشاهده متن کامل توضیحات
                        </button>
                        
                        <a href="${mod.download}" target="_blank" onclick="event.stopPropagation();" class="w-full block text-center bg-brandBlue hover:bg-blue-600 text-brandDark text-xs font-black py-2.5 rounded-xl shadow-md transition-all">
                            <i class="fas fa-download ml-1.5"></i>دانلود مستقیم مود
                        </a>
                    </div>

                    <div class="flex items-center gap-2 border-t border-gray-800/80 pt-2.5 text-[10px] text-gray-500">
                        <img src="${mod.author?.avatar}" class="w-4 h-4 rounded-full bg-brandBg" alt="avatar">
                        <span>ارسال توسط: <strong class="text-gray-400">${mod.author?.name || 'ادمین'}</strong></span>
                    </div>
                </div>

            </div>
        `;
        grid.appendChild(cardBox);
    });
}

function handleCardClick(event, index) {
    if (event.target.closest('button') || event.target.closest('a')) return;
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

document.getElementById('quickNav').addEventListener('click', (e) => {
    if(!e.target.classList.contains('q-nav-btn')) return;
    openCategory(e.target.getAttribute('data-target'));
});

function openModal(e, title, text) {
    e.stopPropagation();
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerText = text;
    document.getElementById('descModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('modalContainer').classList.remove('scale-95'), 10);
}

function closeModal() {
    document.getElementById('modalContainer').classList.add('scale-95');
    setTimeout(() => document.getElementById('descModal').classList.add('hidden'), 200);
}

document.getElementById('searchBar').addEventListener('input', filterAndRender);
window.addEventListener('DOMContentLoaded', init);
