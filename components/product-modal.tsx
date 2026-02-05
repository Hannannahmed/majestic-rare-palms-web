"use client";

import { useState, useEffect, useMemo } from "react";
import { X, ShoppingBag, Check, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { useCart } from "@/context/cart-context";
import axiosInterceptor from "@/lib/axiosInterceptor";
import { ErrorToast } from "./global/ToastContainer";
import { useRouter } from "next/navigation";

const MIN_RENTAL_DAYS = 30;
const INSTALLATION_LEAD_DAYS = 14;
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
      "3": 3.9,
      "4-5": 3.3,
      "6-10": 2.8,
      "11-15": 2.4,
      "16-20": 2.1,
      "21-25": 1.7,
    },
    "1-3": {
      "3": 3.5,
      "4-5": 2.9,
      "6-10": 2.5,
      "11-15": 2.1,
      "16-20": 1.8,
      "21-25": 1.5,
    },
    "3-6": {
      "3": 3.2,
      "4-5": 2.7,
      "6-10": 2.3,
      "11-15": 1.9,
      "16-20": 1.6,
      "21-25": 1.4,
    },
    "6-12": {
      "3": 2.9,
      "4-5": 2.5,
      "6-10": 2.1,
      "11-15": 1.8,
      "16-20": 1.5,
      "21-25": 1.3,
    },
    "12-18": {
      "3": 2.6,
      "4-5": 2.2,
      "6-10": 1.9,
      "11-15": 1.6,
      "16-20": 1.4,
      "21-25": 1.2,
    },
    "18-24": {
      "3": 2.4,
      "4-5": 2.0,
      "6-10": 1.7,
      "11-15": 1.5,
      "16-20": 1.2,
      "21-25": 1.1,
    },
  },

  medium: {
    "1": {
      "3": 5.6,
      "4-5": 4.8,
      "6-10": 4.1,
      "11-15": 3.5,
      "16-20": 2.9,
      "21-25": 2.5,
    },
    "1-3": {
      "3": 5.0,
      "4-5": 4.2,
      "6-10": 3.6,
      "11-15": 3.0,
      "16-20": 2.6,
      "21-25": 2.2,
    },
    "3-6": {
      "3": 4.5,
      "4-5": 3.8,
      "6-10": 3.3,
      "11-15": 2.8,
      "16-20": 2.3,
      "21-25": 2.0,
    },
    "6-12": {
      "3": 4.1,
      "4-5": 3.5,
      "6-10": 3.0,
      "11-15": 2.5,
      "16-20": 2.2,
      "21-25": 1.8,
    },
    "12-18": {
      "3": 3.8,
      "4-5": 3.2,
      "6-10": 2.7,
      "11-15": 2.3,
      "16-20": 2.0,
      "21-25": 1.7,
    },
    "18-24": {
      "3": 3.4,
      "4-5": 2.9,
      "6-10": 2.5,
      "11-15": 2.1,
      "16-20": 1.8,
      "21-25": 1.5,
    },
  },

  large: {
    "1": {
      "3": 6.8,
      "4-5": 5.7,
      "6-10": 4.9,
      "11-15": 4.1,
      "16-20": 3.5,
      "21-25": 3.0,
    },
    "1-3": {
      "3": 5.9,
      "4-5": 5.0,
      "6-10": 4.3,
      "11-15": 3.6,
      "16-20": 3.1,
      "21-25": 2.6,
    },
    "3-6": {
      "3": 5.4,
      "4-5": 4.6,
      "6-10": 3.9,
      "11-15": 3.3,
      "16-20": 2.8,
      "21-25": 2.4,
    },
    "6-12": {
      "3": 5.0,
      "4-5": 4.2,
      "6-10": 3.6,
      "11-15": 3.1,
      "16-20": 2.6,
      "21-25": 2.2,
    },
    "12-18": {
      "3": 4.5,
      "4-5": 3.9,
      "6-10": 3.3,
      "11-15": 2.8,
      "16-20": 2.4,
      "21-25": 2.0,
    },
    "18-24": {
      "3": 4.1,
      "4-5": 3.5,
      "6-10": 3.0,
      "11-15": 2.5,
      "16-20": 2.1,
      "21-25": 1.8,
    },
  },
};

const BASE_PRICE = 5;

function getVolumeMultiplier(numPlants: number) {
  const slabs = Math.floor(numPlants / 5);
  let multiplier = 1;
  for (let i = 0; i < slabs; i++) {
    multiplier *= 0.85;
  }
  return multiplier;
}

function getRentalMultiplier(months: number) {
  // client example: 76% = 0.76
  if (months >= 12) return 0.76;
  if (months >= 6) return 0.9;
  return 1;
}

function getSizeMultiplier(size: "small" | "medium" | "large") {
  if (size === "small") return 0.7;
  if (size === "large") return 1.2;
  return 1;
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

export function ProductModal({ plant, isOpen, onClose }: any) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [plantDetails, setPlantDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [bookedDates, setBookedDates] = useState<{ start: Date; end: Date }[]>(
    [],
  );

  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [pot, setPot] = useState<"basic" | "ceramic" | "premium">("basic");
  const [numPlants, setNumPlants] = useState(3);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [installationDate, setInstallationDate] = useState<Date | null>(null);
  const [postcode, setPostcode] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  // text
  useEffect(() => {
    if (!startDate) {
      setInstallationDate(null);
      return;
    }

    const minInstallDate = new Date(startDate);
    minInstallDate.setDate(minInstallDate.getDate() + INSTALLATION_LEAD_DAYS);

    if (!installationDate || installationDate < minInstallDate) {
      setInstallationDate(minInstallDate);
    }
  }, [startDate]);

  useEffect(() => {
    if (!isOpen || !plant) return;

    setLoading(true);

    axiosInterceptor.get(`/plants/${plant.id}`).then((res) => {
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
      setIsAdded(false);
    }
  }, [isOpen]);

  // ✅ EARLIEST selectable rental start date
  const EARLIEST_START_DATE = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + INSTALLATION_LEAD_DAYS);
    return d;
  }, []);
  function getBasePricePerDay(numPlants: number) {
    if (numPlants >= 15) return 4.7;
    if (numPlants >= 10) return 5.2;
    if (numPlants >= 5) return 5.7;
    return 6.2;
  }

  /* -------- Rental days (NO extra day bug) -------- */
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return Math.round((end.getTime() - start.getTime()) / 86400000) + 1; // ✅ inclusive
  }, [startDate, endDate]);

  const rawMonths = Math.ceil(rentalDays / 30);
  const rentalMonths = Math.max(1, Math.floor(rentalDays / 30)); // ensures at least 1 month

  function getPlantRange(numPlants: number) {
    if (numPlants === 3) return "3";
    if (numPlants <= 5) return "4-5";
    if (numPlants <= 10) return "6-10";
    if (numPlants <= 15) return "11-15";
    if (numPlants <= 20) return "16-20";
    return "21-25";
  }

  function calculateSheetPrice({
    size,
    numPlants,
    rentalDays,
  }: {
    size: "small" | "medium" | "large";
    numPlants: number;
    rentalDays: number;
  }) {
    if (rentalDays === 0) {
      return {
        pricePerDay: 0,
        total: 0,
        days: 0,
        months: 0,
        monthRange: "",
        plantRange: "",
        sizeMultiplier: 1,
        volumeMultiplier: 1,
        rentalMultiplier: 1,
      };
    }

    const months = Math.max(1, Math.floor(rentalDays / 30));
    const monthRange = getMonthRange(months);
    const plantRange = getPlantRange(numPlants);

    const pricePerPlantPerDay = PRICE_TABLE[size][monthRange][plantRange];

    const dailyTotal = pricePerPlantPerDay * numPlants;
    const total = Math.round(dailyTotal * rentalDays);

    const sizeMultiplier = getSizeMultiplier(size);
    const volumeMultiplier = getVolumeMultiplier(numPlants);
    const rentalMultiplier = getRentalMultiplier(months);

    return {
      pricePerDay: pricePerPlantPerDay,
      total,
      days: rentalDays,
      months,
      monthRange,
      plantRange,
      sizeMultiplier,
      volumeMultiplier,
      rentalMultiplier,
    };
  }

  const pricing = useMemo(() => {
    const result = calculateSheetPrice({
      size,
      numPlants,
      rentalDays,
    });

    return {
      pricePerDay: result.pricePerDay,
      totalPrice: result.total,
      days: result.days,
      months: result.months,
      monthRange: result.monthRange,

      breakdown: [
        `Size: ${size}`,
        `Plants: ${result.plantRange}`,
        `Rental Period: ${result.monthRange} months`,
        `Size uplift (${size}): ×${result.sizeMultiplier.toFixed(2)}`,
        `Volume discount for ${numPlants} plants: ×${result.volumeMultiplier.toFixed(2)}`,
        `Rental term discount (${result.months} months): ×${result.rentalMultiplier.toFixed(2)}`,
        `£${result.pricePerDay} per plant / day`,
        `Total days: ${result.days}`,
      ],

      monthlyEquivalent:
        result.months > 0 ? (result.total / result.months).toFixed(2) : "0",
    };
  }, [size, numPlants, rentalDays]);

  const [county, setCounty] = useState("");
  const isCountyValid = ALLOWED_COUNTIES.includes(county);

  const canAddToCart =
    rentalDays >= MIN_RENTAL_DAYS &&
    numPlants >= 3 &&
    startDate &&
    endDate &&
    isCountyValid;

  const handleAddToCart = async () => {
    if (!canAddToCart) {
      ErrorToast("Please complete all required fields");
      return;
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
      });

      setIsAdded(true);
    } catch (error: any) {
      ErrorToast(
        error?.response?.data?.message ||
          "Plant is already booked for the selected dates",
      );
    }
  };

  if (!isOpen) return null;
  if (loading)
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        Loading…
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
          minStartDate={EARLIEST_START_DATE} // ✅ YEH ZAROORI
        />

        <h3 className="font-semibold mt-4 mb-2 flex gap-2">
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
        />

        <select
          className="border p-2 w-full"
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
            Total: <b>£{pricing.totalPrice}</b>
          </p>
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
          <Button
            disabled={!canAddToCart || isAdded}
            onClick={handleAddToCart}
            className="flex-1"
          >
            {isAdded ? <Check /> : <ShoppingBag />} Add to Basket
          </Button>
          {isAdded && (
            <>
              <Button variant="outline" onClick={onClose}>
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
