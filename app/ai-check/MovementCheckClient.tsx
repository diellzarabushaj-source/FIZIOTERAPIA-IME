"use client";

import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import {
  hasValidCameraConsent,
  recordCameraConsent,
} from "@/src/features/ai-movement-check/domain/camera-consent";
import {
  analyzeMovementPose,
  type MovementAnalysisResult,
  type MovementLandmark,
} from "@/src/features/ai-movement-check/domain/movement-analysis";

type ReadyAnalysis = Extract<MovementAnalysisResult, { status: "ready" }>;
type PoseLandmarkerLike = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestamp: number,
  ) => { landmarks?: MovementLandmark[][] };
  close?: () => void;
};

const MEDIAPIPE_VERSION = "0.10.35";
const MEDIAPIPE_WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const GOOGLE_POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

function getAlertLabel(alertType: ReadyAnalysis["alertType"]) {
  if (alertType === "good") return "Lëvizja duket e kontrolluar";
  if (alertType === "needs_attention") return "Bëje më ngadalë";
  return "Kërkon rishikim nga fizioterapeuti";
}

function getBodyVisibleLabel(count: number) {
  return count >= 7
    ? "Trupi shihet qartë"
    : count >= 4
      ? "Trupi shihet pjesërisht"
      : "Trupi nuk shihet qartë";
}

function cameraErrorMessage(error: unknown) {
  if (!(error instanceof DOMException)) {
    return "Kamera nuk u hap. Kontrollo browser-in dhe provo përsëri.";
  }

  if (["NotAllowedError", "PermissionDeniedError"].includes(error.name)) {
    return "Leja e kamerës u refuzua. Hape lejen e kamerës në browser dhe provo përsëri.";
  }
  if (["NotFoundError", "DevicesNotFoundError"].includes(error.name)) {
    return "Nuk u gjet kamerë në këtë pajisje. Mund të vazhdosh pa AI Movement Check.";
  }
  if (["NotReadableError", "TrackStartError"].includes(error.name)) {
    return "Kamera po përdoret nga një aplikacion tjetër ose nuk mund të hapet tani.";
  }
  if (error.name === "SecurityError") {
    return "Browser-i kërkon një lidhje të sigurt HTTPS për ta përdorur kamerën.";
  }
  return "Kamera nuk u hap. Kontrollo lejet e browser-it dhe provo përsëri.";
}

export function MovementCheckClient({ planExerciseId }: { planExerciseId?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseRef = useRef<PoseLandmarkerLike | null>(null);
  const [status, setStatus] = useState("Po përgatitet kontrolli i lëvizjes...");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [result, setResult] = useState<ReadyAnalysis | null>(null);
  const [retryFeedback, setRetryFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setConsentConfirmed(hasValidCameraConsent(window.sessionStorage));
    setCameraSupported(Boolean(navigator.mediaDevices?.getUserMedia));

    let cancelled = false;
    async function loadModel() {
      try {
        setStatus("Po përgatitet kontrolli i lëvizjes...");
        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

        let poseLandmarker: PoseLandmarkerLike;
        try {
          poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: GOOGLE_POSE_MODEL_URL,
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
          }) as PoseLandmarkerLike;
        } catch {
          poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: GOOGLE_POSE_MODEL_URL },
            runningMode: "VIDEO",
            numPoses: 1,
          }) as PoseLandmarkerLike;
        }

        if (cancelled) {
          poseLandmarker.close?.();
          return;
        }
        poseRef.current = poseLandmarker;
        setModelReady(true);
        setStatus("Gati. Konfirmo pëlqimin dhe aktivizo kamerën.");
      } catch {
        if (!cancelled) {
          setError("Modeli i lëvizjes nuk u ngarkua. Mund të vazhdosh pa kamerë dhe ta kontaktosh fizioterapeutin.");
          setStatus("Kontrolli i lëvizjes nuk është i disponueshëm.");
        }
      }
    }

    void loadModel();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      poseRef.current?.close?.();
    };
  }, []);

  function confirmConsent() {
    const stored = recordCameraConsent(window.sessionStorage);
    setConsentConfirmed(stored);
    if (!stored) {
      setError("Pëlqimi nuk mund të ruhet në këtë browser. Kontrollo privacy settings dhe provo përsëri.");
    } else {
      setError("");
      setStatus("Pëlqimi u konfirmua. Mund ta aktivizosh kamerën.");
    }
  }

  async function startCamera() {
    setError("");
    setRetryFeedback("");

    if (!consentConfirmed) {
      setError("Konfirmo pëlqimin e informuar para se ta aktivizosh kamerën.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraSupported(false);
      setError("Ky browser nuk e mbështet kamerën për këtë funksion. Vazhdo pa AI Movement Check.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setStatus("Vendose pajisjen stabil dhe sigurohu që trupi të shihet në ekran.");
    } catch (cameraError) {
      setError(cameraErrorMessage(cameraError));
      setCameraReady(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
    setStatus("Kamera u ndal. Mund ta aktivizosh përsëri kur je gati.");
  }

  function analyzeMovement() {
    setError("");
    setRetryFeedback("");
    setSaved(false);

    const video = videoRef.current;
    if (!poseRef.current || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setError("Kamera nuk është gati ende. Prit pak dhe provo përsëri.");
      return;
    }

    try {
      const output = poseRef.current.detectForVideo(video, performance.now());
      const analysis = analyzeMovementPose(output.landmarks?.[0]);
      if (analysis.status === "retry") {
        setResult(null);
        setRetryFeedback(analysis.feedback);
        setStatus("Frame-i nuk u analizua. Rregullo kamerën dhe provo përsëri.");
        return;
      }

      setResult(analysis);
      setStatus("Kontrolli u krye. Shiko feedback-un më poshtë.");
    } catch {
      setResult(null);
      setError("Kontrolli i frame-it dështoi. Ndalo kamerën, aktivizoje përsëri dhe provo prapë.");
    }
  }

  async function saveResult() {
    if (!result || !planExerciseId) {
      setError("Mungon ushtrimi aktiv ose një rezultat i vlefshëm.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/patient/ai-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planExerciseId,
          score: result.score,
          landmarksDetected: result.landmarksDetected,
        }),
      });
      const payload = await response.json().catch(() => null) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error || "Rezultati nuk u ruajt. Provo përsëri.");
        return;
      }
      setSaved(true);
      setStatus("Rezultati u ruajt dhe fizioterapeuti mund ta rishikojë.");
    } catch {
      setError("Nuk ka lidhje me serverin. Video nuk u dërgua; provo ta ruash rezultatin përsëri.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ai-check-shell">
      <aside className="ai-check-sidebar">
        <BrandMark compact />
        <h2>Kontrollo lëvizjen</h2>
        <p>Opsionale. Nuk zëvendëson fizioterapeutin.</p>
        <div className="ai-status-stack">
          <div className={modelReady ? "ai-status ready" : "ai-status loading"}>
            <b>Hapi 1</b><span>{modelReady ? "Modeli gati" : "Duke u përgatitur"}</span>
          </div>
          <div className={consentConfirmed ? "ai-status ready" : "ai-status loading"}>
            <b>Hapi 2</b><span>{consentConfirmed ? "Pëlqimi i konfirmuar" : "Konfirmo pëlqimin"}</span>
          </div>
          <div className={cameraReady ? "ai-status ready" : "ai-status loading"}>
            <b>Hapi 3</b><span>{cameraReady ? "Kamera aktive" : "Aktivizo kamerën"}</span>
          </div>
          <div className={result ? "ai-status ready" : "ai-status loading"}>
            <b>Hapi 4</b><span>{result ? getAlertLabel(result.alertType) : "Kontrollo lëvizjen"}</span>
          </div>
        </div>
        <div className="ai-disclaimer-card">
          <b>Kufi klinik</b>
          <span>Ky funksion është eksperimental dhe nuk ka saktësi diagnostike. Diagnozën, planin dhe ndryshimet i vendos vetëm fizioterapeuti.</span>
        </div>
        <div className="side-menu">
          <a className="active" href="#camera">Kamera</a>
          <a href="#result">Rezultati</a>
          <a href="/patient-dashboard">Kthehu te plani</a>
        </div>
      </aside>

      <div className="ai-check-main">
        <section className="ai-check-hero">
          <div>
            <span className="badge">Kontroll opsional</span>
            <h1>Feedback orientues për cilësinë e lëvizjes.</h1>
            <p>
              Analiza kryhet lokalisht në browser. Video dhe frame-t nuk ruhen dhe nuk
              dërgohen në server; ruhet vetëm rezultati numerik pasi ta zgjedhësh vetë.
            </p>
          </div>
          <div className="ai-score-orb">
            <span>Rezultati</span>
            <strong>{result ? `${result.score}%` : "—"}</strong>
            <small>{result ? getAlertLabel(result.alertType) : "Pa rezultat"}</small>
          </div>
        </section>

        <p className="sr-only" aria-live="polite">{status}</p>
        {error && <div className="role-warning" role="alert">{error}</div>}
        {retryFeedback && <div className="role-warning" role="status">{retryFeedback}</div>}
        <div className="ai-safety-banner">
          Nëse ke dhimbje 7/10 ose më shumë, marramendje ose pasiguri, ndalo ushtrimin dhe kontakto fizioterapeutin.
        </div>

        <section id="camera" className="ai-check-grid">
          <div className="ai-camera-card">
            <div className="section-header-row">
              <div>
                <span className="mini-badge">Kamera</span>
                <h2>Vendose pajisjen dhe kontrollo lëvizjen</h2>
                <p>{status}</p>
              </div>
              <span className="badge">Asnjë video nuk ruhet</span>
            </div>

            {!consentConfirmed && (
              <div className="ai-consent-gate">
                <label>
                  <input type="checkbox" onChange={(event) => {
                    if (event.currentTarget.checked) confirmConsent();
                  }} />
                  <span>
                    E kuptoj se kamera është opsionale, analiza nuk është diagnozë dhe
                    mund të vazhdoj pa këtë funksion. <a href="/camera-consent">Lexo pëlqimin e plotë</a>.
                  </span>
                </label>
              </div>
            )}

            {!cameraSupported && (
              <div className="ai-empty-result" role="status">
                <p>Ky browser nuk e mbështet kamerën. Plani yt mbetet i përdorshëm pa AI Movement Check.</p>
                <a className="button secondary" href="/patient-dashboard">Vazhdo te plani</a>
              </div>
            )}

            <div className="ai-video-frame">
              <video ref={videoRef} playsInline muted aria-label="Pamja lokale e kamerës" />
              {!cameraReady && (
                <div className="ai-video-placeholder">
                  <div className="ai-body-guide"><span /><span /><span /></div>
                  <p>Vendose pajisjen stabil dhe sigurohu që trupi të shihet qartë.</p>
                </div>
              )}
            </div>

            <div className="button-row ai-button-row">
              <button
                className="button"
                type="button"
                onClick={startCamera}
                disabled={!modelReady || !consentConfirmed || cameraReady || !cameraSupported}
              >
                Aktivizo kamerën
              </button>
              <button
                className="button secondary"
                type="button"
                onClick={analyzeMovement}
                disabled={!cameraReady || !modelReady}
              >
                Kontrollo lëvizjen
              </button>
              <button
                className="button secondary"
                type="button"
                onClick={stopCamera}
                disabled={!cameraReady}
              >
                Ndalo kamerën
              </button>
            </div>
          </div>

          <div id="result" className="ai-result-card">
            <span className="mini-badge">Rezultati orientues</span>
            <h2>Feedback për lëvizjen</h2>
            {result ? (
              <>
                <div className="ai-result-score">
                  <strong>{result.score}%</strong>
                  <span>{getAlertLabel(result.alertType)}</span>
                </div>
                <div className="ai-result-metrics">
                  <div><b>{getBodyVisibleLabel(result.landmarksDetected)}</b><span>qartësia e kamerës</span></div>
                  <div><b>{result.alertType === "good" ? "OK" : "Rishiko"}</b><span>feedback orientues</span></div>
                </div>
                <p>{result.feedback}</p>
                <button
                  className="button"
                  type="button"
                  onClick={saveResult}
                  disabled={saving || saved || !planExerciseId}
                >
                  {saved ? "U ruajt" : saving ? "Duke ruajtur..." : "Ruaj rezultatin për fizioterapeutin"}
                </button>
              </>
            ) : (
              <div className="ai-empty-result">
                <p>Konfirmo pëlqimin, aktivizo kamerën dhe kliko “Kontrollo lëvizjen”.</p>
                <div className="ai-result-metrics">
                  <div><b>—</b><span>qartësia e kamerës</span></div>
                  <div><b>—</b><span>rezultati</span></div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
