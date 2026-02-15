"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, Leaf, ChevronDown, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { categories } from "@/lib/data";
import axiosInterceptor from "@/lib/axiosInterceptor";
import { ErrorToast, SuccessToast } from "./global/ToastContainer";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
];

export function Navbar() {
  const {
    getCartCount,
    cartItems,
    removeFromCart,
    getCartTotal,
    clearCart,
    setIsCartOpen,
    isCartOpen,
  } = useCart();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const cartCount = getCartCount();
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const allowedCounties = [
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
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
  };
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allowedCounties.includes(state)) {
      ErrorToast(
        `We only operate in the following areas: ${allowedCounties.join(", ")}`,
      );
      return;
    }
    e.preventDefault();
    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !zip ||
      !country
    )
      return;

    setIsSubmitting(true);

    const payload = {
      customerInfo: {
        fullName,
        email,
        phone,
        address: { fullAddress: address, city, state, zip, country },
      },
      items: cartItems.map((item) => ({
        plantId: item.plantId,
        startDate: item.startDate,
        endDate: item.endDate,
      })),
    };

    try {
      const res = await axiosInterceptor.post(
        "/checkout/create-session",
        payload,
      );

      // Axios throws for non-2xx status, so res.ok is not needed
      SuccessToast("Order successfully placed!");

      clearCart();
      setShowCustomerForm(false);
    } catch (err: any) {
      console.error(err);
      // Axios errors have response status/message
      ErrorToast(
        err?.response?.data?.message || "Checkout failed, please try again",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderMenu = (
    items: (typeof categories)[0]["subcategories"],
    level = 0,
  ) => {
    if (!items) return null;

    return (
      <ul
        className={`${level === 0 ? "space-y-1" : "space-y-0 ml-4 border-l border-border pl-2"} `}
      >
        {items.map((item) => (
          <li key={item.id} className="group">
            <Link
              href={item.href}
              className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-md"
            >
              {item.name}
              {item.subcategories && <ChevronDown className="h-4 w-4 ml-2" />}
            </Link>

            {/* Render children below the parent */}
            {item.subcategories && (
              <div className="hidden group-hover:block">
                {renderMenu(item.subcategories, level + 1)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="font-serif text-xl md:text-2xl font-semibold text-foreground">
              Bloom & Rent
            </span>
          </Link>

          {/* Desktop Navigation with Mega Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Categories Dropdown */}

            {/* All Plants Dropdown */}
            <div
              className="relative"
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                onMouseEnter={() => setOpenDropdown("all-plants")}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary font-medium py-4"
              >
                All Plants
                <ChevronDown className="h-4 w-4" />
              </button>

              {openDropdown === "all-plants" && (
                <div className="absolute top-full left-0 bg-card border border-border rounded-lg shadow-lg p-3 min-w-56 z-50">
                  {renderMenu(categories[0].subcategories)}
                </div>
              )}
            </div>

            {/* Regular Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5 text-foreground" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-card p-4 w-full sm:max-w-md">
                <SheetTitle className="font-serif text-xl text-card-foreground">
                  Your Cart
                </SheetTitle>
                <div className="mt-6 flex flex-col h-[calc(100vh-120px)]">
                  {cartItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-4">
                        {cartItems.map((item) => (
                          <div
                            key={item.plantId}
                            className="flex gap-4 p-3 bg-muted rounded-lg"
                          >
                            <img
                              src={item.plantImage || "/placeholder.svg"}
                              alt={item.plantName}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-card-foreground truncate">
                                {item.plantName}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {/* {item.size.name} ({item.size.height}) */}
                              </p>
                              {/* <p className="text-xs text-muted-foreground">Pot: {item.pot.name}</p> */}
                              <p className="text-sm text-muted-foreground">
                                {formatDateRange(item.startDate, item.endDate)}{" "}
                                ({item.rentalDays} days)
                              </p>
                              <p className="text-sm font-semibold text-primary">
                                £ {item.totalPrice}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.plantId)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1"
                              aria-label={`Remove ${item.plantName} from cart`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-border mt-4">
                        <p className="text-xs text-muted-foreground mb-3">
                          * Pot included free with each plant rental
                        </p>
                        <div className="flex justify-between font-semibold text-card-foreground mb-4">
                          <span>Total</span>
                          <span>${getCartTotal()}</span>
                        </div>
                        <SheetTrigger asChild>
                          <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={cartCount === 0}
                            onClick={() => setShowCustomerForm(true)}
                          >
                            Proceed to Checkout
                          </Button>
                        </SheetTrigger>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5 text-foreground" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-card w-full sm:max-w-sm">
                <SheetTitle className="font-serif text-xl text-card-foreground">
                  Menu
                </SheetTitle>
                <div className="mt-8 flex flex-col gap-4">
                  {/* Categories in Mobile */}
                  {categories.map((category) => (
                    <div key={category.id}>
                      <Link
                        href={category.href}
                        className="text-lg font-medium text-card-foreground hover:text-primary transition-colors block"
                      >
                        {category.name}
                      </Link>
                      {category.subcategories && (
                        <div className="ml-4 mt-2 space-y-2">
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub.id}
                              href={sub.href}
                              className="text-muted-foreground hover:text-primary transition-colors block"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-border pt-4 mt-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="text-lg font-medium text-card-foreground hover:text-primary transition-colors block py-2"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <Sheet open={showCustomerForm} onOpenChange={setShowCustomerForm}>
          <SheetContent className="bg-card p-6 w-full sm:max-w-md">
            <SheetTitle className="font-serif text-xl mb-4">
              Customer Information
            </SheetTitle>
            <form onSubmit={handleCustomerSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full p-3 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border rounded"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full p-3 border rounded"
              />
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full p-3 border rounded"
              />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full p-3 border rounded"
              />
            <select
  value={state}
  onChange={(e) => setState(e.target.value)}
  required
  className="w-full p-3 border rounded"
>
  <option value="">Select County</option>
  {allowedCounties.map((county) => (
    <option key={county} value={county}>
      {county}
    </option>
  ))}
</select>

              <input
                type="text"
                placeholder="ZIP / Postal Code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
                className="w-full p-3 border rounded"
              />
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full p-3 border rounded"
              />
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Complete Order"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
