import { Music2, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleSearchClick = () => {
    // If we're on the homepage, focus the search input
    if (location.pathname === '/') {
      // Scroll to search and focus it
      const searchInput = document.querySelector('input[placeholder*="Search by artist"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else {
      // If we're on another page, navigate to homepage and focus search
      navigate('/')
      // Wait for navigation, then focus search
      setTimeout(() => {
        const searchInput = document.querySelector('input[placeholder*="Search by artist"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full glass-strong border-b border-white/20"
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 min-w-0 group">
            <motion.div
              whileHover={{ rotate: -5, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative w-10 h-10 sm:w-12 sm:h-12"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-primary rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-glow-primary"
                whileHover={{ scale: 1.1 }}
              >
                <Music2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </motion.div>
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-display text-xl sm:text-2xl font-bold text-gradient-primary tracking-tight">
                Concert Time Machine
              </span>
            </div>
            <div className="sm:hidden">
              <span className="font-display text-lg font-bold text-gradient-primary tracking-tight">
                CTM
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  className="text-warm-gray hover:text-gradient-primary hover:bg-white/50 transition-all touch-target font-medium rounded-lg px-4"
                >
                  Discover
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                className="text-warm-gray hover:text-gradient-primary hover:bg-white/50 transition-all touch-target font-medium rounded-lg px-4"
                disabled
              >
                Browse
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                className="text-warm-gray hover:text-gradient-primary hover:bg-white/50 transition-all touch-target font-medium rounded-lg px-4"
                disabled
              >
                My Collection
              </Button>
            </motion.div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearchClick}
                className="h-10 w-10 sm:h-10 sm:w-10 rounded-lg text-warm-gray hover:text-terracotta hover:bg-white/50 transition-all touch-target hover:shadow-glow"
                title="Search concerts"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 sm:h-10 sm:w-10 rounded-lg text-warm-gray hover:text-terracotta hover:bg-white/50 transition-all touch-target hover:shadow-glow"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
