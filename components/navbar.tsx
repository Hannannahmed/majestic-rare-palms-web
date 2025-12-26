"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, Menu, Leaf, ChevronDown, X } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { categories } from "@/lib/data"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
]

export function Navbar() {
  const { getCartCount, cartItems, removeFromCart, getCartTotal } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const cartCount = getCartCount()

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
    return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`
  }

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="font-serif text-xl md:text-2xl font-semibold text-foreground">Bloom & Rent</span>
          </Link>

          {/* Desktop Navigation with Mega Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Categories Dropdown */}
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => setOpenDropdown(category.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={category.href}
                  className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors font-medium py-4"
                >
                  {category.name}
                  {category.subcategories && <ChevronDown className="h-4 w-4" />}
                </Link>

                {/* Dropdown Menu */}
                {category.subcategories && openDropdown === category.id && (
                  <div className="absolute top-full left-0 bg-card border border-border rounded-lg shadow-lg py-2 min-w-48 z-50">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={sub.href}
                        className="block px-4 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Regular Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5 text-foreground" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-card p-4 w-full sm:max-w-md">
                <SheetTitle className="font-serif text-xl text-card-foreground">Your Cart</SheetTitle>
                <div className="mt-6 flex flex-col h-[calc(100vh-120px)]">
                  {cartItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.plantId} className="flex gap-4 p-3 bg-muted rounded-lg">
                            <img
                              src={item.plantImage || "/placeholder.svg"}
                              alt={item.plantName}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-card-foreground truncate">{item.plantName}</h4>
                              <p className="text-xs text-muted-foreground">
                                {item.size.name} ({item.size.height})
                              </p>
                              <p className="text-xs text-muted-foreground">Pot: {item.pot.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDateRange(item.startDate, item.endDate)} ({item.rentalDays} days)
                              </p>
                              <p className="text-sm font-semibold text-primary">${item.totalPrice}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.plantId)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                              aria-label={`Remove ${item.plantName} from cart`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-border mt-4">
                        <p className="text-xs text-muted-foreground mb-3">* Pot included free with each plant rental</p>
                        <div className="flex justify-between font-semibold text-card-foreground mb-4">
                          <span>Total</span>
                          <span>${getCartTotal()}</span>
                        </div>
                        <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            Proceed to Checkout
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5 text-foreground" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-card w-full sm:max-w-sm">
                <SheetTitle className="font-serif text-xl text-card-foreground">Menu</SheetTitle>
                <div className="mt-8 flex flex-col gap-4">
                  {/* Categories in Mobile */}
                  {categories.map((category) => (
                    <div key={category.id}>
                      <Link
                        href={category.href}
                        className="text-lg font-medium text-card-foreground hover:text-primary transition-colors block"
                      >
                        {category.name}
                      </Link>
                      {category.subcategories && (
                        <div className="ml-4 mt-2 space-y-2">
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub.id}
                              href={sub.href}
                              className="text-muted-foreground hover:text-primary transition-colors block"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-border pt-4 mt-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="text-lg font-medium text-card-foreground hover:text-primary transition-colors block py-2"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
