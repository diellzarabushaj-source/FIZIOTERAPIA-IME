"use client";

import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";

type Landmark = { x: number; y: number; z?: number; visibility?: number };
type AnalysisResult = { score: number; alertType: "good" | "needs_attention" | "contact_physio"; feedback: string; landmarksDetected: number };
type PoseLandmarkerLike = { detectForVideo: (video: HTMLVideoElement, timestamp: number) => { landmarks?: Landmark[][] } };

const keyPoints = [11, 12, 23, 24, 25, 26, 27, 28];
const MEDIAPIPE_WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const GOOGLE_POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
function distance(a: Landmark, b: Landmark) { return Math.hypot(a.x - b.x, a.y - b.y); }
function getAlertLabel(alertType: AnalysisResult["alertType"]) {
  if (alertType === "good") return "Lëvizja duket mirë";
  if (alertType === "needs_attention") return "Bëje më ngadalë";
  return "Kontakto fizioterapeutin";
}
function getBodyVisibleLabel(count: number) { return count >= 7 ? "Trupi shihet qartë" : count >= 4 ? "Trupi shihet pjesërisht" : "Trupi nuk shihet qartë"; }

function analyzePose(landmarks: Landmark[] | undefined): AnalysisResult {
  if (!landmarks?.length) {
    return { score: 0, alertType: "contact_physio", feedback: "Trupi nuk u pa qartë. Vendose telefonin më larg, mbaje stabil dhe provo përsëri.", landmarksDetected: 0 };
  }

  const visible = keyPoints.filter((index) => (landmarks[index]?.visibility ?? 0.8) > 0.45);
  const visibilityScore = Math.round((visible.length / keyPoints.length) * 35);
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  let stabilityScore = 25;
  let symmetryScore = 25;
  let controlScore = 15;

  if (leftShoulder && rightShoulder && leftHip && rightHip) {
    const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipTilt = Math.abs(leftHip.y - rightHip.y);
    stabilityScore = Math.round(clamp(25 - (shoulderTilt + hipTilt) * 170, 4, 25));
  }
  if (leftHip && rightHip && leftKnee && rightKnee) {
    const difference = Math.abs(distance(leftHip, leftKnee) - distance(rightHip, rightKnee));
    symmetryScore = Math.round(clamp(25 - difference * 140, 4, 25));
  }
  if (leftShoulder && rightShoulder && leftHip && rightHip && leftKnee && rightKnee) {
    const trunkCenter = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4;
    const kneeCenter = (leftKnee.x + rightKnee.x) / 2;
    controlScore = Math.round(clamp(15 - Math.abs(trunkCenter - kneeCenter) * 80, 3, 15));
  }

  const score = clamp(visibilityScore + stabilityScore + symmetryScore + controlScore, 0, 100);
  const alertType = score < 60 ? "contact_physio" : score < 80 ? "needs_attention" : "good";
  const feedback = alertType === "good"
    ? "Lëvizja duket e kontrolluar. Vazhdo ngadalë dhe pa dhimbje të fortë."
    : alertType === "needs_attention"
      ? "Lëvizja u pa, por bëje më ngadalë dhe mbaje trupin më stabil."
      : "Rezultati është i ulët ose trupi nuk u pa qartë. Mos e vazhdo ushtrimin nëse nuk je i/e sigurt.";

  return { score, alertType, feedback, landmarksDetected: visible.length };
}

export function MovementCheckClient({ planExerciseId }: { planExerciseId?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseRef = useRef<PoseLandmarkerLike | null>(null);
  const [status, setStatus] = useState("Po përgatitet kontrolli i lëvizjes...");
  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadModel() {
      try {
        setStatus("Po përgatitet kontrolli i lëvizjes...");
        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: GOOGLE_POSE_MODEL_URL, delegate: "GPU" }, runningMode: "VIDEO", numPoses: 1 });
        if (!cancelled) { poseRef.current = poseLandmarker as PoseLandmarkerLike; setModelReady(true); setStatus("Gati. Tani aktivizo kamerën."); }
      } catch (loadError) {
        console.error(loadError);
        if (!cancelled) { setError("Kontrolli nuk u hap. Provo refresh ose përdor Chrome/Safari modern."); setStatus("Gabim gjatë përgatitjes."); }
      }
    }
    loadModel();
    return () => { cancelled = true; streamRef.current?.getTracks().forEach((track) => track.stop()); };
  }, []);

  async function startCamera() {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraReady(true);
      setStatus("Vendose telefonin stabil dhe sigurohu që trupi të shihet në ekran.");
    } catch (cameraError) {
      console.error(cameraError);
      setError("Kamera nuk u hap. Lejo kamerën në browser dhe provo përsëri.");
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
    if (!poseRef.current || !videoRef.current) { setError("Kamera nuk është gati ende."); return; }
    const output = poseRef.current.detectForVideo(videoRef.current, performance.now());
    const analysis = analyzePose(output.landmarks?.[0]);
    setResult(analysis);
    setSaved(false);
    setStatus("Kontrolli u krye. Shiko rezultatin poshtë.");
  }

  async function saveResult() {
    if (!result || !planExerciseId) { setError("Mungon ushtrimi aktiv ose rezultati."); return; }
    setSaving(true);
    setError("");
    const response = await fetch("/api/patient/ai-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planExerciseId, score: result.score, feedback: result.feedback, alertType: result.alertType, landmarksDetected: result.landmarksDetected }) });
    const payload = await response.json();
    setSaving(false);
    if (!payload.ok) { setError(payload.error || "Rezultati nuk u ruajt."); return; }
    setSaved(true);
    setStatus("Rezultati u ruajt dhe fizioterapeuti mund ta shohë.");
  }

  return (
    <section className="ai-check-shell">
      <aside className="ai-check-sidebar">
        <BrandMark compact />
        <h2>Kontrollo lëvizjen</h2>
        <p>Opsionale. Nuk zëvendëson fizioterapeutin.</p>
        <div className="ai-status-stack">
          <div className={modelReady ? "ai-status ready" : "ai-status loading"}><b>Hapi 1</b><span>{modelReady ? "Gati" : "Duke u përgatitur"}</span></div>
          <div className={cameraReady ? "ai-status ready" : "ai-status loading"}><b>Hapi 2</b><span>{cameraReady ? "Kamera aktive" : "Aktivizo kamerën"}</span></div>
          <div className={result ? "ai-status ready" : "ai-status loading"}><b>Hapi 3</b><span>{result ? getAlertLabel(result.alertType) : "Kontrollo lëvizjen"}</span></div>
        </div>
        <div className="ai-disclaimer-card"><b>Rregull klinik</b><span>AI jep vetëm feedback për lëvizjen. Diagnozën, planin dhe ndryshimet i vendos fizioterapeuti.</span></div>
        <div className="side-menu"><a className="active" href="#camera">Kamera</a><a href="#result">Rezultati</a><a href="/patient-dashboard">Kthehu te plani</a></div>
      </aside>

      <div className="ai-check-main">
        <section className="ai-check-hero">
          <div>
            <span className="badge">Kontroll opsional</span>
            <h1>Shiko a po bëhet lëvizja me kontroll.</h1>
            <p>Vendose telefonin stabil, sigurohu që trupi shihet qartë dhe bëje ushtrimin ngadalë. Video nuk ruhet; ruhet vetëm rezultati për fizioterapeutin.</p>
          </div>
          <div className="ai-score-orb"><span>Rezultati</span><strong>{result ? `${result.score}%` : "—"}</strong><small>{result ? getAlertLabel(result.alertType) : "Pa kontroll"}</small></div>
        </section>

        {error && <div className="role-warning">{error}</div>}
        <div className="ai-safety-banner">Nëse ke dhimbje të fortë, marramendje ose pasiguri, ndalo ushtrimin dhe kontakto fizioterapeutin.</div>

        <section id="camera" className="ai-check-grid">
          <div className="ai-camera-card">
            <div className="section-header-row"><div><span className="mini-badge">Kamera</span><h2>Vendose telefonin dhe kontrollo</h2><p>{status}</p></div><span className="badge">Video nuk ruhet</span></div>
            <div className="ai-video-frame">
              <video ref={videoRef} playsInline muted />
              {!cameraReady && <div className="ai-video-placeholder"><div className="ai-body-guide"><span /><span /><span /></div><p>Vendose telefonin stabil dhe sigurohu që trupi të shihet qartë.</p></div>}
            </div>
            <div className="button-row ai-button-row">
              <button className="button" type="button" onClick={startCamera} disabled={!modelReady || cameraReady}>Aktivizo kamerën</button>
              <button className="button secondary" type="button" onClick={analyzeMovement} disabled={!cameraReady || !modelReady}>Kontrollo lëvizjen</button>
              <button className="button secondary" type="button" onClick={stopCamera} disabled={!cameraReady}>Ndalo kamerën</button>
            </div>
          </div>

          <div id="result" className="ai-result-card">
            <span className="mini-badge">Rezultati</span>
            <h2>Feedback për lëvizjen</h2>
            {result ? (
              <>
                <div className="ai-result-score"><strong>{result.score}%</strong><span>{getAlertLabel(result.alertType)}</span></div>
                <div className="ai-result-metrics"><div><b>{getBodyVisibleLabel(result.landmarksDetected)}</b><span>qartësia e kamerës</span></div><div><b>{result.alertType === "good" ? "OK" : "Kujdes"}</b><span>udhëzimi</span></div></div>
                <p>{result.feedback}</p>
                <button className="button" type="button" onClick={saveResult} disabled={saving || saved || !planExerciseId}>{saved ? "U ruajt" : saving ? "Duke ruajtur..." : "Ruaj për fizioterapeutin"}</button>
              </>
            ) : (
              <div className="ai-empty-result"><p>Aktivizo kamerën dhe kliko “Kontrollo lëvizjen”.</p><div className="ai-result-metrics"><div><b>—</b><span>qartësia e kamerës</span></div><div><b>—</b><span>rezultati</span></div></div></div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
