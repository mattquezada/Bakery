"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Props = {
  pickupDate: string;
  setPickupDate: (v: string) => void;
  pickupWindow: string;
  setPickupWindow: (v: string) => void;
};

type PickupSlotRow = {
  id: string;
  pickup_date: string;   // YYYY-MM-DD
  pickup_window: string; // e.g. "@ the Bako Market (10am–3pm)"
};

function formatLongDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

export default function PickupSelector({
  pickupDate,
  setPickupDate,
  pickupWindow,
  setPickupWindow
}: Props) {
  const [slots, setSlots] = useState<PickupSlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return null;
    return createClient(url, anon);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const todayIso = new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("pickup_slots")
        .select("id,pickup_date,pickup_window")
        .gte("pickup_date", todayIso)
        .order("pickup_date", { ascending: true })
        .order("pickup_window", { ascending: true })
        .limit(40);

      if (cancelled) return;

      if (error) {
        console.error("Failed to load pickup slots:", error);
        setSlots([]);
      } else {
        setSlots((data ?? []) as PickupSlotRow[]);
      }

      setLoading(false);
    }

    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // If parent already has values (back/forward navigation), sync radio selection
  useEffect(() => {
    if (!pickupDate || !pickupWindow) return;
    const found = slots.find(
      (s) => s.pickup_date === pickupDate && s.pickup_window === pickupWindow
    );
    if (found) setSelectedSlotId(found.id);
  }, [pickupDate, pickupWindow, slots]);

  function labelForSlot(s: PickupSlotRow) {
    // Example: "Saturday, March 7 @ the Bako Market (10am–3pm)"
    return `${formatLongDate(s.pickup_date)} ${s.pickup_window}`;
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 800, letterSpacing: ".08em", marginBottom: 8 }}>
        PICKUP TIME SLOTS
      </div>

      {loading ? (
        <div>Loading pickup time slots…</div>
      ) : slots.length === 0 ? (
        <div style={{ color: "#b00020", fontWeight: 700 }}>
          No pickup slots available.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {slots.map((s) => {
            const checked = selectedSlotId === s.id;

            return (
              <label
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  border: "1px solid #cfcfcf",
                  borderRadius: 8,
                  background: "white",
                  cursor: "pointer"
                }}
              >
                <input
                  type="radio"
                  name="pickup_slot"
                  checked={checked}
                  onChange={() => {
                    setSelectedSlotId(s.id);

                    // Keep your existing payload shape:
                    // these are what your API/webhook/email use.
                    setPickupDate(s.pickup_date);
                    setPickupWindow(s.pickup_window);
                  }}
                />
                <span style={{ fontSize: 16, fontWeight: 600 }}>
                  {labelForSlot(s)}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}