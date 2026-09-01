import { useEffect, useState } from "react";

const ONE_MINUTE = 60_000;

/** A clock that ticks once a minute, so "hoje" and "há 2 h" stay honest on a page left open. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), ONE_MINUTE);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}
