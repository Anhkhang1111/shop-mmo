async function loadProductsAdmin() {
  const token = localStorage.getItem("token")
  const table = document.getElementById("product-table")

  if (!token) {
    table.innerHTML = `<tr><td colspan="5">Bạn cần đăng nhập admin.</td></tr>`
    return
  }

  const res = await fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } })
  const products = await res.json()
  table.innerHTML = ""

  products.forEach((product) => {
    table.innerHTML += `
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.price.toLocaleString()}</td>
        <td><img src="${product.image || '/images/no-image.png'}" width="60" /></td>
        <td><button class="admin-action" onclick="deleteProduct(${product.id})">Xóa</button></td>
      </tr>
    `
  })
}

async function createProduct() {
  const token = localStorage.getItem("token")
  const name = document.getElementById("product-name").value
  const price = Number(document.getElementById("product-price").value)
  const description = document.getElementById("product-description").value

  if (!name || !price) {
    alert("Tên và giá sản phẩm là bắt buộc.")
    return
  }

  let imageUrl = ""
  const imageFile = document.getElementById("product-image-file").files[0]
  if (imageFile) {
    const formData = new FormData()
    formData.append("image", imageFile)
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData
    })
    const uploadData = await uploadRes.json()
    if (uploadRes.ok) {
      imageUrl = uploadData.imageUrl
    } else {
      alert("Upload ảnh thất bại: " + uploadData.message)
      return
    }
  }

  const res = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, price, image: imageUrl, description })
  })

  const data = await res.json()
  alert(data.message || "Không thể thêm sản phẩm")
  if (res.ok) {
    document.getElementById("product-form").reset()
    loadProductsAdmin()
  }
}

async function deleteProduct(id) {
  const token = localStorage.getItem("token")
  const confirmed = confirm("Bạn có chắc muốn xóa sản phẩm này?")
  if (!confirmed) return

  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json()
  alert(data.message || "Không thể xóa sản phẩm")
  if (res.ok) loadProductsAdmin()
}

loadProductsAdmin()
