const STORAGE_KEYS = {
  orders: 'coffee-orders',
  cart: 'coffee-cart',
};

const MENU_ITEMS = [
  {
    id: 1,
    name: '아메리카노',
    category: 'coffee',
    price: 4500,
    description: '깊고 균형 잡힌 원두 풍미',
    emoji: '☕',
  },
  {
    id: 2,
    name: '카페라떼',
    category: 'coffee',
    price: 5500,
    description: '부드러운 우유 거품이 더해진 클래식 라떼',
    emoji: '🥛',
  },
  {
    id: 3,
    name: '바닐라라떼',
    category: 'coffee',
    price: 6000,
    description: '바닐라 향이 가득한 달콤한 라떼',
    emoji: '🍦',
  },
  {
    id: 4,
    name: '복숭아 아이스티',
    category: 'noncoffee',
    price: 4800,
    description: '시원한 복숭아 향과 산뜻한 맛',
    emoji: '🍑',
  },
  {
    id: 5,
    name: '레몬에이드',
    category: 'noncoffee',
    price: 5200,
    description: '톡 쏘는 레몬향의 상큼한 에이드',
    emoji: '🍋',
  },
  {
    id: 6,
    name: '치즈케이크',
    category: 'dessert',
    price: 6500,
    description: '부드럽고 진한 크림치즈 케이크',
    emoji: '🍰',
  },
  {
    id: 7,
    name: '크로플',
    category: 'dessert',
    price: 7000,
    description: '겉바속촉, 바삭한 쿠키 크로플',
    emoji: '🥐',
  },
  {
    id: 8,
    name: '말차라떼',
    category: 'coffee',
    price: 5800,
    description: '쌉싸름한 말차와 부드러운 우유',
    emoji: '🍵',
  },
];

const STATUS_ORDER = ['주문 접수', '제조 중', '완료', '취소'];

const state = {
  activeCategory: 'all',
  cart: loadFromStorage(STORAGE_KEYS.cart, []),
  orders: loadFromStorage(STORAGE_KEYS.orders, []),
  activeTab: 'customer',
  statusFilter: 'all',
};

const menuListEl = document.getElementById('menu-list');
const cartItemsEl = document.getElementById('cart-items');
const subtotalPriceEl = document.getElementById('subtotal-price');
const totalPriceEl = document.getElementById('total-price');
const orderFormEl = document.getElementById('order-form');
const statsGridEl = document.getElementById('stats-grid');
const adminOrderListEl = document.getElementById('admin-order-list');
const statusFilterEl = document.getElementById('status-filter');

function loadFromStorage(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return saved ?? fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatPrice(value) {
  return `${Number(value).toLocaleString()}원`;
}

function generateOrderNumber() {
  return `B-${new Date().getTime().toString().slice(-6)}`;
}

function getMenuById(id) {
  return MENU_ITEMS.find((item) => item.id === id);
}

function renderMenus() {
  const filtered =
    state.activeCategory === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((menu) => menu.category === state.activeCategory);

  menuListEl.innerHTML = filtered
    .map(
      (menu) => `
        <article class="menu-card">
          <div class="menu-image" aria-hidden="true">${menu.emoji}</div>
          <div class="menu-meta">
            <div>
              <div class="menu-name">${menu.name}</div>
            </div>
            <span class="menu-category">${menu.category === 'coffee' ? '커피' : menu.category === 'noncoffee' ? '논커피' : '디저트'}</span>
          </div>
          <p class="menu-description">${menu.description}</p>
          <div class="menu-footer">
            <span class="price">${formatPrice(menu.price)}</span>
            <button class="primary-btn" type="button" data-add-id="${menu.id}">담기</button>
          </div>
        </article>
      `
    )
    .join('');
}

function renderCart() {
  if (!state.cart.length) {
    cartItemsEl.innerHTML = `
      <div class="empty-state">
        <div>
          <p>장바구니가 비어 있어요.</p>
          <p>원하는 메뉴를 담아보세요.</p>
        </div>
      </div>
    `;
    subtotalPriceEl.textContent = '0원';
    totalPriceEl.textContent = '0원';
    return;
  }

  cartItemsEl.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-item-top">
            <div>
              <div class="cart-name">${item.name}</div>
              <div class="cart-options">${item.options || '기본 옵션'}</div>
            </div>
            <button class="remove-btn" type="button" data-remove-id="${item.id}">삭제</button>
          </div>

          <div class="cart-item-bottom">
            <div class="qty-box" aria-label="수량 조절">
              <button type="button" data-qty-change="-1" data-item-id="${item.id}">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-qty-change="1" data-item-id="${item.id}">+</button>
            </div>
            <div class="cart-price">${formatPrice(item.price * item.quantity)}</div>
          </div>
        </div>
      `
    )
    .join('');

  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  subtotalPriceEl.textContent = formatPrice(subtotal);
  totalPriceEl.textContent = formatPrice(subtotal);
}

function addToCart(menuId) {
  const menu = getMenuById(Number(menuId));
  if (!menu) return;

  const existing = state.cart.find((item) => item.menuId === menu.id && item.options === '기본 옵션');

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: `${menu.id}-${Date.now()}`,
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      quantity: 1,
      options: '기본 옵션',
    });
  }

  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function changeCartQuantity(itemId, delta) {
  const item = state.cart.find((entry) => entry.id === itemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== itemId);
  }

  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function removeCartItem(itemId) {
  state.cart = state.cart.filter((entry) => entry.id !== itemId);
  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function clearCart() {
  state.cart = [];
  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function renderStats() {
  const totalOrders = state.orders.length;
  const waiting = state.orders.filter((order) => order.status === '주문 접수').length;
  const preparing = state.orders.filter((order) => order.status === '제조 중').length;
  const completed = state.orders.filter((order) => order.status === '완료').length;
  const cancelled = state.orders.filter((order) => order.status === '취소').length;
  const todaySales = state.orders
    .filter((order) => order.status !== '취소')
    .reduce((sum, order) => sum + Number(order.totalPrice), 0);

  const statCards = [
    { label: '총 주문', value: totalOrders },
    { label: '대기', value: waiting },
    { label: '제조 중', value: preparing },
    { label: '완료', value: completed },
    { label: '취소', value: cancelled },
    { label: '오늘 매출', value: formatPrice(todaySales) },
  ];

  statsGridEl.innerHTML = statCards
    .map(
      (stat) => `
        <article class="stat-card">
          <div class="stat-label">${stat.label}</div>
          <div class="stat-value">${stat.value}</div>
        </article>
      `
    )
    .join('');
}

function getBadgeClass(status) {
  if (status === '주문 접수') return 'received';
  if (status === '제조 중') return 'preparing';
  if (status === '완료') return 'completed';
  if (status === '취소') return 'cancelled';
  return 'received';
}

function renderAdminOrders() {
  const filteredOrders =
    state.statusFilter === 'all'
      ? [...state.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : state.orders.filter((order) => order.status === state.statusFilter);

  if (!filteredOrders.length) {
    adminOrderListEl.innerHTML = `
      <div class="empty-state">
        <div>
          <p>표시할 주문이 없습니다.</p>
        </div>
      </div>
    `;
    return;
  }

  adminOrderListEl.innerHTML = filteredOrders
    .map(
      (order) => `
        <article class="order-card">
          <div class="order-top">
            <div class="order-number">${order.orderNumber}</div>
            <span class="badge ${getBadgeClass(order.status)}">${order.status}</span>
          </div>
          <div class="order-meta">
            <span>${order.customerName}</span>
            <span>${new Date(order.createdAt).toLocaleString('ko-KR')}</span>
          </div>
          <ul class="order-items">
            ${order.items
              .map(
                (item) => `
                  <li>
                    <span>${item.name} x ${item.quantity}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                  </li>
                `
              )
              .join('')}
          </ul>
          <div class="order-meta">
            <span>요청 사항: ${order.request || '없음'}</span>
            <strong>${formatPrice(order.totalPrice)}</strong>
          </div>
          <div class="order-actions">
            <select class="status-select" data-order-status-id="${order.id}">
              ${STATUS_ORDER.map(
                (status) => `
                  <option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>
                `
              ).join('')}
            </select>
            <button class="status-btn" type="button" data-update-order-status="${order.id}">상태 변경</button>
          </div>
        </article>
      `
    )
    .join('');
}

function updateOrderStatus(orderId) {
  const select = document.querySelector(`[data-order-status-id="${orderId}"]`);
  if (!select) return;

  const nextStatus = select.value;
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order || !nextStatus) return;

  order.status = nextStatus;
  saveToStorage(STORAGE_KEYS.orders, state.orders);
  renderStats();
  renderAdminOrders();
}

function handleOrderSubmit(event) {
  event.preventDefault();

  if (!state.cart.length) {
    alert('장바구니가 비어 있습니다. 메뉴를 선택해 주세요.');
    return;
  }

  const formData = new FormData(event.currentTarget);
  const customerName = formData.get('customerName').toString().trim();
  const phone = formData.get('phone').toString().trim();
  const request = formData.get('request').toString().trim();

  if (!customerName || !phone) {
    alert('이름과 연락처를 입력해 주세요.');
    return;
  }

  const totalPrice = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const newOrder = {
    id: Date.now(),
    orderNumber: generateOrderNumber(),
    customerName,
    phone,
    request,
    totalPrice,
    status: '주문 접수',
    createdAt: new Date().toISOString(),
    items: state.cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      options: item.options,
    })),
  };

  state.orders.unshift(newOrder);
  saveToStorage(STORAGE_KEYS.orders, state.orders);
  clearCart();
  orderFormEl.reset();
  renderStats();
  renderAdminOrders();

  if (state.activeTab !== 'admin') {
    document.querySelector('.tab-btn[data-tab="admin"]').click();
  }

  alert(`${newOrder.orderNumber} 주문이 접수되었습니다.`);
}

function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeTab = button.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach((item) => item.classList.toggle('active', item === button));
      document.querySelectorAll('.tab-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.id === `${state.activeTab}-tab`);
      });
    });
  });

  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeCategory = button.dataset.category;
      document.querySelectorAll('.filter-btn').forEach((item) => item.classList.toggle('active', item === button));
      renderMenus();
    });
  });

  document.getElementById('menu-list').addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-add-id]');
    if (addButton) {
      addToCart(addButton.dataset.addId);
    }
  });

  document.getElementById('cart-items').addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-id]');
    if (removeButton) {
      removeCartItem(removeButton.dataset.removeId);
      return;
    }

    const qtyButton = event.target.closest('[data-qty-change]');
    if (qtyButton) {
      changeCartQuantity(qtyButton.dataset.itemId, Number(qtyButton.dataset.qtyChange));
    }
  });

  document.getElementById('clear-cart').addEventListener('click', clearCart);
  orderFormEl.addEventListener('submit', handleOrderSubmit);

  statusFilterEl.addEventListener('change', (event) => {
    state.statusFilter = event.target.value;
    renderAdminOrders();
  });

  document.getElementById('admin-order-list').addEventListener('click', (event) => {
    const updateButton = event.target.closest('[data-update-order-status]');
    if (updateButton) {
      updateOrderStatus(updateButton.dataset.updateOrderStatus);
    }
  });
}

function init() {
  renderMenus();
  renderCart();
  renderStats();
  renderAdminOrders();
  bindEvents();
}

init();
