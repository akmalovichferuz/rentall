// Like bosish mantiqi
window.toggleLike = async (itemId, btnElement, telegramId) => {
    if (!telegramId) return alert("Avval tizimga kiring!");
    
    try {
        const res = await fetch('/api/social/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, telegramId })
        });
        const data = await res.json();
        
        if (data.success) {
            // Sonini o'zgartirish
            const card = btnElement.closest('.rentall-card');
            const countSpan = card.querySelector('.like-count');
            countSpan.textContent = data.likesCount;
            
            // Yurakchani o'zgartirish
            const icon = btnElement.querySelector('i');
            if (data.isLiked) {
                icon.classList.replace('fa-regular', 'fa-solid');
                icon.classList.add('text-red-500');
                icon.classList.remove('text-gray-400');
            } else {
                icon.classList.replace('fa-solid', 'fa-regular');
                icon.classList.add('text-gray-400');
                icon.classList.remove('text-red-500');
            }
        }
    } catch (error) {
        console.error("Like xatosi:", error);
    }
};

// public/js/social.js dagi loadComments funksiyasini shunga almashtiring:
window.loadComments = async (itemId) => {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '<div class="text-center text-gray-500 text-xs py-3">Yuklanmoqda...</div>';
    
    try {
        const res = await fetch(`/api/social/comment/${itemId}`);
        const data = await res.json();
        if (data.success) {
            if (data.comments.length === 0) {
                commentsList.innerHTML = '<div class="text-center text-gray-500 text-xs py-3">Hali fikrlar yo\'q. Birinchi bo\'lib yozing!</div>';
                return 0; // Sonini qaytaradi
            }
            
            commentsList.innerHTML = '';
            data.comments.forEach(c => {
                const date = new Date(c.createdAt).toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                commentsList.innerHTML += `
                    <div class="bg-gray-800 rounded-xl p-3 border border-gray-700">
                        <div class="flex justify-between items-start mb-1.5">
                            <span class="font-bold text-green-400 text-[11px]"><i class="fa-solid fa-user-circle mr-1 text-gray-500"></i>${c.authorName}</span>
                            <span class="text-[9px] text-gray-500">${date}</span>
                        </div>
                        <p class="text-gray-300 text-xs leading-relaxed">${c.text}</p>
                    </div>
                `;
            });
            return data.comments.length; // Sonini qaytaradi
        }
    } catch (error) {
        commentsList.innerHTML = '<div class="text-center text-red-500 text-xs py-3">Xatolik yuz berdi</div>';
        return 0;
    }
};

// Komment yozish
window.postComment = async (itemId, text, telegramId, authorName) => {
    const btn = document.getElementById('submitCommentBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    
    try {
        const res = await fetch('/api/social/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, telegramId, authorName, text })
        });
        const data = await res.json();
        if (data.success) {
            await window.loadComments(itemId);
        }
    } catch (error) {
        console.error("Fikr yuborishda xato:", error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
    }
};