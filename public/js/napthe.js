async function submitNapthe() {
  const token = localStorage.getItem("token")
  const seri = document.getElementById("seri").value
  const code = document.getElementById("code").value
  const amount = document.getElementById("amount").value

  if (!token) {
    document.getElementById("napthe-status").innerText = "Bạn cần đăng nhập để nạp thẻ."
    return
  }

  const res = await fetch("/api/napthe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ seri, code, amount })
  })

  const data = await res.json()
  document.getElementById("napthe-status").innerText = data.message || "Có lỗi xảy ra"
}
