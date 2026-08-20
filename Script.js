document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('.menu-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;
      cards.forEach(card => {
        const match = card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  const WHATSAPP_NUMBER = '085122949084';

  let cart = []; // { id, name, price, qty }

  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountEl = document.getElementById('cartCount');
  const cartCheckoutBtn = document.getElementById('cartCheckout');
  const toastEl = document.getElementById('toast');

  const formatRupiah = (num) => 'Rp ' + num.toLocaleString('id-ID');

  let toastTimer = null;
  const showToast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2200);
  };

  const renderCart = () => {
    
    cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

    if (cart.length === 0) {
      cartEmptyEl.style.display = 'block';
    } else {
      cartEmptyEl.style.display = 'none';

      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.dataset.id = item.id;
        row.innerHTML = `
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <span class="cart-item-price">${formatRupiah(item.price)}</span>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn minus" type="button" aria-label="Kurangi jumlah ${item.name}">&minus;</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn plus" type="button" aria-label="Tambah jumlah ${item.name}">+</button>
          </div>
          <button class="cart-item-remove" type="button" aria-label="Hapus ${item.name} dari troli">
            <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>
          </button>
        `;
        cartItemsEl.appendChild(row);
      });
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    cartTotalEl.textContent = formatRupiah(total);
    cartCountEl.textContent = String(totalQty);
    cartCountEl.classList.toggle('hidden', totalQty === 0);
    cartCheckoutBtn.disabled = cart.length === 0;
  };

  const addToCart = (id, name, price) => {
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price, qty: 1 });
    }
    renderCart();
    showToast(`${name} ditambahkan ke troli`);
  };

  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.menu-card');
      if (!card) return;
      const { id, name, price } = card.dataset;
      addToCart(id, name, Number(price));
    });
  });

  cartItemsEl.addEventListener('click', (e) => {
    const row = e.target.closest('.cart-item');
    if (!row) return;
    const id = row.dataset.id;
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (e.target.closest('.plus')) {
      item.qty += 1;
    } else if (e.target.closest('.minus')) {
      item.qty -= 1;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
    } else if (e.target.closest('.cart-item-remove')) {
      cart = cart.filter(i => i.id !== id);
    } else {
      return;
    }
    renderCart();
  });

  const openCart = () => {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    cartClose.focus();
  };

  const closeCart = () => {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    cartBtn.focus();
  };

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer.classList.contains('open')) {
      closeCart();
    }
  });

  cartCheckoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    const lines = cart.map(item => `- ${item.name} x${item.qty} (${formatRupiah(item.price * item.qty)})`);
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const message = [
      'Halo Ruang Seduh, saya ingin memesan:',
      ...lines,
      '',
      `Total: ${formatRupiah(total)}`
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  });

  renderCart();

});