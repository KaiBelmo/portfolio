import { domAnimation } from "framer-motion";

// Loaded after hydration by MotionProvider so the animation engine stays out
// of the critical JavaScript every page downloads.
export default domAnimation;
