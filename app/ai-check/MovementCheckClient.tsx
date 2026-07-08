"use client";

import { useEffect, useRef, useState } from "react";

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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distance(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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
  const [status, setStatus] = useState("Gati për AI Movement Check");
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
        setStatus("Duke ngarkuar MediaPipe Pose Landmarker...");
        const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (!cancelled) {
          poseRef.current = poseLandmarker as PoseLandmarkerLike;
          setModelReady(true);
          setStatus("Modeli AI është gati. Aktivizo kamerën.");
        }
      } catch (loadError) {
        console.error(loadError);
        if (!cancelled) {
          setError("MediaPipe nuk u ngarkua. Provo refresh ose përdor Chrome/Safari modern.");
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
      setStatus("Kamera është aktive. Vendose trupin në ekran dhe kliko Analyze movement.");
    } catch (cameraError) {
      console.error(cameraError);
      setError("Kamera nuk u hap. Lejo camera permission në browser dhe provo përsëri.");
    }
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
    setStatus("AI check u ruajt në Supabase.");
  }

  return (
    <section className="patient-shell">
      <aside className="patient-sidebar">
        <div className="patient-avatar">AI</div>
        <h2>Movement Check</h2>
        <p>MediaPipe Pose Landmarker</p>
        <div className="generated-box">
          <b>Status:</b><br />
          {modelReady ? "AI model gati" : "Duke u ngarkuar"}<br />
          {cameraReady ? "Kamera aktive" : "Kamera joaktive"}
        </div>
        <div className="side-menu">
          <a className="active" href="#camera">Kamera</a>
          <a href="#result">Rezultati</a>
          <a href="/patient-dashboard">Kthehu te plani</a>
        </div>
      </aside>

      <div className="patient-main">
        <section className="dashboard-hero">
          <div>
            <span className="badge">AI Movement Check · Real camera</span>
            <h1>Kontrollo cilësinë e lëvizjes.</h1>
            <p>Ky modul përdor kamerën dhe MediaPipe për të detektuar landmark-et e trupit. Nuk diagnostikon dhe nuk zëvendëson fizioterapeutin.</p>
          </div>
          <div className="today-card">
            <span>Score</span>
            <strong>{result ? `${result.score}%` : "—"}</strong>
            <small>{result ? result.alertType : "Pa analizë"}</small>
          </div>
        </section>

        {error && <div className="role-warning">{error}</div>}
        <div className="role-warning">Nëse ke dhimbje të fortë, ndalo ushtrimin dhe kontakto fizioterapeutin.</div>

        <section id="camera" className="dashboard-grid">
          <div className="dashboard-card wide">
            <h2>Kamera</h2>
            <p>{status}</p>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: "100%", minHeight: 360, borderRadius: 24, background: "#102033", objectFit: "cover" }}
            />
            <div className="button-row">
              <button className="button" type="button" onClick={startCamera} disabled={!modelReady}>Aktivizo kamerën</button>
              <button className="button secondary" type="button" onClick={analyzeMovement} disabled={!cameraReady || !modelReady}>Analyze movement</button>
            </div>
          </div>

          <div id="result" className="dashboard-card">
            <h2>Rezultati</h2>
            {result ? (
              <>
                <div className="kpis">
                  <div className="kpi">AI score<strong>{result.score}%</strong></div>
                  <div className="kpi">Landmarks<strong>{result.landmarksDetected}/8</strong></div>
                </div>
                <p>{result.feedback}</p>
                <div className="generated-box"><b>Alert:</b> {result.alertType}</div>
                <button className="button" type="button" onClick={saveResult} disabled={saving || saved || !planExerciseId}>
                  {saved ? "U ruajt" : saving ? "Duke ruajtur..." : "Ruaj në Supabase"}
                </button>
              </>
            ) : (
              <p>Aktivizo kamerën dhe kliko Analyze movement për rezultat.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
