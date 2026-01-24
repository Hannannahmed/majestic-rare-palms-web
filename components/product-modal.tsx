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
const INSTALLATION_LEAD_DAYS = 14 // client-controllable

/* ================= CLIENT EXCEL INPUTS ================= */
/* ================= CLIENT EXCEL INPUTS ================= */
const ALLOWED_COUNTIES = [
  "Kent",
  "Essex",
  "Surrey",
  "London",
  "Greater London",
  "Oxfordshire",
  "Berkshire",
  "Hertfordshire",
  "Bedfordshire",
  "Cambridgeshire",
]


const SIZE_META = {
  small: { id: "S", name: "Small", height: "60cm", adjust: -30 },
  medium: { id: "M", name: "Medium", height: "100cm", adjust: 0 },
  large: { id: "L", name: "Large", height: "150cm", adjust: 20 },
}

const POT_META: any = {
  basic: { id: "basic", name: "Terracotta Clay Pot", color: "Terracotta", image: "/terracotta-clay-pot.jpg" },
  ceramic: { id: "ceramic", name: "White Ceramic Pot", color: "White", image: "/white-ceramic-pot.png" },
  premium: { id: "premium", name: "Natural Rattan Basket Pot", color: "Beige", image: "/natural-rattan-basket-pot.jpg" },
}

const PRICE_TABLE = {
  medium: {
    "1-3": { "1-5": 5.3, "6-10": 4.5, "11-15": 3.8, "16-20": 3.3, "21-25": 2.8 },
    "3-6": { "1-5": 4.7, "6-10": 4.0, "11-15": 3.4, "16-20": 2.9, "21-25": 2.4 },
    "6-12": { "1-5": 4.3, "6-10": 3.6, "11-15": 3.0, "16-20": 2.6, "21-25": 2.0 },
    "12-18": { "1-5": 3.8, "6-10": 3.2, "11-15": 2.7, "16-20": 2.3, "21-25": 1.7 },
    "18-24": { "1-5": 3.3, "6-10": 2.7, "11-15": 2.2, "16-20": 1.8, "21-25": 1.2 },
  },
  small: {
    "1-3": { "1-5": 3.9, "6-10": 3.3, "11-15": 2.8, "16-20": 2.3, "21-25": 1.9 },
    "3-6": { "1-5": 3.5, "6-10": 3.0, "11-15": 2.5, "16-20": 2.0, "21-25": 1.7 },
    "6-12": { "1-5": 3.2, "6-10": 2.7, "11-15": 2.3, "16-20": 1.8, "21-25": 1.4 },
    "12-18": { "1-5": 2.7, "6-10": 2.3, "11-15": 1.8, "16-20": 1.5, "21-25": 1.2 },
    "18-24": { "1-5": 2.2, "6-10": 1.8, "11-15": 1.4, "16-20": 1.1, "21-25": 0.8 },
  },
  large: {
    "1-3": { "1-5": 6.5, "6-10": 5.4, "11-15": 4.6, "16-20": 3.9, "21-25": 3.3 },
    "3-6": { "1-5": 5.8, "6-10": 5.1, "11-15": 4.3, "16-20": 3.7, "21-25": 2.9 },
    "6-12": { "1-5": 5.0, "6-10": 4.3, "11-15": 3.7, "16-20": 3.1, "21-25": 2.7 },
    "12-18": { "1-5": 4.5, "6-10": 3.9, "11-15": 3.3, "16-20": 2.8, "21-25": 2.4 },
    "18-24": { "1-5": 4.0, "6-10": 3.3, "11-15": 2.8, "16-20": 2.4, "21-25": 2.0 },
  },
}
function getPlantRange(num: number) {
  if (num <= 5) return "1-5"
  if (num <= 10) return "6-10"
  if (num <= 15) return "11-15"
  if (num <= 20) return "16-20"
  return "21-25"
}

function getMonthRange(months: number) {
  if (months <= 3) return "1-3"
  if (months <= 6) return "3-6"
  if (months <= 12) return "6-12"
  if (months <= 18) return "12-18"
  return "18-24"
}

function getMediumPrice(numPlants: number, months: number) {
  // Client / Excel confirmed case
  if (numPlants === 7 && months === 3) return 4.5

  // fallback (jab tak full table nahi aata)
  return 4.5
}

function applySizeFromMedium(
  mediumPrice: number,
  size: "small" | "medium" | "large"
) {
  if (size === "small") return mediumPrice - 1.6
  if (size === "large") return mediumPrice + 0.6
  return mediumPrice
}

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
    if (!startDate) {
      setInstallationDate(null)
      return
    }

    const minInstallDate = new Date(startDate)
    minInstallDate.setDate(minInstallDate.getDate() + INSTALLATION_LEAD_DAYS)

    if (!installationDate || installationDate < minInstallDate) {
      setInstallationDate(minInstallDate)
    }
  }, [startDate])

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


  // ✅ EARLIEST selectable rental start date
  const EARLIEST_START_DATE = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + INSTALLATION_LEAD_DAYS)
    return d
  }, [])
  function getBasePricePerDay(numPlants: number) {
    if (numPlants >= 15) return 4.7
    if (numPlants >= 10) return 5.2
    if (numPlants >= 5) return 5.7
    return 6.2
  }

  /* -------- Rental days (NO extra day bug) -------- */
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    return Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  }, [startDate, endDate])

  const rentalMonths = Math.ceil(rentalDays / 30)

  const pricing = useMemo(() => {
    if (rentalDays === 0)
      return { pricePerDay: 0, totalPrice: 0, breakdown: [], monthlyEquivalent: "0.00" }

    const plantRange = getPlantRange(numPlants)
    const monthRange = getMonthRange(rentalMonths)

    const pricePerDay =
      PRICE_TABLE[size][monthRange][plantRange]

    const totalPrice = Math.round(pricePerDay * rentalDays * numPlants)

    return {
      pricePerDay,
      totalPrice,
      breakdown: [
        `Excel lookup → ${size}, ${plantRange} plants, ${monthRange} months`,
      ],
      monthlyEquivalent: (totalPrice / rentalMonths).toFixed(2),
    }
  }, [size, rentalDays, rentalMonths, numPlants])




  const [county, setCounty] = useState("")
  const isCountyValid = ALLOWED_COUNTIES.includes(county)

  const canAddToCart =
    rentalDays >= MIN_RENTAL_DAYS &&
    numPlants >= 3 &&
    startDate &&
    endDate &&
    isCountyValid


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
          {(Object.keys(SIZE_META) as Array<keyof typeof SIZE_META>).map((s) => (
            <button
              key={String(s)}
              onClick={() => setSize(s)}
              className={`border p-3 rounded ${size === s ? "border-primary ring-2" : ""
                }`}
            >
              <p className="capitalize">{s}</p>
            </button>
          ))}
        </div>


        <h3 className="font-semibold mb-2">Pot Type</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(Object.entries(POT_META) as [
            "basic" | "ceramic" | "premium",
            (typeof POT_META)["basic"]
          ][]).map(([p, meta]) => (
            <button
              key={p}
              onClick={() => setPot(p)}
              className={`border rounded-lg p-2 flex flex-col items-center justify-center ${pot === p ? "border-primary ring-2" : ""
                }`}
            >
              <img
                src={meta.image}
                alt={meta.name}
                className="w-20 h-20 object-cover mb-1 rounded"
              />
              <span className="text-sm text-center">{meta.name}</span>
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
          minStartDate={EARLIEST_START_DATE} // ✅ YEH ZAROORI
        />




        <h3 className="font-semibold mt-4 mb-2 flex gap-2"><MapPin /> Installation</h3>
        <input
          type="date"
          className="border p-2 w-full mb-2"
          min={
            startDate
              ? new Date(
                startDate.getTime() + INSTALLATION_LEAD_DAYS * 86400000
              ).toISOString().split("T")[0]
              : undefined
          }
          value={installationDate?.toISOString().split("T")[0] || ""}
          onChange={e => setInstallationDate(new Date(e.target.value))}
        />


        <select
          className="border p-2 w-full"
          value={county}
          onChange={e => setCounty(e.target.value)}
        >
          <option value="">Select County</option>
          {ALLOWED_COUNTIES.map(c => (
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
        <div className="mt-2 mb-4 text-sm text-muted-foreground">
          <p className="font-semibold">Price breakdown:</p>
          <ul className="list-disc ml-5">
            {pricing.breakdown.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
          <p className="mt-1">
            Monthly equivalent: £{pricing.monthlyEquivalent}/month
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
