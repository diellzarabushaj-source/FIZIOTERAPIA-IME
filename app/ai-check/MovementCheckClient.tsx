"use client";

import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/BrandMark";

type Landmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

type AnalysisResult = {
  score: number;
  alertType: "good" | "needs_attention" | "contact_physio";
  feedback: string;
  landmarksDetected: number;
};

type PoseLandmarkerLike = {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => { landmarks?: Landmark[][] };
};

const keyPoints = [11, 12, 23, 24, 25, 26, 27, 28];
const MEDIAPIPE_WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const GOOGLE_POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distance(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getAlertLabel(alertType: AnalysisResult["alertType"]) {
  if (alertType === "good") return "Lëvizje e mirë";
  if (alertType === "needs_attention") return "Duhet më shumë kontroll";
  return "Kontakto fizioterapeutin";
}

function analyzePose(landmarks: Landmark[] | undefined): AnalysisResult {
  if (!landmarks?.length) {
    return {
      score: 0,
      alertType: "contact_physio",
      feedback: "Trupi nuk u detektua qartë. Vendose telefonin më larg dhe sigurohu që trupi të shihet në kamerë.",
      landmarksDetected: 0,
    };
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
    const leftChain = distance(leftHip, leftKnee);
    const rightChain = distance(rightHip, rightKnee);
    const difference = Math.abs(leftChain - rightChain);
    symmetryScore = Math.round(clamp(25 - difference * 140, 4, 25));
  }

  if (leftShoulder && rightShoulder && leftHip && rightHip && leftKnee && rightKnee) {
    const trunkCenter = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4;
    const kneeCenter = (leftKnee.x + rightKnee.x) / 2;
    const alignment = Math.abs(trunkCenter - kneeCenter);
    controlScore = Math.round(clamp(15 - alignment * 80, 3, 15));
  }

  const score = clamp(visibilityScore + stabilityScore + symmetryScore + controlScore, 0, 100);
  const alertType = score < 60 ? "contact_physio" : score < 80 ? "needs_attention" : "good";

  let feedback = "Lëvizja është e kontrolluar. Vazhdo me ritëm të ngadalshëm dhe pa dhimbje të fortë.";
  if (alertType === "needs_attention") {
    feedback = "Lëvizja u detektua, por kontrolli nuk është optimal. Ngadalëso ritmin dhe mbaje legenin/trungun më stabil.";
  }
  if (alertType === "contact_physio") {
    feedback = "AI score është i ulët ose trupi nuk u pa qartë. Mos e vazhdo ushtrimin pa e kontaktuar fizioterapeutin.";
  }

  return {
    score,
    alertType,
    feedback,
    landmarksDetected: visible.length,
  };
}

export function MovementCheckClient({ planExerciseId }: { planExerciseId?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseRef = useRef<PoseLandmarkerLike | null>(null);
  const [status, setStatus] = useState("Gati për Google MediaPipe Movement Check");
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
        setStatus("Duke ngarkuar Google MediaPipe Pose Landmarker...");
        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: GOOGLE_POSE_MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (!cancelled) {
          poseRef.current = poseLandmarker as PoseLandmarkerLike;
          setModelReady(true);
          setStatus("Google MediaPipe modeli është gati. Aktivizo kamerën.");
        }
      } catch (loadError) {
        console.error(loadError);
        if (!cancelled) {
          setError("Google MediaPipe nuk u ngarkua. Provo refresh ose përdor Chrome/Safari modern.");
          setStatus("Gabim gjatë ngarkimit të AI modelit.");
        }
      }
    }

    loadModel();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setStatus("Kamera është aktive. Vendose gjithë trupin në ekran dhe kliko Analyze movement.");
    } catch (cameraError) {
      console.error(cameraError);
      setError("Kamera nuk u hap. Lejo camera permission në browser dhe provo përsëri.");
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

    if (!poseRef.current || !videoRef.current) {
      setError("AI modeli ose kamera nuk është gati ende.");
      return;
    }

    const output = poseRef.current.detectForVideo(videoRef.current, performance.now());
    const firstPose = output.landmarks?.[0];
    const analysis = analyzePose(firstPose);

    setResult(analysis);
    setSaved(false);
    setStatus("Analiza u krye. Shiko score dhe feedback më poshtë.");
  }

  async function saveResult() {
    if (!result || !planExerciseId) {
      setError("Mungon ushtrimi aktiv ose rezultati i analizës.");
      return;
    }

    setSaving(true);
    setError("");

    const response = await fetch("/api/patient/ai-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planExerciseId,
        score: result.score,
        feedback: result.feedback,
        alertType: result.alertType,
        landmarksDetected: result.landmarksDetected,
      }),
    });

    const payload = await response.json();
    setSaving(false);

    if (!payload.ok) {
      setError(payload.error || "AI check nuk u ruajt.");
      return;
    }

    setSaved(true);
    setStatus("AI check u ruajt në Supabase dhe fizioterapeuti mund ta shohë rezultatin.");
  }

  return (
    <section className="ai-check-shell">
      <aside className="ai-check-sidebar">
        <BrandMark compact />
        <h2>AI Movement Check</h2>
        <p>Google MediaPipe Pose Landmarker</p>
        <div className="ai-status-stack">
          <div className={modelReady ? "ai-status ready" : "ai-status loading"}>
            <b>Modeli</b>
            <span>{modelReady ? "Gati" : "Duke u ngarkuar"}</span>
          </div>
          <div className={cameraReady ? "ai-status ready" : "ai-status loading"}>
            <b>Kamera</b>
            <span>{cameraReady ? "Aktive" : "Joaktive"}</span>
          </div>
          <div className={result ? "ai-status ready" : "ai-status loading"}>
            <b>Rezultati</b>
            <span>{result ? `${result.score}%` : "Pa analizë"}</span>
          </div>
        </div>
        <div className="ai-disclaimer-card">
          <b>Rregull klinik</b>
          <span>AI nuk diagnostikon, nuk cakton terapi dhe nuk e zëvendëson fizioterapeutin.</span>
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
            <span className="badge">Google MediaPipe · Real camera</span>
            <h1>Kontrollo cilësinë e lëvizjes me kamerë.</h1>
            <p>
              Ky modul përdor Google MediaPipe Pose Landmarker për të detektuar landmark-et e trupit në browser.
              Video nuk ruhet në MVP; ruhet vetëm score, feedback dhe alert për fizioterapeutin.
            </p>
          </div>
          <div className="ai-score-orb">
            <span>Score</span>
            <strong>{result ? `${result.score}%` : "—"}</strong>
            <small>{result ? getAlertLabel(result.alertType) : "Pa analizë"}</small>
          </div>
        </section>

        {error && <div className="role-warning">{error}</div>}
        <div className="ai-safety-banner">Nëse ke dhimbje të fortë, marramendje ose pasiguri, ndalo ushtrimin dhe kontakto fizioterapeutin.</div>

        <section id="camera" className="ai-check-grid">
          <div className="ai-camera-card">
            <div className="section-header-row">
              <div>
                <span className="mini-badge">Live camera</span>
                <h2>Kamera + detektim i trupit</h2>
                <p>{status}</p>
              </div>
              <span className="badge">Browser only</span>
            </div>

            <div className="ai-video-frame">
              <video ref={videoRef} playsInline muted />
              {!cameraReady && (
                <div className="ai-video-placeholder">
                  <div className="ai-body-guide">
                    <span />
                    <span />
                    <span />
                  </div>
                  <p>Vendose telefonin stabil dhe sigurohu që trupi të shihet qartë.</p>
                </div>
              )}
            </div>

            <div className="button-row ai-button-row">
              <button className="button" type="button" onClick={startCamera} disabled={!modelReady || cameraReady}>Aktivizo kamerën</button>
              <button className="button secondary" type="button" onClick={analyzeMovement} disabled={!cameraReady || !modelReady}>Analyze movement</button>
              <button className="button secondary" type="button" onClick={stopCamera} disabled={!cameraReady}>Ndalo kamerën</button>
            </div>
          </div>

          <div id="result" className="ai-result-card">
            <span className="mini-badge">Rezultati</span>
            <h2>Feedback i lëvizjes</h2>
            {result ? (
              <>
                <div className="ai-result-score">
                  <strong>{result.score}%</strong>
                  <span>{getAlertLabel(result.alertType)}</span>
                </div>
                <div className="ai-result-metrics">
                  <div><b>{result.landmarksDetected}/8</b><span>landmarks kryesore</span></div>
                  <div><b>{result.alertType}</b><span>alert type</span></div>
                </div>
                <p>{result.feedback}</p>
                <button className="button" type="button" onClick={saveResult} disabled={saving || saved || !planExerciseId}>
                  {saved ? "U ruajt" : saving ? "Duke ruajtur..." : "Ruaj në Supabase"}
                </button>
              </>
            ) : (
              <div className="ai-empty-result">
                <p>Aktivizo kamerën dhe kliko Analyze movement për rezultat.</p>
                <div className="ai-result-metrics">
                  <div><b>0/8</b><span>landmarks</span></div>
                  <div><b>—</b><span>score</span></div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
