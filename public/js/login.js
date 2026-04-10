async function login() {
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()
  if (data.token) {
    localStorage.setItem("token", data.token)
    alert("Đăng nhập thành công")
    if (data.user && data.user.role === "admin") {
      window.location.href = "/admin/dashboard.html"
    } else {
      window.location.href = "/html/shop.html"
    }
  } else {
    alert(data.message || "Đăng nhập thất bại")
  }
}

function fillDemo(email, password) {
  document.getElementById("email").value = email
  document.getElementById("password").value = password
}
