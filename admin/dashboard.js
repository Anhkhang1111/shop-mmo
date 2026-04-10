async function loadDashboard() {
  const token = localStorage.getItem("token")
  if (!token) {
    document.getElementById("stats").innerHTML = `<p class="alert">Bạn cần đăng nhập admin để xem dashboard.</p>`
    return
  }

  async function fetchCount(url) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return 0
    const data = await res.json()
    return Array.isArray(data) ? data.length : 0
  }

  async function fetchRevenue() {
    const res = await fetch("/api/transactions/all", { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return 0
    const data = await res.json()
    return data.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0)
  }

  const [products, users, orders, napthe, revenue] = await Promise.all([
    fetchCount("/api/products"),
    fetchCount("/api/users"),
    fetchCount("/api/orders"),
    fetchCount("/api/napthe"),
    fetchRevenue()
  ])

  document.getElementById("stats").innerHTML = `
    <div class="admin-card">
      <h2>Thống kê nhanh</h2>
      <p>Sản phẩm: <strong>${products}</strong></p>
      <p>Người dùng: <strong>${users}</strong></p>
      <p>Đơn hàng: <strong>${orders}</strong></p>
      <p>Nạp thẻ: <strong>${napthe}</strong></p>
      <p>Doanh thu: <strong>${revenue.toLocaleString()} VND</strong></p>
      <button onclick="logoutAdmin()">Đăng xuất</button>
    </div>
  `
}

function logoutAdmin() {
  localStorage.removeItem("token")
  window.location.href = "/html/login.html"
}

loadDashboard()
