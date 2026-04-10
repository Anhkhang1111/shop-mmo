async function loadOrdersAdmin() {
  const token = localStorage.getItem("token")
  const table = document.getElementById("order-table")

  if (!token) {
    table.innerHTML = `<tr><td colspan="5">Bạn cần đăng nhập admin.</td></tr>`
    return
  }

  const res = await fetch("/api/orders", {
    headers: { Authorization: `Bearer ${token}` }
  })
  const orders = await res.json()
  table.innerHTML = ""

  orders.forEach((order) => {
    table.innerHTML += `
      <tr>
        <td>${order.id}</td>
        <td>${order.user_name || order.user_id}</td>
        <td>${order.product_name || order.product_id}</td>
        <td>${order.price.toLocaleString()}</td>
        <td>${new Date(order.created_at).toLocaleString()}</td>
      </tr>
    `
  })
}

loadOrdersAdmin()
