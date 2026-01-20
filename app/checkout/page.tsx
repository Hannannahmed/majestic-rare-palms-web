"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ArrowLeft, Truck, Check, AlertCircle } from "lucide-react"
import { CartProvider, useCart } from "@/context/cart-context"
import { Navbar } from "@/components/navbar"
import { ErrorToast } from "@/components/global/ToastContainer"

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
  const [selectedCounty, setSelectedCounty] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)

  // Customer info state
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zip, setZip] = useState("")
  const [country, setCountry] = useState("Pakistan")

  const canCheckout = cartItems.length > 0 && selectedCounty

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
    return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`
  }

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !phone || !address || !city || !state || !zip || !country) return

    setIsSubmitting(true)

    const payload = {
      customerInfo: {
        fullName,
        email,
        phone,
        address: {
          fullAddress: address,
          city,
          state,
          zip,
          country,
        },
      },
      items: cartItems.map((item) => ({
        plantId: item.plantId,
        startDate: item.startDate,
        endDate: item.endDate,
      })),
    }

    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Checkout failed")

      clearCart()
      setShowCustomerForm(false)
      setIsComplete(true)
    } catch (err) {
      console.error(err)
      ErrorToast("Checkout failed, please try again")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-serif text-3xl font-bold mb-4">Order Confirmed!</h2>
          <p className="text-muted-foreground mb-4">
            Thank you for your order. We will deliver and install your plants within 2 weeks.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6 flex items-center gap-3 text-primary">
            <Truck className="h-5 w-5" /> Delivery & Installation included
          </div>
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some plants to your cart to continue.</p>
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse Plants</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="py-8 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>

        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.plantId} className="flex gap-4 p-4 bg-muted rounded-lg">
                    <img
                      src={item.plantImage || "/placeholder.svg"}
                      alt={item.plantName}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.plantName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size?.name} ({item.size?.height})
                      </p>
                      <p className="text-sm text-muted-foreground">Pot: {item.pot?.name} (Free)</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateRange(item.startDate, item.endDate)} ({item.rentalDays} days)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-primary">£ {item.totalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <Truck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Delivery & Installation</p>
                <p className="text-sm text-muted-foreground">
                  Your plants will be delivered and professionally installed within 2 weeks of your order confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Checkout / Modal Trigger */}
          <div className="lg:col-span-1">
            <Sheet open={showCustomerForm} onOpenChange={setShowCustomerForm}>
              <SheetTrigger asChild>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
                  disabled={!canCheckout}
                >
                  Proceed to Checkout
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-card p-6 w-full sm:max-w-md">
                <SheetTitle className="font-serif text-xl mb-4">Customer Information</SheetTitle>
                <form className="space-y-3" onSubmit={handleCustomerSubmit}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-background"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-background"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-background"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-background"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-background"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-background"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ZIP / Postal Code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-background"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-background"
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Complete Order"}
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
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
