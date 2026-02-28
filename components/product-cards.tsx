"use client"

import { useEffect, useState } from "react"
import type { Plant } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import axiosInterceptor from "@/lib/axiosInterceptor"

interface ProductCardsProps {
  onPlantClick: (plant: Plant) => void
  category?: string
}

function getCategoryTitle(category?: string): string {
  const titles: Record<string, string> = {
    indoor: "Indoor Plants",
    outdoor: "Outdoor Plants",
    bundles: "Plant Bundles",
    palms: "Palms Collection",
    bananas: "Banana Plants",
    individual: "Individual Plants",
  }
  return category ? titles[category] || "Featured Plants" : "Featured Plants"
}

export function ProductCards({ onPlantClick, category }: ProductCardsProps) {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true)
        const res = await axiosInterceptor.get("/plants")

        const apiPlants = res.data.data.plants.map((p: any) => ({
          id: p.id,
          name: p.name,
          image: p.images?.[0],
          shortDescription: p.description,
          fullDescription: p.description,
          category: p.category.toLowerCase(),
          subcategory: p.category.toLowerCase(),
          pricePerDay: p.rentPrice,
        }))

        setPlants(apiPlants)
      } catch (error) {
        console.error("Failed to fetch plants", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlants()
  }, [])

  const filteredPlants = category
    ? plants.filter(
      (p) => p.category === category || p.subcategory === category
    )
    : plants

  return (
    <section id="products" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {getCategoryTitle(category)}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {category
              ? `Showing ${filteredPlants.length} plant${filteredPlants.length !== 1 ? "s" : ""} in this category`
              : "Discover our handpicked collection of premium plants, perfect for any space"}
          </p>
          {category && (
            <a href="/#products" className="inline-block mt-4 text-primary hover:underline font-medium">
              View All Plants
            </a>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {loading ? (
  <div className="col-span-full flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
  </div>
          ) : ( 
            filteredPlants.length > 0 ? (
              filteredPlants.map((plant) => (
                <Card
                  key={plant.id}
                  className="group cursor-pointer overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card"
                  onClick={() => onPlantClick(plant)}
                >
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={plant.image || "/placeholder.svg"}
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
                    <span className="absolute top-3 left-3 bg-card/90 text-card-foreground text-xs font-medium px-2 py-1 rounded-full capitalize">
                      {plant.subcategory || plant.category}
                    </span>
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="inline-block bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-full">
                        View Details
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-serif text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                      {plant.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {plant.shortDescription}
                    </p>
                    <p className="text-primary font-semibold">
                      From £{plant.pricePerDay}/day
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No plants found in this category.</p>
                <a href="/#products" className="inline-block mt-4 text-primary hover:underline font-medium">
                  View All Plants
                </a>
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}
