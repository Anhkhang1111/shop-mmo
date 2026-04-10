async function forgotPassword() {
  const email = document.getElementById("email").value
  if (!email) {
    document.getElementById("message").innerText = "Vui lòng nhập email"
    return
  }

  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })

  const data = await res.json()
  document.getElementById("message").innerText = data.message
  if (res.ok) {
    document.getElementById("reset-form").style.display = "block"
  }
}

async function resetPassword() {
  const token = document.getElementById("reset-token").value
  const newPassword = document.getElementById("new-password").value

  if (!token || !newPassword) {
    document.getElementById("message").innerText = "Vui lòng điền đầy đủ"
    return
  }

  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword })
  })

  const data = await res.json()
  document.getElementById("message").innerText = data.message
  if (res.ok) {
    window.location.href = "/html/login.html"
  }
}