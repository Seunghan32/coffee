const STORAGE_KEYS = {
  menu: 'coffee-menu-items',
  cart: 'coffee-cart-items',
  orders: 'coffee-orders',
};

const STATUS_LABELS = {
  waiting: '주문 접수',
  preparing: '준비 중',
  completed: '완료',
  cancelled: '취소',
};

const STATUS_COLORS = {
  waiting: '#d08a31',
  preparing: '#4d7fb4',
  completed: '#2d8f6d',
  cancelled: '#b74c4c',
};

const DEFAULT_MENU_ITEMS = [
  {
    id: 1,
    name: '에스프레소',
    category: 'coffee',
    description: '진한 바디감과 고소한 커피향이 살아있는 클래식 커피',
    price: 3500,
    emoji: '☕',
  },
  {
    id: 2,
    name: '카페라떼',
    category: 'coffee',
    description: '부드러운 우유 거품과 균형 잡힌 커피 맛',
    price: 4500,
    emoji: '🥛',
  },
  {
    id: 3,
    name: '바닐라 라떼',
    category: 'coffee',
    description: '바닐라 향이 더해진 달콤한 스페셜티 라떼',
    price: 5200,
    emoji: '🍦',
  },
  {
    id: 4,
    name: '아메리카노',
    category: 'coffee',
    description: '깔끔하고 상쾌한 원두의 향을 살린 아메리카노',
    price: 4000,
    emoji: '☕',
  },
  {
    id: 5,
    name: '복숭아 아이스티',
    category: 'tea',
    description: '과일향이 가득한 달콤한 아이스티',
    price: 4200,
    emoji: '🍑',
  },
  {
    id: 6,
    name: '자몽 에이드',
    category: 'noncoffee',
    description: '새콤하고 상큼한 자몽 에이드',
    price: 4800,
    emoji: '🍊',
  },
  {
    id: 7,
    name: '치즈 케이크',
    category: 'dessert',
    description: '부드러운 크림치즈와 바삭한 크럼블이 어우러진 케이크',
    price: 6000,
    emoji: '🍰',
  },
  {
    id: 8,
    name: '크로와상',
    category: 'dessert',
    description: '겉은 바삭하고 속은 부드러운 프랑스식 크로와상',
    price: 3500,
    emoji: '🥐',
  },
];

const categoryMeta = {
  all: '전체',
  coffee: '커피',
  noncoffee: '논커피',
  dessert: '디저트',
  tea: '티',
};

const state = {
  selectedCategory: 'all',
  searchQuery: '',
  cart: loadFromStorage(STORAGE_KEYS.cart, []),
  orders: loadFromStorage(STORAGE_KEYS.orders, []),
  menuItems: loadFromStorage(STORAGE_KEYS.menu, DEFAULT_MENU_ITEMS),
  activeAdminFilter: 'all',
};

function loadFromStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.warn(`${key} 로딩 중 오류 발생:`, error);
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatPrice(value) {
  return `${Number(value).toLocaleString()}원`;
}

function getFilteredMenu() {
  return state.menuItems.filter((item) => {
    const matchesCategory = state.selectedCategory === 'all' || item.category === state.selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

function renderCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  const categories = ['all', ...Object.keys(categoryMeta).filter((key) => key !== 'all')];

  container.innerHTML = categories
    .map(
      (category) => `
        <button
          type="button"
          class="filter-chip ${state.selectedCategory === category ? 'active' : ''}"
          data-category="${category}"
        >
          ${categoryMeta[category]}
        </button>
      `,
    )
    .join('');

  container.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCategory = button.dataset.category;
      renderCategoryFilters();
      renderMenu();
    });
  });
}

function renderMenu() {
  const menuGrid = document.getElementById('menuGrid');
  const filteredMenu = getFilteredMenu();

  if (!filteredMenu.length) {
    menuGrid.innerHTML = `<div class="empty-cart">검색 조건에 맞는 메뉴가 없습니다.</div>`;
    return;
  }

  menuGrid.innerHTML = filteredMenu
    .map(
      (item) => `
        <article class="menu-card" data-id="${item.id}">
          <div class="menu-thumb">${item.emoji || '☕'}</div>
          <div class="menu-body">
            <div class="menu-topline">
              <div class="menu-name">${item.name}</div>
              <span class="menu-tag">${categoryMeta[item.category]}</span>
            </div>
            <div class="menu-desc">${item.description}</div>
            <div class="menu-meta">
              <div class="menu-price">${formatPrice(item.price)}</div>
              <button type="button" class="primary-btn add-to-cart-btn" data-id="${item.id}">담기</button>
            </div>
          </div>
        </article>
      `,
    )
    .join('');

  menuGrid.querySelectorAll('.add-to-cart-btn').forEach((button) => {
    button.addEventListener('click', () => addToCart(Number(button.dataset.id)));
  });
}

function addToCart(menuId) {
  const existingItem = state.cart.find((item) => item.menuId === menuId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const menu = state.menuItems.find((item) => item.id === menuId);
    if (!menu) return;

    state.cart.push({
      id: `${menuId}-${Date.now()}`,
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      quantity: 1,
      category: menu.category,
    });
  }

  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function updateCartQuantity(menuId, delta) {
  const target = state.cart.find((item) => item.menuId === menuId);
  if (!target) return;

  target.quantity += delta;
  if (target.quantity <= 0) {
    state.cart = state.cart.filter((item) => item.menuId !== menuId);
  }

  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function removeCartItem(menuId) {
  state.cart = state.cart.filter((item) => item.menuId !== menuId);
  saveToStorage(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById('cartList');
  const cartTotal = document.getElementById('cartTotal');
  const cartItemCount = document.getElementById('cartItemCount');

  if (!state.cart.length) {
    cartList.innerHTML = `
      <div class="empty-cart">
        아직 담긴 메뉴가 없어요.<br />원하는 메뉴를 선택해보세요.
      </div>
    `;
    cartTotal.textContent = '0원';
    cartItemCount.textContent = '0개';
    return;
  }

  const totalPrice = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  cartTotal.textContent = formatPrice(totalPrice);
  cartItemCount.textContent = `${totalQty}개`;

  cartList.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="meta">
            <h4>${item.name}</h4>
            <p>${formatPrice(item.price)} / 개</p>
            <div class="cart-controls">
              <div class="qty-buttons">
                <button type="button" class="qty-btn" data-action="decrease" data-menu-id="${item.menuId}">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button type="button" class="qty-btn" data-action="increase" data-menu-id="${item.menuId}">+</button>
              </div>
              <button type="button" class="ghost-btn" data-action="remove" data-menu-id="${item.menuId}">삭제</button>
            </div>
          </div>
          <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
      `,
    )
    .join('');

  cartList.querySelectorAll('.qty-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const menuId = Number(button.dataset.menuId);
      if (action === 'increase') {
        updateCartQuantity(menuId, 1);
      } else {
        updateCartQuantity(menuId, -1);
      }
    });
  });

  cartList.querySelectorAll('[data-action="remove"]').forEach((button) => {
    button.addEventListener('click', () => {
      removeCartItem(Number(button.dataset.menuId));
    });
  });
}

function handleOrderSubmit(event) {
  event.preventDefault();

  if (!state.cart.length) {
    alert('장바구니에 메뉴를 먼저 담아주세요.');
    return;
  }

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const paymentMethod = document.getElementById('paymentMethod').value;
  const requestNote = document.getElementById('requestNote').value.trim();

  if (!name || !phone) {
    alert('이름과 연락처를 입력해주세요.');
    return;
  }

  const orderNumber = `B-${Date.now().toString().slice(-6)}`;
  const totalPrice = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const newOrder = {
    id: Date.now(),
    orderNumber,
    customerName: name,
    phoneNumber: phone,
    paymentMethod,
    requestNote: requestNote || '요청 사항 없음',
    status: 'waiting',
    totalPrice,
    createdAt: new Date().toISOString(),
    items: state.cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  };

  state.orders.unshift(newOrder);
  saveToStorage(STORAGE_KEYS.orders, state.orders);

  state.cart = [];
  saveToStorage(STORAGE_KEYS.cart, state.cart);

  document.getElementById('orderForm').reset();
  renderCart();
  renderDashboard();

  alert(`${orderNumber} 주문이 접수되었습니다.`);
}

function renderStats() {
  const statsContainer = document.getElementById('statsCards');
  const totalOrders = state.orders.length;
  const todaySales = state.orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const waitingCount = state.orders.filter((order) => order.status === 'waiting').length;
  const preparingCount = state.orders.filter((order) => order.status === 'preparing').length;
  const completedCount = state.orders.filter((order) => order.status === 'completed').length;

  const stats = [
    { label: '총 주문 수', value: totalOrders },
    { label: '오늘 매출', value: formatPrice(todaySales) },
    { label: '대기 중', value: waitingCount },
    { label: '제조 중', value: preparingCount },
    { label: '완료', value: completedCount },
  ];

  statsContainer.innerHTML = stats
    .map(
      (stat) => `
        <div class="stat-card">
          <div class="label">${stat.label}</div>
          <div class="value">${stat.value}</div>
        </div>
      `,
    )
    .join('');
}

function renderStatusFilters() {
  const container = document.getElementById('statusFilter');
  const statusKeys = ['all', ...Object.keys(STATUS_LABELS)];

  container.innerHTML = statusKeys
    .map(
      (status) => `
        <button
          type="button"
          class="filter-chip ${state.activeAdminFilter === status ? 'active' : ''}"
          data-status="${status}"
        >
          ${status === 'all' ? '전체' : STATUS_LABELS[status]}
        </button>
      `,
    )
    .join('');

  container.querySelectorAll('[data-status]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeAdminFilter = button.dataset.status;
      renderStatusFilters();
      renderAdminOrders();
    });
  });
}

function renderAdminOrders() {
  const container = document.getElementById('adminOrders');

  const filteredOrders = state.orders.filter((order) => {
    return state.activeAdminFilter === 'all' || order.status === state.activeAdminFilter;
  });

  if (!filteredOrders.length) {
    container.innerHTML = `<div class="empty-cart">표시할 주문이 없습니다.</div>`;
    return;
  }

  container.innerHTML = filteredOrders
    .map(
      (order) => `
        <article class="order-card" data-order-id="${order.id}">
          <div class="order-header">
            <div>
              <strong>${order.orderNumber}</strong>
              <div>${order.customerName} · ${order.phoneNumber}</div>
            </div>
            <span class="order-badge" style="background:${STATUS_COLORS[order.status]}22; color:${STATUS_COLORS[order.status]};">
              ${STATUS_LABELS[order.status]}
            </span>
          </div>

          <div class="order-body">
            <div class="order-items">
              ${order.items
                .map(
                  (item) => `
                    <div class="order-item-line">
                      <span>${item.name} x ${item.quantity}</span>
                      <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                  `,
                )
                .join('')}
              <div class="order-item-line">
                <span>요청사항</span>
                <span>${order.requestNote}</span>
              </div>
            </div>

            <div class="order-summary">
              <div>결제: ${order.paymentMethod}</div>
              <strong>${formatPrice(order.totalPrice)}</strong>
              <div class="status-buttons">
                ${Object.entries(STATUS_LABELS)
                  .map(
                    ([statusKey, statusLabel]) => `
                      <button
                        type="button"
                        class="status-btn ${order.status === statusKey ? 'active' : ''}"
                        data-order-id="${order.id}"
                        data-status="${statusKey}"
                      >
                        ${statusLabel}
                      </button>
                    `,
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </article>
      `,
    )
    .join('');

  container.querySelectorAll('.status-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const orderId = Number(button.dataset.orderId);
      const nextStatus = button.dataset.status;
      updateOrderStatus(orderId, nextStatus);
    });
  });
}

function updateOrderStatus(orderId, nextStatus) {
  const targetOrder = state.orders.find((order) => order.id === orderId);
  if (!targetOrder) return;

  targetOrder.status = nextStatus;
  saveToStorage(STORAGE_KEYS.orders, state.orders);
  renderDashboard();
}

function renderDashboard() {
  renderStats();
  renderStatusFilters();
  renderAdminOrders();
}

function handleMenuSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('newMenuName').value.trim();
  const category = document.getElementById('newMenuCategory').value;
  const description = document.getElementById('newMenuDescription').value.trim();
  const price = Number(document.getElementById('newMenuPrice').value);

  if (!name || !description || Number.isNaN(price) || price <= 0) {
    alert('메뉴 정보를 올바르게 입력해주세요.');
    return;
  }

  const newMenu = {
    id: Date.now(),
    name,
    category,
    description,
    price,
    emoji: getEmojiByCategory(category),
  };

  state.menuItems.push(newMenu);
  saveToStorage(STORAGE_KEYS.menu, state.menuItems);

  event.target.reset();
  renderMenu();
  renderCategoryFilters();
  alert('메뉴가 추가되었습니다.');
}

function getEmojiByCategory(category) {
  const emojiMap = {
    coffee: '☕',
    noncoffee: '🍹',
    dessert: '🍰',
    tea: '🫖',
  };

  return emojiMap[category] || '☕';
}

function bindEvents() {
  document.getElementById('searchInput').addEventListener('input', (event) => {
    state.searchQuery = event.target.value;
    renderMenu();
  });

  document.getElementById('clearCartBtn').addEventListener('click', () => {
    state.cart = [];
    saveToStorage(STORAGE_KEYS.cart, state.cart);
    renderCart();
  });

  document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);
  document.getElementById('menuForm').addEventListener('submit', handleMenuSubmit);

  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      document.querySelectorAll('.nav-btn').forEach((nav) => nav.classList.toggle('active', nav === button));
      document.getElementById('customerView').classList.toggle('active', view === 'customer');
      document.getElementById('adminView').classList.toggle('active', view === 'admin');
    });
  });
}

function initialize() {
  bindEvents();
  renderCategoryFilters();
  renderMenu();
  renderCart();
  renderDashboard();
}

initialize();
