/* ==========================================================================
   WAFFLE WONDERLAND - REALISTIC STORE SNAPSHOTS & SCROLL 3D CYLINDER ENGINE
   ========================================================================== */

// Catalog Items with Realistic Store Smartphone Photos
const WAFFLE_CATALOG = [
  {
    id: "wfl-1",
    name: "Classic Nutella Belgian Waffle",
    category: "belgian",
    price: 240,
    rating: 4.9,
    badge: "📸 Store Bestseller",
    isVeg: true,
    image: "images/phone_photo_belgian_waffle_1784736088909.png",
    description: "Freshly baked crispy Belgian waffle loaded with warm Nutella and fresh strawberries, captured live at our store table."
  },
  {
    id: "wfl-2",
    name: "Berry Blast Pearl Liege Waffle",
    category: "liege",
    price: 260,
    rating: 4.8,
    badge: "📸 Chef's Snap",
    isVeg: true,
    image: "images/phone_photo_liege_waffle_1784736105183.png",
    description: "Caramelized Liege pearl sugar waffle topped with wild blueberry compote and powdered sugar on a cozy cafe paper plate."
  },
  {
    id: "wfl-3",
    name: "Oreo Overload Bubble Waffle",
    category: "bubble",
    price: 290,
    rating: 4.95,
    badge: "📸 Handheld Favorite",
    isVeg: true,
    image: "images/phone_photo_bubble_waffle_1784736121515.png",
    description: "Hong Kong style egg bubble waffle cone filled with chocolate fudge ice cream and crushed Oreos in a store setting."
  },
  {
    id: "wfl-4",
    name: "Triple Chocolate Threat Waffle",
    category: "belgian",
    price: 270,
    rating: 4.7,
    badge: "📸 Choco Treat",
    isVeg: true,
    image: "images/belgian_nutella_waffle_1784734264994.png",
    description: "Dark chocolate waffle crust topped with milk chocolate drizzle, white chocolate shavings, and dark chocolate chips."
  },
  {
    id: "wfl-5",
    name: "Cheesy Herb Savory Waffle",
    category: "savory",
    price: 220,
    rating: 4.6,
    badge: "📸 Diner Special",
    isVeg: true,
    image: "images/berry_liege_waffle_1784734283010.png",
    description: "Golden sourdough waffle infused with sharp cheddar, jalapenos, and mozzarella cheese served hot on a store tray."
  },
  {
    id: "wfl-6",
    name: "Salted Caramel Banana Bowl",
    category: "bowls",
    price: 280,
    rating: 4.85,
    badge: "📸 Popular Bowl",
    isVeg: true,
    image: "images/bubble_waffle_sundae_1784734297921.png",
    description: "Edible waffle bowl packed with vanilla bean ice cream, caramelised banana slices, and salted caramel drizzle."
  },
  {
    id: "wfl-7",
    name: "Lotus Biscoff Crunch Waffle",
    category: "belgian",
    price: 295,
    rating: 4.92,
    badge: "📸 Trending Now",
    isVeg: true,
    image: "images/phone_photo_belgian_waffle_1784736088909.png",
    description: "Crispy waffle smothered in original Belgian Biscoff spread, crushed Biscoff biscuit crumbs, and vanilla ice cream scoop."
  },
  {
    id: "wfl-8",
    name: "Thick Chocolate Waffle Shake",
    category: "drinks",
    price: 180,
    rating: 4.75,
    badge: "📸 Chilly Shake",
    isVeg: true,
    image: "images/bubble_waffle_sundae_1784734297921.png",
    description: "Ultra creamy thick chocolate milkshake blended with real waffle crust pieces and topped with strawberry whipped cream."
  }
];

const EXTRA_TOPPINGS = [
  { id: "top-1", name: "Nutella Drizzle", price: 40 },
  { id: "top-2", name: "Vanilla Ice Cream Scoop", price: 50 },
  { id: "top-3", name: "Fresh Strawberries", price: 45 },
  { id: "top-4", name: "Lotus Biscoff Crumbs", price: 35 },
  { id: "top-5", name: "Whipped Pink Cream", price: 30 },
  { id: "top-6", name: "Rainbow Sprinkles", price: 20 }
];

// App State
let cartState = [];
let activeCategory = "all";
let searchKeyword = "";
let selectedItemForCustomization = null;
let currentCustomToppings = [];
let activePaymentMethod = "phonepe";
let activeOrder = null;
let prepTimerInterval = null;
let isVegOnlyFilter = false;

// 3D Cylinder Physics Angles
let cylinderAngleY = 0; // Horizontal Yaw
let cylinderAngleX = 0; // Vertical Pitch
let currentFilteredCatalog = [];
let isDraggingCylinder = false;
let startX = 0;
let startY = 0;
let startAngleY = 0;
let startAngleX = 0;

const GST_RATE = 0.05;
const MAINTENANCE_FEE = 15;

// DOM Initializer
document.addEventListener("DOMContentLoaded", () => {
  renderMenuGrid();
  setupEventListeners();
  initQRCode();
  updateCartUI();
  init3DCylinderScrollBinding();
});

/* ==========================================================================
   PAGE SCROLL BINDING: SCROLL UP/DOWN ROTATES CYLINDER UP/DOWN & RIGHT/LEFT
   ========================================================================== */
function init3DCylinderScrollBinding() {
  window.addEventListener("scroll", () => {
    requestAnimationFrame(() => {
      handlePageScroll3D();
    });
  }, { passive: true });

  const wrapper = document.getElementById("cylinder3dWrapper");
  if (!wrapper) return;

  // Mouse Drag / Touch Swipe Controls
  wrapper.addEventListener("mousedown", (e) => {
    isDraggingCylinder = true;
    startX = e.clientX;
    startY = e.clientY;
    startAngleY = cylinderAngleY;
    startAngleX = cylinderAngleX;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDraggingCylinder) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    cylinderAngleY = startAngleY + deltaX * 0.45;
    cylinderAngleX = Math.max(-30, Math.min(30, startAngleX - deltaY * 0.3));
    updateDrumTransform();
  });

  window.addEventListener("mouseup", () => {
    isDraggingCylinder = false;
  });

  // Touch Swipe
  wrapper.addEventListener("touchstart", (e) => {
    isDraggingCylinder = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startAngleY = cylinderAngleY;
    startAngleX = cylinderAngleX;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!isDraggingCylinder) return;
    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;
    cylinderAngleY = startAngleY + deltaX * 0.5;
    cylinderAngleX = Math.max(-30, Math.min(30, startAngleX - deltaY * 0.35));
    updateDrumTransform();
  }, { passive: true });

  window.addEventListener("touchend", () => {
    isDraggingCylinder = false;
  });
}

function handlePageScroll3D() {
  if (isDraggingCylinder) return;

  const scrollY = window.scrollY;
  const menuSection = document.getElementById("menuSection");
  if (!menuSection) return;

  const rect = menuSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Calculate scroll progress through menu section
  const progress = (viewportHeight - rect.top) / (rect.height + viewportHeight);
  
  // Rotate Cylinder Right & Down on Scroll Down, Left & Up on Scroll Up!
  cylinderAngleY = scrollY * 0.28; 
  cylinderAngleX = Math.sin(scrollY * 0.003) * 20;

  updateDrumTransform();
  updateCreamDripAnimation(scrollY);
}

function updateCreamDripAnimation(scrollY) {
  const creamDripSvg = document.getElementById("creamDripSvg");
  const blob1 = document.getElementById("creamBlob1");
  const blob2 = document.getElementById("creamBlob2");

  if (creamDripSvg) {
    const scaleY = 1 + Math.sin(scrollY * 0.006) * 0.2;
    creamDripSvg.style.transform = `scaleY(${scaleY}) translateY(${Math.sin(scrollY * 0.009) * 6}px)`;
  }

  if (blob1) {
    blob1.style.transform = `translate3d(0, ${scrollY * 0.15}px, 0) scale(${1 + Math.sin(scrollY * 0.004) * 0.1})`;
  }
  if (blob2) {
    blob2.style.transform = `translate3d(0, ${-scrollY * 0.1}px, 0) scale(${1 + Math.cos(scrollY * 0.004) * 0.1})`;
  }
}

/* ==========================================================================
   3D CYLINDRICAL DRUM RENDERER
   ========================================================================== */
function renderMenuGrid() {
  const drumContainer = document.getElementById("cylinderDrumContainer");
  if (!drumContainer) return;

  currentFilteredCatalog = WAFFLE_CATALOG.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesVeg = !isVegOnlyFilter || item.isVeg;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  if (currentFilteredCatalog.length === 0) {
    drumContainer.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--cocoa-light);">
        <i class="fa-solid fa-cookie-bite" style="font-size: 3rem; color: var(--pink-primary); margin-bottom: 1rem;"></i>
        <h3>No delicious waffles found!</h3>
        <p>Try searching for another flavor or category filter.</p>
      </div>
    `;
    return;
  }

  const count = currentFilteredCatalog.length;
  const panelWidth = 320;
  const radius = Math.max(380, Math.round((panelWidth / 2) / Math.tan(Math.PI / Math.max(count, 4))));
  const angleStep = 360 / count;

  drumContainer.innerHTML = currentFilteredCatalog.map((item, index) => {
    const panelAngle = index * angleStep;
    return `
      <div class="cylinder-panel" 
           id="panel-${index}" 
           style="transform: rotateY(${panelAngle}deg) translateZ(${radius}px);"
           onclick="bringPanelToFront(${index})">
        <div class="photo-frame">
          <img src="${item.image}" alt="${item.name}">
          ${item.badge ? `<span class="card-badge">${item.badge}</span>` : ''}
          <div class="photo-cam-tag"><i class="fa-solid fa-camera"></i> Cafe Shot</div>
        </div>
        <h3 class="cylinder-panel-title">${item.name}</h3>
        <p class="cylinder-panel-desc">${item.description}</p>
        <div class="cylinder-panel-footer">
          <div class="cylinder-panel-price">₹${item.price}</div>
          <button class="btn-add-item" onclick="event.stopPropagation(); openCustomizerModal('${item.id}')">
            <i class="fa-solid fa-plus"></i> Add
          </button>
        </div>
      </div>
    `;
  }).join("");

  updateDrumTransform();
}

function updateDrumTransform() {
  const drumContainer = document.getElementById("cylinderDrumContainer");
  if (!drumContainer) return;

  // Apply both Pitch (RotateX) and Yaw (RotateY) to drum container
  drumContainer.style.transform = `rotateX(${cylinderAngleX}deg) rotateY(${cylinderAngleY}deg)`;

  const count = currentFilteredCatalog.length;
  if (count === 0) return;
  const angleStep = 360 / count;

  let activeIndex = Math.round((-cylinderAngleY % 360) / angleStep) % count;
  if (activeIndex < 0) activeIndex += count;

  document.querySelectorAll(".cylinder-panel").forEach((panel, idx) => {
    if (idx === activeIndex) {
      panel.classList.add("front-active");
    } else {
      panel.classList.remove("front-active");
    }
  });
}

function rotateCylinderWheel(direction) {
  const count = currentFilteredCatalog.length;
  if (count === 0) return;
  const angleStep = 360 / count;
  cylinderAngleY -= direction * angleStep;
  updateDrumTransform();
}

function bringPanelToFront(index) {
  const count = currentFilteredCatalog.length;
  if (count === 0) return;
  const angleStep = 360 / count;
  cylinderAngleY = -index * angleStep;
  cylinderAngleX = 0;
  updateDrumTransform();
}

/* Category & Veg Filters */
function setCategoryFilter(category, btnElement) {
  activeCategory = category;
  cylinderAngleY = 0;
  cylinderAngleX = 0;
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  renderMenuGrid();
}

function toggleVegOnlyFilter(btnElement) {
  isVegOnlyFilter = !isVegOnlyFilter;
  cylinderAngleY = 0;
  cylinderAngleX = 0;
  if (isVegOnlyFilter) {
    btnElement.style.background = "var(--mint-green)";
    btnElement.style.color = "white";
    btnElement.style.borderColor = "var(--mint-green)";
  } else {
    btnElement.style.background = "white";
    btnElement.style.color = "var(--cocoa-text)";
    btnElement.style.borderColor = "rgba(255, 64, 129, 0.2)";
  }
  renderMenuGrid();
}

function handleSearchInput(e) {
  searchKeyword = e.target.value.trim();
  cylinderAngleY = 0;
  cylinderAngleX = 0;
  renderMenuGrid();
}

function triggerRandomWaffle() {
  const randomIndex = Math.floor(Math.random() * WAFFLE_CATALOG.length);
  const randomWaffle = WAFFLE_CATALOG[randomIndex];
  openCustomizerModal(randomWaffle.id);
  showToast(`🎲 Surprise! Selected "${randomWaffle.name}" for you!`);
}

/* Customizer Modal */
function openCustomizerModal(itemId) {
  selectedItemForCustomization = WAFFLE_CATALOG.find(i => i.id === itemId);
  if (!selectedItemForCustomization) return;

  currentCustomToppings = [];
  
  const modal = document.getElementById("customizerModalOverlay");
  const bodyContainer = document.getElementById("customizerContent");

  bodyContainer.innerHTML = `
    <img src="${selectedItemForCustomization.image}" class="customize-img" alt="${selectedItemForCustomization.name}">
    <h2 style="font-size: 1.5rem; color: var(--cocoa-text);">${selectedItemForCustomization.name}</h2>
    <p style="color: var(--cocoa-light); font-size: 0.9rem; margin-bottom: 1rem;">${selectedItemForCustomization.description}</p>
    <div style="font-family: var(--font-heading); font-size: 1.3rem; color: var(--pink-deep); font-weight: 700;">Base Price: ₹${selectedItemForCustomization.price}</div>

    <div class="topping-group-title"><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--pink-primary);"></i> Choose Extra Toppings:</div>
    <div class="topping-options">
      ${EXTRA_TOPPINGS.map(top => `
        <div class="topping-chip" id="chip-${top.id}" onclick="toggleToppingSelection('${top.id}')">
          <i class="fa-regular fa-square"></i>
          <span>${top.name} (+₹${top.price})</span>
        </div>
      `).join("")}
    </div>

    <button class="btn-primary" style="width: 100%; margin-top: 1.5rem; justify-content: center;" onclick="confirmAddToCart()">
      <i class="fa-solid fa-cart-shopping"></i> Add to Order • ₹<span id="customModalTotalPrice">${selectedItemForCustomization.price}</span>
    </button>
  `;

  modal.classList.add("active");
}

function toggleToppingSelection(toppingId) {
  const topping = EXTRA_TOPPINGS.find(t => t.id === toppingId);
  const chip = document.getElementById(`chip-${toppingId}`);
  if (!topping || !chip) return;

  const index = currentCustomToppings.findIndex(t => t.id === toppingId);
  if (index > -1) {
    currentCustomToppings.splice(index, 1);
    chip.classList.remove("selected");
    chip.querySelector("i").className = "fa-regular fa-square";
  } else {
    currentCustomToppings.push(topping);
    chip.classList.add("selected");
    chip.querySelector("i").className = "fa-solid fa-square-check";
  }

  const toppingsSum = currentCustomToppings.reduce((acc, curr) => acc + curr.price, 0);
  const total = selectedItemForCustomization.price + toppingsSum;
  document.getElementById("customModalTotalPrice").innerText = total;
}

function confirmAddToCart() {
  if (!selectedItemForCustomization) return;

  const toppingsSum = currentCustomToppings.reduce((acc, curr) => acc + curr.price, 0);
  const itemUnitPrice = selectedItemForCustomization.price + toppingsSum;
  
  const existingCartIndex = cartState.findIndex(cItem => 
    cItem.id === selectedItemForCustomization.id && 
    JSON.stringify(cItem.toppings) === JSON.stringify(currentCustomToppings)
  );

  if (existingCartIndex > -1) {
    cartState[existingCartIndex].qty += 1;
  } else {
    cartState.push({
      id: selectedItemForCustomization.id,
      name: selectedItemForCustomization.name,
      basePrice: selectedItemForCustomization.price,
      unitPrice: itemUnitPrice,
      image: selectedItemForCustomization.image,
      toppings: [...currentCustomToppings],
      qty: 1
    });
  }

  closeModal("customizerModalOverlay");
  updateCartUI();
  showToast(`🛒 Added "${selectedItemForCustomization.name}" to your basket!`);
}

/* Cart Calculations */
function updateCartUI() {
  const cartBadge = document.getElementById("cartItemBadge");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartGstEl = document.getElementById("cartGst");
  const cartMaintenanceEl = document.getElementById("cartMaintenance");
  const cartTotalEl = document.getElementById("cartTotal");
  const checkoutBtnTotalEl = document.getElementById("checkoutBtnTotal");

  const totalItemCount = cartState.reduce((acc, item) => acc + item.qty, 0);
  if (cartBadge) cartBadge.innerText = totalItemCount;

  if (cartState.length === 0) {
    cartItemsContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--cocoa-light);">
        <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; color: rgba(194,24,91,0.2); margin-bottom: 1rem;"></i>
        <h4>Your waffle basket is empty!</h4>
        <p style="font-size: 0.85rem;">Spin 3D wheel or scan QR to start ordering.</p>
      </div>
    `;
    cartSubtotalEl.innerText = "₹0.00";
    cartGstEl.innerText = "₹0.00";
    cartMaintenanceEl.innerText = "₹0.00";
    cartTotalEl.innerText = "₹0.00";
    if (checkoutBtnTotalEl) checkoutBtnTotalEl.innerText = "₹0.00";
    return;
  }

  const subtotal = cartState.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const gstAmount = Math.round(subtotal * GST_RATE);
  const maintenanceFee = MAINTENANCE_FEE;
  const grandTotal = subtotal + gstAmount + maintenanceFee;

  cartItemsContainer.innerHTML = cartState.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.image}" class="cart-item-img" alt="${item.name}">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.name}</div>
        <div style="font-size: 0.78rem; color: var(--cocoa-light);">
          ${item.toppings.length > 0 ? item.toppings.map(t => t.name).join(", ") : "Standard Pink Cream"}
        </div>
        <div style="font-weight: 700; color: var(--pink-deep); margin-top: 0.2rem;">₹${item.unitPrice}</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">-</button>
        <span style="font-weight: 700; font-size: 0.9rem;">${item.qty}</span>
        <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
      </div>
    </div>
  `).join("");

  cartSubtotalEl.innerText = `₹${subtotal.toFixed(2)}`;
  cartGstEl.innerText = `₹${gstAmount.toFixed(2)}`;
  cartMaintenanceEl.innerText = `₹${maintenanceFee.toFixed(2)}`;
  cartTotalEl.innerText = `₹${grandTotal.toFixed(2)}`;
  if (checkoutBtnTotalEl) checkoutBtnTotalEl.innerText = `₹${grandTotal.toFixed(2)}`;
}

function updateCartQty(index, change) {
  if (cartState[index]) {
    cartState[index].qty += change;
    if (cartState[index].qty <= 0) {
      cartState.splice(index, 1);
    }
    updateCartUI();
  }
}

function toggleCartDrawer(open) {
  const overlay = document.getElementById("cartDrawerOverlay");
  if (open) overlay.classList.add("active");
  else overlay.classList.remove("active");
}

/* Checkout & Payments */
function openCheckoutModal() {
  if (cartState.length === 0) {
    showToast("⚠️ Add items to your basket before proceeding to checkout!");
    return;
  }

  toggleCartDrawer(false);
  
  const subtotal = cartState.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const gstAmount = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + gstAmount + MAINTENANCE_FEE;

  document.getElementById("checkoutFinalTotal").innerText = `₹${grandTotal.toFixed(2)}`;
  document.getElementById("checkoutModalOverlay").classList.add("active");
  setPaymentGateway("phonepe");
}

function setPaymentGateway(method) {
  activePaymentMethod = method;
  document.querySelectorAll(".pay-tab").forEach(tab => tab.classList.remove("active"));
  document.getElementById(`tab-${method}`).classList.add("active");

  const phonepeView = document.getElementById("phonepeGatewayView");
  const cardView = document.getElementById("cardGatewayView");
  const cashView = document.getElementById("cashGatewayView");

  phonepeView.style.display = method === "phonepe" ? "block" : "none";
  cardView.style.display = method === "card" ? "block" : "none";
  cashView.style.display = method === "cash" ? "block" : "none";

  if (method === "phonepe") {
    generatePhonePeQR();
  }
}

function generatePhonePeQR() {
  const qrContainer = document.getElementById("phonepeQrContainer");
  if (!qrContainer) return;
  qrContainer.innerHTML = "";
  
  const subtotal = cartState.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const total = subtotal + Math.round(subtotal * GST_RATE) + MAINTENANCE_FEE;
  
  const upiString = `upi://pay?pa=wafflewonderland@upi&pn=WaffleWonderland&am=${total}&cu=INR`;
  
  if (typeof QRCode !== 'undefined') {
    new QRCode(qrContainer, {
      text: upiString,
      width: 160,
      height: 160,
      colorDark: "#5f259f",
      colorLight: "#ffffff"
    });
  } else {
    qrContainer.innerHTML = `<i class="fa-solid fa-qrcode" style="font-size: 8rem; color: #5f259f;"></i>`;
  }
}

function handleCardNumberInput(e) {
  let val = e.target.value.replace(/\D/g, '').substring(0, 16);
  let formatted = val.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••';
  document.getElementById("cardDisplayNumber").innerText = formatted;
}

function processPaymentAndOrder() {
  const customerName = document.getElementById("custNameInput")?.value.trim() || "Guest Diner";
  const tableNo = document.getElementById("custTableInput")?.value.trim() || "T-04";

  const subtotal = cartState.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const gstAmount = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + gstAmount + MAINTENANCE_FEE;

  const orderId = `#WFL-${Math.floor(1000 + Math.random() * 9000)}`;

  activeOrder = {
    orderId: orderId,
    customerName: customerName,
    tableNo: tableNo,
    items: [...cartState],
    paymentMethod: activePaymentMethod.toUpperCase(),
    totalAmount: grandTotal,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estimatedMinutes: 12
  };

  closeModal("checkoutModalOverlay");
  cartState = [];
  updateCartUI();

  showToast(`🎉 Payment Verified via ${activeOrder.paymentMethod}! Order Confirmed.`);
  renderOrderTracker();
}

/* Order Tracker Screen */
function renderOrderTracker() {
  if (!activeOrder) return;

  document.getElementById("heroSection").style.display = "none";
  document.getElementById("menuSection").style.display = "none";
  
  const trackerScreen = document.getElementById("orderTrackerScreen");
  trackerScreen.classList.add("active");

  document.getElementById("trackerOrderId").innerText = activeOrder.orderId;
  document.getElementById("trackerCustName").innerText = activeOrder.customerName;
  document.getElementById("trackerTableNo").innerText = activeOrder.tableNo;
  document.getElementById("trackerPayStatus").innerText = `Paid via ${activeOrder.paymentMethod}`;
  document.getElementById("trackerTotal").innerText = `₹${activeOrder.totalAmount.toFixed(2)}`;

  let secondsRemaining = activeOrder.estimatedMinutes * 60;
  clearInterval(prepTimerInterval);

  updateStepHighlights(1);

  prepTimerInterval = setInterval(() => {
    secondsRemaining--;
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    const timerDisplay = document.getElementById("prepCountdownDisplay");
    if (timerDisplay) timerDisplay.innerText = formattedTime;

    if (secondsRemaining <= 600 && secondsRemaining > 300) {
      updateStepHighlights(2);
    } else if (secondsRemaining <= 300 && secondsRemaining > 30) {
      updateStepHighlights(3);
    } else if (secondsRemaining <= 30) {
      updateStepHighlights(4);
    }

    if (secondsRemaining <= 0) {
      clearInterval(prepTimerInterval);
      if (timerDisplay) timerDisplay.innerText = "READY!";
      showToast("🔔 Your hot waffles with fresh whipped cream are ready!");
    }
  }, 1000);
}

function updateStepHighlights(activeStepNum) {
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    if (stepEl) {
      if (i <= activeStepNum) stepEl.classList.add("active");
      else stepEl.classList.remove("active");
    }
  }
}

function returnToMenu() {
  clearInterval(prepTimerInterval);
  document.getElementById("heroSection").style.display = "block";
  document.getElementById("menuSection").style.display = "block";
  document.getElementById("orderTrackerScreen").classList.remove("active");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Utilities & Modals */
function initQRCode() {
  const qrContainer = document.getElementById("qrCodeContainer");
  if (!qrContainer) return;
  qrContainer.innerHTML = "";
  
  const currentUrl = window.location.href;

  if (typeof QRCode !== 'undefined') {
    new QRCode(qrContainer, {
      text: currentUrl,
      width: 180,
      height: 180,
      colorDark: "#c2185b",
      colorLight: "#ffffff"
    });
  } else {
    qrContainer.innerHTML = `<i class="fa-solid fa-qrcode" style="font-size: 9rem; color: var(--pink-deep);"></i>`;
  }
}

function openQRModal() {
  document.getElementById("qrModalOverlay").classList.add("active");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

function showToast(message) {
  const toast = document.getElementById("appToast");
  if (!toast) return;
  toast.querySelector(".toast-text").innerText = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

function setupEventListeners() {
  const searchInput = document.getElementById("menuSearchInput");
  if (searchInput) searchInput.addEventListener("input", handleSearchInput);

  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("active");
    });
  });
}
