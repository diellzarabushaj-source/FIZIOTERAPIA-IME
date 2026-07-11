"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    posthog?: {
      init: (key: string, options: Record<string, unknown>) => void;
      capture: (event: string, properties?: Record<string, unknown>) => void;
      opt_out_capturing?: () => void;
    };
  }
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com").replace(/\/$/, "");

export function PostHogAnalytics() {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (!POSTHOG_KEY || initialized.current || typeof window === "undefined") return;

    const initialize = () => {
      if (!window.posthog || initialized.current) return;

      window.posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: false,
        disable_session_recording: true,
        person_profiles: "identified_only",
        persistence: "localStorage+cookie",
        secure_cookie: window.location.protocol === "https:",
        respect_dnt: true,
        sanitize_properties: (properties: Record<string, unknown>) => {
          const safe = { ...properties };
          delete safe.$current_url;
          delete safe.$referrer;
          delete safe.$referring_domain;
          return safe;
        },
      });

      initialized.current = true;
    };

    if (window.posthog) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `${POSTHOG_HOST.replace(".i.posthog.com", "-assets.i.posthog.com")}/static/array.js`;
    script.onload = initialize;
    script.onerror = () => console.warn("PostHog analytics failed to load.");
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!initialized.current || !window.posthog || !pathname) return;

    window.posthog.capture("$pageview", {
      $current_url: `${window.location.origin}${pathname}`,
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}
