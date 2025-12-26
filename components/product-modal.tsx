"use client"

import { useState, useEffect, useMemo } from "react"
import { X, ShoppingBag, Check, Calendar } from "lucide-react"
import type { Plant } from "@/lib/data"
import { plantSizes, pots } from "@/lib/data"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"

/* ================= CONFIG ================= */

const MIN_RENTAL_DAYS = 3

const DISCOUNT_SLABS = [
  { days: 90, discount: 20 },
  { days: 60, discount: 15 },
  { days: 30, discount: 10 },
  { days: 14, discount: 5 },
]

/* ================= TYPES ================= */

interface ProductModalProps {
  plant: Plant | null
  isOpen: boolean
  onClose: () => void
}

/* ================= COMPONENT ================= */

export function ProductModal({ plant, isOpen, onClose }: ProductModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [selectedSize, setSelectedSize] = useState(plantSizes[0])
  const [selectedPot, setSelectedPot] = useState(pots[0])
  const [isAdded, setIsAdded] = useState(false)

  const { addToCart, getBookedDatesForPlant } = useCart()

  /* ================= EFFECTS ================= */

  useEffect(() => {
    if (isOpen) {
      setStartDate(null)
      setEndDate(null)
      setSelectedSize(plantSizes[0])
      setSelectedPot(pots[0])
      setIsAdded(false)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // ESC key close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  if (!isOpen || !plant) return null

  const bookedDates = getBookedDatesForPlant(plant.id)

  /* ================= LOGIC ================= */

  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    const diff = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
  }, [startDate, endDate])

  const discount = useMemo(() => {
    const slab = DISCOUNT_SLABS.find((s) => rentalDays >= s.days)
    return slab ? slab.discount : 0
  }, [rentalDays])

  const adjustedPricePerDay = Math.round(
    plant.pricePerDay * selectedSize.priceMultiplier
  )

  const basePrice = adjustedPricePerDay * rentalDays
  const totalPrice = Math.round(basePrice * (1 - discount / 100))

  const canAddToCart =
    startDate && endDate && rentalDays >= MIN_RENTAL_DAYS

const isDateRangeAvailable = () => {
  if (!startDate || !endDate) return false

  return !bookedDates.some((range) => {
    const bookedStart = new Date(range.start)
    const bookedEnd = new Date(range.end)

    // overlap check
    return (
      startDate <= bookedEnd &&
      endDate >= bookedStart
    )
  })
}

  /* ================= HANDLERS ================= */

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleAddToCart = () => {
    if (!canAddToCart) return

    if (!isDateRangeAvailable()) {
      alert("Selected dates are not available")
      return
    }

    addToCart({
      plantId: plant.id,
      plantName: plant.name,
      plantImage: plant.image,
      startDate: startDate!.toISOString(),
      endDate: endDate!.toISOString(),
      rentalDays,
      pricePerDay: adjustedPricePerDay,
      totalPrice,
      size: {
        id: selectedSize.id,
        name: selectedSize.name,
        height: selectedSize.height,
      },
      pot: {
        id: selectedPot.id,
        name: selectedPot.name,
        color: selectedPot.color,
      },
    })

    setIsAdded(true)
    setTimeout(onClose, 1000)
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-card/80 p-2 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2">
          <img
            src={plant.image || "/placeholder.svg"}
            alt={plant.name}
            className="w-full h-full object-cover"
          />

          <div className="p-6 overflow-y-auto">
            <h2 className="font-serif text-2xl font-bold mb-4">
              {plant.name}
            </h2>

            <p className="text-muted-foreground mb-6">
              {plant.fullDescription}
            </p>

            {/* SIZE */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">Select Size</label>
              <div className="grid grid-cols-3 gap-3">
                {plantSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 border-2 rounded-lg ${
                      selectedSize.id === size.id
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <span className="block font-medium">{size.name}</span>
                    <span className="text-xs">{size.height}</span>
                    <span className="block text-primary font-semibold">
                      ${Math.round(
                        plant.pricePerDay * size.priceMultiplier
                      )}/day
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* POT */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Select Pot (Free)
              </label>
              <div className="grid grid-cols-4 gap-3">
                {pots.map((pot) => (
                  <button
                    key={pot.id}
                    onClick={() => setSelectedPot(pot)}
                    className={`p-2 border-2 rounded-lg ${
                      selectedPot.id === pot.id
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <img
                      src={pot.image}
                      alt={pot.name}
                      className="rounded mb-1"
                    />
                    <span className="text-xs">{pot.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DATE */}
            <div className="mb-6">
              <label className="flex items-center gap-2 mb-2 font-medium">
                <Calendar className="h-4 w-4" />
                Rental Period
              </label>
              <DateRangePicker
                bookedDates={bookedDates}
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={handleDateRangeChange}
              />

              {rentalDays > 0 && (
                <p className="mt-2 text-sm">
                  {rentalDays} days
                  {discount > 0 && ` (${discount}% discount)`}
                </p>
              )}

              {rentalDays > 0 && rentalDays < MIN_RENTAL_DAYS && (
                <p className="text-sm text-destructive mt-1">
                  Minimum rental is {MIN_RENTAL_DAYS} days
                </p>
              )}
            </div>

            {/* PRICE */}
            {canAddToCart && (
              <div className="bg-muted p-4 rounded-lg mb-6">
                <div className="flex justify-between text-sm">
                  <span>
                    ${adjustedPricePerDay} × {rentalDays} days
                  </span>
                  <span>${basePrice}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Discount</span>
                    <span>- ${basePrice - totalPrice}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-lg border-t mt-2 pt-2">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart || isAdded}
              className="w-full py-6 text-lg"
            >
              {isAdded ? (
                <>
                  <Check className="mr-2 h-5 w-5" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

