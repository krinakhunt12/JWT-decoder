import { useRef, useState, useEffect } from "react";

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  distance = 36,
  duration = 650,
  threshold = 0.12,
  rootMargin = "0px 0px -40px 0px",
  as: Component = "div",
  reverse = true,
  ...rest
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (reverse) {
          // Reverse back when scrolled out of view
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, reverse]);

  return (
    <Component
      ref={ref}
      className={`scroll-reveal-container ${isVisible ? "scroll-reveal-visible" : "scroll-reveal-hidden"} ${className}`}
      style={{
        "--reveal-distance": `${distance}px`,
        "--reveal-duration": `${duration}ms`,
        "--reveal-delay": `${delay}ms`,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
