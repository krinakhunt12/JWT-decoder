import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for bottom-to-top scroll reveal animations with reverse on scroll back.
 * @param {Object} options Configuration options
 * @param {number} options.threshold Intersection threshold (0.0 - 1.0)
 * @param {string} options.rootMargin Margin around root
 * @param {boolean} options.resetOnExit Whether to reverse animation when scrolled out
 * @returns {[React.RefObject, boolean, string]} [ref, isVisible, scrollDirection]
 */
export function useScrollReveal({
  threshold = 0.12,
  rootMargin = "0px 0px -40px 0px",
  resetOnExit = true,
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("down");
  const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY.current) > 4) {
        setScrollDirection(currentScrollY > lastScrollY.current ? "down" : "up");
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (resetOnExit) {
          // Reverse animation when scrolled out
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, resetOnExit]);

  return [ref, isVisible, scrollDirection];
}
