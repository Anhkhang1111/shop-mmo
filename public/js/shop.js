let PRODUCTS = []

function getCart() {
  return JSON.parse(localStorage.getItem("shopCart") || "[]")
}

function saveCart(cart) {
  localStorage.setItem("shopCart", JSON.stringify(cart))
}

function addToCart(productId) {
  const product = PRODUCTS.find((item) => item.id === productId)
  if (!product) return

  const cart = getCart()
  const exist = cart.find((item) => item.id === productId)
  if (exist) {
    exist.quantity += 1
  } else {
    cart.push({ ...product, quantity: 1 })
  }

  saveCart(cart)
  alert("Đã thêm vào giỏ hàng")
}

async function directBuy(productId, productPrice) {
  const token = localStorage.getItem("token")
  if (!token) {
    alert("Bạn cần đăng nhập để mua sản phẩm.")
    window.location.href = "/html/login.html"
    return
  }

  const discountCode = prompt("Nhập mã giảm giá (nếu có):")
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ product_id: productId, discount_code: discountCode || undefined })
  })
  const data = await res.json()
  alert(data.message || "Đã có lỗi xảy ra")
}

function renderProducts(products) {
  const div = document.getElementById("products")
  div.innerHTML = ""

  products.forEach((p) => {
    div.innerHTML += `
      <div class="product-card">
        <img src="${p.image || '/images/no-image.png'}" alt="${p.name}" class="product-image">
        <h3>${p.name}</h3>
        <p class="product-price">${p.price.toLocaleString()} VND</p>
        <p class="product-details">Rank: ${p.rank || 'N/A'} | Skins: ${p.skins || 0} | Champions: ${p.champions || 0}</p>
        <p class="product-description">${p.description || "Không có mô tả"}</p>
        <div class="product-actions">
          <button onclick="addToCart(${p.id})">Thêm vào giỏ</button>
          <button onclick="directBuy(${p.id}, ${p.price})">Mua ngay</button>
        </div>
      </div>
    `
  })
}

function searchProducts() {
  const query = document.getElementById("search-input").value.toLowerCase().trim()
  let filtered = PRODUCTS.filter((product) => {
    return product.name.toLowerCase().includes(query) || (product.description || "").toLowerCase().includes(query)
  })
  renderProducts(filtered)
}

function applyFilters() {
  const rank = document.getElementById("rank-filter").value
  const minPrice = document.getElementById("min-price").value
  const maxPrice = document.getElementById("max-price").value
  const minSkins = document.getElementById("min-skins").value
  const maxSkins = document.getElementById("max-skins").value

  let filtered = PRODUCTS

  if (rank) filtered = filtered.filter(p => p.rank === rank)
  if (minPrice) filtered = filtered.filter(p => p.price >= minPrice)
  if (maxPrice) filtered = filtered.filter(p => p.price <= maxPrice)
  if (minSkins) filtered = filtered.filter(p => p.skins >= minSkins)
  if (maxSkins) filtered = filtered.filter(p => p.skins <= maxSkins)

  renderProducts(filtered)
}

async function loadProducts() {
  const res = await fetch("/api/products")
  PRODUCTS = await res.json()
  renderProducts(PRODUCTS)
}

loadProducts()