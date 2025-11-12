import { Music2, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export function Header() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-light-gray bg-white/80 backdrop-blur-xl"
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 min-w-0 group">
            <motion.div
              whileHover={{ rotate: -5 }}
              transition={{ duration: 0.2 }}
              className="relative w-10 h-10 sm:w-12 sm:h-12"
            >
              <div className="absolute inset-0 bg-terracotta rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-card">
                <Music2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-display text-xl text-charcoal tracking-tight">
                Concert Time Machine
              </span>
            </div>
            <div className="sm:hidden">
              <span className="font-display text-lg text-charcoal tracking-tight">
                CTM
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button
                variant="ghost"
                className="text-warm-gray hover:text-charcoal hover:bg-cream-tan/50 transition-colors"
              >
                Discover
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="text-warm-gray hover:text-charcoal hover:bg-cream-tan/50 transition-colors"
              disabled
            >
              Browse
            </Button>
            <Button
              variant="ghost"
              className="text-warm-gray hover:text-charcoal hover:bg-cream-tan/50 transition-colors"
              disabled
            >
              My Collection
            </Button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-warm-gray hover:text-charcoal hover:bg-cream-tan/50 transition-all"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-warm-gray hover:text-charcoal hover:bg-cream-tan/50 transition-all"
            >
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
