let allMods = [];
let currentCategory = 'all';

// دریافت داده‌ها از JSON
async function fetchMods() {
    try {
        const response = await fetch('data/mods.json');
        allMods = await response.json();
        renderMods(allMods);
    } catch (error) {
        console.error("خطا در دریافت اطلاعات مودها:", error);
        document.getElementById('modsGrid').innerHTML = `<p class="text-red-500 col-span-full text-center">خطا در بارگذاری اطلاعات!</p>`;
    }
}

// رندر کردن کارت‌های مود
function renderMods(mods) {
    const grid = document.getElementById('modsGrid');
    const modCount = document.getElementById('modCount');
    grid.innerHTML = '';
    
    modCount.innerText = `${mods.length} مود`;

    if(mods.length === 0) {
        grid.innerHTML = `<p class="text-gray-500 col-span-full text-center py-10">هیچ مودی پیدا نشد.</p>`;
        return;
    }

    mods.forEach(mod => {
        const card = document.createElement('div');
        card.className = "bg-gray-900 border border-gray-800/60 rounded-2xl overflow-hidden hover:border-gray-700 transition-all group flex flex-col justify-between shadow-xl";
        
        card.innerHTML = `
            <div>
                <div class="relative overflow-hidden aspect-video bg-gray-800">
                    <img src="${mod.image}" alt="${mod.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
                    <span class="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-[10px] px-2.5 py-1 rounded-md font-medium uppercase tracking-wider">${mod.category}</span>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-base text-gray-100 group-hover:text-orange-400 transition-colors line-clamp-1">${mod.title}</h3>
                    <div class="flex gap-2 mt-2">
                        ${mod.tags.map(tag => `<span class="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">#${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="p-4 pt-0">
                <div class="flex justify-between items-center text-xs text-gray-400 mb-3 border-t border-gray-800/50 pt-3">
                    <span><i class="fas fa-hdd ml-1"></i>${mod.size}</span>
                    <span><i class="fas fa-code-branch ml-1"></i>v${mod.version}</span>
                </div>
                <a href="${mod.download}" target="_blank" class="w-full block text-center bg-gray-800 hover:bg-orange-600 hover:text-white text-gray-200 text-sm font-bold py-2.5 px-4 rounded-xl transition-all">
                    <i class="fas fa-download ml-2"></i>دانلود مستقیم
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// سیستم فیلتر و جستجو ترکیبی
function filterAndSearch() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    
    const filtered = allMods.filter(mod => {
        const matchesCategory = (currentCategory === 'all' || mod.category === currentCategory);
        const matchesSearch = mod.title.toLowerCase().includes(searchTerm) || 
                              mod.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        return matchesCategory && matchesSearch;
    });
    
    renderMods(filtered);
}

// رویدادهای کلیک روی دسته‌بندی‌ها
document.getElementById('categoryFilters').addEventListener('click', (e) => {
    if(!e.target.classList.contains('cat-btn')) return;
    
    // تغییر استایل دکمه فعال
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('bg-orange-600', 'text-white', 'shadow-lg', 'shadow-orange-600/20');
        btn.classList.add('bg-gray-800', 'hover:bg-gray-700');
    });
    e.target.classList.add('bg-orange-600', 'text-white', 'shadow-lg', 'shadow-orange-600/20');
    
    currentCategory = e.target.getAttribute('data-category');
    document.getElementById('sectionTitle').innerText = e.target.innerText;
    filterAndSearch();
});

// رویداد تایپ در نوار جستجو
document.getElementById('searchBar').addEventListener('input', filterAndSearch);

// اجرای اولیه هنگام لود صفحه
window.addEventListener('DOMContentLoaded', fetchMods);
