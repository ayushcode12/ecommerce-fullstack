import { useEffect, useState } from 'react'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const Products = () => {

  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(
          "http://localhost:8080/products",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        console.log("Products fetched successfully:", response.data)
        setProducts(response.data.content)
      } catch (error) {
        console.log("Failed to fetch products:", error.response?.data || error.message)
      }
    }

    fetchProducts()
  }, [])


  return (
    <div style={{ padding: "20px" }}>
      <h2>Products</h2>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className='products-grid'>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Products