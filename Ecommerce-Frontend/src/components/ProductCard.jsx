import axios from 'axios'

const ProductCard = ({ product }) => {

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `http://localhost:8080/cart/add?productId=${product.id}&quantity=1`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      alert("Product added to cart!")
    } catch (error) {
      console.log("Failed to add product to cart:", error.response?.data || error.message)
      alert("Failed to add product to cart. Please try again.")
    }
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "15px",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        color: "#000000"
      }}
    >
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p><strong>Price:</strong> ₹{product.price}</p>
      <p><strong>Category:</strong> {product.categoryName}</p>
      <button
        onClick={handleAddToCart}
        style={{
          marginTop: "10px",
          padding: "8px",
          backgroundColor: "#1abc9c",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Add to Cart
      </button>
    </div>
  )
}

export default ProductCard
