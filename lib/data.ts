export interface PlantSize {
  id: string
  name: string
  height: string
  priceMultiplier: number
}

export interface Pot {
  id: number
  name: string
  image: string
  color: string
}


// Updated Plant interface
export interface Plant {
  id: string
  name: string
  image?: string
  shortDescription: string
  fullDescription: string
  category: string
  subcategory?: string
  pricePerDay: number

  bookedDateRanges?: {
    start: string
    end: string
  }[]

  specifications?: {
    height: string
    potSize: string
    lightRequirement: string
    wateringFrequency: string
  }
}



// lib/data.ts
export interface Category {
  id: string
  name: string
  href: string
  subcategories?: Category[]
}

export const categories: Category[] = [
  {
    id: "all-plants",
    name: "All Plants",
    href: "/#products",
    subcategories: [
      {
        id: "indoor",
        name: "Indoor",
        href: "/?filter=indoor#products",
        subcategories: [
          {
            id: "individual",
            name: "Individual",
            href: "/?filter=individual#products",
            subcategories: [
              { id: "palms", name: "Palms", href: "/?filter=palms#products" },
              { id: "broad-leaves", name: "Broad-leaves", href: "/?filter=broad-leaves#products" },
            ],
          },
          { id: "bundles", name: "Bundles", href: "/?filter=bundles#products" },
        ],
      },
      { id: "outdoor", name: "Outdoor", href: "/?filter=outdoor#products" },
    ],
  },
]



export const plantSizes: PlantSize[] = [
  { id: "small", name: "Small", height: "30-50cm", priceMultiplier: 1 },
  { id: "medium", name: "Medium", height: "60-90cm", priceMultiplier: 1.5 },
  { id: "large", name: "Large", height: "100-150cm", priceMultiplier: 2 },
]

export const pots: Pot[] = [
  { id: 1, name: "Classic White", image: "/white-ceramic-pot.png", color: "White" },
  { id: 2, name: "Terracotta", image: "/terracotta-clay-pot.jpg", color: "Terracotta" },
  { id: 3, name: "Matte Black", image: "/matte-black-ceramic-pot.jpg", color: "Black" },
  { id: 4, name: "Natural Rattan", image: "/natural-rattan-basket-pot.jpg", color: "Natural" },
]


