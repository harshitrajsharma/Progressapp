"use client";

import { useEffect, useState } from "react";
import { format, getHours, getMinutes, getSeconds } from "date-fns";

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);
  const [is24Hour, setIs24Hour] = useState(true); // Default to 24-hour format

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  // Calculate day progress percentage (0-100)
  const totalSecondsInDay = 24 * 60 * 60;
  const currentSeconds = getHours(time) * 3600 + getMinutes(time) * 60 + getSeconds(time);
  const dayProgress = (currentSeconds / totalSecondsInDay) * 100;

  // Determine progress bar color, pulsating dot color, and message based on time of day
  let progressBarColor = "";
  let dotColor = "";
  let motivationalMessage = "";
  let messageColor = "";

  if (dayProgress < 25) {
    progressBarColor = "from-green-500 to-green-700";
    dotColor = "bg-green-700";
    motivationalMessage = "Start fresh—plan your day!";
    messageColor = "text-green-400";
  } else if (dayProgress < 50) {
    progressBarColor = "from-yellow-500 to-yellow-700";
    dotColor = "bg-yellow-700";
    motivationalMessage = "Morning momentum—tackle key tasks!";
    messageColor = "text-yellow-400";
  } else if (dayProgress < 75) {
    progressBarColor = "from-orange-500 to-orange-700";
    dotColor = "bg-orange-700";
    motivationalMessage = "Keep pushing—stay focused!";
    messageColor = "text-orange-400";
  } else {
    progressBarColor = "from-red-500 to-red-700";
    dotColor = "bg-red-700";
    motivationalMessage = "Wrap up strong—reflect and prep!";
    messageColor = "text-red-400";
  }

  // Handle time format toggle
  const handleClockClick = () => {
    setIs24Hour((prev) => !prev);
  };

  // Format time based on the current setting
  const timeFormat = is24Hour ? "HH:mm:ss" : "hh:mm:ss";

  return (
    <div className="flex items-center h-full">
      {/* Time Display - Clickable to toggle format */}
      <div
        className="flex items-center gap-1 py-2 px-3 bg-emerald-400/10 dark:bg-black/10 backdrop-blur-sm font-mono rounded-xl cursor-pointer transition-all duration-200 hover:bg-emerald-400/20"
        onClick={handleClockClick}
      >
        <span className="text-lg md:text-xl font-bold text-emerald-500 tracking-tight">
          {format(time, timeFormat.split(":")[0])}
        </span>
        <span className="text-lg md:text-xl text-emerald-500 animate-pulse font-bold">
          :
        </span>
        <span className="text-lg md:text-xl font-bold text-emerald-500 tracking-tight">
          {format(time, timeFormat.split(":")[1])}
        </span>
        <span className="text-lg md:text-xl text-emerald-500 animate-pulse font-bold">
          :
        </span>
        <span className="text-lg md:text-xl font-bold text-emerald-500 tracking-tight">
          {format(time, timeFormat.split(":")[2])}
        </span>
        <span className="text-sm md:text-base text-emerald-500/70 ml-1 font-medium">
          {format(time, "a")}
        </span>
      </div>

      {/* Vertical Divider - Shown on md+ */}
      <div className="hidden md:block h-8 mx-3 border-l border-gray-600/50"></div>

      {/* Progress Section - Hidden on mobile, shown on md+ */}
      <div className="hidden md:flex items-center">
        <div className="flex flex-col items-center space-y-1.5">
          <div className="flex items-center space-x-2 w-full">
            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-gray-400 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
              <div
                className={`absolute h-full z-10 bg-gradient-to-r ${progressBarColor} transition-all duration-1000 ease-linear`}
                style={{ width: `${dayProgress}%`, borderRadius: "inherit" }}
              >
                {/* Pulsating Dot */}
                <div
                  className={`absolute -right-1 top-[35%] z-0 -translate-y-1/2 w-2 h-2 rounded-full ${dotColor} animate-ping opacity-80`}
                />
              </div>
            </div>

            {/* Progress Percentage */}
            <span className="text-xs font-semibold text-black dark:text-gray-300">
              {dayProgress.toFixed(1)}%
            </span>
          </div>

          {/* Motivational Message */}
          <span className={`text-xs font-medium ${messageColor} tracking-wide`}>
            {motivationalMessage}
          </span>
        </div>
      </div>
    </div>
  );
}