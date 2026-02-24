"use client";

import { useMemo } from "react";

type Props = {
  pickupDate: string;
  setPickupDate: (v: string) => void;
  pickupWindow: string;
  setPickupWindow: (v: string) => void;
};

function nextWeekendDates(count = 8): string[] {
  const out: string[] = [];
  const now = new Date();

  for (let i = 0; i < 45 && out.length < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dow = d.getDay(); // 0 Sun, 6 Sat

    // Friday (5) or Saturday (6)
    if (dow === 5 || dow === 6) {
      out.push(d.toISOString().slice(0, 10));
    }
  }

  return out;
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

export default function PickupSelector({
  pickupDate,
  setPickupDate,
  pickupWindow,
  setPickupWindow
}: Props) {
  const pickupDates = useMemo(() => nextWeekendDates(8), []);

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
      <select
        value={pickupDate}
        onChange={(e) => setPickupDate(e.target.value)}
        style={{
          flex: "1 1 220px",
          padding: 10,
          border: "1px solid #cfcfcf",
          borderRadius: 6,
          background: "white"
        }}
      >
        <option value="">Pickup date</option>
        {pickupDates.map((d) => (
          <option key={d} value={d}>
            {formatDate(d)}
          </option>
        ))}
      </select>

      <select
        value={pickupWindow}
        onChange={(e) => setPickupWindow(e.target.value)}
        style={{
          flex: "1 1 220px",
          padding: 10,
          border: "1px solid #cfcfcf",
          borderRadius: 6,
          background: "white"
        }}
      >
        <option value="">Pickup time window</option>
        <option value="2-3 PM">2–3 PM</option>
        <option value="3-4 PM">3–4 PM</option>
        <option value="After-hours pickup">After-hours pickup</option>
      </select>
    </div>
  );
}