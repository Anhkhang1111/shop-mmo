async function loadUsersAdmin() {
  const token = localStorage.getItem("token")
  const table = document.getElementById("user-table")

  if (!token) {
    table.innerHTML = `<tr><td colspan="5">Bạn cần đăng nhập admin.</td></tr>`
    return
  }

  const res = await fetch("/api/users", {
    headers: { Authorization: `Bearer ${token}` }
  })
  const users = await res.json()
  table.innerHTML = ""

  users.forEach((user) => {
    table.innerHTML += `
      <tr>
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.money}</td>
      </tr>
    `
  })
}

loadUsersAdmin()
