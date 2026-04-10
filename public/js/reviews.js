async function loadReviews() {
  const res = await fetch("/api/reviews")
  const reviews = await res.json()
  const list = document.getElementById("reviews-list")
  list.innerHTML = reviews.map(r => `
    <div class="review-card">
      <p><strong>${r.username}</strong> - ${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</p>
      <p>${r.comment}</p>
      <small>${new Date(r.created_at).toLocaleString()}</small>
    </div>
  `).join("")
}

async function submitReview() {
  const token = localStorage.getItem("token")
  if (!token) {
    alert("Bạn cần đăng nhập để đánh giá")
    window.location.href = "/html/login.html"
    return
  }

  const rating = document.getElementById("rating").value
  const comment = document.getElementById("comment").value

  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ rating, comment })
  })

  const data = await res.json()
  alert(data.message)
  if (res.ok) {
    document.getElementById("comment").value = ""
    loadReviews()
  }
}

loadReviews()