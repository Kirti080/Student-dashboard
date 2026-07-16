import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AdminDatePickerProps = {
  value?: string;
  label: string;
  onChange: (value: string) => void;
};

export default function AdminDatePicker({
  value,
  label,
  onChange,
}: AdminDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value
    ? new Date(`${value.slice(0, 10)}T00:00:00`)
    : undefined;

  const selectDate = (date: Date | undefined) => {
    if (!date) return;
    onChange(format(date, "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={
            "h-10 w-full justify-start rounded-xl border-2 " +
            "border-slate-200 bg-white px-3 text-left text-sm " +
            "font-medium hover:border-blue-300 hover:bg-blue-50/40 " +
            (selected ? "text-slate-900" : "text-slate-400")
          }
        >
          <span className="mr-1 rounded-lg bg-blue-100 p-1.5 text-blue-600">
            <CalendarDays className="h-4 w-4" />
          </span>
          {selected ? format(selected, "dd MMMM yyyy") : `Select ${label}`}
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-950/65 backdrop-blur-md"
        className={
          "w-[calc(100%-2rem)] max-w-[22rem] gap-0 overflow-hidden " +
          "rounded-3xl border-0 bg-white p-0 shadow-2xl " +
          "shadow-blue-950/30"
        }
      >
        <div
          className={
            "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 " +
            "relative px-5 py-4 text-white"
          }
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close calendar"
            className={
              "absolute right-3 top-3 rounded-full bg-white/15 p-2 " +
              "text-white transition hover:bg-white/25"
            }
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            Choose a date
          </p>
          <DialogTitle className="mt-0.5 text-lg font-black text-white">
            {selected ? format(selected, "EEEE, dd MMM") : "No date selected"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Select a date for {label}
          </DialogDescription>
        </div>

        <Calendar
          mode="single"
          selected={selected}
          onSelect={selectDate}
          captionLayout="dropdown"
          buttonVariant="ghost"
          className="w-full p-3 [--cell-radius:0.65rem] [--cell-size:2rem]"
          classNames={{
            root: "w-full",
            month: "w-full gap-2",
            month_caption: "mb-1 flex h-8 items-center justify-center",
            weekdays: "flex w-full",
            week: "mt-1 flex w-full",
            weekday: "font-bold text-slate-400",
            today: "rounded-xl bg-blue-50 font-bold text-blue-700",
          }}
        />

        <div className="flex items-center justify-between border-t border-slate-100 p-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="h-9 rounded-xl px-3 text-slate-500"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
          <Button
            type="button"
            onClick={() => selectDate(new Date())}
            className="h-9 rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-700"
          >
            <Check className="h-4 w-4" />
            Today
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
