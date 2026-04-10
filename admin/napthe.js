async function loadNaptheAdmin() {
  const token = localStorage.getItem("token")
  const table = document.getElementById("napthe-table")

  if (!token) {
    table.innerHTML = `<tr><td colspan="7">Bạn cần đăng nhập admin.</td></tr>`
    return
  }

  const res = await fetch("/api/napthe", {
    headers: { Authorization: `Bearer ${token}` }
  })
  const naptheList = await res.json()
  table.innerHTML = ""

  naptheList.forEach((item) => {
    table.innerHTML += `
      <tr>
        <td>${item.id}</td>
        <td>${item.user_id}</td>
        <td>${item.seri}</td>
        <td>${item.code}</td>
        <td>${item.amount}</td>
        <td><span class="admin-status">${item.status}</span></td>
        <td><button class="admin-action" onclick="updateStatus(${item.id}, 'completed')">Hoàn thành</button></td>
      </tr>
    `
  })
}

async function updateStatus(id, status) {
  const token = localStorage.getItem("token")
  const res = await fetch(`/api/napthe/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  })
  const data = await res.json()
  alert(data.message || "Không thể cập nhật trạng thái")
  if (res.ok) loadNaptheAdmin()
}

loadNaptheAdmin()
