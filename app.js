let allMods = [];
let currentCategory = 'all';
let currentSubFilter = 'all';

async function fetchMods() {
    try {
        const response = await fetch('data/mods.json');
        allMods = await response.json();
    } catch (e) {
        console.error("خطا در لود داده‌ها", e);
    }
}

// سیستم مدیریت صفحات (SPA Engine)
function showPage(pageId) {
    document.getElementById('welcomePage').classList.add('hidden');
    document.getElementById('categoriesPage').classList.add('hidden');
    document.getElementById('galleryPage').classList.add('hidden');
    document.getElementById('mainHeader').classList.add('hidden');

    document.getElementById(pageId).classList.remove('hidden');
    if (pageId === 'galleryPage') {
        document.getElementById('mainHeader').classList.remove('hidden');
    }
}

function openCategory(cat) {
    currentCategory = cat;
    currentSubFilter = 'all';
    
    // هماهنگ کردن استایل نوار بالای گالری
    document.querySelectorAll('.q-nav-btn').forEach(btn => {
        if(btn.getAttribute('data-target') === cat) {
            btn.className = "q-nav-btn px-4 py-2 bg-brandBlue text-brandDark font-bold rounded-xl text-xs transition-all";
        } else {
            btn.className = "q-nav-btn px-4 py-2 bg-brandDark text-gray-400 rounded-xl text-xs hover:bg-gray-800 transition-all";
        }
    });

    showPage('galleryPage');
    buildSubFilters();
    filterAndRender();
}

// ساخت فیلترهای فرعی (برند برای ماشین / کشور برای مپ)
function buildSubFilters() {
    const container = document.getElementById('subFilterSection');
    const inner = document.getElementById('subFiltersContainer');
    inner.innerHTML = `<button data-sub="all" class="sub-btn px-3 py-1.5 bg-brandBlue/20 text-brandBlue border border-brandBlue/30 rounded-lg text-[11px] font-bold">همه موارد</button>`;

    if (currentCategory === 'cars') {
        container.classList.remove('hidden');
        document.getElementById('subFilterTitle').innerText = "🏁 فیلتر بر اساس برند خودرو (اتوگالری)";
        const brands = [...new Set(allMods.filter(m => m.category === 'cars').map(m => m.brand))];
        brands.forEach(b => { if(b) inner.innerHTML += `<button data-sub="${b}" class="sub-btn px-3 py-1.5 bg-brandDark text-gray-400 rounded-lg text-[11px] hover:bg-gray-800 transition-all">${b}</button>`; });
    } else if (currentCategory === 'maps') {
        container.classList.remove('hidden');
        document.getElementById('subFilterTitle').innerText = "🗺️ فیلتر بر اساس موقعیت جاده / کشور";
        const countries = [...new Set(allMods.filter(m => m.category === 'maps').map(m => m.subcategory))];
        countries.forEach(c => { if(c) inner.innerHTML += `<button data-sub="${c}" class="sub-btn px-3 py-1.5 bg-brandDark text-gray-400 rounded-lg text-[11px] hover:bg-gray-800 transition-all">${c}</button>`; });
    } else {
        container.classList.add('hidden');
    }
}

// رندر کارت‌ها با ساختار جدید درخواست شده
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
                
                <div class="card-front bg-brandDark/40 border border-gray-800/80 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl">
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

                <div class="card-back bg-brandDark border-2 border-brandBlue/20 rounded-2xl p-4 flex flex-col justify-between shadow-2xl">
                    <div class="text-left">
                        <span class="text-[10px] bg-brandBg text-brandBlue font-bold px-2.5 py-1 rounded-md uppercase">
                            ${mod.category === 'cars' ? `🚗 ${mod.brand}` : `✨ ${mod.category}`}
                        </span>
                    </div>

                    <div class="flex-1 flex flex-col justify-center gap-2">
                        <p class="text-[11px] text-gray-400 text-justify line-clamp-4 leading-relaxed bg-brandBg/40 p-2.5 rounded-xl border border-gray-800/30">
                            ${mod.description || 'توضیحات تکمیلی برای این مود ثبت نشده است.'}
                        </p>
                        
                        <button onclick="openModal(event, '${mod.title}', \`${mod.description}\`)" class="w-full bg-brandBg hover:bg-gray-800 border border-gray-700/50 text-[11px] py-2 rounded-xl font-bold transition-all text-gray-300">
                            <i class="fas fa-expand ml-1.5 text-brandBlue"></i>نمایش کامل توضیحات
                        </button>
                        
                        <a href="${mod.download}" target="_blank" onclick="event.stopPropagation();" class="w-full block text-center bg-brandBlue hover:bg-blue-600 text-brandDark text-xs font-black py-2.5 rounded-xl shadow-md shadow-brandBlue/10 transition-all">
                            <i class="fas fa-cloud-download-alt ml-1.5"></i>دانلود مستقیم مود
                        </a>
                    </div>

                    <div class="flex items-center justify-between border-t border-gray-800/60 pt-2.5 text-[10px] text-gray-500">
                        <div class="flex items-center gap-1.5">
                            <img src="${mod.author?.avatar}" class="w-4 h-4 rounded-full bg-brandBg" alt="avatar">
                            <span>ارسال: <strong class="text-gray-400">${mod.author?.name}</strong></span>
                        </div>
                        <span class="text-[9px] text-brandBlue/70">#${mod.tags[0] || 'mod'}</span>
                    </div>
                </div>

            </div>
        `;
        grid.appendChild(cardBox);
    });
}

// کنترلر کلیک روی کارت و چرخش هوشمند
function handleCardClick(event, index) {
    // اگر کاربر روی دکمه دانلود یا پاپ‌آپ کلیک کرد، کارت نچرخد
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

// مدیریت کلیک نوار بالایی بدون ریلود
document.getElementById('quickNav').addEventListener('click', (e) => {
    if(!e.target.classList.contains('q-nav-btn')) return;
    openCategory(e.target.getAttribute('data-target'));
});

// مدیریت کلیک فیلترهای فرعی
document.getElementById('subFiltersContainer').addEventListener('click', (e) => {
    if(!e.target.classList.contains('sub-btn')) return;
    document.querySelectorAll('.sub-btn').forEach(b => { b.className = "sub-btn px-3 py-1.5 bg-brandDark text-gray-400 rounded-lg text-[11px] hover:bg-gray-800 transition-all" });
    e.target.className = "sub-btn px-3 py-1.5 bg-brandBlue/20 text-brandBlue border border-brandBlue/30 rounded-lg text-[11px] font-bold";
    currentSubFilter = e.target.getAttribute('data-sub');
    filterAndRender();
});

function openModal(e, title, text) {
    e.stopPropagation(); // جلوگیری از چرخیدن مجدد کارت موقع زدن پاپ‌آپ
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
window.addEventListener('DOMContentLoaded', async () => {
    await fetchMods();
    showPage('welcomePage');
});
