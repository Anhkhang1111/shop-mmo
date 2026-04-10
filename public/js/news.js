async function loadNews() {
  const res = await fetch("/api/news")
  const news = await res.json()
  const list = document.getElementById("news-list")
  list.innerHTML = news.map(n => `
    <div class="news-card">
      <h3>${n.title}</h3>
      <p>${n.content}</p>
      <small>${new Date(n.created_at).toLocaleString()}</small>
    </div>
  `).join("")
}

loadNews()