"use client";

import { useState, useEffect, useMemo } from "react";
import { X, ShoppingBag, Check, Calendar, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { useCart } from "@/context/cart-context";
import axiosInterceptor from "@/lib/axiosInterceptor";
import { ErrorToast } from "./global/ToastContainer";
import { useRouter } from "next/navigation";

const MIN_RENTAL_DAYS = 30;
// const INSTALLATION_LEAD_DAYS = 1;
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
];

const SIZE_META = {
  small: { id: "S", name: "Small", height: "60cm", adjust: -30 },
  medium: { id: "M", name: "Medium", height: "100cm", adjust: 0 },
  large: { id: "L", name: "Large", height: "150cm", adjust: 20 },
};

const POT_META: any = {
  basic: {
    id: "basic",
    name: "Terracotta Clay Pot",
    color: "Terracotta",
    image: "/terracotta-clay-pot.jpg",
  },
  ceramic: {
    id: "ceramic",
    name: "White Ceramic Pot",
    color: "White",
    image: "/white-ceramic-pot.png",
  },
  premium: {
    id: "premium",
    name: "Natural Rattan Basket Pot",
    color: "Beige",
    image: "/natural-rattan-basket-pot.jpg",
  },
};

const PRICE_TABLE = {
  small: {
    "1": {
      "3": 4.4,
      "4-5": 3.7,
      "6-10": 3.2,
      "11-15": 2.7,
      "16-20": 2.3,
      "21-25": 1.9,
    },
    "1-3": {
      "3": 3.9,
      "4-5": 3.3,
      "6-10": 2.8,
      "11-15": 2.4,
      "16-20": 2.0,
      "21-25": 1.7,
    },
    "3-6": {
      "3": 3.5,
      "4-5": 3.0,
      "6-10": 2.5,
      "11-15": 2.1,
      "16-20": 1.8,
      "21-25": 1.6,
    },
    "6-12": {
      "3": 3.2,
      "4-5": 2.7,
      "6-10": 2.3,
      "11-15": 2.0,
      "16-20": 1.7,
      "21-25": 1.4,
    },
    "12-18": {
      "3": 2.9,
      "4-5": 2.5,
      "6-10": 2.1,
      "11-15": 1.8,
      "16-20": 1.5,
      "21-25": 1.3,
    },
    "18-24": {
      "3": 2.7,
      "4-5": 2.3,
      "6-10": 1.9,
      "11-15": 1.6,
      "16-20": 1.4,
      "21-25": 1.2,
    },
  },

  medium: {
    "1": {
      "3": 6.3,
      "4-5": 5.3,
      "6-10": 4.5,
      "11-15": 3.8,
      "16-20": 3.3,
      "21-25": 2.8,
    },
    "1-3": {
      "3": 5.5,
      "4-5": 4.7,
      "6-10": 4.0,
      "11-15": 3.4,
      "16-20": 2.9,
      "21-25": 2.4,
    },
    "3-6": {
      "3": 5.0,
      "4-5": 4.3,
      "6-10": 3.6,
      "11-15": 3.1,
      "16-20": 2.6,
      "21-25": 2.2,
    },
    "6-12": {
      "3": 4.6,
      "4-5": 3.9,
      "6-10": 3.3,
      "11-15": 2.8,
      "16-20": 2.4,
      "21-25": 2.0,
    },
    "12-18": {
      "3": 4.2,
      "4-5": 3.6,
      "6-10": 3.0,
      "11-15": 2.6,
      "16-20": 2.2,
      "21-25": 1.9,
    },
    "18-24": {
      "3": 3.8,
      "4-5": 3.2,
      "6-10": 2.7,
      "11-15": 2.3,
      "16-20": 2.0,
      "21-25": 1.7,
    },
  },

  large: {
    "1": {
      "3": 7.5,
      "4-5": 6.4,
      "6-10": 5.4,
      "11-15": 4.6,
      "16-20": 3.9,
      "21-25": 3.3,
    },
    "1-3": {
      "3": 6.6,
      "4-5": 5.6,
      "6-10": 4.8,
      "11-15": 4.1,
      "16-20": 3.4,
      "21-25": 2.9,
    },
    "3-6": {
      "3": 6.0,
      "4-5": 5.1,
      "6-10": 4.3,
      "11-15": 3.7,
      "16-20": 3.1,
      "21-25": 2.7,
    },
    "6-12": {
      "3": 5.5,
      "4-5": 4.7,
      "6-10": 4.0,
      "11-15": 3.4,
      "16-20": 2.9,
      "21-25": 2.4,
    },
    "12-18": {
      "3": 5.0,
      "4-5": 4.3,
      "6-10": 3.6,
      "11-15": 3.1,
      "16-20": 2.6,
      "21-25": 2.2,
    },
    "18-24": {
      "3": 4.6,
      "4-5": 3.9,
      "6-10": 3.3,
      "11-15": 2.8,
      "16-20": 2.4,
      "21-25": 2.0,
    },
  },
};
const BASE_PRICE = 5.0; // Change this one value → all prices update automatically

// Volume discount: each 5-plant slab gives 15% off
function getVolumeMultiplier(numPlants: number) {
  const slabs = Math.floor((numPlants - 1) / 5); // 1-5=0 slabs, 6-10=1 slab, etc.
  return Math.pow(0.85, slabs);
}

// Rental duration multiplier (from Excel Sheet3)
function getRentalMultiplier(months: number) {
  if (months <= 1) return 1.25;
  if (months <= 3) return 1.1;
  if (months <= 6) return 1.0;
  if (months <= 12) return 0.92;
  if (months <= 18) return 0.84;
  return 0.76;
}

// Size multiplier (from Excel Sheet3)
function getSizeMultiplier(size: "small" | "medium" | "large") {
  if (size === "small") return 0.7;
  if (size === "large") return 1.2;
  return 1.0;
}

function getLockedClientPrice(
  size: "small" | "medium" | "large",
  numPlants: number,
  months: number,
) {
  // ✅ 7 plants, 3-month slab (2–3 months allow)
  if (numPlants === 7 && months >= 2 && months <= 3) {
    if (size === "small") return 2.78;
    if (size === "medium") return 4.0;
    if (size === "large") return 4.8;
  }

  // safety fallback (never return 0 in prod)
  if (size === "small") return 2.78;
  if (size === "medium") return 4.0;
  if (size === "large") return 4.8;

  return 0;
}
function getMonthRange(months: number) {
  if (months <= 1) return "1";
  if (months <= 3) return "1-3";
  if (months <= 6) return "3-6";
  if (months <= 12) return "6-12"; // ✅ 12 stays here
  if (months > 12 && months <= 18) return "12-18"; // ✅ only >12
  return "18-24";
}

export function ProductModal({
  plant,
  isOpen,
  onClose,
  existingCartItem,
}: any) {
  const router = useRouter();
  const { addToCart, setIsCartOpen, isCartOpen, updateCartItem } = useCart();
  console.log(existingCartItem, "existingCartItem");
  const [plantDetails, setPlantDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [bookedDates, setBookedDates] = useState<
    { start: Date; end: Date; quantity: number; stock: number }[]
  >([]);
  console.log(bookedDates, "book-dates");
  const [size, setSize] = useState<keyof typeof PRICE_TABLE>("medium");

  const [pot, setPot] = useState<"basic" | "ceramic" | "premium">("basic");
  const [numPlants, setNumPlants] = useState(3);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  // const [installationDate, setInstallationDate] = useState<Date | null>(null);
  const [postcode, setPostcode] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  useEffect(() => {
    if (!existingCartItem && !startDate) {
      const defaultStart = new Date();
      defaultStart.setDate(defaultStart.getDate() + 14); // 14 din ahead default
      setStartDate(defaultStart);
    }
  }, [existingCartItem, startDate]);

  useEffect(() => {
    if (existingCartItem) {
      setSize(
        existingCartItem.size?.name?.toLowerCase() as
          | "small"
          | "medium"
          | "large",
      );

      setPot(existingCartItem.pot?.id);
      setNumPlants(existingCartItem.numPlants);
      setStartDate(new Date(existingCartItem.startDate));
      setEndDate(new Date(existingCartItem.endDate));
      setCounty(existingCartItem.county || "");
    }
  }, [existingCartItem]);
  const [error, SetError] = useState("");
  const [totalStock, setTotalStock] = useState(0);
  useEffect(() => {
    if (!isOpen || !plant) return;

    setLoading(true);

    axiosInterceptor.get(`/plants/${plant.id}`).then((res) => {
      const plantData = res.data.data.plant;
      setPlantDetails(plantData);

      const bookedRanges =
        plantData.bookedDateRanges?.map((b: any) => ({
          start: new Date(b.start),
          end: new Date(b.end),
          quantity: b.quantity,
        })) || [];

      setBookedDates(bookedRanges);

      // ✅ TOTAL BOOKED STOCK CALCULATE
      const totalBooked = bookedRanges.reduce(
        (sum: number, booking: any) => sum + booking.quantity,
        0,
      );

      setTotalStock(totalBooked);

      console.log("Total Booked:", totalBooked);

      // ✅ CHECK IF OVERBOOKED
      if (totalBooked > plantData.stock) {
        SetError("Booked quantity exceeds available stock!");
      } else {
        SetError("");
      }

      setLoading(false);
    });
  }, [isOpen, plant]);

  useEffect(() => {
    if (isOpen) {
      setIsAdded(false);
    }
  }, [isOpen]);

  // ✅ EARLIEST selectable rental start date
  // const EARLIEST_START_DATE = useMemo(() => {
  //   const d = new Date();
  //   d.setDate(d.getDate() + INSTALLATION_LEAD_DAYS);
  //   return d;
  // }, []);

  function getBasePricePerDay(numPlants: number) {
    if (numPlants >= 15) return 4.7;
    if (numPlants >= 10) return 5.2;
    if (numPlants >= 5) return 5.7;
    return 6.2;
  }

  /* -------- Rental days (NO extra day bug) -------- */
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;

    const utcStart = Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    );

    const utcEnd = Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
    );

    const diffDays = (utcEnd - utcStart) / (1000 * 60 * 60 * 24);

    return diffDays;
  }, [startDate, endDate]);

  function getCalendarMonths(start: Date, end: Date) {
    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const startDay = start.getDate();

    const endYear = end.getFullYear();
    const endMonth = end.getMonth();
    const endDay = end.getDate();

    let months = (endYear - startYear) * 12 + (endMonth - startMonth);

    // agar end day start day se kam hai to full month complete nahi hua
    if (endDay < startDay) {
      months -= 1;
    }

    return Math.max(1, months);
  }
  const rentalMonths =
    startDate && endDate ? getCalendarMonths(startDate, endDate) : 0;

  function getPlantRange(numPlants: number) {
    if (numPlants === 3) return "3";
    if (numPlants <= 5) return "4-5";
    if (numPlants <= 10) return "6-10";
    if (numPlants <= 15) return "11-15";
    if (numPlants <= 20) return "16-20";
    return "21-25";
  }
  function getRentalMultiplier(months: number) {
    if (months === 1) return 1.25;
    if (months > 1 && months <= 3) return 1.1;
    if (months > 3 && months <= 6) return 1.0;
    if (months > 6 && months <= 12) return 0.92;
    if (months > 12 && months <= 18) return 0.84;
    return 0.76;
  }
  function getVolumeMultiplier(numPlants: number) {
    if (numPlants <= 3) return Math.pow(0.85, 0); // 1.0
    if (numPlants <= 5) return Math.pow(0.85, 1); // 0.85
    if (numPlants <= 10) return Math.pow(0.85, 2); // 0.7225
    if (numPlants <= 15) return Math.pow(0.85, 3); // 0.614125
    if (numPlants <= 20) return Math.pow(0.85, 4); // 0.52200625
    return Math.pow(0.85, 5); // 0.443705...
  }
  function getSizeMultiplier(size: "small" | "medium" | "large") {
    if (size === "small") return 0.7;
    if (size === "large") return 1.2;
    return 1;
  }
  function calculatePrice({
    size,
    numPlants,
    rentalDays,
    rentalMonths,
  }: {
    size: "small" | "medium" | "large";
    numPlants: number;
    rentalDays: number;
    rentalMonths: number;
  }) {
    if (!rentalDays || !rentalMonths) {
      return { pricePerDay: 0, total: 0, monthlyEquivalent: "£0" };
    }

    const rentalMult = getRentalMultiplier(rentalMonths);
    const volumeMult = getVolumeMultiplier(numPlants);
    const sizeMult = getSizeMultiplier(size);

    const pricePerPlantPerDay = BASE_PRICE * rentalMult * volumeMult * sizeMult;
    const total = pricePerPlantPerDay * numPlants * rentalDays;

    return {
      pricePerDay: pricePerPlantPerDay.toFixed(1),
      total: Number(total.toFixed(2)),
      monthlyEquivalent: `£${(total / rentalMonths).toFixed(2)}`,
      breakdown: [
        `Base price: £${BASE_PRICE}`,
        `Size (${size}): ×${sizeMult}`,
        `Volume (${numPlants} plants): ×${volumeMult.toFixed(4)}`,
        `Rental term (${rentalMonths} mo): ×${rentalMult}`,
        `Price per plant/day: £${pricePerPlantPerDay.toFixed(1)}`,
        `Total: £${pricePerPlantPerDay.toFixed(1)} × ${numPlants} plants × ${rentalDays} days`,
      ],
    };
  }
  const pricing = useMemo(() => {
    return calculatePrice({ size, numPlants, rentalDays, rentalMonths });
  }, [size, numPlants, rentalDays, rentalMonths]);

  const [county, setCounty] = useState("");
  const isCountyValid = ALLOWED_COUNTIES.includes(county);

  const canAddToCart =
    rentalDays >= MIN_RENTAL_DAYS &&
    numPlants >= 3 &&
    startDate &&
    endDate &&
    county;

  const handleAddToCart = async () => {
    if (!county) {
      ErrorToast("Please select county");
      return;
    }
    if (!canAddToCart) {
      ErrorToast("Please complete all required fields");
      return;
    }
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      const newItem = {
        plantId: plantDetails.id,
        plantName: plantDetails.name,
        plantImage: plantDetails.images?.[0] || "/placeholder.svg",

        startDate: startDate!.toISOString(),
        endDate: endDate!.toISOString(),
        rentalDays,

        pricePerDay: pricing.pricePerDay,
        totalPrice: pricing.total, // ✅ NUMBER

        numPlants,
        county,
        size: SIZE_META[size],
        pot: POT_META[pot],
      };
      if (existingCartItem) {
        await updateCartItem(existingCartItem.plantId, newItem);
      } else {
        await addToCart(newItem);
      }
      setIsAdded(true);
    } catch (error: any) {
      ErrorToast(
        error?.response?.data?.message ||
          "Plant is already booked for the selected dates",
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (!isOpen) return null;
  if (loading)
    return (
      <div className="fixed inset-0 bg-white/50 flex items-center justify-center">
        <div className="col-span-full flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-4xl w-full p-6 overflow-y-auto h-[500px]">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X />
        </button>
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
          {(Object.keys(SIZE_META) as Array<keyof typeof SIZE_META>).map(
            (s) => (
              <button
                key={String(s)}
                onClick={() => setSize(s)}
                className={`border p-3 rounded ${
                  size === s ? "border-primary ring-2" : ""
                }`}
              >
                <p className="capitalize">{s}</p>
              </button>
            ),
          )}
        </div>

        <h3 className="font-semibold mb-2">Pot Type</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(
            Object.entries(POT_META) as [
              "basic" | "ceramic" | "premium",
              (typeof POT_META)["basic"],
            ][]
          ).map(([p, meta]) => (
            <button
              key={p}
              onClick={() => setPot(p)}
              className={`border rounded-lg p-2 flex flex-col items-center justify-center ${
                pot === p ? "border-primary ring-2" : ""
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

        <input
          type="number"
          min={3}
          value={numPlants}
          onChange={(e) => setNumPlants(Number(e.target.value))}
          className="border p-2 w-full mb-4"
        />

        <h3 className="font-semibold mb-2 flex gap-2">
          <Calendar /> Rental Period
        </h3>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
          bookedDates={bookedDates}
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {/* <h3 className="font-semibold mt-4 mb-2 flex gap-2">
          <MapPin /> Installation
        </h3>
        <input
          type="date"
          className="border p-2 w-full mb-2"
          min={
            startDate
              ? new Date(
                  startDate.getTime() + INSTALLATION_LEAD_DAYS * 86400000,
                )
                  .toISOString()
                  .split("T")[0]
              : undefined
          }
          value={installationDate?.toISOString().split("T")[0] || ""}
          onChange={(e) => setInstallationDate(new Date(e.target.value))}
        /> */}

        <select
          className="border p-2 w-full mt-4"
          value={county}
          onChange={(e) => setCounty(e.target.value)}
        >
          <option value="">Select County</option>
          {ALLOWED_COUNTIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="mt-6 border-t pt-4">
          <p>
            Total: <b>£{pricing.total}</b>
          </p>
          <p className="text-sm text-muted-foreground">
            £{pricing.pricePerDay}/day • {rentalMonths} months
          </p>
        </div>
        <div className="mt-2 mb-4 text-sm text-muted-foreground">
          <p className="font-semibold">Price breakdown:</p>
          {pricing?.breakdown && pricing.breakdown.length > 0 && (
            <ul className="list-disc ml-5">
              {pricing.breakdown.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          )}
          <p className="mt-1">
            Monthly equivalent: {pricing.monthlyEquivalent}/month
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <Button
            disabled={!canAddToCart || isAdded || isAddingToCart}
            onClick={handleAddToCart}
            className="flex-1"
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="animate-spin" /> Adding...
              </>
            ) : isAdded ? (
              <>
                <Check /> Added
              </>
            ) : (
              <>
                <ShoppingBag /> Add to Basket
              </>
            )}
          </Button>
          {isAdded && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCartOpen(true);
                  onClose();
                }}
              >
                Review Basket
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Continue Shopping
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
