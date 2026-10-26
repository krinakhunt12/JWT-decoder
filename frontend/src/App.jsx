import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { JwtProvider, useJwtContext } from "./context/JwtContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ToastContainer from "./components/ToastContainer";
import AppRoutes from "./router";

function AppLayout() {
  const { loadSample } = useJwtContext();

  // Global bottom-to-top scroll animation observer with reverse on scroll exit
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            // Reverse on reverse scroll
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -45px 0px",
      }
    );

    const observeTargets = () => {
      const targets = document.querySelectorAll(".reveal-on-scroll, [data-scroll-reveal]");
      targets.forEach((target) => observer.observe(target));
    };

    observeTargets();

    const mutationObserver = new MutationObserver(() => {
      observeTargets();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen dot-grid-animated flex flex-col bg-background text-foreground relative selection:bg-indigo-500/15 selection:text-indigo-600">
      {/* Floating System Toasts */}
      <ToastContainer />

      {/* Universal Navigation Bar */}
      <Navbar loadSample={loadSample} />

      {/* Ambient Cyber Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] animate-float-orb-slow" />
        <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-violet-600/5 rounded-full blur-[130px] animate-float-orb-fast" />
        <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-cyan-500/4 rounded-full blur-[120px]" />
      </div>

      {/* Main Dynamic View Area */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col">
        <AppRoutes />
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary title="JWT Console Critical Exception">
      <JwtProvider>
        <AppLayout />
      </JwtProvider>
    </ErrorBoundary>
  );
}