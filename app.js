// --- STATE MANAGEMENT ---
let menuData = [];
let cart = JSON.parse(localStorage.getItem('pawon_cart_wa')) || [];
let activeItem = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    fetchMenuData();
    updateUI();
    setupHeroSlider();
    setupScrollObserver();
    setupModalEvents();
});

// --- FETCH DATA MENU ---
async function fetchMenuData() {
    try {
        const response = await fetch('./menu.json');
        if (!response.ok) throw new Error('Gagal mengambil data menu');
        menuData = await response.json();
        renderMenu();
    } catch (error) {
        console.error(error);
        const menuGrid = document.getElementById('menu-grid');
        if (menuGrid) {
            menuGrid.innerHTML = `
                <div class="col-span-full text-center py-8 text-rose-500 font-bold">
                    Gagal memuat daftar menu. Pastikan file menu.json tersedia.
                </div>
            `;
        }
    }
}

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
}

// --- RENDER MENU ---
function renderMenu() {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;

    grid.innerHTML = menuData.map(item => `
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
            <div>
                <img src="${item.img}" alt="${item.name}" class="w-full h-48 object-cover rounded-xl mb-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg text-gray-900">${item.name}</h3>
                    <span class="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">${formatRupiah(item.price)}</span>
                </div>
                <p class="text-gray-500 text-sm mb-4">${item.desc}</p>
            </div>
            <button onclick="openVariantModal('${item.id}')" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center space-x-2">
                <i class="fa-solid fa-plus text-xs"></i>
                <span>Pilih & Tambahkan</span>
            </button>
        </div>
    `).join('');
}

// --- MODAL & CART MANAGEMENT ---
function openVariantModal(itemId) {
    const menuItem = menuData.find(m => m.id === itemId);
    if (!menuItem) return;
    
    activeItem = menuItem;
    document.getElementById('modal-item-title').innerText = menuItem.name;
    const modal = document.getElementById('variant-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeVariantModal() {
    const modal = document.getElementById('variant-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    activeItem = null;
}

function setupModalEvents() {
    const modal = document.getElementById('variant-modal');
    if (!modal) return;

    // Close modal when clicking backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeVariantModal();
    });

    // Close modal on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeVariantModal();
        }
    });
}

function confirmAddVariant() {
    if (!activeItem) return;
    const variantSelect = document.getElementById('modal-variant-select');
    const variant = variantSelect ? variantSelect.value : 'Pedas Sedang';
    
    const existing = cart.find(c => c.id === activeItem.id && c.variant === variant);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: activeItem.id, name: activeItem.name, price: activeItem.price, variant, qty: 1 });
    }
    
    localStorage.setItem('pawon_cart_wa', JSON.stringify(cart));
    updateUI();
    showToast(`${activeItem.name} (${variant}) ditambahkan!`);
    closeVariantModal();
}

function updateQty(index, change) {
    if (!cart[index]) return;
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('pawon_cart_wa', JSON.stringify(cart));
    updateUI();
}

// --- UPDATE UI CART ---
function updateUI() {
    const cartList = document.getElementById('cart-list');
    const totalElem = document.getElementById('cart-total');
    const navCount = document.getElementById('nav-cart-count');
    const floatCart = document.getElementById('floating-cart');
    const floatQty = document.getElementById('float-qty');
    const floatTotal = document.getElementById('float-total');

    let total = 0;
    let totalQty = 0;

    if (cart.length === 0) {
        if (cartList) cartList.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">Keranjang belanja Anda masih kosong.</p>';
        if (floatCart) floatCart.classList.add('translate-y-32');
    } else {
        if (cartList) {
            cartList.innerHTML = '';
            cart.forEach((item, idx) => {
                const itemTotal = item.price * item.qty;
                total += itemTotal;
                totalQty += item.qty;

                cartList.innerHTML += `
                    <div class="flex items-center justify-between pt-3">
                        <div>
                            <h4 class="font-bold text-gray-800 text-sm">${item.name}</h4>
                            <p class="text-xs text-gray-500">Varian: ${item.variant} | ${formatRupiah(item.price)}</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <button type="button" onclick="updateQty(${idx}, -1)" class="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition">-</button>
                            <span class="font-bold text-sm">${item.qty}</span>
                            <button type="button" onclick="updateQty(${idx}, 1)" class="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold hover:bg-amber-200 transition">+</button>
                        </div>
                    </div>
                `;
            });
        }
        if (floatCart) floatCart.classList.remove('translate-y-32');
    }

    const formattedTotal = formatRupiah(total);
    if (totalElem) totalElem.innerText = formattedTotal;
    if (floatTotal) floatTotal.innerText = formattedTotal;
    if (navCount) navCount.innerText = totalQty;
    if (floatQty) floatQty.innerText = totalQty;
}

// --- PEMBAYARAN TOGGLE & CHECKOUT ---
function togglePaymentView(method) {
    const btn = document.getElementById('submit-btn');
    const qrisBox = document.getElementById('qris-box');

    if (method === 'QRIS') {
        btn.className = "w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center space-x-2 mt-6";
        btn.innerHTML = `<i class="fa-solid fa-qrcode text-xl"></i><span>Lanjutkan Pembayaran QRIS</span>`;
        if (qrisBox) qrisBox.classList.add('hidden');
    } else {
        btn.className = "w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center space-x-2 mt-6";
        btn.innerHTML = `<i class="fa-brands fa-whatsapp text-xl"></i><span>Kirim & Bayar via WhatsApp</span>`;
        if (qrisBox) qrisBox.classList.add('hidden');
    }
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    if (cart.length === 0) {
        alert('Keranjang masih kosong. Pilih menu terlebih dahulu.');
        return;
    }

    const selectedMethod = document.querySelector('input[name="pay-method"]:checked').value;

    if (selectedMethod === 'QRIS') {
        const qrisBox = document.getElementById('qris-box');
        if (qrisBox) {
            qrisBox.classList.remove('hidden');
            qrisBox.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        // Direct WhatsApp
        const name = document.getElementById('cust-name').value;
        let phone = document.getElementById('cust-phone').value;
        const option = document.getElementById('cust-option').value;
        const address = document.getElementById('cust-address').value;

        phone = phone.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) { phone = '62' + phone.slice(1); }

        let text = `Halo *Pawon Corner*, saya mau memesan:\n\n*Rincian Pesanan:*\n`;
        let total = 0;
        
        cart.forEach((item, i) => {
            const sub = item.price * item.qty;
            total += sub;
            text += `${i+1}. ${item.name} (${item.variant}) x${item.qty} = ${formatRupiah(sub)}\n`;
        });

        text += `\n*Total:* ${formatRupiah(total)}\n\n`;
        text += `*Data Pemesan:*\n• Nama: ${name}\n• No. HP: ${phone}\n• Opsi: ${option}\n`;
        if (option === 'Diantar') text += `• Alamat: ${address}\n`;

        const storePhone = "62895367375041"; 
        const waUrl = `https://api.whatsapp.com/send?phone=${storePhone}&text=${encodeURIComponent(text)}`;

        localStorage.removeItem('pawon_cart_wa');
        cart = [];
        updateUI();

        window.location.href = waUrl;
    }
}

function simulatePaymentSuccess() {
    alert('Pembayaran QRIS Berhasil! Pesanan Anda telah diteruskan ke dapur Pawon Corner.');
    localStorage.removeItem('pawon_cart_wa');
    cart = [];
    updateUI();
    const qrisBox = document.getElementById('qris-box');
    if (qrisBox) qrisBox.classList.add('hidden');
}

// --- INTERSECTION OBSERVER FOR ACTIVE NAV ---
function setupScrollObserver() {
    const sections = document.querySelectorAll('section, footer');
    const navItems = document.querySelectorAll('.mobile-nav-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    const sectionTarget = item.getAttribute('data-section');
                    if (sectionTarget === currentId) {
                        item.classList.remove('text-gray-500');
                        item.classList.add('text-amber-600');
                    } else {
                        item.classList.remove('text-amber-600');
                        item.classList.add('text-gray-500');
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
}

// --- HELPER UI ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('menu-icon');
    if (!menu || !icon) return;
    
    menu.classList.toggle('open');
    icon.className = menu.classList.contains('open') ? 'fa-solid fa-xmark text-xl' : 'fa-solid fa-bars text-xl';
}

function toggleAddressInput(val) {
    const container = document.getElementById('address-container');
    const addressInput = document.getElementById('cust-address');
    if (!container || !addressInput) return;

    if (val === 'Ambil Sendiri') {
        container.classList.add('hidden');
        addressInput.removeAttribute('required');
    } else {
        container.classList.remove('hidden');
        addressInput.setAttribute('required', 'true');
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    const msgElem = document.getElementById('toast-message');
    if (!toast || !msgElem) return;

    msgElem.innerText = msg;
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-show');
    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-enter');
    }, 2500);
}

function setupHeroSlider() {
    const slides = document.querySelectorAll('.slide-img');
    if (slides.length === 0) return;
    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 3000);
}
