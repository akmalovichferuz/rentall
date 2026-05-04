const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let adminId = null;
let currentViewingUser = null; 

// --- TABLARNI BOSHQARISH ---
function switchTab(tabId) {
    ['usersTab', 'settingsTab', 'messageTab'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
        document.getElementById(`btn-${id}`).classList.remove('active', 'bg-green-500', 'text-black', 'shadow-[0_0_15px_rgba(34,197,94,0.4)]');
        document.getElementById(`btn-${id}`).classList.add('bg-gray-800', 'text-gray-400');
    });

    document.getElementById(tabId).classList.remove('hidden');
    const btn = document.getElementById(`btn-${tabId}`);
    btn.classList.add('active');
    btn.classList.remove('bg-gray-800', 'text-gray-400');
    
    if(tabId === 'usersTab') loadUsers();
    if(tabId === 'settingsTab') loadSettings();
}

function switchUserTab(tabId) {
    document.getElementById('uItemsTab').classList.add('hidden');
    document.getElementById('uRefsTab').classList.add('hidden');
    
    document.getElementById('btn-uItemsTab').className = "text-sm font-bold text-gray-500 px-2 py-1 border-b-2 border-transparent";
    document.getElementById('btn-uRefsTab').className = "text-sm font-bold text-gray-500 px-2 py-1 border-b-2 border-transparent";

    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById(`btn-${tabId}`).className = "text-sm font-bold text-green-500 px-2 py-1 border-b-2 border-green-500";
}

// --- 1. FOYDALANUVCHILAR MANTIQI ---
async function loadUsers() {
    try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.success) {
            document.getElementById('totalUsersCount').textContent = data.data.length;
            const container = document.getElementById('usersListContainer');
            container.innerHTML = '';
            
            data.data.forEach(user => {
                const date = new Date(user.createdAt).toLocaleDateString('uz-UZ');
                container.innerHTML += `
                    <div onclick="openUserModal('${user.telegramId}')" class="bg-gray-800 border border-gray-700 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors">
                        <div>
                            <p class="font-bold text-white text-sm">${user.firstName}</p>
                            <p class="text-[10px] text-gray-400 mt-0.5">${user.phoneNumber || 'Raqamsiz'} • ${date}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-yellow-500 font-bold text-sm"><i class="fa-solid fa-coins text-xs"></i> ${user.coins}</p>
                            <p class="text-[10px] text-blue-400 mt-0.5"><i class="fa-solid fa-users"></i> ${user.referralsCount}</p>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) { console.error("Foydalanuvchilarni yuklashda xato:", error); }
}

async function openUserModal(telegramId) {
    currentViewingUser = telegramId;
    document.getElementById('userDetailsModal').classList.replace('hidden', 'flex');
    
    document.getElementById('uItemsTab').innerHTML = '<p class="text-xs text-gray-500 text-center py-4">Yuklanmoqda...</p>';
    document.getElementById('uRefsTab').innerHTML = '';
    
    try {
        const res = await fetch(`/api/admin/users/${telegramId}`);
        const data = await res.json();
        
        if (data.success) {
            const { user, items, referrals } = data;
            
            document.getElementById('u_name').textContent = user.firstName;
            document.getElementById('u_phone').textContent = user.phoneNumber || 'Raqam kiritilmagan';
            document.getElementById('u_tgid').textContent = user.telegramId;
            document.getElementById('u_coins').textContent = user.coins;
            
            document.getElementById('u_items_count').textContent = items.length;
            document.getElementById('u_refs_count').textContent = referrals.length;

            const itemsContainer = document.getElementById('uItemsTab');
            itemsContainer.innerHTML = '';
            if (items.length === 0) itemsContainer.innerHTML = '<p class="text-xs text-gray-500 text-center py-4">E\'lonlari yo\'q.</p>';
            
            items.forEach(item => {
                itemsContainer.innerHTML += `
                    <div class="bg-gray-800 rounded-xl flex overflow-hidden border border-gray-700 h-24">
                        <img src="${item.imageUrl}" class="w-24 h-full object-cover">
                        <div class="p-2 flex-1 flex flex-col justify-between">
                            <div>
                                <p class="text-xs text-white font-bold line-clamp-1">${item.title}</p>
                                <p class="text-[10px] text-gray-400">${item.price} so'm</p>
                            </div>
                            <div class="flex justify-end gap-2">
                                <button onclick="deleteUserItem('${item._id}')" class="w-7 h-7 bg-red-500/20 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors"><i class="fa-solid fa-trash text-xs"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            });

            const refsContainer = document.getElementById('uRefsTab');
            refsContainer.innerHTML = '';
            if (referrals.length === 0) refsContainer.innerHTML = '<p class="text-xs text-gray-500 text-center py-4">Referallari yo\'q.</p>';
            
            referrals.forEach(ref => {
                const rDate = new Date(ref.createdAt).toLocaleDateString('uz-UZ');
                refsContainer.innerHTML += `
                    <div class="bg-gray-800 rounded-lg p-3 border border-gray-700 flex justify-between items-center">
                        <p class="text-xs text-white">${ref.firstName}</p>
                        <p class="text-[10px] text-gray-500">${rDate}</p>
                    </div>
                `;
            });
        }
    } catch (e) { alert("Ma'lumotlarni yuklashda xatolik!"); }
}

function closeUserModal() {
    document.getElementById('userDetailsModal').classList.replace('flex', 'hidden');
    currentViewingUser = null;
    loadUsers(); 
}

// XATOLIK SABABI TO'G'IRLANDI (Browserda tg.showAlert yo'qligi)
async function modifyUserCoins() {
    const amount = document.getElementById('coinAmountInput').value;
    if(!amount || !currentViewingUser) return;
    
    const btn = document.getElementById('modifyCoinsBtn');
    btn.innerHTML = '...'; btn.disabled = true;

    try {
        const res = await fetch(`/api/admin/users/${currentViewingUser}/coins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: Number(amount) })
        });
        const data = await res.json();
        if(res.ok) {
            document.getElementById('u_coins').textContent = data.newBalance;
            document.getElementById('coinAmountInput').value = '';
            alert(`Muvaffaqiyatli! Tangalar o'tkazildi. Yangi balans: ${data.newBalance}`); // <--- SHU YERDA ALmashtirildi
        } else {
            alert(data.message || "Xatolik yuz berdi");
        }
    } catch (e) { 
        alert("Server xatosi!"); 
    }
    finally { btn.innerHTML = '<i class="fa-solid fa-check"></i>'; btn.disabled = false; }
}

async function sendSingleMessage() {
    const text = document.getElementById('singleMsgText').value;
    if(!text.trim() || !currentViewingUser) return;

    const btn = document.getElementById('sendSingleMsgBtn');
    btn.innerHTML = 'Kuting...'; btn.disabled = true;

    try {
        const res = await fetch('/api/admin/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'single', target: currentViewingUser, text })
        });
        if(res.ok) {
            document.getElementById('singleMsgText').value = '';
            alert("Xabar bot orqali muvaffaqiyatli yetkazildi!"); // <--- SHU YERDA ALmashtirildi
        } else {
            const data = await res.json();
            alert(data.message || "Xatolik yuz berdi");
        }
    } catch (e) { 
        alert("Server bilan ulanishda xato!"); 
    }
    finally { btn.innerHTML = 'Yuborish <i class="fa-solid fa-paper-plane ml-1"></i>'; btn.disabled = false; }
}

async function deleteUserItem(itemId) {
    if(!confirm("Admin sifatida ushbu e'lonni o'chirmoqchimisiz?")) return;
    try {
        alert("E'lon o'chirildi (Demo).");
        openUserModal(currentViewingUser); 
    } catch(e) {}
}

// --- 2. SOZLAMALAR MANTIQI ---
async function loadSettings() {
    try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if(data.success) {
            data.data.forEach(setting => {
                if(setting.key === 'item_create_cost') document.getElementById('set_item_create').value = setting.value;
                if(setting.key === 'item_edit_cost') document.getElementById('set_item_edit').value = setting.value;
                if(setting.key === 'referral_bonus') document.getElementById('set_referral').value = setting.value;
                if(setting.key === 'daily_bonus_1') document.getElementById('set_daily_1').value = setting.value;
                if(setting.key === 'daily_bonus_2') document.getElementById('set_daily_2').value = setting.value;
                if(setting.key === 'daily_bonus_3') document.getElementById('set_daily_3').value = setting.value;
            });
        }
    } catch (e) { console.log(e); }
}

document.getElementById('settingsForm').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveSettingsBtn');
    btn.innerHTML = 'Saqlanmoqda...'; btn.disabled = true;

    const payload = {
        item_create_cost: document.getElementById('set_item_create').value,
        item_edit_cost: document.getElementById('set_item_edit').value,
        referral_bonus: document.getElementById('set_referral').value,
        daily_bonus_1: document.getElementById('set_daily_1').value,
        daily_bonus_2: document.getElementById('set_daily_2').value,
        daily_bonus_3: document.getElementById('set_daily_3').value
    };

    try {
        const res = await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(res.ok) alert("Tizim sozlamalari yangilandi!"); // <--- SHU YERDA ALmashtirildi
        else alert("Saqlashda xato yuz berdi.");
    } catch (e) { alert("Xatolik"); }
    finally { btn.innerHTML = 'Sozlamalarni saqlash'; btn.disabled = false; }
};

// --- 3. OMMAVIY XABAR MANTIQI ---
document.getElementById('massMessageForm').onsubmit = async (e) => {
    e.preventDefault();
    const target = document.getElementById('massTarget').value;
    const text = document.getElementById('massText').value;
    
    if(!confirm("Barcha belgilangan mijozlarga bot orqali xabar ketsinmi?")) return;

    const btn = document.getElementById('sendMassMsgBtn');
    btn.innerHTML = 'Jo\'natilmoqda...'; btn.disabled = true;

    try {
        const res = await fetch('/api/admin/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'mass', target, text })
        });
        const data = await res.json();
        
        if(res.ok) {
            alert(data.message); // <--- SHU YERDA ALmashtirildi
            document.getElementById('massText').value = '';
        } else {
            alert(data.message || "Xatolik yuz berdi");
        }
    } catch (e) { 
        alert("Server bilan ulanishda xato!"); 
        console.error(e);
    }
    finally { btn.innerHTML = 'Xabarni yuborish <i class="fa-solid fa-paper-plane ml-2"></i>'; btn.disabled = false; }
};


// --- 4. AVTO-LOGIN VA INITIALIZATSIYA ---
window.checkAdminAuth = function() {
    const inputId = document.getElementById('adminAuthId').value;
    if (!inputId) return alert("Iltimos, Telegram ID raqamingizni kiriting!");
    
    adminId = inputId;
    
    const authModal = document.getElementById('adminAuthModal');
    authModal.classList.add('hidden');
    authModal.classList.remove('flex');
    
    switchTab('usersTab');
};

document.addEventListener("DOMContentLoaded", () => {
    const tgId = tg.initDataUnsafe?.user?.id;
    const urlParams = new URLSearchParams(window.location.search);
    const isRoleAdmin = urlParams.get('role') === 'admin';

    if (tgId || isRoleAdmin) {
        adminId = tgId ? tgId.toString() : 'Admin';
        
        const authModal = document.getElementById('adminAuthModal');
        if(authModal) {
            authModal.classList.add('hidden');
            authModal.classList.remove('flex');
        }
        
        switchTab('usersTab');
    } else {
        const authModal = document.getElementById('adminAuthModal');
        if(authModal) {
            authModal.classList.remove('hidden');
            authModal.classList.add('flex');
        }
    }
});