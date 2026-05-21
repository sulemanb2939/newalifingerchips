/* ==========================================================================
   NEW ALI FINGER CHIPS - CORE INTERACTION SYSTEM
   ========================================================================== */

// --- Menu Data Architecture ---
const MENU_ITEMS = [
    {
        id: 1,
        name: "Special Finger Chips",
        description: "Freshly cut high-quality potatoes double-fried to absolute golden crisp perfection.",
        priceHalf: 100,
        priceFull: 200,
        image: "image/Special Finger Chips.png",
        tag: "Bestseller"
    },
    {
        id: 2,
        name: "French Fries",
        description: "Classic salted fries, crisp on the outside and soft and fluffy on the inside.",
        priceHalf: 100,
        priceFull: 200,
        image: "image/French Fries.png",
        tag: "Classic"
    },
    {
        id: 3,
        name: "Flavour Fries",
        description: "Crunchy fries coated generously with a customized mix of savory and sweet herbs.",
        priceHalf: 100,
        priceFull: 200,
        image: "image/Flavour Fries.png",
        tag: "Seasoned"
    },
    {
        id: 4,
        name: "Spicy Flavour",
        description: "Spiced french fries loaded with hot red chili dust and tangy lemon zest.",
        priceHalf: 100,
        priceFull: 200,
        image: "image/Spicy Flavour Fries.png",
        tag: "Spicy Hot"
    },
    {
        id: 5,
        name: "Loaded Fries",
        description: "Cheesy heaven loaded with special melted cheese, custom herbs, and gourmet toppings.",
        priceHalf: 250,
        priceFull: 450,
        image: "image/Loaded Fries.png",
        tag: "Chef Special"
    },
    {
        id: 6,
        name: "Mayo Garlic Fries",
        description: "Hot crispy fries fully drizzled with rich, creamy house-made mayonnaise garlic sauce.",
        priceHalf: 150,
        priceFull: 250,
        image: "image/Mayo Garlic Fries.png",
        tag: "Highly Popular"
    }
];

// --- Application State ---
let cart = [];
let localSelections = {}; // Tracks selected size and quantity on menu cards: { itemId: { size: 'Half'|'Full', qty: 1 } }

// --- DOM References ---
document.addEventListener("DOMContentLoaded", () => {
    initLocalSelections();
    renderMenu();
    setupNavbarScroll();
    setupCartListeners();
    setupCheckoutListeners();
    setupPwaNavSync();
    updateCartUI();
});

// Initialize local selector states for each menu item card
function initLocalSelections() {
    MENU_ITEMS.forEach(item => {
        localSelections[item.id] = {
            size: "Half",
            qty: 1
        };
    });
}

// --- Menu Rendering & Card Dynamics ---
function renderMenu() {
    const grid = document.getElementById("menu-items-grid");
    if (!grid) return;
    grid.innerHTML = "";

    MENU_ITEMS.forEach(item => {
        const sel = localSelections[item.id];
        const currentPrice = sel.size === "Half" ? item.priceHalf : item.priceFull;

        const cardHTML = `
            <div class="col-md-6 col-lg-4">
                <div class="menu-card">
                    <div class="menu-card-img-wrapper">
                        <span class="menu-card-tag"><i class="bi bi-tag-fill me-1"></i> ${item.tag}</span>
                        <img src="${item.image}" alt="${item.name}" class="menu-card-img" loading="lazy">
                    </div>
                    
                    <div class="menu-card-body">
                        <h3 class="menu-card-title">${item.name}</h3>
                        <p class="menu-card-desc">${item.description}</p>
                        
                        <!-- Half / Full Custom Selector Switch -->
                        <div class="size-toggle-container">
                            <button type="button" class="size-toggle-btn ${sel.size === 'Half' ? 'active' : ''}" 
                                onclick="changeCardSize(${item.id}, 'Half')">
                                Half (Rs ${item.priceHalf})
                            </button>
                            <button type="button" class="size-toggle-btn ${sel.size === 'Full' ? 'active' : ''}" 
                                onclick="changeCardSize(${item.id}, 'Full')">
                                Full (Rs ${item.priceFull})
                            </button>
                        </div>
                        
                        <!-- Price and Quantity Selector -->
                        <div class="d-flex align-items-center justify-content-between mt-auto pt-2">
                            <div>
                                <span class="d-block text-muted fs-8 fw-600 text-uppercase">Price</span>
                                <span class="price-display" id="price-val-${item.id}">Rs ${currentPrice}</span>
                            </div>
                            
                            <div class="qty-controls">
                                <button type="button" class="qty-btn" onclick="adjustCardQty(${item.id}, -1)">
                                    <i class="bi bi-dash-lg"></i>
                                </button>
                                <span class="qty-value" id="qty-val-${item.id}">${sel.qty}</span>
                                <button type="button" class="qty-btn" onclick="adjustCardQty(${item.id}, 1)">
                                    <i class="bi bi-plus-lg"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Card Order Buttons -->
                        <div class="row g-2 mt-3 pt-1">
                            <div class="col-6">
                                <button type="button" class="btn-card-add" onclick="addCardToCart(${item.id})">
                                    <i class="bi bi-bag-plus"></i> Add
                                </button>
                            </div>
                            <div class="col-6">
                                <button type="button" class="btn-card-buy" onclick="quickBuyCard(${item.id})">
                                    Quick Buy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML("beforeend", cardHTML);
    });
}

// Change size option on a card dynamically
window.changeCardSize = function(itemId, size) {
    localSelections[itemId].size = size;
    const item = MENU_ITEMS.find(i => i.id === itemId);
    const priceSpan = document.getElementById(`price-val-${itemId}`);
    
    if (priceSpan && item) {
        const newPrice = size === "Half" ? item.priceHalf : item.priceFull;
        priceSpan.innerText = `Rs ${newPrice}`;
        
        // Add smooth scale animation to price change
        priceSpan.style.transform = "scale(1.15)";
        setTimeout(() => priceSpan.style.transform = "scale(1)", 150);
    }
    
    // Sync buttons visually
    const cardEl = priceSpan.closest(".menu-card");
    const btns = cardEl.querySelectorAll(".size-toggle-btn");
    btns.forEach(btn => {
        if (btn.innerText.includes(size)) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
};

// Adjust quantity on a card dynamically
window.adjustCardQty = function(itemId, dir) {
    const currentQty = localSelections[itemId].qty;
    let newQty = currentQty + dir;
    if (newQty < 1) newQty = 1;
    if (newQty > 20) newQty = 20; // safe cap

    localSelections[itemId].qty = newQty;
    const qtySpan = document.getElementById(`qty-val-${itemId}`);
    if (qtySpan) {
        qtySpan.innerText = newQty;
    }
};

// Add card contents to state cart
window.addCardToCart = function(itemId) {
    const item = MENU_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const size = localSelections[itemId].size;
    const quantity = localSelections[itemId].qty;
    const unitPrice = size === "Half" ? item.priceHalf : item.priceFull;

    addToCartState(item, size, quantity, unitPrice);
    
    // Reset quantity on the card back to 1 for next transaction
    localSelections[itemId].qty = 1;
    const qtySpan = document.getElementById(`qty-val-${itemId}`);
    if (qtySpan) qtySpan.innerText = "1";

    showToast(`Added ${quantity}x ${item.name} (${size}) to basket!`);
};

// Quick Buy adds to cart and triggers checkout modal
window.quickBuyCard = function(itemId) {
    const item = MENU_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const size = localSelections[itemId].size;
    const quantity = localSelections[itemId].qty;
    const unitPrice = size === "Half" ? item.priceHalf : item.priceFull;

    addToCartState(item, size, quantity, unitPrice);

    // Reset card inputs
    localSelections[itemId].qty = 1;
    const qtySpan = document.getElementById(`qty-val-${itemId}`);
    if (qtySpan) qtySpan.innerText = "1";

    // Immediately trigger checkout popup
    openCheckoutFlow();
};


// --- Cart State Actions & Logic ---
function addToCartState(item, size, quantity, unitPrice) {
    const cartItemId = `${item.id}-${size.toLowerCase()}`;
    const existing = cart.find(c => c.id === cartItemId);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: cartItemId,
            itemId: item.id,
            name: item.name,
            size: size,
            quantity: quantity,
            unitPrice: unitPrice,
            image: item.image
        });
    }

    updateCartUI();
}

// Adjust quantity directly within the cart drawer or checkout modal
window.adjustCartItemQty = function(cartItemId, dir) {
    const item = cart.find(c => c.id === cartItemId);
    if (!item) return;

    item.quantity += dir;
    if (item.quantity <= 0) {
        cart = cart.filter(c => c.id !== cartItemId);
        showToast("Item removed from basket.");
    }

    updateCartUI();

    // If checkout modal is open, keep its summary list updated live
    const modalEl = document.getElementById("checkoutModal");
    if (modalEl && modalEl.classList.contains("show")) {
        if (cart.length === 0) {
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
            showToast("Your cart is empty. Returning to menu.");
        } else {
            updateModalSummary();
        }
    }
};

// Remove item entirely from the cart drawer
window.removeCartItem = function(cartItemId) {
    cart = cart.filter(c => c.id !== cartItemId);
    updateCartUI();
    showToast("Item removed from basket.");

    const modalEl = document.getElementById("checkoutModal");
    if (modalEl && modalEl.classList.contains("show")) {
        if (cart.length === 0) {
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();
        } else {
            updateModalSummary();
        }
    }
};

// Calculate delivery charges according to order subtotal and hostel status
function calculateDelivery(subtotal, isHostel = false) {
    if (isHostel) return 50;
    if (subtotal >= 1000) return 0;
    if (subtotal >= 900) return 10;
    if (subtotal >= 800) return 20;
    if (subtotal >= 700) return 30;
    if (subtotal >= 600) return 40;
    if (subtotal >= 500) return 50;
    if (subtotal >= 400) return 60;
    if (subtotal >= 300) return 70;
    if (subtotal >= 200) return 80;
    return 90;
}

// --- Dynamic Cart UI Rendering ---
function updateCartUI() {
    const cartList = document.getElementById("cart-drawer-items-list");
    const emptyPlaceholder = document.getElementById("cart-empty-placeholder");
    const calcPanel = document.getElementById("cart-drawer-calculations-panel");

    const desktopCountBadge = document.getElementById("desktop-cart-badge-count");
    const mobileCountBadge = document.getElementById("mobile-cart-badge-count");
    const mobileTotalBadge = document.getElementById("mobile-cart-total-badge");

    // Calculate totals
    let subtotal = 0;
    let totalItemsCount = 0;

    cart.forEach(item => {
        subtotal += item.unitPrice * item.quantity;
        totalItemsCount += item.quantity;
    });

    const cartHostelCheckbox = document.getElementById("cart-hostel");
    const isHostel = cartHostelCheckbox ? cartHostelCheckbox.checked : false;
    const deliveryFee = calculateDelivery(subtotal, isHostel);
    const grandTotal = subtotal + deliveryFee;

    // Update floating badges
    if (desktopCountBadge) desktopCountBadge.innerText = totalItemsCount;
    if (mobileCountBadge) mobileCountBadge.innerText = totalItemsCount;
    if (mobileTotalBadge) mobileTotalBadge.innerText = `Rs ${grandTotal}`;

    // Highlight row in delivery charges table based on subtotal
    highlightDeliveryTableRow(subtotal);

    // If cart is empty, show nice banner
    if (cart.length === 0) {
        if (cartList && emptyPlaceholder) {
            // Keep empty placeholder visible and clear other items
            const oldItems = cartList.querySelectorAll(".cart-item");
            oldItems.forEach(el => el.remove());
            emptyPlaceholder.style.display = "block";
        }
        if (calcPanel) calcPanel.style.display = "none";
        
        // Hide PWA Sticky bottom action bar if cart is empty
        const stickyBar = document.querySelector(".mobile-sticky-order-bar");
        if (stickyBar) stickyBar.style.display = "none";
        return;
    }

    // Display elements
    if (emptyPlaceholder) emptyPlaceholder.style.display = "none";
    if (calcPanel) calcPanel.style.display = "block";

    // Show Mobile Sticky Bar
    const stickyBar = document.querySelector(".mobile-sticky-order-bar");
    if (stickyBar && window.innerWidth <= 767.98) {
        stickyBar.style.display = "block";
    }

    // Render cart items
    if (cartList) {
        const oldItems = cartList.querySelectorAll(".cart-item");
        oldItems.forEach(el => el.remove());

        cart.forEach(item => {
            const itemHTML = `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <span class="cart-item-size-badge">${item.size}</span>
                        <div class="d-flex align-items-center justify-content-between mt-2">
                            <span class="cart-item-price">Rs ${item.unitPrice * item.quantity}</span>
                            
                            <div class="qty-controls" style="height: 32px; max-width: 95px;">
                                <button type="button" class="qty-btn" style="width: 28px;" onclick="adjustCartItemQty('${item.id}', -1)">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <span class="qty-value" style="width: 32px; font-size: 0.85rem;">${item.quantity}</span>
                                <button type="button" class="qty-btn" style="width: 28px;" onclick="adjustCartItemQty('${item.id}', 1)">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="cart-item-delete" onclick="removeCartItem('${item.id}')">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </div>
            `;
            cartList.insertAdjacentHTML("afterbegin", itemHTML);
        });
    }

    // Update text content
    const subtotalText = document.getElementById("cart-calc-subtotal");
    const deliveryText = document.getElementById("cart-calc-delivery");
    const grandTotalText = document.getElementById("cart-calc-grand-total");
    const deliveryLabel = document.getElementById("delivery-label-status");

    if (subtotalText) subtotalText.innerText = `Rs ${subtotal}`;
    
    if (deliveryText) {
        if (deliveryFee === 0) {
            deliveryText.innerText = "FREE Delivery";
            deliveryText.className = "fw-bold text-success";
        } else {
            deliveryText.innerText = `Rs ${deliveryFee}`;
            deliveryText.className = "fw-bold text-dark";
        }
    }

    if (deliveryLabel) {
        deliveryLabel.innerHTML = isHostel ? 'Delivery Charges <span class="badge bg-warning text-dark ms-1">Hostel</span>' : "Delivery Charges";
    }

    if (grandTotalText) grandTotalText.innerText = `Rs ${grandTotal}`;
}

// Highlight the current delivery charge row dynamically
function highlightDeliveryTableRow(subtotal) {
    // Remove active highlight from all rows
    const rows = document.querySelectorAll(".delivery-charges-table tr");
    rows.forEach(r => r.classList.remove("table-success", "text-dark", "highlighted"));

    let targetRowId = "";
    if (subtotal >= 1000) targetRowId = "drow-1000";
    else if (subtotal >= 900) targetRowId = "drow-900";
    else if (subtotal >= 800) targetRowId = "drow-800";
    else if (subtotal >= 700) targetRowId = "drow-700";
    else if (subtotal >= 600) targetRowId = "drow-600";
    else if (subtotal >= 500) targetRowId = "drow-500";
    else if (subtotal >= 400) targetRowId = "drow-400";
    else if (subtotal >= 300) targetRowId = "drow-300";
    else if (subtotal >= 200) targetRowId = "drow-200";
    else if (subtotal >= 100) targetRowId = "drow-100";

    if (targetRowId) {
        const row = document.getElementById(targetRowId);
        if (row) {
            row.classList.add("table-success", "text-dark", "highlighted");
        }
    }
}

// --- Cart Offcanvas Trigger Action ---
function setupCartListeners() {
    const checkoutTrigger = document.getElementById("cart-checkout-trigger-btn");
    if (checkoutTrigger) {
        checkoutTrigger.addEventListener("click", () => {
            // Close Offcanvas drawer
            const offcanvasEl = document.getElementById("cartOffcanvas");
            const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
            if (bsOffcanvas) bsOffcanvas.hide();

            // Open checkout modal
            openCheckoutFlow();
        });
    }

    // Empty Cart "Browse Menu" button scroll handler
    const browseMenuBtn = document.getElementById("cart-browse-menu-btn");
    if (browseMenuBtn) {
        browseMenuBtn.addEventListener("click", (e) => {
            e.preventDefault();
            // Close Offcanvas drawer
            const offcanvasEl = document.getElementById("cartOffcanvas");
            const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
            // Wait for backdrop cleanup & transition to complete (350ms)
            setTimeout(() => {
                const menuSection = document.getElementById("menu");
                if (menuSection) {
                    menuSection.scrollIntoView({ behavior: "smooth" });
                }
            }, 350);
        });
    }

    // Listener for cart drawer hostel checkbox to sync with modal checkbox
    const cartHostel = document.getElementById("cart-hostel");
    if (cartHostel) {
        cartHostel.addEventListener("change", () => {
            const modalHostel = document.getElementById("cust-hostel");
            if (modalHostel) {
                modalHostel.checked = cartHostel.checked;
                const noticeEl = document.getElementById("hostel-info-notice");
                if (noticeEl) {
                    if (modalHostel.checked) {
                        noticeEl.classList.remove("d-none");
                    } else {
                        noticeEl.classList.add("d-none");
                    }
                }
            }
            updateCartUI();
        });
    }
}

// --- Checkout Modal Flow & Live Summary Calculations ---
function openCheckoutFlow() {
    if (cart.length === 0) {
        showToast("Please add items to your cart before checking out!");
        return;
    }

    // Sync checkout hostel checkbox state with cart drawer hostel checkbox state
    const cartHostel = document.getElementById("cart-hostel");
    const modalHostel = document.getElementById("cust-hostel");
    const noticeEl = document.getElementById("hostel-info-notice");
    if (cartHostel && modalHostel) {
        modalHostel.checked = cartHostel.checked;
        if (noticeEl) {
            if (modalHostel.checked) {
                noticeEl.classList.remove("d-none");
            } else {
                noticeEl.classList.add("d-none");
            }
        }
    }

    const modalEl = document.getElementById("checkoutModal");
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    
    // Update live modal receipt summary
    updateModalSummary();
    
    bsModal.show();
}

function updateModalSummary() {
    const listContainer = document.getElementById("checkout-summary-items-list");
    const subtotalText = document.getElementById("modal-subtotal");
    const deliveryText = document.getElementById("modal-delivery");
    const grandTotalText = document.getElementById("modal-grand-total");
    const hostelCheckbox = document.getElementById("cust-hostel");

    if (!listContainer) return;
    listContainer.innerHTML = "";

    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.unitPrice * item.quantity;

        const summaryItemHTML = `
            <div class="checkout-item d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                    <div>
                        <h6 class="checkout-item-title">${item.name}</h6>
                        <span class="badge bg-light text-dark border fs-8">${item.size}</span>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <div class="qty-controls" style="height: 28px; max-width: 85px;">
                        <button type="button" class="qty-btn" style="width: 24px; height: 100%;" onclick="adjustCartItemQty('${item.id}', -1)">
                            <i class="bi bi-dash"></i>
                        </button>
                        <span class="qty-value" style="width: 32px; font-size: 0.8rem; line-height: 26px;">${item.quantity}</span>
                        <button type="button" class="qty-btn" style="width: 24px; height: 100%;" onclick="adjustCartItemQty('${item.id}', 1)">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                    <span class="fw-bold text-primary fs-7" style="min-width: 55px; text-align: right;">Rs ${item.unitPrice * item.quantity}</span>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML("beforeend", summaryItemHTML);
    });

    const isHostel = hostelCheckbox ? hostelCheckbox.checked : false;
    const deliveryFee = calculateDelivery(subtotal, isHostel);
    const grandTotal = subtotal + deliveryFee;

    if (subtotalText) subtotalText.innerText = `Rs ${subtotal}`;
    
    if (deliveryText) {
        if (deliveryFee === 0) {
            deliveryText.innerText = "FREE Delivery";
            deliveryText.className = "fw-bold text-success";
        } else {
            deliveryText.innerText = `Rs ${deliveryFee}`;
            deliveryText.className = "fw-bold text-dark";
        }
    }
    
    if (grandTotalText) grandTotalText.innerText = `Rs ${grandTotal}`;
}

// Listen for checkout inputs and hostel overrides
function setupCheckoutListeners() {
    const hostelCheckbox = document.getElementById("cust-hostel");
    const noticeEl = document.getElementById("hostel-info-notice");

    if (hostelCheckbox) {
        hostelCheckbox.addEventListener("change", () => {
            // Synchronize with cart drawer hostel checkbox
            const cartHostel = document.getElementById("cart-hostel");
            if (cartHostel) {
                cartHostel.checked = hostelCheckbox.checked;
            }
            
            if (hostelCheckbox.checked) {
                if (noticeEl) noticeEl.classList.remove("d-none");
            } else {
                if (noticeEl) noticeEl.classList.add("d-none");
            }
            // Recalculate delivery fee immediately inside modal
            updateModalSummary();
            // Update cart drawer UI values
            updateCartUI();
        });
    }

    const form = document.getElementById("checkout-order-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            processOrderConfirmation();
        });
    }
}

// --- Automated WhatsApp Generator & Sender Linker ---
function processOrderConfirmation() {
    const name = document.getElementById("cust-name").value.trim();
    const phone = document.getElementById("cust-phone").value.trim();
    const address = document.getElementById("cust-address").value.trim();
    const area = document.getElementById("cust-area").value.trim();
    const isHostel = document.getElementById("cust-hostel").checked;
    const instructions = document.getElementById("cust-instructions").value.trim();

    // Secondary validation
    if (!name || !phone || !address || !area) {
        showToast("Please fill out all required fields!");
        return;
    }

    // Generate Dynamic Order Reference Code
    const orderRef = `NAFC-${Math.floor(1000 + Math.random() * 9000)}`;

    // Compile calculations
    let subtotal = 0;
    let itemRowsText = "";
    cart.forEach(item => {
        const itemTotal = item.unitPrice * item.quantity;
        subtotal += itemTotal;
        itemRowsText += `🍟 *${item.quantity}x* ${item.name} (${item.size}) - Rs ${itemTotal}\n`;
    });

    const deliveryFee = calculateDelivery(subtotal, isHostel);
    const grandTotal = subtotal + deliveryFee;

    // Build emoji structured message
    let msg = `🍟 *NEW ALI FINGER CHIPS* 🍟\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📝 *ORDER REF:* #${orderRef}\n`;
    msg += `👤 *CUSTOMER DETAILS:*\n`;
    msg += `   • *Name:* ${name}\n`;
    msg += `   • *Phone:* ${phone}\n`;
    msg += `   • *Address:* ${address}\n`;
    msg += `   • *Area/Location:* ${area}\n`;
    msg += `   • *Hostel Delivery:* ${isHostel ? "YES (Rs 50 locked fee)" : "NO"}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🛒 *ORDERED ITEMS:*\n${itemRowsText}`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💵 *Subtotal:* Rs ${subtotal}\n`;
    msg += `🚀 *Delivery Fee:* ${deliveryFee === 0 ? "FREE Delivery" : "Rs " + deliveryFee}\n`;
    msg += `🔥 *GRAND TOTAL: Rs ${grandTotal}*\n`;
    
    if (instructions) {
        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `💡 *SPECIAL INSTRUCTIONS:*\n   _"${instructions}"_\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `⚠️ _Please prepare my order fresh & warm. Thank you, Malik Bhai!_`;

    // URL encode the message
    const encodedText = encodeURIComponent(msg);
    const waNumber = "923013443021";
    const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;

    // Close the Modal
    const modalEl = document.getElementById("checkoutModal");
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    if (bsModal) bsModal.hide();

    // Reset checkout form fields
    const formEl = document.getElementById("checkout-order-form");
    if (formEl) formEl.reset();
    const modalHostel = document.getElementById("cust-hostel");
    if (modalHostel) {
        modalHostel.checked = false;
    }
    const cartHostel = document.getElementById("cart-hostel");
    if (cartHostel) {
        cartHostel.checked = false;
    }
    const noticeEl = document.getElementById("hostel-info-notice");
    if (noticeEl) noticeEl.classList.add("d-none");

    // Empty active basket state
    cart = [];
    updateCartUI();

    // Open WhatsApp in new tab
    showToast("Compiling order and redirecting to WhatsApp...");
    setTimeout(() => {
        window.open(waUrl, "_blank");
    }, 1200);
}

// --- Scrolling, Sticky Effects, and Mobile active states ---
function setupNavbarScroll() {
    const navbar = document.querySelector(".navbar-custom");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
        syncScrollProgressWithNavs();
    });
}

function setupPwaNavSync() {
    const links = document.querySelectorAll(".nav-link-custom");
    const mobileItems = document.querySelectorAll(".mobile-nav-item");

    links.forEach(l => {
        l.addEventListener("click", () => {
            links.forEach(inner => inner.classList.remove("active"));
            l.classList.add("active");
        });
    });

    mobileItems.forEach(mi => {
        mi.addEventListener("click", () => {
            mobileItems.forEach(inner => inner.classList.remove("active"));
            mi.classList.add("active");
        });
    });
}

function syncScrollProgressWithNavs() {
    const sections = ["home", "menu", "delivery-rules", "testimonials", "contact"];
    const scrollPos = window.scrollY + 200;

    sections.forEach(s => {
        const el = document.getElementById(s);
        if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                // Sync desktop link
                const dlink = document.querySelector(`.nav-link-custom[href="#${s}"]`) || document.querySelector(`.nav-link-custom[href="#"]`);
                if (dlink) {
                    document.querySelectorAll(".nav-link-custom").forEach(l => l.classList.remove("active"));
                    dlink.classList.add("active");
                }

                // Sync mobile PWA nav item
                let mId = "mnav-home";
                if (s === "menu") mId = "mnav-menu";
                else if (s === "delivery-rules") mId = "mnav-delivery";
                else if (s === "contact") mId = "mnav-contact";

                const mlink = document.getElementById(mId);
                if (mlink) {
                    document.querySelectorAll(".mobile-nav-item").forEach(mi => mi.classList.remove("active"));
                    mlink.classList.add("active");
                }
            }
        }
    });
}

// --- Custom Toast / Floating Notification Alert ---
function showToast(message) {
    // Remove existing toast if any
    const oldToast = document.querySelector(".custom-toast");
    if (oldToast) oldToast.remove();

    const toastHTML = `
        <div class="custom-toast animate-toast">
            <div class="d-flex align-items-center gap-2">
                <i class="bi bi-check2-circle fs-5"></i>
                <span>${message}</span>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", toastHTML);

    // CSS Styling inject for dynamic toast alert
    const styleEl = document.createElement("style");
    styleEl.className = "dynamic-toast-style";
    styleEl.innerHTML = `
        .custom-toast {
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(18, 18, 20, 0.96);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: #ffffff;
            font-weight: 600;
            font-size: 0.9rem;
            padding: 12px 20px;
            border-radius: 14px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            border: 1px solid rgba(255, 94, 0, 0.3);
            pointer-events: none;
            transition: all 0.4s ease;
            max-width: 90vw;
            width: max-content;
            box-sizing: border-box;
        }
        .custom-toast i {
            color: var(--color-secondary);
            flex-shrink: 0;
        }
        .animate-toast {
            animation: toastIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes toastIn {
            from { bottom: 80px; opacity: 0; transform: translateX(-50%) scale(0.85); }
            to { bottom: 120px; opacity: 1; transform: translateX(-50%) scale(1); }
        }
        @media (max-width: 767.98px) {
            .custom-toast {
                bottom: 145px;
                font-size: 0.82rem;
                padding: 10px 16px;
                border-radius: 12px;
                width: calc(100% - 32px);
                max-width: 380px;
            }
            @keyframes toastIn {
                from { bottom: 105px; opacity: 0; transform: translateX(-50%) scale(0.85); }
                to { bottom: 145px; opacity: 1; transform: translateX(-50%) scale(1); }
            }
        }
    `;
    
    // Cleanup dynamic toast styles to prevent crowding
    const oldStyle = document.querySelector(".dynamic-toast-style");
    if (oldStyle) oldStyle.remove();
    document.head.appendChild(styleEl);

    // Fadeout animation trigger
    setTimeout(() => {
        const toast = document.querySelector(".custom-toast");
        if (toast) {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(-50%) scale(0.9)";
            setTimeout(() => toast.remove(), 400);
        }
    }, 3200);
}
