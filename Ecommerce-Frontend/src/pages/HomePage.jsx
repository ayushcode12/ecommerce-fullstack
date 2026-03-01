import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../api/axiosInstance"
import ProductCard from "../components/ProductCard"

const HomePage = () => {

  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState([])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get(
          `/products?page=0&size=4&sortBy=id&direction=asc`
        )
        setFeaturedProducts(response.data.content)
      } catch (error) {
        console.log("Failed to fetch featured products", error)
      }
    }

    fetchFeatured()
  }, [])

  return (
    <div className="animate-fadeIn">
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200">

        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-36 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500 opacity-20 blur-3xl rounded-full animate-pulse"></div>

          <div className="max-w-[1600px] mx-auto px-8 text-center relative z-10">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Professional Cleaning Products
            </h1>

            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Powerful, safe, and reliable home cleaning solutions trusted by thousands.
            </p>

            <button
              onClick={() => navigate("/products")}
              className="bg-emerald-500 hover:bg-emerald-600 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
            >
              Shop Now
            </button>

            <p className="mt-16 text-slate-400 text-sm tracking-wide">
              Trusted by 10,000+ customers across India
            </p>
          </div>
        </section>

        {/* FREE SHIPPING BAR */}
        <div className="bg-emerald-500 text-white text-center py-3 text-sm font-semibold tracking-wide">
          FREE SHIPPING on orders above ₹499
        </div>

        {/* FEATURES */}
        <div className="max-w-[1600px] mx-auto px-8 py-24 space-y-24">

          <section className="bg-slate-50 rounded-3xl p-14 grid grid-cols-1 md:grid-cols-3 gap-10 shadow-inner">
            {[
              { title: "Fast Delivery", desc: "Quick shipping across India." },
              { title: "Premium Quality", desc: "Lab-tested powerful cleaning formulas." },
              { title: "Trusted Brand", desc: "Used by thousands of households." }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-10 rounded-2xl shadow-md hover:shadow-lg transition text-center"
              >
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </section>

          {/* FEATURED PRODUCTS */}
          <section className="space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-slate-800">
                Featured Products
              </h2>
              <p className="text-slate-600 mt-2">
                Handpicked essentials for powerful cleaning performance.
              </p>
            </div>

            {featuredProducts.length === 0 ? (
              <p className="text-center text-slate-600">
                No products available.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    refreshCartCount={() => {}}
                  />
                ))}
              </div>
            )}

            <div className="text-center pt-6">
              <button
                onClick={() => navigate("/products")}
                className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-xl transition shadow-lg hover:shadow-2xl"
              >
                View All Products
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

export default HomePage