const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const uzbData = {
    "Toshkent shahri": ["Yunusobod", "Olmazor", "Mirzo Ulug'bek", "Yashnobod", "Yakkasaroy", "Mirobod", "Chilonzor", "Uchtepa", "Shayxontohur", "Sergeli", "Bektemir", "Yangihayot"],
    "Toshkent viloyati": ["Zangiota", "Qibray", "Bo'stonliq", "Parkent", "O'rta Chirchiq", "Quyi Chirchiq", "Yuqori Chirchiq", "Yangiyo'l", "Chinoz", "Oqqo'rg'on", "Piskent", "Bo'ka", "Bekobod"],
    "Samarqand viloyati": ["Samarqand shahri", "Urgut", "Toyloq", "Pastdarg'om", "Oqdaryo", "Ishtixon", "Payariq", "Qo'shrabot", "Nurobod", "Jomboy", "Kattaqo'rg'on", "Bulung'ur", "Narpay", "Paxtachi"],
    "Buxoro viloyati": ["Buxoro shahri", "G'ijduvon", "Vobkent", "Romitan", "Peshku", "Jondor", "Qorako'l", "Olot", "Qorovulbozor", "Kogon", "Shofirkon"],
    "Farg'ona viloyati": ["Farg'ona shahri", "Marg'ilon", "Qo'qon", "Beshariq", "Dang'ara", "Uchko'prik", "Bag'dod", "Rishton", "Oltiariq", "Quva", "Toshloq", "Yozyovon", "Farg'ona tumani"],
    "Andijon viloyati": ["Andijon shahri", "Asaka", "Shahrixon", "Qo'rg'ontepa", "Xo'jaobod", "Paxtaobod", "Jalaquduq", "Izboskan", "Bo'z", "Buloqboshi", "Ulug'nor", "Baliqchi"],
    "Namangan viloyati": ["Namangan shahri", "Chust", "Kosonsoy", "Mingbuloq", "To'raqo'rg'on", "Uychi", "Uchqo'rg'on", "Chortoq", "Yangiqo'rg'on", "Pop", "Norin"],
    "Qashqadaryo viloyati": ["Qarshi shahri", "Shahrisabz", "Kitob", "Yakkabog'", "Qamashi", "G'uzor", "Dehqonobod", "Kasbi", "Koson", "Muborak", "Nishon", "Chiroqchi"],
    "Surxondaryo viloyati": ["Termiz shahri", "Denov", "Boysun", "Sariosiyo", "Uzun", "Sho'rchi", "Qumqo'rg'on", "Jarqo'rg'on", "Angor", "Muzrabot", "Sherobod", "Qiziriq"],
    "Jizzax viloyati": ["Jizzax shahri", "Zomin", "G'allaorol", "Sharof Rashidov", "Zafarobod", "Zarbdor", "Paxtakor", "Mirzacho'l", "Do'stlik", "Forish", "Arnasoy", "Yangiobod"],
    "Sirdaryo viloyati": ["Guliston shahri", "Yangiyer", "Sirdaryo", "Sayxunobod", "Oqoltin", "Sardoba", "Xavos", "Mirzaobod", "Boyovut", "Shirin"],
    "Navoiy viloyati": ["Navoiy shahri", "Zarafshon", "Karmana", "Qiziltepa", "Navbahor", "Nurota", "Konimex", "Uchquduq", "Tomdi"],
    "Xorazm viloyati": ["Urganch shahri", "Xiva", "Xonqa", "Hazorasp", "Bog'ot", "Shovot", "Gurlan", "Yangibozor", "Yangiariq", "Qo'shko'pir"],
    "Qoraqalpog'iston Respublikasi": ["Nukus shahri", "Qo'ng'irot", "Mo'ynoq", "Xo'jayli", "Beruniy", "To'rtko'l", "Amudaryo", "Chimboy", "Kegeyli", "Qonliko'l", "Shumanay", "Taxiatosh", "Qorao'zak", "Taxtako'pir"]
};

const defaultCategories = [
    { name: "Avtomobil", icon: "🚗" },
    { name: "Elektronika", icon: "💻" },
    { name: "Kitoblar", icon: "📚" },
    { name: "Uy va ro'zg'or buyumlari", icon: "🏠" },
    { name: "Telefon va Aksessuarlar", icon: "📱" },
    { name: "Kiyim va poyabzal", icon: "👕" },
    { name: "Sport va hordiq", icon: "⚽" },
    { name: "Qurilish anjomlari", icon: "🔨" }
];

let currentUser = null; 
let currentCoins = 0;
let activeCategory = '';
let itemsList = [];
let currentEditItemId = null;
let appSettings = { createCost: 5, editCost: 2 }; // Default

const categoryContainer = document.getElementById('categoryContainer');
const itemsGrid = document.getElementById('itemsGrid');
const regionFilter = document.getElementById('regionFilter');
const districtFilter = document.getElementById('districtFilter');
const addRegion = document.getElementById('addRegion');
const addDistrict = document.getElementById('addDistrict');
const editRegion = document.getElementById('editRegion');
const editDistrict = document.getElementById('editDistrict');
const searchInput = document.getElementById('searchInput');

function setupLocations() {
    Object.keys(uzbData).forEach(region => {
        regionFilter.innerHTML += `<option value="${region}">${region}</option>`;
        addRegion.innerHTML += `<option value="${region}">${region}</option>`;
        editRegion.innerHTML += `<option value="${region}">${region}</option>`;
    });

    regionFilter.addEventListener('change', (e) => {
        districtFilter.innerHTML = '<option value="">Barcha tumanlar</option>';
        if (e.target.value) uzbData[e.target.value].forEach(district => districtFilter.innerHTML += `<option value="${district}">${district}</option>`);
        fetchItems();
    });

    addRegion.addEventListener('change', (e) => {
        addDistrict.innerHTML = '<option value="">Tuman tanlang</option>';
        if (e.target.value) {
            addDistrict.disabled = false;
            uzbData[e.target.value].forEach(district => addDistrict.innerHTML += `<option value="${district}">${district}</option>`);
        } else {
            addDistrict.disabled = true;
            addDistrict.innerHTML = '<option value="">Avval viloyat tanlang</option>';
        }
    });

    editRegion.addEventListener('change', (e) => {
        editDistrict.innerHTML = '';
        if (e.target.value) uzbData[e.target.value].forEach(district => editDistrict.innerHTML += `<option value="${district}">${district}</option>`);
    });

    districtFilter.addEventListener('change', fetchItems);
}

function renderCategories() {
    categoryContainer.innerHTML = '';
    
    const allBtn = document.createElement('button');
    allBtn.className = `cat-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs transition-all ${activeCategory === '' ? 'active' : ''}`;
    allBtn.textContent = 'Hammasi';
    allBtn.onclick = () => { activeCategory = ''; renderCategories(); fetchItems(); };
    categoryContainer.appendChild(allBtn);

    const favBtn = document.createElement('button');
    favBtn.className = `cat-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs transition-all ${activeCategory === 'Sevimlilar' ? 'fav-active' : ''}`;
    favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Sevimlilar';
    favBtn.onclick = () => { 
        if(!currentUser) return alert("Tizimga kiring!");
        activeCategory = 'Sevimlilar'; renderCategories(); fetchItems(); 
    };
    categoryContainer.appendChild(favBtn);

    const myItemsBtn = document.createElement('button');
    myItemsBtn.className = `cat-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs transition-all ${activeCategory === "Mening e'lonlarim" ? 'my-active' : ''}`;
    myItemsBtn.innerHTML = '<i class="fa-solid fa-box"></i> Mening e\'lonlarim';
    myItemsBtn.onclick = () => { 
        if(!currentUser) return alert("Tizimga kiring!");
        activeCategory = "Mening e'lonlarim"; renderCategories(); fetchItems(); 
    };
    categoryContainer.appendChild(myItemsBtn);

    const addCategorySelect = document.getElementById('addCategory');
    addCategorySelect.innerHTML = '<option value="">Kategoriya tanlang</option>';
    const editCategorySelect = document.getElementById('editCategory');
    editCategorySelect.innerHTML = '';

    defaultCategories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs transition-all ${activeCategory === cat.name ? 'active' : ''}`;
        btn.innerHTML = `${cat.icon} ${cat.name}`;
        btn.onclick = () => { activeCategory = cat.name; renderCategories(); fetchItems(); };
        categoryContainer.appendChild(btn);

        addCategorySelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        editCategorySelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
    });
}

async function fetchItems() {
    itemsGrid.innerHTML = `<div class="col-span-2 text-center text-green-500 py-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Yuklanmoqda...</p></div>`;

    try {
        const params = new URLSearchParams();
        if (activeCategory) {
            params.append('categoryName', activeCategory);
            if(activeCategory === 'Sevimlilar' && currentUser) { params.append('favoritesOnly', 'true'); params.append('telegramId', currentUser.telegramId); }
            if(activeCategory === "Mening e'lonlarim" && currentUser) { params.append('myItems', 'true'); params.append('telegramId', currentUser.telegramId); }
        }
        if (searchInput.value) params.append('search', searchInput.value);
        if (regionFilter.value) params.append('region', regionFilter.value);
        if (districtFilter.value) params.append('district', districtFilter.value);

        const response = await fetch(`/api/items?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            itemsList = data.data;
            document.getElementById('itemsCount').textContent = `${itemsList.length} ta tovar`;
            renderItems();
        }
    } catch (e) { itemsGrid.innerHTML = `<div class="col-span-2 text-center text-red-500">Xatolik yuz berdi.</div>`; }
}

window.handleLike = async (e, itemId, btnElement) => {
    e.stopPropagation(); 
    if(typeof window.toggleLike === 'function') {
        await window.toggleLike(itemId, btnElement, currentUser?.telegramId);
        if (activeCategory === 'Sevimlilar') fetchItems();
    }
};

window.deleteItem = async (e, id) => {
    e.stopPropagation();
    if(!confirm("Haqiqatan ham o'chirmoqchimisiz? Bu jarayon bepul!")) return;
    
    try {
        const res = await fetch(`/api/items/${id}?telegramId=${currentUser.telegramId}`, { method: 'DELETE' });
        const data = await res.json();
        if(res.ok) { alert("Muvaffaqiyatli o'chirildi!"); fetchItems(); } 
        else alert(data.message);
    } catch(e) { alert("Xatolik yuz berdi"); }
};

window.openEditModal = (e, id) => {
    e.stopPropagation();
    const item = itemsList.find(i => i._id === id);
    if(!item) return;

    currentEditItemId = id;
    document.getElementById('editTitle').value = item.title;
    document.getElementById('editPrice').value = item.price;
    document.getElementById('editCategory').value = item.categoryName;
    document.getElementById('editRegion').value = item.region;
    
    const distSelect = document.getElementById('editDistrict');
    distSelect.innerHTML = '';
    uzbData[item.region].forEach(d => distSelect.innerHTML += `<option value="${d}">${d}</option>`);
    distSelect.value = item.district;

    document.getElementById('editDesc').value = item.description;
    document.getElementById('editModal').classList.replace('hidden', 'flex');
};

function renderItems() {
    itemsGrid.innerHTML = '';
    if (itemsList.length === 0) {
        itemsGrid.innerHTML = `<div class="col-span-2 text-center text-gray-500 py-10"><i class="fa-solid fa-box-open text-4xl mb-3"></i><p>Tovar topilmadi</p></div>`;
        return;
    }

    itemsList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'rentall-card overflow-hidden flex flex-col cursor-pointer relative';
        
        const isLiked = currentUser && item.likes && item.likes.includes(currentUser.telegramId);
        const heartClass = isLiked ? 'fa-solid text-red-500' : 'fa-regular text-gray-400';
        const likesCount = item.likes ? item.likes.length : 0;
        const commentsCount = item.commentsCount || 0; 
        const isOwner = currentUser && item.ownerTelegramId === currentUser.telegramId;
        
        card.onclick = (e) => {
            if(e.target.closest('.like-btn') || e.target.closest('.edit-action-btn')) return; 
            
            document.getElementById('detailImage').src = item.imageUrl;
            document.getElementById('detailTitle').textContent = item.title;
            document.getElementById('detailPrice').textContent = item.price.toLocaleString();
            document.getElementById('detailCategory').textContent = item.categoryName;
            document.getElementById('detailLocation').textContent = `${item.region}, ${item.district}`;
            document.getElementById('detailDesc').textContent = item.description;
            document.getElementById('detailOwnerName').textContent = item.ownerName || "Foydalanuvchi";
            document.getElementById('detailOwnerPhone').textContent = item.ownerPhone || "Raqam mavjud emas";
            
            const tabInfoBtn = document.getElementById('tabInfoBtn');
            const tabCommentsBtn = document.getElementById('tabCommentsBtn');
            const tabInfoContent = document.getElementById('tabInfoContent');
            const tabCommentsContent = document.getElementById('tabCommentsContent');

            tabInfoBtn.className = "w-1/2 py-3 text-sm font-bold text-green-500 border-b-2 border-green-500 transition-colors";
            tabCommentsBtn.className = "w-1/2 py-3 text-sm font-bold text-gray-500 border-b-2 border-transparent transition-colors";
            tabInfoContent.classList.replace('hidden', 'block');
            tabCommentsContent.classList.replace('flex', 'hidden'); 

            tabInfoBtn.onclick = () => {
                tabInfoBtn.className = "w-1/2 py-3 text-sm font-bold text-green-500 border-b-2 border-green-500 transition-colors";
                tabCommentsBtn.className = "w-1/2 py-3 text-sm font-bold text-gray-500 border-b-2 border-transparent transition-colors";
                tabInfoContent.classList.replace('hidden', 'block');
                tabCommentsContent.classList.replace('flex', 'hidden');
            };

            tabCommentsBtn.onclick = () => {
                tabCommentsBtn.className = "w-1/2 py-3 text-sm font-bold text-green-500 border-b-2 border-green-500 transition-colors";
                tabInfoBtn.className = "w-1/2 py-3 text-sm font-bold text-gray-500 border-b-2 border-transparent transition-colors";
                tabInfoContent.classList.replace('block', 'hidden');
                tabCommentsContent.classList.replace('hidden', 'flex');
            };

            if(typeof window.loadComments === 'function') {
                window.loadComments(item._id).then(count => { document.getElementById('tabCommentsCount').textContent = count || 0; });
            }
            
            document.getElementById('addCommentForm').onsubmit = async (event) => {
                event.preventDefault();
                const text = document.getElementById('commentText').value;
                const authorName = currentUser.firstName || 'Foydalanuvchi';
                if(text.trim() && typeof window.postComment === 'function') {
                    await window.postComment(item._id, text, currentUser.telegramId, authorName);
                    document.getElementById('commentText').value = '';
                    if(typeof window.loadComments === 'function') {
                        window.loadComments(item._id).then(count => {
                            document.getElementById('tabCommentsCount').textContent = count || 0; fetchItems();
                        });
                    }
                }
            };
            
            document.getElementById('detailImage').onclick = () => {
                const fsModal = document.getElementById('fullScreenImageModal');
                document.getElementById('fullScreenImage').src = item.imageUrl;
                fsModal.classList.replace('hidden', 'flex');
                setTimeout(() => fsModal.classList.replace('opacity-0', 'opacity-100'), 10);
            };
            
            document.getElementById('detailContactBtn').onclick = () => {
                let phone = item.ownerPhone ? item.ownerPhone.replace(/\D/g, '') : '';
                if (phone) {
                    let tgUrl = `https://t.me/+${phone}`;
                    tg.initDataUnsafe?.user ? tg.openTelegramLink(tgUrl) : window.open(tgUrl, '_blank');
                } else alert(`Raqam topilmadi. ID: ${item.ownerTelegramId}`);
            };
            
            document.getElementById('itemDetailsModal').classList.replace('hidden', 'flex');
        };
        
        card.innerHTML = `
            <div class="h-36 bg-gray-800 relative">
                <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover">
                ${isOwner ? `
                <div class="absolute top-2 left-2 flex gap-1.5 z-20">
                    <button onclick="window.openEditModal(event, '${item._id}')" class="edit-action-btn w-8 h-8 bg-blue-500/90 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-transform active:scale-90 shadow-lg border border-blue-400"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="window.deleteItem(event, '${item._id}')" class="edit-action-btn w-8 h-8 bg-red-500/90 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-transform active:scale-90 shadow-lg border border-red-400"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
                ` : `
                <div class="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-green-400 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-700">${item.region.replace(' viloyati', '').replace(' shahri', '')}</div>
                `}
                <button onclick="window.handleLike(event, '${item._id}', this)" class="like-btn absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-md border border-gray-600 rounded-full flex items-center justify-center transition-transform active:scale-90 z-20">
                    <i class="fa-heart ${heartClass} text-sm transition-colors"></i>
                </button>
            </div>
            <div class="p-3 flex-1 flex flex-col justify-between">
                <div>
                    <h3 class="font-bold text-sm text-white line-clamp-2">${item.title}</h3>
                    <p class="text-[11px] text-gray-400 mt-1"><i class="fa-solid fa-location-dot text-[9px] mr-1 text-gray-500"></i>${item.district}</p>
                </div>
                <div class="mt-3 flex justify-between items-center border-t border-gray-700 pt-2">
                    <div class="text-green-400 font-extrabold text-sm">${item.price.toLocaleString()} so'm</div>
                    <div class="text-[11px] text-gray-400 font-medium flex items-center gap-2">
                        <span><i class="fa-solid fa-heart text-gray-500 mr-0.5"></i> <span class="like-count">${likesCount}</span></span>
                        <span><i class="fa-solid fa-comment text-gray-500 mr-0.5"></i> ${commentsCount}</span>
                    </div>
                </div>
            </div>
        `;
        itemsGrid.appendChild(card);
    });
}

function checkAuth() {
    const tgId = tg.initDataUnsafe?.user?.id;
    if (tgId) loginUser(tgId);
    else {
        const loginHtml = `
        <div id="authModal" class="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col justify-center items-center px-4">
            <div class="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-[0_0_30px_rgba(34,197,94,0.1)] relative">
                <div class="w-16 h-16 bg-green-900/30 text-green-500 rounded-2xl mx-auto flex justify-center items-center text-3xl mb-4 border border-green-800/50"><i class="fa-solid fa-lock"></i></div>
                <h2 class="text-xl font-bold text-center text-white mb-2">Tizimga kirish</h2>
                <p class="text-xs text-center text-gray-400 mb-6 px-4">Botdan ro'yxatdan o'tgan bo'lishingiz shart. Iltimos, Telegram ID raqamingizni kiriting:</p>
                <form id="authForm" class="space-y-4">
                    <input type="number" id="authTgId" required class="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 outline-none focus:border-green-500 text-white text-center text-lg font-bold tracking-wider" placeholder="Masalan: 123456789">
                    <button type="submit" id="authBtn" class="w-full bg-green-500 text-black font-bold py-3.5 rounded-xl hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">Tasdiqlash</button>
                    <p id="authError" class="text-xs text-red-500 text-center hidden font-medium"></p>
                </form>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', loginHtml);
        
        document.getElementById('authForm').onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('authBtn');
            const err = document.getElementById('authError');
            btn.innerHTML = 'Kuting...'; btn.disabled = true; err.classList.add('hidden');
            try {
                const res = await fetch(`/api/users/${document.getElementById('authTgId').value}`);
                const data = await res.json();
                if (res.ok && data.success) {
                    currentUser = data.data; currentCoins = currentUser.coins;
                    document.getElementById('user-coins').textContent = currentCoins;
                    document.getElementById('authModal').remove();
                    startApp();
                } else { err.textContent = "Bazada topilmadingiz. Botdan ro'yxatdan o'ting."; err.classList.remove('hidden'); }
            } catch (error) { err.textContent = "Server xatosi."; err.classList.remove('hidden'); } 
            finally { btn.innerHTML = 'Tasdiqlash'; btn.disabled = false; }
        };
    }
}

async function loginUser(tgId) {
    try {
        const res = await fetch(`/api/users/${tgId}`);
        const data = await res.json();
        if (res.ok && data.success) {
            currentUser = data.data; currentCoins = currentUser.coins;
            document.getElementById('user-coins').textContent = currentCoins;
            startApp();
        } else { alert("Bazada topilmadingiz. Iltimos botga qaytib /start ni bosing!"); }
    } catch (e) { alert("Server aloqasi yo'q."); }
}

function startApp() {
    setupLocations();
    renderCategories();
    fetchItems();
    
    fetch('/api/admin/settings').then(res => res.json()).then(data => {
        if(data.success) {
            data.data.forEach(s => {
                if(s.key === 'item_create_cost') {
                    appSettings.createCost = Number(s.value);
                    if(document.getElementById('ui_create_cost')) document.getElementById('ui_create_cost').textContent = appSettings.createCost;
                    if(document.getElementById('ui_create_btn')) document.getElementById('ui_create_btn').textContent = appSettings.createCost;
                }
                if(s.key === 'item_edit_cost') {
                    appSettings.editCost = Number(s.value);
                    if(document.getElementById('ui_edit_cost')) document.getElementById('ui_edit_cost').textContent = appSettings.editCost;
                    if(document.getElementById('ui_edit_btn')) document.getElementById('ui_edit_btn').textContent = appSettings.editCost;
                }
            });
        }
    }).catch(e => console.log(e));

    let timeout;
    searchInput.addEventListener('input', () => { clearTimeout(timeout); timeout = setTimeout(fetchItems, 500); });

    document.getElementById('addBtn').addEventListener('click', () => {
        if (currentCoins < appSettings.createCost) return alert(`Bu xizmat narxi ${appSettings.createCost} tanga! Sizda ${currentCoins} bor.`);
        document.getElementById('addModal').classList.replace('hidden', 'flex');
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => document.getElementById('addModal').classList.replace('flex', 'hidden'));
    document.getElementById('closeEditModalBtn').addEventListener('click', () => document.getElementById('editModal').classList.replace('flex', 'hidden'));
    document.getElementById('closeDetailsBtn').addEventListener('click', () => document.getElementById('itemDetailsModal').classList.replace('flex', 'hidden'));

    document.getElementById('closeFullScreenBtn').addEventListener('click', () => {
        const fsModal = document.getElementById('fullScreenImageModal');
        fsModal.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => fsModal.classList.replace('flex', 'hidden'), 300);
    });

    document.getElementById('addItemForm').onsubmit = async (e) => {
        e.preventDefault();
        const imageFile = document.getElementById('addImage').files[0];
        if (!imageFile) return alert("Iltimos, rasm tanlang!"); 

        const btn = document.getElementById('submitItemBtn');
        btn.disabled = true; btn.textContent = "Kuting...";

        const formData = new FormData();
        formData.append('telegramId', currentUser.telegramId);
        formData.append('title', document.getElementById('addTitle').value);
        formData.append('price', parseInt(document.getElementById('addPrice').value));
        formData.append('categoryName', document.getElementById('addCategory').value);
        formData.append('region', document.getElementById('addRegion').value);
        formData.append('district', document.getElementById('addDistrict').value);
        formData.append('description', document.getElementById('addDesc').value);
        formData.append('imageFile', imageFile);

        try {
            const res = await fetch('/api/items', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                alert("Tovar muvaffaqiyatli qo'shildi!");
                document.getElementById('addModal').classList.replace('flex', 'hidden');
                e.target.reset();
                currentCoins = data.remainingCoins;
                document.getElementById('user-coins').textContent = currentCoins;
                fetchItems();
            } else { alert(data.message); }
        } catch (err) { alert("Xato yuz berdi."); }
        finally { btn.disabled = false; btn.textContent = `Joylash (-${appSettings.createCost} tanga)`; }
    };

    document.getElementById('editItemForm').onsubmit = async (e) => {
        e.preventDefault();
        if(currentCoins < appSettings.editCost) return alert(`Sizda yetarli mablag' yo'q. Tahrirlash narxi: ${appSettings.editCost} tanga!`);

        const btn = document.getElementById('submitEditBtn');
        btn.disabled = true; btn.textContent = "Kuting...";

        const formData = new FormData();
        formData.append('telegramId', currentUser.telegramId);
        formData.append('title', document.getElementById('editTitle').value);
        formData.append('price', parseInt(document.getElementById('editPrice').value));
        formData.append('categoryName', document.getElementById('editCategory').value);
        formData.append('region', document.getElementById('editRegion').value);
        formData.append('district', document.getElementById('editDistrict').value);
        formData.append('description', document.getElementById('editDesc').value);
        
        const imageFile = document.getElementById('editImage').files[0];
        if (imageFile) formData.append('imageFile', imageFile);

        try {
            const res = await fetch(`/api/items/${currentEditItemId}`, { method: 'PUT', body: formData });
            const data = await res.json();
            if (res.ok) {
                alert("Muvaffaqiyatli tahrirlandi!");
                document.getElementById('editModal').classList.replace('flex', 'hidden');
                e.target.reset();
                currentCoins = data.remainingCoins;
                document.getElementById('user-coins').textContent = currentCoins;
                fetchItems();
            } else { alert(data.message); }
        } catch (err) { alert("Xato yuz berdi."); }
        finally { btn.disabled = false; btn.textContent = `Saqlash (-${appSettings.editCost} tanga)`; }
    };
}

checkAuth();