"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { HeroSlider } from "@/components/hero-slider"
import { ProductCards } from "@/components/product-cards"
import { ProductModal } from "@/components/product-modal"
import { CartProvider } from "@/context/cart-context"
import type { Plant } from "@/lib/data"

export default function Home() {
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const searchParams = useSearchParams()
  const filter = searchParams.get("filter") || undefined

  const handlePlantClick = (plant: Plant) => {
    setSelectedPlant(plant)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPlant(null)
  }

  return (
    <CartProvider>
      <main className="min-h-screen bg-background">
        <Navbar />
        <HeroSlider />
        <ProductCards onPlantClick={handlePlantClick} category={filter} />
        <ProductModal plant={selectedPlant} isOpen={isModalOpen} onClose={handleCloseModal} />
      </main>
    </CartProvider>
  )
}
