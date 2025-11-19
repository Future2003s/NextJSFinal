"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { vi } from "date-fns/locale";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function Calendar21() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2025, 5, 12),
    to: new Date(2025, 5, 17),
  });

  const [month, setMonth] = React.useState<Date | undefined>(range?.from);

  return (
    <>
      <Calendar
        mode="range"
        month={month}
        onMonthChange={setMonth}
        selected={range}
        locale={vi}
        onSelect={setRange}
        numberOfMonths={1}
        captionLayout="dropdown"
        className="rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("default", { month: "2-digit" }),
        }}
        // 👇 CHỖ QUAN TRỌNG: tuỳ chỉnh màu ô ngày ở đây
        classNames={{
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full",
          day_selected:
            "bg-amber-500 text-white hover:bg-amber-600 focus:bg-amber-600",
          day_today: "border border-amber-500 text-amber-900 bg-amber-50",
          day_range_middle: "bg-amber-100 text-amber-900",
          day_outside: "text-muted-foreground opacity-40",
        }}
        components={{
          DayButton: ({ children, modifiers, day, ...props }) => {
            const isWeekend =
              day.date.getDay() === 0 || day.date.getDay() === 6;

            return (
              <CalendarDayButton
                day={day}
                modifiers={modifiers}
                {...props}
                className={cn(
                  // ví dụ: đổi màu chữ cuối tuần
                  !modifiers.selected &&
                    !modifiers.range_middle &&
                    !modifiers.today &&
                    isWeekend &&
                    "text-red-500",
                  props.className
                )}
              >
                {children}
              </CalendarDayButton>
            );
          },
        }}
      />

      <Button
        className="mt-2"
        onClick={() => {
          const today = new Date();
          setRange({
            from: today,
            to: today,
          });
          setMonth(today);
        }}
      >
        Hôm nay
      </Button>
    </>
  );
}
