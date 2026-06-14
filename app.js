let allMods = [];
let currentCategory = 'all';
let currentBrand = 'all';

async function fetchMods() {
    try {
        const response = await fetch('data/mods.json');
        allMods = await response.json();
        renderMods(allMods);
        buildBrandFilters();
    } catch (error) {
        console.error("خطا در دریافت اطلاعات:", error);
    }
}

// ساخت دکمه‌های اتوگالری برندها به صورت داینامیک بر اساس فایل JSON
function buildBrandFilters() {
    const brandContainer = document.getElementById('brandFilters');
    brandContainer.innerHTML = `<button data-brand="all" class="brand-btn px-3 py-1.5 bg-orange-600/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-medium transition-all">همه برندها</button>`;
    
    // گرفتن لیست برندهای یکتا از مودهای دسته ماشین
    const carMods = allMods.filter(m => m.category === 'cars' && m.brand);
    const uniqueBrands = [...new Set(carMods.map(m => m.brand))];

    uniqueBrands.forEach(brand => {
        brandContainer.innerHTML += `
            <button data-brand="${brand}" class="brand-btn px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs font-medium hover:bg-gray-700 transition-all">
                ${brand}
            </button>
        `;
    });
}

// رندر کارت‌ها با قابلیت چرخش دوطرفه (Flip)
function renderMods(mods) {
    const grid = document.getElementById('modsGrid');
    document.getElementById('modCount').innerText = `${mods.length} مود`;
    grid.innerHTML = '';

    if (mods.length === 0) {
        grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-10">مودی با این مشخصات یافت نشد.</p>`;
        return;
    }

    mods.forEach((mod, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = "card-perspective h-[380px] w-full cursor-pointer";
        
        wrapper.innerHTML = `
            <div class="card-inner w-full h-full" id="card-${index}">
                <div class="card-front bg-gray-900 border border-gray-800/70 rounded-2xl overflow-hidden h-full flex flex-col justify-between shadow-lg" onclick="flipCard(${index})">
                    <div class="relative aspect-video bg-gray-800 overflow-hidden">
                        <img src="${mod.image}" alt="${mod.title}" class="w-full h-full object-cover" loading="lazy">
                        <span class="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-[10px] px-2.5 py-1 rounded-md font-medium uppercase">${mod.category}</span>
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between">
                        <h3 class="font-bold text-base text-gray-100 group-hover:text-orange-400 transition-colors line-clamp-2">${mod.title}</h3>
                        <div class="flex justify-between items-center text-xs text-gray-500 border-t border-gray-800/50 pt-3 mt-4">
                            <span><i class="fas fa-hdd ml-1"></i>${mod.size}</span>
                            <span><i class="fas fa-code-branch ml-1"></i>v${mod.version}</span>
                        </div>
                    </div>
                </div>

                <div class="card-back bg-gray-950 border-2 border-orange-600/30 rounded-2xl p-4 flex flex-col justify-between shadow-2xl">
                    <div class="flex justify-between items-start">
                        <span class="text-xs bg-gray-900 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-md">
                            ${mod.category === 'cars' ? `🚗 ${mod.brand || ''}` : mod.category.toUpperCase()}
                        </span>
                        <button onclick="event.stopPropagation(); flipCard(${index})" class="text-gray-500 hover:text-white p-1 text-sm"><i class="fas fa-undo"></i> چرخش</button>
                    </div>

                    <div class="my-4 flex-1 flex flex-col justify-center">
                        <h4 class="font-bold text-sm text-gray-200 line-clamp-1 mb-3">${mod.title}</h4>
                        <button onclick="event.stopPropagation(); showModal('${mod.title}', \`${mod.description || 'توضیحاتی برای این مود ثبت نشده است.'}\`)" class="w-full text-center bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs py-2 rounded-xl text-gray-300 transition-all mb-2">
                            <i class="fas fa-file-text ml-2 text-orange-400"></i>مشاهده توضیحات مود
                        </button>
                        <a href="${mod.download}" target="_blank" onclick="event.stopPropagation();" class="w-full block text-center bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md">
                            <i class="fas fa-download ml-2"></i>دانلود مستقیم مود
                        </a>
                    </div>

                    <div class="flex items-center justify-between border-t border-gray-900 pt-3 text-[11px] text-gray-500">
                        <div class="flex items-center gap-2">
                            <img src="${mod.author?.avatar || 'https://api.dicebear.com/7.x/bottts/svg'}" class="w-5 h-5 rounded-full bg-gray-800" alt="avatar">
                            <span>ارسال شده توسط: <strong class="text-gray-400">${mod.author?.name || 'ادمین'}</strong></span>
                        </div>
                        <div class="flex gap-1">
                            ${mod.tags.slice(0, 2).map(tag => `<span class="bg-gray-900 px-1.5 py-0.5 rounded text-[9px]">#${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(wrapper);
    });
}

// تابع انیمیشن چرخش کارت
function flipCard(index) {
    const cardInner = document.getElementById(`card-${index}`);
    cardInner.classList.toggle('card-flipped');
}

// سیستم مدیریت فیلترهای ترکیبی
function filterAndSearch() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    
    const filtered = allMods.filter(mod => {
        const matchesCategory = (currentCategory === 'all' || mod.category === currentCategory);
        const matchesBrand = (currentCategory !== 'cars' || currentBrand === 'all' || mod.brand === currentBrand);
        const matchesSearch = mod.title.toLowerCase().includes(searchTerm) || 
                              mod.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        return matchesCategory && matchesBrand && matchesSearch;
    });
    
    renderMods(filtered);
}

// رویداد دسته‌بندی‌های اصلی
document.getElementById('categoryFilters').addEventListener('click', (e) => {
    if (!e.target.classList.contains('cat-btn')) return;
    
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('bg-orange-600', 'text-white', 'shadow-lg'));
    e.target.classList.add('bg-orange-600', 'text-white', 'shadow-lg');
    
    currentCategory = e.target.getAttribute('data-category');
    currentBrand = 'all'; // ریست کردن برند هنگام تغییر دسته اصلی
    
    // نمایش یا مخفی کردن اتوگالری برندها
    const brandSection = document.getElementById('brandSection');
    if (currentCategory === 'cars') {
        brandSection.classList.remove('hidden');
    } else {
        brandSection.classList.add('hidden');
    }

    filterAndSearch();
});

// رویداد اتوگالری برندها
document.getElementById('brandFilters').addEventListener('click', (e) => {
    if (!e.target.classList.contains('brand-btn')) return;
    
    document.querySelectorAll('.brand-btn').forEach(btn => {
        btn.classList.remove('bg-orange-600/20', 'text-orange-400', 'border', 'border-orange-500/30');
        btn.classList.add('bg-gray-800', 'text-gray-400');
    });
    e.target.classList.add('bg-orange-600/20', 'text-orange-400', 'border', 'border-orange-500/30');
    
    currentBrand = e.target.getAttribute('data-brand');
    filterAndSearch();
});

// توابع پاپ‌آپ توضیحات (Modal)
function showModal(title, text) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerText = text;
    const modal = document.getElementById('descModal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('modalContainer').classList.remove('scale-95');
    }, 10);
}

function closeModal() {
    document.getElementById('modalContainer').classList.add('scale-95');
    setTimeout(() => {
        document.getElementById('descModal').classList.add('hidden');
    }, 200);
}

document.getElementById('searchBar').addEventListener('input', filterAndSearch);
window.addEventListener('DOMContentLoaded', fetchMods);
