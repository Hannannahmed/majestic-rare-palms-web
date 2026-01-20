"use client"

import { useState, useEffect, useMemo } from "react"
import { X, ShoppingBag, Check, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { useCart } from "@/context/cart-context"
import axiosInterceptor from "@/lib/axiosInterceptor"
import { ErrorToast } from "./global/ToastContainer"
import { useRouter } from "next/navigation"

const MIN_RENTAL_DAYS = 30

/* ================= CLIENT EXCEL INPUTS ================= */

const BASE_PRICE_PER_DAY = 5 // £5 (medium plant base)

const SIZE_META = {
  small: { id: "S", name: "Small", height: "60cm", adjust: -30 },
  medium: { id: "M", name: "Medium", height: "100cm", adjust: 0 },
  large: { id: "L", name: "Large", height: "150cm", adjust: 20 },
}

const POT_META = {
  basic: { id: "basic", name: "Basic Pot", color: "Black" },
  ceramic: { id: "ceramic", name: "Ceramic Pot", color: "White" },
  premium: { id: "premium", name: "Premium Pot", color: "Stone Grey" },
}

const TERM_DISCOUNT = [
  { months: 12, discount: 20 },
  { months: 6, discount: 10 },
]

const VOLUME_DISCOUNT_PERCENT = 15 // cell B2 → ×0.85
const PLANTS_PER_SLAB = 5

const ALLOWED_POSTCODES = ["SW", "SE", "NW", "E", "W"]

/* ================= HELPERS ================= */

function getTermDiscount(months: number) {
  if (months >= 12) return 20
  if (months >= 6) return 10
  return 0
}

function applyVolumeDiscount(price: number, qty: number) {
  if (qty <= 3) return price
  const slabs = Math.floor((qty - 3) / PLANTS_PER_SLAB)
  let p = price
  for (let i = 0; i < slabs; i++) {
    p *= (1 - VOLUME_DISCOUNT_PERCENT / 100) // ×0.85
  }
  return p
}
const ALLOWED_COUNTRIES = [
  "United Kingdom",
  "France",
  "Germany",
  "Netherlands",
]

/* ================= COMPONENT ================= */

export function ProductModal({ plant, isOpen, onClose }: any) {
  const router = useRouter()
  const { addToCart } = useCart()

  const [plantDetails, setPlantDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [country, setCountry] = useState("")
  const [bookedDates, setBookedDates] = useState<{ start: Date; end: Date }[]>([])


  const [size, setSize] = useState<"small" | "medium" | "large">("medium")
  const [pot, setPot] = useState<"basic" | "ceramic" | "premium">("basic")
  const [numPlants, setNumPlants] = useState(3)

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [installationDate, setInstallationDate] = useState<Date | null>(null)
  const [postcode, setPostcode] = useState("")
  const [isAdded, setIsAdded] = useState(false)
 useEffect(() => {
  if (!isOpen || !plant) return;

  setLoading(true);

  axiosInterceptor.get(`/plants/${plant.id}`).then(res => {
    const plant = res.data.data.plant;
    setPlantDetails(plant);

    // Booked ranges from backend
    const bookedRanges: { start: Date; end: Date }[] =
      plant.bookedDateRanges?.map((b: any) => ({
        start: new Date(b.start),
        end: new Date(b.end),
      })) || [];

    setBookedDates(bookedRanges);
    setLoading(false);
  });
}, [isOpen, plant]);


useEffect(() => {
  if (isOpen) {
    setIsAdded(false)
  }
}, [isOpen])



  /* -------- Rental days (NO extra day bug) -------- */
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    return Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  }, [startDate, endDate])

  const rentalMonths = Math.round(rentalDays / 30)

  /* ================= CLIENT EXCEL PRICING ================= */

  const pricing = useMemo(() => {
    if (rentalDays === 0) return { pricePerDay: 0, totalPrice: 0 }

    // 1️⃣ Base medium price
    let pricePerDay = BASE_PRICE_PER_DAY

    // 2️⃣ Size adjustment
    pricePerDay *= 1 + SIZE_META[size].adjust / 100

    // 3️⃣ Term discount
    pricePerDay *= 1 - getTermDiscount(rentalMonths) / 100

    // 4️⃣ Volume discount (successive)
    pricePerDay = applyVolumeDiscount(pricePerDay, numPlants)

    const totalPrice = Math.round(pricePerDay * rentalDays * numPlants)

    return {
      pricePerDay: Math.round(pricePerDay * 100) / 100,
      totalPrice,
    }
  }, [size, rentalDays, rentalMonths, numPlants])
  const isCountryValid = ALLOWED_COUNTRIES.includes(country)

  const canAddToCart =
    rentalDays >= MIN_RENTAL_DAYS &&
    numPlants >= 3 &&
    startDate &&
    endDate &&
    installationDate &&
    isCountryValid
  const handleAddToCart = async () => {
    if (!canAddToCart) {
      ErrorToast("Please complete all required fields")
      return
    }

    try {
      addToCart({
        plantId: plantDetails.id,
        plantName: plantDetails.name,
        plantImage: plantDetails.images?.[0] || "/placeholder.svg",

        startDate: startDate!.toISOString(),
        endDate: endDate!.toISOString(),
        rentalDays,

        pricePerDay: pricing.pricePerDay,
        totalPrice: pricing.totalPrice,
        numPlants,

        country,
        size: SIZE_META[size],
        pot: POT_META[pot],
      })

      setIsAdded(true)
    } catch (error: any) {
      ErrorToast(
        error?.response?.data?.message ||
        "Plant is already booked for the selected dates"
      )
    }
  }

  if (!isOpen) return null
  if (loading) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center">Loading…</div>

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-4xl w-full p-6 overflow-y-auto h-[500px]">

        <button onClick={onClose} className="absolute top-4 right-4"><X /></button>
        {/* PLANT HEADER */}
        <div className="flex gap-4 items-center mb-6">
          <img
            src={plantDetails?.images?.[0] || "/placeholder.svg"}
            alt={plantDetails?.name}
            className="w-28 h-28 object-cover rounded-lg border"
          />

          <div>
            <h2 className="text-2xl font-bold">{plantDetails?.name}</h2>
            <p className="text-sm text-muted-foreground">
              Choose size, quantity & rental period
            </p>
          </div>
        </div>

        <h3 className="font-semibold mb-2">Plant Size</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(Object.keys(SIZE_META) as any).map(s => (
            <button key={s} onClick={() => setSize(s)}
              className={`border p-3 rounded ${size === s && "border-primary ring-2"}`}>
              <p className="capitalize">{s}</p>
            </button>
          ))}
        </div>

        <input type="number" min={3} value={numPlants}
          onChange={e => setNumPlants(Number(e.target.value))}
          className="border p-2 w-full mb-4" />

        <h3 className="font-semibold mb-2 flex gap-2"><Calendar /> Rental Period</h3>
      <DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onDateRangeChange={(s, e) => {
    setStartDate(s)
    setEndDate(e)
  }}
  bookedDates={bookedDates}
/>



        <h3 className="font-semibold mt-4 mb-2 flex gap-2"><MapPin /> Installation</h3>
        <input type="date" className="border p-2 w-full mb-2"
          onChange={e => setInstallationDate(new Date(e.target.value))} />
        <select
          className="border p-2 w-full"
          value={country}
          onChange={e => setCountry(e.target.value)}
        >
          <option value="">Select Country</option>
          {ALLOWED_COUNTRIES.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>


        <div className="mt-6 border-t pt-4">
          <p>Total: <b>£{pricing.totalPrice}</b></p>
          <p className="text-sm text-muted-foreground">
            £{pricing.pricePerDay}/day • {rentalMonths} months
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <Button disabled={!canAddToCart || isAdded}
            onClick={handleAddToCart} className="flex-1">
            {isAdded ? <Check /> : <ShoppingBag />} Add to Basket
          </Button>
          {isAdded && (
            <>
              <Button variant="outline" onClick={onClose}>Review Basket</Button>
              <Button variant="ghost" onClick={onClose}>Continue Shopping</Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
