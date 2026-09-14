import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import NavBar from "../components/NavBar";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function Settings({ go, logOut }) {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchKey = async () => {
      if (!user) return;
      const ref = doc(db, "trainers", user.uid, "settings", "api");
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().anthropicKey) {
        setHasKey(true);
        setApiKey("sk-ant-••••••••••••••••");
      }
    };
    fetchKey();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim() || apiKey.includes("••••")) return;
    setSaving(true);
    const ref = doc(db, "trainers", user.uid, "settings", "api");
    await setDoc(ref, { anthropicKey: apiKey.trim() });
    setHasKey(true);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("API 키를 삭제할까요?")) return;
    const ref = doc(db, "trainers", user.uid, "settings", "api");
    await setDoc(ref, { anthropicKey: "" });
    setApiKey("");
    setHasKey(false);
  };

  return (
    <div className="screen">
      <div style={{paddingTop:52, marginBottom:24}}>
        <p className="eyebrow">Settings</p>
        <h2 className="screen-title"><strong>설정</strong></h2>
      </div>

      {/* 계정 */}
      <div className="result-card" style={{marginBottom:10}}>
        <p className="card-label">계정</p>
        <p style={{fontSize:14, color:"var(--text1)", marginTop:6}}>{user?.email}</p>
        <button
          onClick={logOut}
          style={{
            marginTop:12, fontSize:13, color:"#e24b4a",
            background:"none", border:"none", padding:0, cursor:"pointer",
            fontFamily:"inherit"
          }}
        >
          로그아웃
        </button>
      </div>

      {/* API 키 */}
      <div className="result-card">
        <p className="card-label">Anthropic API 키</p>
        <p style={{fontSize:12, color:"var(--text2)", marginTop:4, marginBottom:12, lineHeight:1.6}}>
          {hasKey
            ? "API 키가 등록되어 있어요. AI 진단 기능을 사용할 수 있어요."
            : "API 키를 입력하면 AI 진단 기능을 사용할 수 있어요. console.anthropic.com에서 발급받으세요."}
        </p>

        {!hasKey || !apiKey.includes("••••") ? (
          <>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={apiKey.includes("••••") ? "" : apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{
                width:"100%", background:"var(--bg3)",
                border:"0.5px solid var(--border2)",
                borderRadius:10, padding:"12px 14px",
                fontSize:13, color:"var(--text1)",
                fontFamily:"inherit", outline:"none",
                marginBottom:10
              }}
            />
            <button
              className="btn-primary"
              disabled={!apiKey.trim() || saving}
              onClick={handleSave}
            >
              {saving ? "저장 중..." : saved ? "✓ 저장됨" : "저장"}
            </button>
          </>
        ) : (
          <div style={{display:"flex", gap:8}}>
            <button
              className="btn-secondary"
              onClick={() => { setApiKey(""); setHasKey(false); }}
            >
              키 변경
            </button>
            <button
              className="btn-secondary"
              style={{color:"#e24b4a", borderColor:"#e24b4a"}}
              onClick={handleDelete}
            >
              키 삭제
            </button>
          </div>
        )}
      </div>

      {/* API 키 발급 안내 */}
      {!hasKey && (
        <div className="highlight-card">
          <p className="card-label">API 키 발급 방법</p>
          <p style={{fontSize:13, color:"var(--text1)", lineHeight:1.8, marginTop:6}}>
            1. console.anthropic.com 접속{"\n"}
            2. API Keys 메뉴 클릭{"\n"}
            3. Create Key 버튼 클릭{"\n"}
            4. 생성된 sk-ant-... 키 복사{"\n"}
            5. 위 입력창에 붙여넣기
          </p>
        </div>
      )}

      <NavBar go={go} active="settings" />
    </div>
  );
}
