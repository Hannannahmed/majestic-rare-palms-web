"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { ErrorToast } from "./global/ToastContainer";
import { Button } from "./ui/button";

interface DateRangePickerProps {
  bookedDates: { start: Date; end: Date; quantity: number; stock: number }[];
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  startDate: Date | null;
  endDate: Date | null;
  minStartDate?: Date;
}
const INSTALLATION_LEAD_DAYS = 14; // changeable later
const MAX_BOOKING_MONTHS_AHEAD = 36; // business decision

export function DateRangePicker({
  bookedDates,
  onDateRangeChange,
  startDate,
  endDate,
  minStartDate, // ✅ ADD THIS
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateBooked = (date: Date) => {
    if (!bookedDates || bookedDates.length === 0) return false; // ← ADD THIS

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    let totalBooked = 0;
    bookedDates.forEach(({ start, end, quantity }) => {
      const s = new Date(start);
      s.setHours(0, 0, 0, 0);
      const e = new Date(end);
      e.setHours(0, 0, 0, 0);

      if (checkDate >= s && checkDate <= e) {
        totalBooked += quantity;
      }
    });

    const stock = bookedDates[0]?.stock || 0;
    return totalBooked >= stock;
  };

  const isDateDisabled = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const minSelectableDate = minStartDate ? new Date(minStartDate) : today;
    const maxSelectableDate = new Date(today);
    maxSelectableDate.setMonth(
      maxSelectableDate.getMonth() + MAX_BOOKING_MONTHS_AHEAD,
    );

    // disabled if outside min/max or booked
    return (
      checkDate < minSelectableDate ||
      checkDate > maxSelectableDate ||
      isDateBooked(checkDate)
    );
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > startDate && checkDate < endDate;
  };

  const isStartDate = (date: Date) => {
    if (!startDate) return false;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return checkDate.getTime() === start.getTime();
  };

  const isEndDate = (date: Date) => {
    if (!endDate) return false;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return checkDate.getTime() === end.getTime();
  };

  const hasBookedDateInRange = (start: Date, end: Date) => {
    const current = new Date(start);
    while (current <= end) {
      if (isDateBooked(current)) return true;
      current.setDate(current.getDate() + 1);
    }
    return false;
  };

  // const canAddToCart = startDate && endDate && rentalDays >= 30

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    // START DATE selection
    if (!startDate || endDate || date < startDate) {
      onDateRangeChange(date, null);
      setSelectingEnd(true);
      return;
    }

    // END DATE selection
    const minEndDate = new Date(startDate);
    minEndDate.setDate(minEndDate.getDate() + 30);

    if (date < minEndDate) {
      ErrorToast("Minimum rental term is 1 month");
      return;
    }

    if (hasBookedDateInRange(startDate, date)) {
      ErrorToast("Selected range overlaps with booked dates");
      return;
    }

    onDateRangeChange(startDate, date);
    setSelectingEnd(false);
  };

  const canGoNextMonth = () => {
    const max = new Date(today);
    max.setMonth(max.getMonth() + MAX_BOOKING_MONTHS_AHEAD);
    return currentMonth < max;
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const disabled = isDateDisabled(date);
    const booked = isDateBooked(date);
    const inRange = isDateInRange(date);
    const isStart = isStartDate(date);
    const isEnd = isEndDate(date);

    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(date)}
        disabled={disabled}
        className={`
          h-10 w-full rounded-lg text-sm font-medium transition-all relative
          ${disabled ? "text-muted-foreground/40 cursor-not-allowed" : "cursor-pointer hover:bg-primary/10"}
          ${booked ? "bg-destructive/20 text-destructive line-through" : ""}
          ${inRange ? "bg-primary/20 text-primary" : ""}
          ${isStart || isEnd ? "bg-primary text-primary-foreground hover:bg-primary" : ""}
          ${!disabled && !booked && !inRange && !isStart && !isEnd ? "text-card-foreground" : ""}
        `}
      >
        {day}
      </button>,
    );
  }

  const isPrevDisabled =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2 mb-2">
        {[3, 6, 12, 24].map((months) => (
          <Button
            key={months}
            size="sm"
            onClick={() => {
              if (!startDate) return;
              const end = new Date(startDate);
              end.setMonth(end.getMonth() + months);

              const diff =
                Math.ceil(
                  (end.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
                ) + 1;
              if (diff < 30) {
                ErrorToast("Minimum rental term is 1 month");
                return;
              }

              // Booked date check
              if (hasBookedDateInRange(startDate, end)) {
                ErrorToast("Selected range overlaps with booked dates");
                return;
              }

              onDateRangeChange(startDate, end);
            }}
          >
            {months} months
          </Button>
        ))}
      </div>
      <div className="mb-2 text-xs text-muted-foreground">
        Price per plant decreases with longer rental terms and more plants.
      </div>

      <div
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        className="flex items-center justify-between w-full border border-border rounded-xl px-4 py-3 bg-card cursor-pointer hover:border-primary/50 transition-colors"
      >
        <div className="flex-1 text-left">
          {startDate && endDate ? (
            <span className="text-card-foreground font-medium">
              {formatDateShort(startDate)} — {formatDateShort(endDate)}
            </span>
          ) : startDate ? (
            <span className="text-card-foreground font-medium">
              {formatDateShort(startDate)} —{" "}
              <span className="text-muted-foreground">Select end date</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select rental dates</span>
          )}
        </div>
        <div className="ml-3 p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
      </div>

      {isCalendarOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              disabled={isPrevDisabled}
              className={`p-2 rounded-lg transition-colors ${isPrevDisabled ? "text-muted-foreground/40 cursor-not-allowed" : "hover:bg-muted text-card-foreground"}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-semibold text-card-foreground">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={nextMonth}
              disabled={!canGoNextMonth()}
              className="p-2 rounded-lg hover:bg-muted text-card-foreground transition-colors disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">{days}</div>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive/20" />
              <span>Unavailable</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
