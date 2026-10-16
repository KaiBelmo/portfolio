"use client";

import dynamic from "next/dynamic";

// The canvas engine is ~50 KB of source. Render a same-size placeholder on the
// server and load the animation after hydration so it never delays the page.
const AboutSpaceAnimation = dynamic(() => import("./AboutSpaceAnimation"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="relative mb-[clamp(10px,1.8vw,20px)] h-[clamp(190px,22vw,285px)] max-[640px]:mb-[clamp(8px,3vw,16px)] max-[640px]:h-[clamp(175px,44vw,235px)]"
    />
  ),
});

export default AboutSpaceAnimation;
