'use client';

import { useState } from 'react';
import { CalendarView } from "@/components/analytics/CalendarView";

export default function AnalyticsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="space-y-8">
      <CalendarView
        selectedDate={selectedDate}
        onSelectDate={(date) => date && setSelectedDate(date)}
      />
    </div>
  );
} 