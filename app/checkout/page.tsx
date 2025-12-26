"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { CartProvider, useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Truck, Check, AlertCircle } from "lucide-react"

const serviceCounties = [
  "Greater London",
  "Surrey",
  "Kent",
  "Essex",
  "Hertfordshire",
  "Berkshire",
  "Buckinghamshire",
  "Oxfordshire",
]

function CheckoutContent() {
  const { cartItems, getCartTotal, clearCart } = useCart()
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [confirmedCounty, setConfirmedCounty] = useState(false)
  const [selectedCounty, setSelectedCounty] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
    return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`
  }

  const canCheckout = cartItems.length > 0 && agreedToTerms && confirmedCounty && selectedCounty

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCheckout) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsComplete(true)
      clearCart()
    }, 2000)
  }

  if (isComplete) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Order Confirmed!</h2>
          <p className="text-muted-foreground mb-4">
            Thank you for your order. We will deliver and install your plants within 2 weeks.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3 text-primary">
              <Truck className="h-5 w-5" />
              <span className="font-medium">Installation within 2 weeks</span>
            </div>
          </div>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some plants to your cart to continue.</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse Plants</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="py-8 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-card-foreground mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.plantId} className="flex gap-4 p-4 bg-muted rounded-lg">
                    <img
                      src={item.plantImage || "/placeholder.svg"}
                      alt={item.plantName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-card-foreground">{item.plantName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size.name} ({item.size.height})
                      </p>
                      <p className="text-sm text-muted-foreground">Pot: {item.pot.name} (Free)</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateRange(item.startDate, item.endDate)} ({item.rentalDays} days)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-primary">${item.totalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <Truck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">Delivery & Installation</p>
                <p className="text-sm text-muted-foreground">
                  Your plants will be delivered and professionally installed within 2 weeks of your order confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Payment & Confirmation */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="font-serif text-xl font-semibold text-card-foreground mb-6">Confirm Order</h2>

              <div className="mb-6">
                <label htmlFor="county" className="block text-sm font-medium text-card-foreground mb-2">
                  Select Your County
                </label>
                <select
                  id="county"
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose a county...</option>
                  {serviceCounties.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedCounty}
                    onChange={(e) => setConfirmedCounty(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    I confirm that my delivery location is within the service area (
                    {selectedCounty || "selected county"})
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Warnings */}
              {(!agreedToTerms || !confirmedCounty || !selectedCounty) && (
                <div className="bg-muted p-3 rounded-lg mb-6 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Please select your county and agree to the terms to proceed with checkout.
                  </p>
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Subtotal</span>
                  <span>${getCartTotal()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Delivery & Installation</span>
                  <span className="text-primary">FREE</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                  <span>Pots</span>
                  <span className="text-primary">FREE</span>
                </div>
                <div className="flex justify-between font-semibold text-lg text-card-foreground">
                  <span>Total</span>
                  <span>${getCartTotal()}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!canCheckout || isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Complete Order"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <main className="min-h-screen bg-background">
        <Navbar />
        <CheckoutContent />
      </main>
    </CartProvider>
  )
}
