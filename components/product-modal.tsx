"use client"

import { useState, useEffect, useMemo } from "react"
import { X, ShoppingBag, Check, Calendar } from "lucide-react"
import type { Plant } from "@/lib/data"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import axiosInterceptor from "@/lib/axiosInterceptor"

const MIN_RENTAL_DAYS = 3
const DISCOUNT_SLABS = [
  { days: 90, discount: 20 },
  { days: 60, discount: 15 },
  { days: 30, discount: 10 },
  { days: 14, discount: 5 },
]

interface ProductModalProps {
  plant: Plant | null
  isOpen: boolean
  onClose: () => void
}

interface APIRange {
  start: string
  end: string
}

export function ProductModal({ plant, isOpen, onClose }: ProductModalProps) {
  const [plantDetails, setPlantDetails] = useState<Plant | null>(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isAdded, setIsAdded] = useState(false)

  const { addToCart } = useCart()

  useEffect(() => {
    if (isOpen) {
      setStartDate(null)
      setEndDate(null)
      setIsAdded(false)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  useEffect(() => {
    if (!isOpen || !plant) return

    const fetchPlant = async () => {
      setLoading(true)
      try {
        const res = await axiosInterceptor.get(`/plants/${plant.id}`)
        const p = res.data.data.plant

       
        const bookedRanges: { start: Date; end: Date }[] = (p.bookedDateRanges || []).map(
          (r: APIRange) => ({ start: new Date(r.start), end: new Date(r.end) })
        )

        setPlantDetails({
          id: p.id,
          name: p.name,
          image: p.images?.[0] || "/placeholder.svg",
          shortDescription: p.description,
          fullDescription: p.description,
          category: p.category.toLowerCase(),
          subcategory: p.category.toLowerCase(),
          pricePerDay: p.rentPrice,
          specifications: p.specifications,
          bookedDateRanges: p.bookedDateRanges || [],
        })
      } catch (err) {
        console.error("Failed to fetch plant details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlant()
  }, [isOpen, plant])

  const bookedDates = (plantDetails?.bookedDateRanges || []).map(r => ({
    start: new Date(r.start),
    end: new Date(r.end),
  }))

  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    const diff = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
  }, [startDate, endDate])

  const discount = useMemo(() => {
    const slab = DISCOUNT_SLABS.find((s) => rentalDays >= s.days)
    return slab ? slab.discount : 0
  }, [rentalDays])

  if (!isOpen) return null

  if (loading || !plantDetails) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-card p-6 rounded-lg">Loading...</div>
      </div>
    )
  }

  const adjustedPricePerDay = plantDetails.pricePerDay
  const basePrice = adjustedPricePerDay * rentalDays
  const totalPrice = Math.round(basePrice * (1 - discount / 100))
  const canAddToCart = startDate && endDate && rentalDays >= MIN_RENTAL_DAYS

  const isDateRangeAvailable = () => {
    if (!startDate || !endDate) return false
    return !bookedDates.some((range) => startDate <= range.end && endDate >= range.start)
  }

  const handleAddToCart = () => {
  if (!canAddToCart) return
  if (!isDateRangeAvailable()) {
    alert("Selected dates are not available")
    return
  }

  addToCart({
    plantId: plantDetails.id,
    plantName: plantDetails.name,
    plantImage: plantDetails.image!,
    startDate: startDate!.toISOString(),
    endDate: endDate!.toISOString(),
    rentalDays,
    pricePerDay: adjustedPricePerDay,
    totalPrice,
    size: null,
    pot: null,
  })

  setIsAdded(true)
  setTimeout(onClose, 1000)
}

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 bg-card/80 p-2 rounded-full z-10">
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2 overflow-y-auto p-6 gap-6 flex-1">
          {/* Plant Image */}
          <img src={plantDetails.image} alt={plantDetails.name} className="w-full h-full object-cover rounded-xl" />

          {/* Details */}
          <div className="flex flex-col">
            <h2 className="font-serif text-2xl font-bold mb-4">{plantDetails.name}</h2>
            <p className="text-muted-foreground mb-4">{plantDetails.fullDescription}</p>

            {/* Specifications */}
            {plantDetails.specifications && (
              <div className="mb-6 border-t border-border pt-4">
                <h3 className="font-medium mb-2">Specifications:</h3>
                <ul className="text-sm text-card-foreground space-y-1">
                  <li>Height: {plantDetails.specifications.height} cm</li>
                  <li>Pot Size: {plantDetails.specifications.potSize} cm</li>
                  <li>Light: {plantDetails.specifications.lightRequirement}</li>
                  <li>Watering: {plantDetails.specifications.wateringFrequency}</li>
                </ul>
              </div>
            )}

            {/* Date Picker */}
            <div className="mb-6">
              <label className="flex items-center gap-2 mb-2 font-medium">
                <Calendar className="h-4 w-4" /> Rental Period
              </label>
              <DateRangePicker
                bookedDates={bookedDates}
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={handleDateRangeChange}
              />

              {rentalDays > 0 && (
                <p className="mt-2 text-sm">
                  {rentalDays} days {discount > 0 && `(${discount}% discount)`}
                </p>
              )}

              {rentalDays > 0 && rentalDays < MIN_RENTAL_DAYS && (
                <p className="text-sm text-destructive mt-1">Minimum rental is {MIN_RENTAL_DAYS} days</p>
              )}
            </div>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="p-6 border-t border-border bg-background sticky bottom-0">
          <div className="flex justify-between mb-2 text-sm">
            <span>${adjustedPricePerDay} × {rentalDays} days</span>
            <span>${basePrice}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-primary mb-2">
              <span>Discount</span>
              <span>- ${basePrice - totalPrice}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg mb-4">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>

          <Button onClick={handleAddToCart} disabled={!canAddToCart || isAdded} className="w-full py-4 text-lg">
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
  )
}
