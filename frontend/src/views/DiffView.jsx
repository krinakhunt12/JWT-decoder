import { useJwtContext } from "../context/JwtContext";
import ErrorBoundary from "../components/ErrorBoundary";
import DiffPanel from "../components/DiffPanel";

export default function DiffView() {
  const { token, result, resetAllStates } = useJwtContext();

  return (
    <ErrorBoundary onReset={resetAllStates}>
      <div className="w-full animate-fade-up">
        <DiffPanel activeToken={result ? token : ""} />
      </div>
    </ErrorBoundary>
  );
}
