async function loadProfile() {
  const token = localStorage.getItem("token")
  const profileContent = document.getElementById("profile-content")

  if (!token) {
    profileContent.innerHTML = `<p>Bạn chưa đăng nhập. <a href="login.html">Đăng nhập</a></p>`
    return
  }

  const [profileRes, ordersRes, naptheRes, transactionsRes] = await Promise.all([
    fetch("/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } }),
    fetch("/api/orders/me", { headers: { Authorization: `Bearer ${token}` } }),
    fetch("/api/napthe/me", { headers: { Authorization: `Bearer ${token}` } }),
    fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } })
  ])

  const profileData = await profileRes.json()
  if (!profileRes.ok) {
    profileContent.innerHTML = `<p>${profileData.message || "Lỗi lấy hồ sơ"}</p>`
    return
  }

  const user = profileData.user
  profileContent.innerHTML = `
    <p><strong>ID:</strong> ${user.id}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Vai trò:</strong> ${user.role}</p>
  `

  // Fill update form
  document.getElementById("update-username").value = user.username || ""
  document.getElementById("update-email").value = user.email || ""

  if (ordersRes.ok) {
    const orders = await ordersRes.json()
    const ordersTable = document.getElementById("orders-table")
    ordersTable.innerHTML = orders.map(order => `
      <tr>
        <td>${order.id}</td>
        <td>${order.product_name || order.product_id}</td>
        <td>${order.price.toLocaleString()}</td>
        <td>${new Date(order.created_at).toLocaleString()}</td>
      </tr>
    `).join("")
  }

  if (transactionsRes.ok) {
    const transactions = await transactionsRes.json()
    const transactionsTable = document.getElementById("transactions-table")
    transactionsTable.innerHTML = transactions.map(t => `
      <tr>
        <td>${t.type}</td>
        <td>${t.amount > 0 ? '+' : ''}${t.amount.toLocaleString()} VND</td>
        <td>${t.description}</td>
        <td>${new Date(t.created_at).toLocaleString()}</td>
      </tr>
    `).join("")
  }
}

async function updateProfile() {
  const token = localStorage.getItem("token")
  const username = document.getElementById("update-username").value
  const email = document.getElementById("update-email").value

  const res = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ username, email })
  })

  const data = await res.json()
  alert(data.message)
  if (res.ok) {
    loadProfile()
  }
}

function logout() {
  localStorage.removeItem("token")
  window.location.href = "/html/login.html"
}

loadProfile()
