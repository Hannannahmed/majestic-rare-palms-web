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

export interface Plant {
  id: number
  name: string
  image: string
  shortDescription: string
  fullDescription: string
  pricePerDay: number
  category: "indoor" | "outdoor" | "bundles"
  subcategory?: "palms" | "bananas" | "individual"
}

export interface Category {
  id: string
  name: string
  href: string
  subcategories?: { id: string; name: string; href: string }[]
}

export const categories: Category[] = [
  {
    id: "all-plants",
    name: "All Plants",
    href: "/#products",
    subcategories: [
      { id: "indoor", name: "Indoor", href: "/?filter=indoor#products" },
      { id: "individual", name: "Individual", href: "/?filter=individual#products" },
      { id: "palms", name: "Palms", href: "/?filter=palms#products" },
      { id: "bananas", name: "Bananas", href: "/?filter=bananas#products" },
      { id: "bundles", name: "Bundles", href: "/?filter=bundles#products" },
      { id: "outdoor", name: "Outdoor", href: "/?filter=outdoor#products" },
      { id: "pots", name: "Pots", href: "/#pots" },
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

export const plants: Plant[] = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    image: "/monstera-deliciosa-tropical-plant-in-ceramic-pot.jpg",
    shortDescription: "The iconic Swiss Cheese Plant with stunning split leaves",
    fullDescription:
      "The Monstera Deliciosa, also known as the Swiss Cheese Plant, features large, glossy heart-shaped leaves with distinctive splits. Perfect for adding a tropical touch to any space. Easy to care for and thrives in indirect light.",
    pricePerDay: 5,
    category: "indoor",
    subcategory: "individual",
  },
  {
    id: 2,
    name: "Fiddle Leaf Fig",
    image: "/fiddle-leaf-fig-tree-in-white-pot-indoor.jpg",
    shortDescription: "Elegant tree with large violin-shaped leaves",
    fullDescription:
      "The Fiddle Leaf Fig is a stunning statement plant with large, violin-shaped leaves. This Instagram-favorite brings elegance and drama to any room. Requires bright, indirect light and moderate watering.",
    pricePerDay: 7,
    category: "indoor",
    subcategory: "individual",
  },
  {
    id: 3,
    name: "Snake Plant",
    image: "/snake-plant-sansevieria-in-terracotta-pot.jpg",
    shortDescription: "Low-maintenance air purifier with striking upright leaves",
    fullDescription:
      "The Snake Plant (Sansevieria) is one of the most resilient houseplants available. Its architectural upright leaves add modern appeal while purifying your air. Perfect for beginners and low-light spaces.",
    pricePerDay: 3,
    category: "indoor",
    subcategory: "individual",
  },
  {
    id: 4,
    name: "Bird of Paradise",
    image: "/bird-of-paradise-plant-strelitzia-in-pot.jpg",
    shortDescription: "Tropical beauty with banana-like leaves",
    fullDescription:
      "The Bird of Paradise brings instant tropical vibes with its large, banana-like leaves. This dramatic plant makes a bold statement and thrives in bright light. Perfect for creating a resort-like atmosphere.",
    pricePerDay: 8,
    category: "indoor",
    subcategory: "bananas",
  },
  {
    id: 5,
    name: "Areca Palm",
    image: "/areca-palm-plant-indoor.jpg",
    shortDescription: "Elegant feathery palm fronds for a tropical feel",
    fullDescription:
      "The Areca Palm brings a touch of the tropics with its elegant, feathery fronds. This air-purifying beauty is perfect for brightening up any corner. It loves bright, indirect light and regular watering.",
    pricePerDay: 6,
    category: "indoor",
    subcategory: "palms",
  },
  {
    id: 6,
    name: "Kentia Palm",
    image: "/kentia-palm-plant-indoor-pot.jpg",
    shortDescription: "Classic palm with graceful arching fronds",
    fullDescription:
      "The Kentia Palm is a timeless classic known for its graceful, arching fronds. This low-maintenance beauty tolerates low light and adds instant sophistication to any interior space.",
    pricePerDay: 7,
    category: "indoor",
    subcategory: "palms",
  },
  {
    id: 7,
    name: "Outdoor Olive Tree",
    image: "/olive-tree-outdoor-pot.jpg",
    shortDescription: "Mediterranean charm for your outdoor space",
    fullDescription:
      "The Olive Tree brings Mediterranean elegance to patios and gardens. Its silvery-green leaves and gnarled trunk add timeless character. Perfect for outdoor events and terrace styling.",
    pricePerDay: 10,
    category: "outdoor",
  },
  {
    id: 8,
    name: "Event Bundle",
    image: "/collection-of-plants-bundle-arrangement.jpg",
    shortDescription: "Curated collection of 5 plants for events",
    fullDescription:
      "Our Event Bundle includes 5 carefully curated plants perfect for weddings, corporate events, or special occasions. Mix of sizes and varieties to create stunning displays. Includes delivery and setup.",
    pricePerDay: 25,
    category: "bundles",
  },
]
