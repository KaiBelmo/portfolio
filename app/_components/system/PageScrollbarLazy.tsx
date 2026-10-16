"use client";

import dynamic from "next/dynamic";

// The custom scrollbar is decorative and stays hidden until it measures the
// page, so it can load after hydration instead of with every route.
const PageScrollbar = dynamic(() => import("./PageScrollbar"), { ssr: false });

export default PageScrollbar;
