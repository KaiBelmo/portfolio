"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Shortest thumb the rail will draw, so very long pages stay grabbable.
const MIN_THUMB = 32;
// Gap between the thumb and the rail edges, like a pixel rail.
const INSET = 3;
// Longest a route change counts its scroll jumps as the page's, not the user's.
const ROUTE_MAX_MS = 2000;
const EASE: KeyframeAnimationOptions = { duration: 380, easing: "cubic-bezier(0.45, 0, 0.2, 1)" };

/**
 * Page scrollbar drawn by the page instead of the browser.
 *
 * A native thumb snaps whenever the page height or scroll position jumps,
 * which makes route switches look like a hard cut. This rail eases those
 * changes instead, and every moving part is a transform, so the compositor
 * runs it even while the main thread is busy mounting the next route:
 *
 *   slide  follows the scroll (CSS scroll-driven animation, no script)
 *   shift  absorbs jumps the page makes, easing them out (shiftBy)
 *   thumb  is scaled to the thumb's length, easing between lengths (setSize)
 *
 * Script only runs when the page or viewport resizes, on route changes, and
 * for drag and track clicks. Engines without scroll timelines get a passive
 * scroll listener for the slide instead.
 *
 * Over the rail, the pixel cursor is drawn by an element (see onCursorMove):
 * Chrome drops any custom cursor image that is not fully inside the viewport,
 * and a 12px rail at the window edge never fits one.
 *
 * It only runs when the bootstrap script set html[data-scrollbar="custom"]
 * (mouse and trackpad devices). Touch devices keep their native overlay
 * scrollbars, and wheel, keyboard and touch scrolling stay native everywhere.
 */
export default function PageScrollbar() {
  const pathname = usePathname();
  const startRoutingRef = useRef<() => void>(() => {});
  const lastPathRef = useRef(pathname);
  const railRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const rail = railRef.current;
    const slide = slideRef.current;
    const shift = shiftRef.current;
    const thumb = thumbRef.current;
    const cursor = cursorRef.current;
    if (!rail || !slide || !shift || !thumb || !cursor || root.dataset.scrollbar !== "custom") return;

    const scrollDriven = CSS.supports("animation-timeline: scroll()");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The page as last measured. Positions are computed from these so they
    // match what the slide layer last drew.
    let maxScroll = 0;
    let travel = 0;
    let railHeight = 0;
    let railLeft = 0;
    // Scroll offset last drawn; only tracked while a route change is easing.
    let lastTop = window.scrollY;
    // Inputs of the last measure, to skip work when a resize changed nothing.
    let lastScrollHeight = -1;
    let lastViewport = -1;
    let lastWidth = -1;
    let routing = false;
    let routingTimer = 0;
    // Running glides with their start values, so a new glide can pick up from
    // the current value without asking the browser for computed styles.
    let shiftAnimation: Animation | null = null;
    let shiftFrom = 0;
    let sizeAnimation: Animation | null = null;
    let sizeFrom = 1;
    let sizeTo = 1;

    // Eased progress (0..1) of a running glide, read from the animation itself.
    const progressOf = (animation: Animation) => animation.effect?.getComputedTiming().progress ?? 1;

    const positionAt = (top: number) => (maxScroll > 0 ? (Math.min(Math.max(top, 0), maxScroll) / maxScroll) * travel : 0);

    // Eases out a jump of `delta` px: the shift layer starts offset so the
    // thumb stays where it was drawn, then glides to zero. A new jump mid-glide
    // continues from wherever the glide currently is.
    const shiftBy = (delta: number) => {
      if (Math.abs(delta) < 0.5 || reducedMotion.matches) return;
      let current = 0;
      if (shiftAnimation) {
        current = shiftFrom * (1 - progressOf(shiftAnimation));
        shiftAnimation.cancel();
      }
      shiftFrom = current + delta;
      shiftAnimation = shift.animate([{ transform: `translateY(${shiftFrom}px)` }, { transform: "translateY(0px)" }], EASE);
      const animation = shiftAnimation;
      animation.onfinish = () => {
        if (shiftAnimation === animation) shiftAnimation = null;
      };
    };

    // Scales the thumb to `size` px, easing from its current length.
    const setSize = (size: number, animate: boolean) => {
      const to = Math.max(0, size - INSET * 2) / Math.max(1, railHeight - INSET * 2);
      let from = sizeTo;
      if (sizeAnimation) {
        from = sizeFrom + (sizeTo - sizeFrom) * progressOf(sizeAnimation);
        sizeAnimation.cancel();
        sizeAnimation = null;
      }
      if (to !== sizeTo || !thumb.style.transform) thumb.style.transform = `scaleY(${to})`;
      sizeTo = to;
      if (!animate || Math.abs(from - to) < 0.001 || reducedMotion.matches) return;
      sizeFrom = from;
      sizeAnimation = thumb.animate([{ transform: `scaleY(${from})` }, { transform: `scaleY(${to})` }], EASE);
      const animation = sizeAnimation;
      animation.onfinish = () => {
        if (sizeAnimation === animation) sizeAnimation = null;
      };
    };

    const syncProgress = () => {
      const progress = maxScroll > 0 ? Math.min(1, root.scrollTop / maxScroll) : 0;
      slide.style.setProperty("--thumb-progress", String(progress));
    };

    // Reads the page and moves every layer to match. ResizeObserver callbacks
    // run after layout, so the reads are free. Returns whether anything scrolls.
    // `animate` eases the thumb into its new size and offset; without it the
    // thumb jumps there, which is right while the rail is hidden.
    const measure = (animate: boolean) => {
      const viewport = root.clientHeight;
      const scrollHeight = root.scrollHeight;
      // Most body resizes (a reveal, a hover state) leave the page height and
      // viewport alone; nothing on the rail needs to change then.
      const width = window.innerWidth;
      if (scrollHeight === lastScrollHeight && viewport === lastViewport && width === lastWidth) return maxScroll > 0;
      lastScrollHeight = scrollHeight;
      lastViewport = viewport;
      lastWidth = width;
      const top = window.scrollY;
      // What the slide layer last drew: the eased offset during a route
      // change, otherwise the current scroll on the old measurements.
      const drawnPosition = positionAt(routing ? lastTop : top);
      railLeft = width - rail.offsetWidth;
      railHeight = rail.clientHeight;
      maxScroll = Math.max(0, scrollHeight - viewport);
      lastTop = top;
      if (maxScroll === 0) {
        // Nothing to scroll: the rail slides out with the thumb as it was
        // drawn, only easing it back to the top (the timeline goes inactive).
        travel = 0;
        if (animate) shiftBy(drawnPosition);
        return false;
      }
      const size = Math.max(MIN_THUMB, (railHeight * viewport) / scrollHeight);
      const nextTravel = railHeight - size;
      // Rewriting the keyframes' input restarts the composited slide animation.
      if (nextTravel !== travel) rail.style.setProperty("--thumb-travel", `${nextTravel}px`);
      travel = nextTravel;
      if (!scrollDriven) syncProgress();
      setSize(size, animate);
      if (animate) {
        shiftBy(drawnPosition - positionAt(lastTop));
      } else {
        shiftAnimation?.cancel();
        shiftAnimation = null;
      }
      return true;
    };

    // Eases out scroll jumps the page makes during a route change.
    const onRoutingScroll = () => {
      const top = window.scrollY;
      shiftBy(positionAt(lastTop) - positionAt(top));
      lastTop = top;
    };

    // These listeners exist only while a route change is easing, so ordinary
    // scrolling runs no script at all (the slide layer follows it in CSS).
    const endRouting = () => {
      window.clearTimeout(routingTimer);
      if (!routing) return;
      routing = false;
      window.removeEventListener("scroll", onRoutingScroll);
      window.removeEventListener("wheel", endRouting);
      window.removeEventListener("keydown", endRouting);
      window.removeEventListener("pointerdown", endRouting, { capture: true });
    };

    // During a route change the page jumps its scroll (back to the top, or to
    // a restored offset); those jumps are eased out instead of followed, until
    // the user scrolls, types or clicks.
    const startRouting = () => {
      window.clearTimeout(routingTimer);
      routingTimer = window.setTimeout(endRouting, ROUTE_MAX_MS);
      if (routing) return;
      routing = true;
      lastTop = window.scrollY;
      window.addEventListener("scroll", onRoutingScroll, { passive: true });
      window.addEventListener("wheel", endRouting, { passive: true });
      window.addEventListener("keydown", endRouting);
      window.addEventListener("pointerdown", endRouting, { capture: true });
    };
    startRoutingRef.current = startRouting;

    const update = () => {
      // Appearing: the rail slides in already at the thumb's real size and
      // offset, rather than resizing from wherever the hidden thumb was left.
      const scrollable = measure(rail.hasAttribute("data-active"));
      rail.toggleAttribute("data-active", scrollable);
      if (!scrollable) cursor.removeAttribute("data-visible");
    };

    // The rail hides the system cursor, so draw the pixel cursor where it
    // would be. During a drag, pointer capture keeps these events coming even
    // off the rail, where Chrome shows the real cursor again (it picks the
    // cursor by hit test, not by capture), so only draw while over the rail.
    const onCursorMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (event.clientX < railLeft) {
        cursor.removeAttribute("data-visible");
        return;
      }
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      cursor.dataset.visible = "true";
    };
    const onCursorLeave = () => {
      cursor.removeAttribute("data-visible");
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || maxScroll === 0) return;
      event.preventDefault();

      if (event.target !== thumb) {
        // Track click pages toward the pointer, like the native rail.
        const direction = event.clientY < thumb.getBoundingClientRect().top ? -1 : 1;
        window.scrollBy({ top: direction * root.clientHeight * 0.9 });
        return;
      }

      const startY = event.clientY;
      const startScroll = root.scrollTop;
      const ratio = maxScroll / Math.max(1, travel);
      rail.setPointerCapture(event.pointerId);
      rail.dataset.dragging = "true";

      const onMove = (moveEvent: PointerEvent) => {
        window.scrollTo({ top: startScroll + (moveEvent.clientY - startY) * ratio, behavior: "instant" });
      };
      const onEnd = () => {
        delete rail.dataset.dragging;
        rail.removeEventListener("pointermove", onMove);
        rail.removeEventListener("pointerup", onEnd);
        rail.removeEventListener("pointercancel", onEnd);
      };
      rail.addEventListener("pointermove", onMove);
      rail.addEventListener("pointerup", onEnd);
      rail.addEventListener("pointercancel", onEnd);
    };

    // First measure without easing so the thumb starts at its real size, then
    // enable the rail's fade so it fades in rather than popping in at hydration.
    const scrollable = measure(false);
    void getComputedStyle(rail).opacity;
    rail.dataset.ready = "true";
    rail.toggleAttribute("data-active", scrollable);

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.body);
    resizeObserver.observe(rail);
    rail.addEventListener("pointerdown", onPointerDown);
    rail.addEventListener("pointermove", onCursorMove);
    rail.addEventListener("pointerleave", onCursorLeave);
    if (!scrollDriven) window.addEventListener("scroll", syncProgress, { passive: true });

    return () => {
      endRouting();
      shiftAnimation?.cancel();
      sizeAnimation?.cancel();
      startRoutingRef.current = () => {};
      resizeObserver.disconnect();
      rail.removeEventListener("pointerdown", onPointerDown);
      rail.removeEventListener("pointermove", onCursorMove);
      rail.removeEventListener("pointerleave", onCursorLeave);
      window.removeEventListener("scroll", syncProgress);
    };
  }, []);

  // Compare with the last path rather than skipping the first run, so
  // StrictMode's double-run of effects on mount does not count as navigation.
  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    startRoutingRef.current();
  }, [pathname]);

  return (
    <>
      <div ref={railRef} className="page-scrollbar" aria-hidden="true">
        <div ref={slideRef} className="page-scrollbar__slide">
          <div ref={shiftRef} className="page-scrollbar__shift">
            <div ref={thumbRef} className="page-scrollbar__thumb" />
          </div>
        </div>
      </div>
      {/* Outside the rail: the rail's paint containment would clip it */}
      <div ref={cursorRef} className="page-scrollbar__cursor" aria-hidden="true" />
    </>
  );
}
