// Common API utilities for Coffee and Beans Roastery

async function submitNewsletter(inputId) {
  const emailInput = document.getElementById(inputId);
  if (!emailInput || !emailInput.value) return;

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput.value })
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message || 'Subscribed successfully!');
      emailInput.value = '';
    } else {
      alert(data.error || 'Subscription failed.');
    }
  } catch (err) {
    alert('Subscription failed. Please try again.');
  }
}

// Global Order Drawer / Cart Handler
let globalCart = [];

function addGlobalOrder(name, price, weight = '') {
  globalCart.push({ name, price, weight });
  updateCartDrawer();
}

function updateCartDrawer() {
  let drawer = document.getElementById('globalOrderDrawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'globalOrderDrawer';
    drawer.className = 'fixed bottom-4 right-4 z-50 bg-primary text-on-primary p-space-md rounded-lg shadow-xl max-w-sm w-full transition-all duration-300 transform translate-y-0';
    document.body.appendChild(drawer);
  }

  const total = globalCart.reduce((sum, item) => sum + item.price, 0);
  const count = globalCart.length;

  if (count === 0) {
    drawer.classList.add('hidden');
    return;
  }

  drawer.classList.remove('hidden');
  const lastItem = globalCart[globalCart.length - 1];

  drawer.innerHTML = `
    <div class="flex items-center justify-between pb-2 mb-2 border-b border-surface-container-high/30">
      <div class="flex items-center space-x-2">
        <span class="material-symbols-outlined text-secondary-fixed text-[20px]">shopping_bag</span>
        <span class="font-title-md text-title-md font-semibold text-surface-bright">Order Tray (${count})</span>
      </div>
      <button onclick="clearGlobalCart()" class="text-label-sm font-label-sm text-outline-variant hover:text-surface-bright">Clear</button>
    </div>
    <p class="font-body-sm text-body-sm text-surface-container-low mb-2">
      Added: <strong class="text-surface-bright">${lastItem.name}</strong> (${lastItem.price} PKR)
    </p>
    <div class="flex items-center justify-between pt-1">
      <span class="font-title-lg text-title-lg font-bold text-secondary-fixed">PKR ${total.toLocaleString()}</span>
      <button onclick="checkoutCart()" class="bg-secondary text-on-secondary font-label-md text-label-md px-space-md py-space-xs rounded hover:bg-secondary-container hover:text-on-secondary-container transition-colors font-semibold">
        Checkout Order
      </button>
    </div>
  `;
}

function clearGlobalCart() {
  globalCart = [];
  updateCartDrawer();
}

async function checkoutCart() {
  if (globalCart.length === 0) return;
  const name = prompt("Please enter your Name for the Order:") || "Guest";
  const phone = prompt("Please enter your Phone Number:") || "";
  const total = globalCart.reduce((sum, item) => sum + item.price, 0);

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: name,
        customer_phone: phone,
        items: globalCart,
        total_price: total
      })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Thank you ${name}! Your order #${data.orderId} has been placed successfully.`);
      clearGlobalCart();
    } else {
      alert(data.error || 'Failed to place order.');
    }
  } catch (err) {
    alert('Error placing order. Please try again.');
  }
}
