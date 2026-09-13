import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

// 트레이너 API 키 가져오기
async function getApiKey() {
  const user = auth.currentUser;
  if (!user) return null;
  const ref = doc(db, "trainers", user.uid, "settings", "api");
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().anthropicKey) {
    return snap.data().anthropicKey;
  }
  return null;
}

async function callClaude(systemPrompt, userPrompt) {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error("API 키가 없어요. 설정에서 Anthropic API 키를 입력해주세요.");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) throw new Error(`API 오류: ${res.status}`);
  const data = await res.json();
  const raw = data.content?.[0]?.text ?? "";
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return { raw }; }
}

export function useSelfDiagnosis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const diagnose = async ({ symptom, range, pitchData }) => {
    setLoading(true); setError(null);
    const system = `당신은 전문 보컬 트레이너입니다. 사용자의 발성 데이터를 분석해서 문제점과 해결 방안을 제시해주세요.
반드시 아래 JSON 형식으로만 응답하세요:
{"issues":"주요 발성 문제(1~2문장)","cause":"원인 분석(1~2문장)","solutions":["해결 방안1","해결 방안2","해결 방안3"],"exercise":"오늘 당장 할 수 있는 연습 1가지(구체적으로)"}`;
    const symptomMap = { tight:"목이 조이는 느낌", force:"힘이 과하게 들어가는 느낌", open:"열리는 느낌", unknown:"잘 모르겠음" };
    const rangeMap = { low:"저음역", mid:"중음역", high:"고음역", all:"전 음역대" };
    const user = `발성 증상: ${symptomMap[symptom] ?? symptom}\n불편한 음역대: ${rangeMap[range] ?? range}\n${pitchData ? `피치 데이터: ${JSON.stringify(pitchData)}` : "피치 데이터: 없음"}`;
    try { setResult(await callClaude(system, user)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  return { diagnose, result, loading, error };
}

export function useLessonDiagnosis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const diagnose = async ({ student, memo }) => {
    setLoading(true); setError(null);
    const system = `당신은 전문 보컬 트레이너입니다. 트레이너가 레슨 중 관찰한 내용을 바탕으로 오늘 레슨 방향과 연습법을 제안해주세요.
반드시 아래 JSON 형식으로만 응답하세요:
{"pattern":"주요 발성 패턴 요약(1문장)","cause":"원인 분석(1~2문장)","directions":["레슨 방향1","레슨 방향2","레슨 방향3"],"homework":"다음 레슨 전까지 할 연습 과제(구체적으로)"}`;
    const user = `학생: ${student?.name ?? "학생"}\n\n트레이너 관찰 메모:\n${memo}`;
    try { setResult(await callClaude(system, user)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  return { diagnose, result, loading, error };
}
