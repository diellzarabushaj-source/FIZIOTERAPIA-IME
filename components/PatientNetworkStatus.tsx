"use client";

import { useEffect, useState } from "react";

export function PatientNetworkStatus() {
  const [online, setOnline] = useState(true);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);

    const handleOffline = () => {
      setRestored(false);
      setOnline(false);
    };

    const handleOnline = () => {
      setOnline(true);
      setRestored(true);
      window.setTimeout(() => setRestored(false), 3500);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!online) {
    return (
      <div className="patient-network-status offline" role="alert">
        <strong>Nuk ka internet</strong>
        <span>Mos e mbyll faqen. Kur të kthehet interneti, provo përsëri.</span>
      </div>
    );
  }

  if (restored) {
    return (
      <div className="patient-network-status online" role="status">
        <strong>Interneti u kthye</strong>
        <span>Tani mund të vazhdosh.</span>
      </div>
    );
  }

  return null;
}
