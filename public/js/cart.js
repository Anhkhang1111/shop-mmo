function getCart() {
  return JSON.parse(localStorage.getItem("shopCart") || "[]")
}

function saveCart(cart) {
  localStorage.setItem("shopCart", JSON.stringify(cart))
}

function formatPrice(value) {
  return Number(value).toLocaleString() + " VND"
}

function renderCart() {
  const cart = getCart()
  const cartBody = document.getElementById("cart-body")
  const cartTable = document.getElementById("cart-table")
  const cartSummary = document.getElementById("cart-summary")
  const cartEmpty = document.getElementById("cart-empty")

  if (!cart.length) {
    cartTable.classList.add("hidden")
    cartSummary.classList.add("hidden")
    cartEmpty.classList.remove("hidden")
    return
  }

  cartTable.classList.remove("hidden")
  cartSummary.classList.remove("hidden")
  cartEmpty.classList.add("hidden")

  cartBody.innerHTML = ""
  let total = 0

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity
    total += itemTotal

    cartBody.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${formatPrice(item.price)}</td>
        <td>${item.quantity}</td>
        <td>${formatPrice(itemTotal)}</td>
        <td><button class="icon-button" onclick="removeCartItem(${index})">Xóa</button></td>
      </tr>
    `
  })

  document.getElementById("cart-total").textContent = formatPrice(total)
}

function removeCartItem(index) {
  const cart = getCart()
  cart.splice(index, 1)
  saveCart(cart)
  renderCart()
}

async function checkoutCart() {
  const token = localStorage.getItem("token")
  if (!token) {
    alert("Bạn cần đăng nhập để thanh toán.")
    window.location.href = "/html/login.html"
    return
  }

  const cart = getCart()
  if (!cart.length) {
    alert("Giỏ hàng trống.")
    return
  }

  try {
    for (const item of cart) {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: item.id, price: item.price })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Lỗi thanh toán sản phẩm")
      }
    }

    localStorage.removeItem("shopCart")
    alert("Thanh toán thành công. Đơn hàng của bạn đã được tạo.")
    renderCart()
  } catch (error) {
    console.error(error)
    alert(error.message || "Đã xảy ra lỗi khi thanh toán.")
  }
}

document.getElementById("checkout-button").addEventListener("click", checkoutCart)
renderCart()
