import { lazy, Suspense } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import LoadingFallback from "./components/LoadingFallback";
import ErrorBoundary from "./components/ErrorBoundary";
import PageTransition from "./components/PageTransition";
import ToolLayout from "./components/ToolLayout";
import { useJwtContext } from "./context/JwtContext";

// Lazy-loaded route components for high performance and code-splitting
const HomePage = lazy(() => import("./components/Home"));
const AboutPage = lazy(() => import("./components/About"));
const ContactPage = lazy(() => import("./components/Contact"));
const DecoderView = lazy(() => import("./views/DecoderView"));
const AuditView = lazy(() => import("./views/AuditView"));
const DiffView = lazy(() => import("./views/DiffView"));
const GeneratorView = lazy(() => import("./views/GeneratorView"));
const NotFoundView = lazy(() => import("./views/NotFoundView"));

export default function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loadSample, addToast, resetAllStates } = useJwtContext();

  return (
    <ErrorBoundary resetKeys={[location.pathname]} onReset={resetAllStates}>
      <Suspense fallback={<LoadingFallback />}>
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            {/* Landing & Informational Routes */}
            <Route
              path="/"
              element={
                <HomePage
                  loadSampleAndNavigate={() => {
                    loadSample();
                    navigate("/decode");
                  }}
                />
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage addToast={addToast} />} />

            {/* Cryptographic Tools Suite with Shared ToolLayout & Sub-Tabs */}
            <Route element={<ToolLayout />}>
              <Route path="/decode" element={<DecoderView />} />
              <Route path="/audit" element={<AuditView />} />
              <Route path="/diff" element={<DiffView />} />
              <Route path="/generate" element={<GeneratorView />} />
            </Route>

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </PageTransition>
      </Suspense>
    </ErrorBoundary>
  );
}
