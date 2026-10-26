import { useNavigate } from "react-router-dom";
import { useJwtContext } from "../context/JwtContext";
import ErrorBoundary from "../components/ErrorBoundary";
import GeneratorPanel from "../components/GeneratorPanel";

export default function GeneratorView() {
  const navigate = useNavigate();
  const {
    genHeaderAlg,
    setGenHeaderAlg,
    genPayloadStr,
    setGenPayloadStr,
    genSecret,
    setGenSecret,
    genExpiresIn,
    setGenExpiresIn,
    generatedToken,
    genResult,
    genError,
    showGenSecret,
    setShowGenSecret,
    openInDecoder,
    resetAllStates,
  } = useJwtContext();

  return (
    <ErrorBoundary onReset={resetAllStates}>
      <div className="w-full animate-fade-up">
        <GeneratorPanel
          genHeaderAlg={genHeaderAlg}
          setGenHeaderAlg={setGenHeaderAlg}
          genPayloadStr={genPayloadStr}
          setGenPayloadStr={setGenPayloadStr}
          genSecret={genSecret}
          setGenSecret={setGenSecret}
          genExpiresIn={genExpiresIn}
          setGenExpiresIn={setGenExpiresIn}
          generatedToken={generatedToken}
          genResult={genResult}
          genError={genError}
          showGenSecret={showGenSecret}
          setShowGenSecret={setShowGenSecret}
          openInDecoder={(tok) => openInDecoder(tok, navigate)}
        />
      </div>
    </ErrorBoundary>
  );
}
