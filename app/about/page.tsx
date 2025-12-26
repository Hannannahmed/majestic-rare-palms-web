"use client"

import { Navbar } from "@/components/navbar"
import { CartProvider } from "@/context/cart-context"
import { Leaf, Truck, Recycle, Users } from "lucide-react"

const values = [
  {
    icon: Leaf,
    title: "Sustainable Practices",
    description: "We believe in eco-friendly plant rental that reduces waste and promotes green living.",
  },
  {
    icon: Truck,
    title: "Professional Delivery",
    description: "Our team ensures safe delivery and installation of your plants within 2 weeks of booking.",
  },
  {
    icon: Recycle,
    title: "Circular Economy",
    description: "Rent, return, and reuse - our plants go through proper care between rentals.",
  },
  {
    icon: Users,
    title: "Expert Care",
    description: "Our horticulturists maintain every plant to ensure they arrive healthy and vibrant.",
  },
]

export default function AboutPage() {
  return (
    <CartProvider>
      <main className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">About Us</h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              At Bloom & Rent, we believe everyone deserves to enjoy the beauty of plants without the long-term
              commitment. Whether you are hosting an event, decorating your office, or simply want to try before you
              buy, we have got you covered.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2020, Bloom & Rent started with a simple idea: make plant ownership flexible and accessible
                  to everyone. What began as a small operation from a backyard greenhouse has grown into a thriving
                  plant rental service.
                </p>
                <p>
                  We noticed that many people loved plants but hesitated due to commitment fears, space constraints, or
                  simply not knowing how to care for them. Our rental model solves all these problems.
                </p>
                <p>
                  Today, we serve hundreds of happy customers, from corporate offices to wedding venues, helping them
                  bring nature indoors without the hassle.
                </p>
              </div>
            </div>
            <div className="relative">
              <img src="/greenhouse-with-beautiful-plants.jpg" alt="Our greenhouse" className="rounded-2xl shadow-xl w-full" />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground text-center mb-12">Our Values</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div key={value.title} className="bg-card p-6 rounded-xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-card-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Bring Nature Indoors?
            </h2>
            <p className="text-muted-foreground mb-8">
              Browse our collection and start your plant rental journey today.
            </p>
            <a
              href="/"
              className="inline-flex items-center bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              Explore Plants
            </a>
          </div>
        </section>
      </main>
    </CartProvider>
  )
}
