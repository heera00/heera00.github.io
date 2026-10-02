const products = [
  { id: 1, name: "Everyday Tote", category: "Accessories", price: 34.99, description: "Durable cotton tote for daily essentials." },
  { id: 2, name: "Cloud Sneakers", category: "Footwear", price: 89.0, description: "Lightweight sneakers with cushioned soles." },
  { id: 3, name: "Classic Tee", category: "Apparel", price: 24.5, description: "Soft premium cotton t-shirt." },
  { id: 4, name: "Minimal Hoodie", category: "Apparel", price: 59.99, description: "Mid-weight hoodie for year-round comfort." },
  { id: 5, name: "Brew Mug", category: "Home", price: 14.75, description: "Ceramic mug for coffee or tea moments." },
  { id: 6, name: "Desk Lamp", category: "Home", price: 42.25, description: "Warm LED lamp with adjustable neck." },
  { id: 7, name: "Travel Bottle", category: "Accessories", price: 19.99, description: "Insulated bottle that keeps drinks cold." },
  { id: 8, name: "Trail Sandals", category: "Footwear", price: 39.5, description: "Comfortable sandals with secure grip." }
];

const cartStorageKey = "myshop-cart";
const state = {
  query: "",
  category: "all",
  cart: loadCart()
};

const ui = {
  grid: document.getElementById("product-grid"),
  queryInput: document.getElementById("search-input"),
  categoryFilter: document.getElementById("category-filter"),
  resultsCount: document.getElementById("results-count"),
  cartItems: document.getElementById("cart-items"),
  cartCount: document.getElementById("cart-count"),
  subtotal: document.getElementById("subtotal"),
  cartPanel: document.getElementById("cart-panel"),
  cartToggle: document.getElementById("cart-toggle"),
  clearCart: document.getElementById("clear-cart"),
  checkout: document.getElementById("checkout")
};

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(cartStorageKey)) || {};
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem(cartStorageKey, JSON.stringify(state.cart));
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function uniqueCategories() {
  return [...new Set(products.map((p) => p.category))].sort();
}

function filteredProducts() {
  const q = state.query.trim().toLowerCase();
  return products.filter((product) => {
    const matchesQuery =
      product.name.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q);
    const matchesCategory =
      state.category === "all" || product.category === state.category;

    return matchesQuery && matchesCategory;
  });
}

function cartQuantity() {
  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}

function cartSubtotal() {
  return products.reduce((sum, product) => {
    const qty = state.cart[product.id] || 0;
    return sum + product.price * qty;
  }, 0);
}

function updateCart(productId, delta) {
  const next = (state.cart[productId] || 0) + delta;
  if (next <= 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = next;
  }
  saveCart();
  renderCart();
}

function renderCategories() {
  uniqueCategories().forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    ui.categoryFilter.appendChild(option);
  });
}

function renderProducts() {
  const items = filteredProducts();
  ui.grid.innerHTML = "";
  ui.resultsCount.textContent = `${items.length} product${items.length === 1 ? "" : "s"} found`;

  if (!items.length) {
    const empty = document.createElement("p");
    empty.textContent = "No products match your filters.";
    ui.grid.appendChild(empty);
    return;
  }

  items.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product";

    const title = document.createElement("h3");
    title.textContent = product.name;

    const detail = document.createElement("p");
    detail.textContent = `${product.category} · ${product.description}`;

    const priceRow = document.createElement("div");
    priceRow.className = "price-row";

    const price = document.createElement("span");
    price.textContent = formatPrice(product.price);

    const addButton = document.createElement("button");
    addButton.className = "button";
    addButton.textContent = "Add to Cart";
    addButton.addEventListener("click", () => updateCart(product.id, 1));

    priceRow.append(price, addButton);
    card.append(title, detail, priceRow);
    ui.grid.appendChild(card);
  });
}

function renderCart() {
  ui.cartItems.innerHTML = "";
  const entries = Object.entries(state.cart);

  if (!entries.length) {
    const empty = document.createElement("li");
    empty.textContent = "Your cart is empty.";
    ui.cartItems.appendChild(empty);
  } else {
    entries.forEach(([id, quantity]) => {
      const product = products.find((item) => item.id === Number(id));
      if (!product) return;

      const item = document.createElement("li");
      item.className = "cart-item";

      const head = document.createElement("div");
      head.className = "cart-item__head";

      const name = document.createElement("strong");
      name.textContent = product.name;

      const total = document.createElement("span");
      total.textContent = formatPrice(product.price * quantity);

      head.append(name, total);

      const meta = document.createElement("small");
      meta.textContent = `${formatPrice(product.price)} each · Qty ${quantity}`;

      const actions = document.createElement("div");
      actions.className = "cart-item__actions";

      const decrease = document.createElement("button");
      decrease.textContent = "−";
      decrease.setAttribute("aria-label", `Decrease ${product.name}`);
      decrease.addEventListener("click", () => updateCart(product.id, -1));

      const increase = document.createElement("button");
      increase.textContent = "+";
      increase.setAttribute("aria-label", `Increase ${product.name}`);
      increase.addEventListener("click", () => updateCart(product.id, 1));

      const remove = document.createElement("button");
      remove.textContent = "Remove";
      remove.addEventListener("click", () => updateCart(product.id, -quantity));

      actions.append(decrease, increase, remove);
      item.append(head, meta, actions);
      ui.cartItems.appendChild(item);
    });
  }

  ui.cartCount.textContent = String(cartQuantity());
  ui.subtotal.textContent = formatPrice(cartSubtotal());
}

function toggleCart() {
  const nextExpanded = ui.cartToggle.getAttribute("aria-expanded") !== "true";
  ui.cartToggle.setAttribute("aria-expanded", String(nextExpanded));
  ui.cartPanel.classList.toggle("is-open", nextExpanded);
}

function setupEvents() {
  ui.queryInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderProducts();
  });

  ui.categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderProducts();
  });

  ui.cartToggle.addEventListener("click", toggleCart);

  ui.clearCart.addEventListener("click", () => {
    state.cart = {};
    saveCart();
    renderCart();
  });

  ui.checkout.addEventListener("click", () => {
    if (!cartQuantity()) {
      alert("Your cart is empty. Add a few products first.");
      return;
    }

    alert("Thanks for trying myshop! Replace this with your real checkout flow.");
  });
}

function init() {
  renderCategories();
  setupEvents();
  renderProducts();
  renderCart();
}

init();
