const STORAGE_KEYS = {
  menu: 'coffee-menu',
  cart: 'coffee-cart',
  orders: 'coffee-orders'
};

const optionMap = {
  temperature: {
    ice: 0,
    hot: 0
  },
  size: {
    regular: 0,
    large: 1500
  },
  extras: {
    shot: 500,
    syrup: 300,
    cream: 400,
    vanilla: 350
  }
};

const defaultMenu = [
  {
    id: 'espresso',
    name: '에스프레소',
    category: 'coffee',
    description: '진한 커피향이 살아있는 원두 에스프레소',
    price: 3500,
    emoji: '☕',
    options: {
      temperature: ['ice', 'hot'],
      size: ['regular', 'large'],
      extras: ['shot', 'syrup', 'cream']
    }
  },
  {
    id: 'latte',
    name: '카페 라떼',
    category: 'coffee',
    description: '부드러운 우유 거품과 고소한 커피의 조화',
    price: 4500,
    emoji: '🥛',
    options: {
      temperature: ['ice', 'hot'],
      size: ['regular', 'large'],
      extras: ['shot', 'syrup', 'vanilla']
    }
  },
  {
    id: 'vanilla-latte',
    name: '바닐라 라떼',
    category: 'coffee',
    description: '달콤한 바닐라 향이 더해진 부드러운 라떼',
    price: 5200,
    emoji: '🍦',
    options: {
      temperature: ['ice', 'hot'],
      size: ['regular', 'large'],
      extras: ['shot', 'cream', 'vanilla']
    }
  },
  {
    id: 'lemonade',
    name: '레몬에이드',
    category: 'beverage',
    description: '시원한 레몬 향이 가득한 상큼한 에이드',
    price: 4800,
    emoji: '🍋',
    options: {
      temperature: ['ice'],
      size: ['regular', 'large'],
      extras: ['syrup', 'vanilla']
    }
  },
  {
    id: 'matcha',
    name: '말차 라떼',
    category: 'beverage',
    description: '깊고 고소한 말차의 풍미가 느껴지는 라떼',
    price: 5500,
    emoji: '🍵',
    options: {
      temperature: ['ice', 'hot'],
      size: ['regular', 'large'],
      extras: ['cream', 'syrup']
    }
  },
  {
    id: 'cheesecake',
    name: '치즈 케이크',
    category: 'dessert',
    description: '촉촉하고 부드러운 치즈 케이크',
    price: 6200,
    emoji: '🍰',
    options: {
      temperature: ['hot'],
      size: ['regular'],
      extras: ['cream', 'vanilla']
    }
  }
];

const initialOrders = [
  {
    id: 1,
    orderNumber: 'ORD-20261022-0001',
    customerName: '김민준',
    phoneNumber: '010-1234-5678',
    orderTime: '2026-10-22T09:02:00',
    status: 'waiting',
    totalPrice: 8500,
    requestNote: '얼음 적게 부탁해요.',
    paymentMethod: 'card',
    items: [
      { id: 'americano-order', menuId: 'espresso', name: '에스프레소', quantity: 1, unitPrice: 4500, selectedOptions: { temperature: 'ice', size: 'large', extras: ['shot'] } }
    ]
  },
  {
    id: 2,
    orderNumber: 'ORD-20261022-0002',
    customerName: '이서연',
    phoneNumber: '010-9876-5432',
    orderTime: '2026-10-22T09:40:00',
    status: 'preparing',
    totalPrice: 10200,
    requestNote: '종이컵으로 부탁드려요.',
    paymentMethod: 'simple',
    items: [
      { id: 'latte-order', menuId: 'latte', name: '카페 라떼', quantity: 2, unitPrice: 5100, selectedOptions: { temperature: 'hot', size: 'regular', extras: ['syrup'] } }
    ]
  },
  {
    id: 3,
    orderNumber: 'ORD-20261022-0003',
    customerName: '박지훈',
    phoneNumber: '010-5566-7788',
    orderTime: '2026-10-22T10:12:00',
    status: 'completed',
    totalPrice: 12000,
    requestNote: '',
    paymentMethod: 'cash',
    items: [
      { id: 'matcha-order', menuId: 'matcha', name: '말차 라떼', quantity: 1, unitPrice: 7000, selectedOptions: { temperature: 'ice', size: 'large', extras: ['cream'] } },
      { id: 'cake-order', menuId: 'cheesecake', name: '치즈 케이크', quantity: 1, unitPrice: 5000, selectedOptions: { temperature: 'hot', size: 'regular', extras: ['vanilla'] } }
    ]
  }
];

const state = {
  activeTab: 'customer',
  category: 'all',
  query: '',
  cart: loadFromStorage(STORAGE_KEYS.cart, []),
  orders: loadFromStorage(STORAGE_KEYS.orders, initialOrders),
  adminFilter: 'all',
  selectedMenu: null
};

const els = {
  customerView: document.getElementById('customer-view'),
  adminView: document.getElementById('admin-view'),
  menuGrid: document.getElementById('menuGrid'),
  cartList: document.getElementById('cartList'),
  cartTotal: document.getElementById('cartTotal'),
  cartCount: document.getElementById('cartCount'),
  searchInput: document.getElementById('searchInput'),
  categoryTabs: document.getElementById('categoryTabs'),
  orderForm: document.getElementById('orderForm'),
  customerOrderList: document.getElementById('customerOrderList'),
  adminOrderList: document.getElementById('adminOrderList'),
  adminFilter: document.getElementById('adminFilter'),
  menuModal: document.getElementById('menuModal'),
  modalContent: document.getElementById('modalContent'),
  clearCartBtn: document.getElementById('clearCartBtn')
};

function loadFromStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatPrice(value) {
  return `${Number(value).toLocaleString()}원`;
}

function getCategories() {
  const categories = [...new Set(defaultMenu.map(item => item.category))];
  return ['all', ...categories];
}

function getFilteredMenu() {
  const selectedCategory = state.category;
  const query = state.query.trim().toLowerCase();

  return defaultMenu.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery = !query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
}

function renderCategories() {
  const categories = getCategories();
  els.categoryTabs.innerHTML = categories
    .map(category => {
      const labelMap = {
        all: '전체',
        coffee: '커피',
        beverage: '음료',
        dessert: '디저트'
      };

      const isActive = state.category === category;
      return `<button class="category-button ${isActive ? 'active' : ''}" data-category="${category}" type="button">${labelMap[category] || category}</button>`;
    })
    .join('');
}

function renderMenu() {
  const filteredMenu = getFilteredMenu();

  if (!filteredMenu.length) {
    els.menuGrid.innerHTML = '<div class="empty-state">검색 결과가 없습니다.</div>';
    return;
  }

  els.menuGrid.innerHTML = filteredMenu
    .map(
      item => `
        <button class="menu-card" type="button" data-menu-id="${item.id}">
          <div class="menu-emoji">${item.emoji}</div>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="menu-meta">
            <span class="price">${formatPrice(item.price)}</span>
            <span class="select-button">선택</span>
          </div>
        </button>
      `
    )
    .join('');
}

function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

function renderCart() {
  if (!state.cart.length) {
    els.cartList.innerHTML = '<div class="empty-state">장바구니가 비어 있습니다.</div>';
    els.cartTotal.textContent = '0원';
    els.cartCount.textContent = '0개';
    saveToStorage(STORAGE_KEYS.cart, state.cart);
    return;
  }

  els.cartList.innerHTML = state.cart
    .map(
      item => `
        <div class="cart-item">
          <div class="cart-item-row">
            <div>
              <p class="cart-item-name">${item.name}</p>
              <div class="cart-item-meta">${formatOptionSummary(item.selectedOptions)}</div>
            </div>
            <button class="remove-button" type="button" data-remove-id="${item.id}">삭제</button>
          </div>

          <div class="cart-item-row">
            <div class="quantity-controls">
              <button class="quantity-button" type="button" data-change-qty="-" data-id="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-button" type="button" data-change-qty="+" data-id="${item.id}">+</button>
            </div>
            <span class="item-total">${formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        </div>
      `
    )
    .join('');

  els.cartCount.textContent = `${state.cart.reduce((sum, item) => sum + item.quantity, 0)}개`;
  els.cartTotal.textContent = formatPrice(getCartTotal());
  saveToStorage(STORAGE_KEYS.cart, state.cart);
}

function formatOptionSummary(options) {
  if (!options) return '기본 옵션';

  const extras = options.extras && options.extras.length ? ` / ${options.extras.join(', ')}` : '';
  return `${options.temperature || 'ice'} / ${options.size || 'regular'}${extras}`;
}

function getOptionCost(selectedOptions) {
  let total = 0;
  const sizePrice = optionMap.size[selectedOptions.size] || 0;
  const temperaturePrice = optionMap.temperature[selectedOptions.temperature] || 0;
  const extras = selectedOptions.extras || [];

  total += sizePrice + temperaturePrice + extras.reduce((sum, extra) => sum + (optionMap.extras[extra] || 0), 0);
  return total;
}

function openMenuModal(menuId) {
  const menu = defaultMenu.find(item => item.id === menuId);
  if (!menu) return;

  state.selectedMenu = menu;
  const options = menu.options || {};
  const defaultSelected = {
    temperature: options.temperature?.[0] || 'ice',
    size: options.size?.[0] || 'regular',
    extras: []
  };

  const content = `
    <div class="modal-emoji">${menu.emoji}</div>
    <h2>${menu.name}</h2>
    <p class="meta-muted">${menu.description}</p>
    <p class="price">${formatPrice(menu.price)}</p>

    <div class="option-group">
      <h4>온도</h4>
      <div class="option-list">
        ${options.temperature
          ?.map(
            value => `
              <label>
                <input type="radio" name="temperature" value="${value}" ${value === defaultSelected.temperature ? 'checked' : ''} />
                ${value === 'ice' ? '아이스' : '핫'}
              </label>
            `
          )
          .join('') || ''}
      </div>
    </div>

    <div class="option-group">
      <h4>사이즈</h4>
      <div class="option-list">
        ${options.size
          ?.map(
            value => `
              <label>
                <input type="radio" name="size" value="${value}" ${value === defaultSelected.size ? 'checked' : ''} />
                ${value === 'regular' ? '레귤러' : '라지'}
              </label>
            `
          )
          .join('') || ''}
      </div>
    </div>

    <div class="option-group">
      <h4>추가 옵션</h4>
      <div class="option-list">
        ${(options.extras || [])
          .map(
            value => `
              <label>
                <input type="checkbox" name="extra" value="${value}" />
                ${value === 'shot' ? '샷 추가' : value === 'syrup' ? '시럽 추가' : value === 'cream' ? '휘핑크림' : '바닐라 시럽'}
              </label>
            `
          )
          .join('')}
      </div>
    </div>

    <div class="modal-actions">
      <button id="addToCartBtn" class="primary-button" type="button">장바구니 담기</button>
    </div>
  `;

  els.modalContent.innerHTML = content;
  els.menuModal.classList.remove('hidden');
  els.menuModal.setAttribute('aria-hidden', 'false');
}

function closeMenuModal() {
  els.menuModal.classList.add('hidden');
  els.menuModal.setAttribute('aria-hidden', 'true');
}

function addToCartFromModal() {
  if (!state.selectedMenu) return;

  const temperature = document.querySelector('input[name="temperature"]:checked')?.value || 'ice';
  const size = document.querySelector('input[name="size"]:checked')?.value || 'regular';
  const extras = Array.from(document.querySelectorAll('input[name="extra"]:checked')).map(input => input.value);

  const selectedOptions = { temperature, size, extras };
  const unitPrice = state.selectedMenu.price + getOptionCost(selectedOptions);
  const existingItem = state.cart.find(item => item.menuId === state.selectedMenu.id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions));

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({
      id: `${state.selectedMenu.id}-${Date.now()}`,
      menuId: state.selectedMenu.id,
      name: state.selectedMenu.name,
      quantity: 1,
      selectedOptions,
      unitPrice
    });
  }

  renderCart();
  closeMenuModal();
}

function adjustCartQuantity(itemId, delta) {
  const item = state.cart.find(entry => entry.id === itemId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    state.cart = state.cart.filter(entry => entry.id !== itemId);
  }

  renderCart();
}

function removeCartItem(itemId) {
  state.cart = state.cart.filter(item => item.id !== itemId);
  renderCart();
}

function clearCart() {
  state.cart = [];
  renderCart();
}

function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = state.orders.length + 1;
  return `ORD-${datePart}-${String(count).padStart(4, '0')}`;
}

function handleOrderSubmit(event) {
  event.preventDefault();

  if (!state.cart.length) {
    alert('장바구니가 비어 있습니다. 메뉴를 선택해 주세요.');
    return;
  }

  const formData = new FormData(els.orderForm);
  const customerName = formData.get('customerName')?.toString().trim();
  const phoneNumber = formData.get('customerPhone')?.toString().trim();
  const paymentMethod = formData.get('paymentMethod')?.toString();
  const requestNote = document.getElementById('requestNote').value.trim();

  if (!customerName || !phoneNumber) {
    alert('이름과 연락처를 입력해 주세요.');
    return;
  }

  const order = {
    id: Date.now(),
    orderNumber: generateOrderNumber(),
    customerName,
    phoneNumber,
    orderTime: new Date().toISOString(),
    status: 'waiting',
    totalPrice: getCartTotal(),
    requestNote,
    paymentMethod,
    items: state.cart.map(item => ({
      ...item,
      id: `${item.id}-${Date.now()}`
    }))
  };

  state.orders.unshift(order);
  saveToStorage(STORAGE_KEYS.orders, state.orders);
  state.cart = [];
  els.orderForm.reset();
  renderCart();
  renderCustomerOrders();
  renderAdminDashboard();
  renderAdminOrders();
  alert(`주문이 완료되었습니다. 주문번호: ${order.orderNumber}`);
}

function renderCustomerOrders() {
  const orders = state.orders.slice(0, 5);

  if (!orders.length) {
    els.customerOrderList.innerHTML = '<div class="empty-state">주문 내역이 없습니다.</div>';
    return;
  }

  els.customerOrderList.innerHTML = orders
    .map(
      order => `
        <div class="order-card">
          <div class="order-head">
            <strong>${order.orderNumber}</strong>
            <span class="status-badge ${getStatusClass(order.status)}">${getStatusLabel(order.status)}</span>
          </div>
          <div class="order-summary">${order.items.map(item => `${item.name} ${item.quantity}개`).join(', ')}</div>
          <div class="order-summary">총 합계: ${formatPrice(order.totalPrice)}</div>
          <div class="meta-muted">${new Date(order.orderTime).toLocaleString('ko-KR')}</div>
        </div>
      `
    )
    .join('');
}

function getStatusClass(status) {
  const mapping = {
    waiting: 'status-waiting',
    preparing: 'status-preparing',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  };

  return mapping[status] || 'status-waiting';
}

function getStatusLabel(status) {
  const mapping = {
    waiting: '주문 접수',
    preparing: '준비 중',
    completed: '완료',
    cancelled: '취소'
  };

  return mapping[status] || '주문 접수';
}

function renderAdminDashboard() {
  const waiting = state.orders.filter(order => order.status === 'waiting').length;
  const preparing = state.orders.filter(order => order.status === 'preparing').length;
  const completed = state.orders.filter(order => order.status === 'completed').length;
  const cancelled = state.orders.filter(order => order.status === 'cancelled').length;
  const totalSales = state.orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  const avgOrder = state.orders.length ? Math.round(totalSales / state.orders.length) : 0;

  document.getElementById('statWaiting').textContent = waiting;
  document.getElementById('statPreparing').textContent = preparing;
  document.getElementById('statCompleted').textContent = completed;
  document.getElementById('statCancelled').textContent = cancelled;
  document.getElementById('totalOrderCount').textContent = state.orders.length;
  document.getElementById('totalSales').textContent = formatPrice(totalSales);
  document.getElementById('avgOrderAmount').textContent = formatPrice(avgOrder);
}

function renderAdminOrders() {
  const filteredOrders =
    state.adminFilter === 'all' ? state.orders : state.orders.filter(order => order.status === state.adminFilter);

  if (!filteredOrders.length) {
    els.adminOrderList.innerHTML = '<div class="empty-state">해당 상태의 주문이 없습니다.</div>';
    return;
  }

  els.adminOrderList.innerHTML = filteredOrders
    .map(
      order => `
        <div class="admin-order-card">
          <div>
            <strong>${order.orderNumber}</strong>
            <div class="meta-muted">${order.customerName} / ${order.phoneNumber}</div>
            <div class="meta-muted">${new Date(order.orderTime).toLocaleString('ko-KR')}</div>
            <div class="meta-muted">${order.items.map(item => `${item.name}(${item.quantity})`).join(', ')}</div>
          </div>
          <div>
            <div class="meta-muted">결제</div>
            <strong>${formatPrice(order.totalPrice)}</strong>
            <div class="meta-muted">${order.requestNote || '요청 사항 없음'}</div>
          </div>
          <label>
            <span class="meta-muted">상태 변경</span>
            <select class="order-status-select" data-order-id="${order.id}">
              ${['waiting', 'preparing', 'completed', 'cancelled']
                .map(
                  status => `
                    <option value="${status}" ${status === order.status ? 'selected' : ''}>${getStatusLabel(status)}</option>
                  `
                )
                .join('')}
            </select>
          </label>
        </div>
      `
    )
    .join('');
}

function updateOrderStatus(orderId, nextStatus) {
  const targetOrder = state.orders.find(order => order.id === Number(orderId));
  if (!targetOrder) return;

  targetOrder.status = nextStatus;
  saveToStorage(STORAGE_KEYS.orders, state.orders);
  renderAdminDashboard();
  renderAdminOrders();
  renderCustomerOrders();
}

function attachEventListeners() {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;
      state.activeTab = target;
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.toggle('active', btn === button));
      els.customerView.classList.toggle('active', target === 'customer');
      els.adminView.classList.toggle('active', target === 'admin');
    });
  });

  els.searchInput.addEventListener('input', event => {
    state.query = event.target.value;
    renderMenu();
  });

  els.categoryTabs.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    renderCategories();
    renderMenu();
  });

  els.menuGrid.addEventListener('click', event => {
    const card = event.target.closest('[data-menu-id]');
    if (!card) return;
    openMenuModal(card.dataset.menuId);
  });

  els.cartList.addEventListener('click', event => {
    const quantityButton = event.target.closest('[data-change-qty]');
    const removeButton = event.target.closest('[data-remove-id]');

    if (quantityButton) {
      const delta = quantityButton.dataset.changeQty === '+' ? 1 : -1;
      adjustCartQuantity(quantityButton.dataset.id, delta);
      return;
    }

    if (removeButton) {
      removeCartItem(removeButton.dataset.removeId);
    }
  });

  els.clearCartBtn.addEventListener('click', clearCart);

  els.orderForm.addEventListener('submit', handleOrderSubmit);

  els.adminFilter.addEventListener('change', event => {
    state.adminFilter = event.target.value;
    renderAdminOrders();
  });

  document.getElementById('closeModalBtn').addEventListener('click', closeMenuModal);
  els.menuModal.addEventListener('click', event => {
    if (event.target === els.menuModal) closeMenuModal();
  });

  document.addEventListener('click', event => {
    const addButton = event.target.closest('#addToCartBtn');
    if (addButton) {
      addToCartFromModal();
    }
  });

  document.addEventListener('change', event => {
    const select = event.target.closest('.order-status-select');
    if (select) {
      updateOrderStatus(select.dataset.orderId, select.value);
    }
  });
}

function initialize() {
  if (!localStorage.getItem(STORAGE_KEYS.orders)) {
    saveToStorage(STORAGE_KEYS.orders, initialOrders);
    state.orders = initialOrders;
  }

  renderCategories();
  renderMenu();
  renderCart();
  renderCustomerOrders();
  renderAdminDashboard();
  renderAdminOrders();
  attachEventListeners();
}

initialize();
