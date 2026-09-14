import { useState, useEffect } from "react";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useLessonLogs, useCategories } from "../../hooks/useFirestore";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";

export default function StudentDetail({ go, params }) {
  const student = params?.student;
  const { logs } = useLessonLogs(student?.id);
  const { categories } = useCategories();
  const [memo, setMemo] = useState(student?.memo || "");
  const [editingMemo, setEditingMemo] = useState(false);
  const [savingMemo, setSavingMemo] = useState(false);

  const cat = categories.find(c => c.id === student?.category);

  const saveMemo = async () => {
    if (!student?.id) return;
    setSavingMemo(true);
    const ref = doc(db, "trainers", auth.currentUser.uid, "students", student.id);
    await updateDoc(ref, { memo });
    setSavingMemo(false);
    setEditingMemo(false);
  };

  if (!student) return null;

  return (
    <div className="screen">
      <BackButton label="Students" onClick={() => go("studentsList")} />

      {/* 프로필 */}
      <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:20}}>
        <div style={{
          width:52, height:52, borderRadius:"50%",
          background:"var(--accent-dim)", border:"0.5px solid var(--accent-mid)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:20, fontWeight:600, color:"var(--accent)",
        }}>{student.name.slice(-1)}</div>
        <div>
          <h2 style={{fontSize:22, fontWeight:600, color:"var(--text1)", marginBottom:6}}>
            {student.name}
          </h2>
          <div style={{display:"flex", gap:8, alignItems:"center"}}>
            {cat && (
              <span style={{
                fontSize:10, padding:"3px 9px", borderRadius:10, fontWeight:500,
                background:`${cat.color}22`, color:cat.color,
              }}>{cat.name}</span>
            )}
            <span style={{fontSize:11, color:"var(--text3)"}}>레슨 {logs.length}회</span>
          </div>
        </div>
      </div>

      {/* 스탯 */}
      <div style={{display:"flex", gap:8, marginBottom:12}}>
        {[
          { num: logs.length, label: "총 레슨" },
          { num: logs.length > 0 ? `${Math.ceil(logs.length / 4)}개월` : "-", label: "수강 기간" },
        ].map((s, i) => (
          <div key={i} style={{
            flex:1, background:"var(--bg2)", border:"0.5px solid var(--border2)",
            borderRadius:14, padding:"14px", textAlign:"center", boxShadow:"var(--shadow)",
          }}>
            <p style={{fontSize:20, fontWeight:600, color:"var(--accent)", marginBottom:2}}>{s.num}</p>
            <p style={{fontSize:9, color:"var(--text3)", letterSpacing:".06em", textTransform:"uppercase"}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* 트레이너 메모 */}
      <div className="result-card" style={{marginBottom:16}}>
        <p className="card-label">트레이너 메모</p>
        {editingMemo ? (
          <>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              rows={3}
              style={{
                width:"100%", background:"transparent", border:"none",
                outline:"none", fontSize:13, color:"var(--text1)",
                fontFamily:"inherit", resize:"none", lineHeight:1.7, marginTop:6,
              }}
            />
            <div className="btn-row" style={{marginTop:10}}>
              <button className="btn-secondary" onClick={() => setEditingMemo(false)}>취소</button>
              <button className="btn-primary" disabled={savingMemo} onClick={saveMemo}>
                {savingMemo ? "저장 중..." : "저장"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{fontSize:13, color: memo ? "var(--text1)" : "var(--text3)", lineHeight:1.7, marginTop:6}}>
              {memo || "메모 없음"}
            </p>
            <button
              onClick={() => setEditingMemo(true)}
              style={{fontSize:11, color:"var(--accent)", background:"none", border:"none", cursor:"pointer", padding:0, marginTop:8, fontFamily:"inherit", opacity:.8}}
            >
              {memo ? "수정" : "+ 메모 추가"}
            </button>
          </>
        )}
      </div>

      <div className="section-divider" />

      {/* 레슨 기록 */}
      <div className="section-header">
        <p className="section-title">레슨 기록</p>
        <span style={{fontSize:12, color:"var(--text2)"}}>{logs.length}회</span>
      </div>

      {logs.length === 0 ? (
        <div style={{textAlign:"center", padding:"30px 0"}}>
          <p style={{fontSize:13, color:"var(--text2)"}}>아직 레슨 기록이 없어요</p>
        </div>
      ) : (
        <div className="result-card">
          {logs.slice(0, 5).map((log, i) => (
            <div key={log.id || i} style={{
              display:"flex", alignItems:"flex-start", gap:10,
              padding:"10px 0", borderBottom: i < logs.length - 1 ? "0.5px solid var(--border)" : "none",
            }}>
              <span style={{fontSize:10, color:"var(--text3)", minWidth:36}}>
                {log.date?.toDate?.()?.toLocaleDateString("ko-KR", {month:"numeric", day:"numeric"}) || "-"}
              </span>
              <div style={{flex:1}}>
                <p style={{fontSize:12, fontWeight:500, color:"var(--text1)", marginBottom:2}}>
                  {log.memo || "레슨 기록"}
                </p>
                <p style={{fontSize:10, color:"var(--text2)"}}>
                  {log.pattern || ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 레슨 시작 버튼 */}
      <div style={{height:12}} />
      <button className="btn-primary" onClick={() => go("checklist", { student })}>
        레슨 시작 →
      </button>

      <NavBar go={go} active="studentSelect" />
    </div>
  );
}
