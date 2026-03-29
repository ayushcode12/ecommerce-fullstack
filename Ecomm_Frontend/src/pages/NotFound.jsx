import { Link } from "react-router-dom"
import { useEffect } from "react"
import { ArrowLeft, Home } from "lucide-react"

const NotFound = () => {
  useEffect(() => {
    document.title = "Page Not Found | Urban Threads"
  }, [])

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="page-accent page-accent--left" />
      <div className="page-accent page-accent--right" />

      <div className="mx-auto flex min-h-[60vh] w-full max-w-[1200px] items-center justify-center px-3 py-6 sm:px-4 md:px-6 lg:px-8">
        <section className="surface-card w-full max-w-2xl rounded-3xl p-6 text-center sm:p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">404 Error</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-slate-900 sm:text-5xl">Page not found</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 sm:text-base">
            The page you are looking for does not exist or the link may be broken.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-base">
              <Home size={16} />
              Back to Home
            </Link>
            <Link
              to="/products"
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-base"
            >
              <ArrowLeft size={16} />
              Browse Products
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default NotFound
