import { useState } from "react";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useLessonLogs, useCategories } from "../../hooks/useFirestore";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";

function getMonthDiff(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return months < 1 ? 1 : months;
}

export default function StudentDetail({ go, params }) {
  const student = params?.student;
  const { logs } = useLessonLogs(student?.id);
  const { categories } = useCategories();

  const [memo, setMemo] = useState(student?.memo || "");
  const [editingMemo, setEditingMemo] = useState(false);
  const [savingMemo, setSavingMemo] = useState(false);

  const [editingInfo, setEditingInfo] = useState(false);
  const [category, setCategory] = useState(student?.category || "");
  const [startDate, setStartDate] = useState(student?.startDate || "");
  const [baseCount, setBaseCount] = useState(student?.baseCount || 0);
  const [savingInfo, setSavingInfo] = useState(false);

  const cat = categories.find(c => c.id === category);
  const totalLessons = logs.length + Number(baseCount);
  const months = getMonthDiff(startDate);

  const getRef = () => doc(db, "trainers", auth.currentUser.uid, "students", student.id);

  const saveMemo = async () => {
    setSavingMemo(true);
    await updateDoc(getRef(), { memo });
    setSavingMemo(false);
    setEditingMemo(false);
  };

  const saveInfo = async () => {
    setSavingInfo(true);
    await updateDoc(getRef(), { category, startDate, baseCount: Number(baseCount) });
    setSavingInfo(false);
    setEditingInfo(false);
  };

  const deleteStudent = async () => {
    if (!confirm(`${student.name} 학생을 삭제할까요?`)) return;
    await deleteDoc(getRef());
    go("studentsList");
  };

  if (!student) return null;

  return (
    <div className="screen">
      <BackButton label="Students" onClick={() => go("studentsList")} />

      {/* 프로필 */}
      <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:16}}>
        <div style={{
          width:52, height:52, borderRadius:"50%",
          background:"var(--accent-dim)", border:"0.5px solid var(--accent-mid)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:20, fontWeight:600, color:"var(--accent)",
        }}>{student.name.slice(-1)}</div>
        <div style={{flex:1}}>
          <h2 style={{fontSize:22, fontWeight:600, color:"var(--text1)", marginBottom:6}}>{student.name}</h2>
          {cat && (
            <span style={{
              fontSize:10, padding:"3px 9px", borderRadius:10, fontWeight:500,
              background:`${cat.color}22`, color:cat.color,
            }}>{cat.name}</span>
          )}
        </div>
        <button
          onClick={() => setEditingInfo(!editingInfo)}
          style={{
            fontSize:11, color:"var(--accent)", background:"none",
            border:"0.5px solid var(--accent-mid)", borderRadius:8,
            padding:"5px 10px", cursor:"pointer", fontFamily:"inherit", opacity:.8,
          }}
        >{editingInfo ? "닫기" : "수정"}</button>
      </div>

      {/* 수정 모드 */}
      {editingInfo && (
        <div className="card" style={{marginBottom:12}}>
          <p className="card-label">카테고리</p>
          <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:14}}>
            {categories.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)} style={{
                padding:"5px 12px", borderRadius:14, fontSize:11, fontWeight:500,
                background: category === c.id ? `${c.color}22` : "var(--bg3)",
                color: category === c.id ? c.color : "var(--text2)",
                border:`0.5px solid ${category === c.id ? c.color : "var(--border2)"}`,
                cursor:"pointer", fontFamily:"inherit",
              }}>{c.name}</button>
            ))}
          </div>

          <p className="card-label">첫 수업 날짜</p>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{
            width:"100%", padding:"10px 12px", borderRadius:10, marginBottom:14,
            background:"var(--bg3)", border:"0.5px solid var(--border2)",
            color:"var(--text1)", fontSize:13, fontFamily:"inherit", outline:"none",
          }} />

          <p className="card-label">앱 사용 전 레슨 횟수</p>
          <p style={{fontSize:11, color:"var(--text3)", marginBottom:8}}>앱 쓰기 전 기존 레슨 횟수를 입력하면 자동 합산돼요</p>
          <input type="number" value={baseCount} min="0" onChange={e => setBaseCount(e.target.value)} style={{
            width:"100%", padding:"10px 12px", borderRadius:10, marginBottom:14,
            background:"var(--bg3)", border:"0.5px solid var(--border2)",
            color:"var(--text1)", fontSize:13, fontFamily:"inherit", outline:"none",
          }} />

          <div className="btn-row" style={{marginBottom:8}}>
            <button className="btn-secondary" onClick={() => setEditingInfo(false)}>취소</button>
            <button className="btn-primary" disabled={savingInfo} onClick={saveInfo}>
              {savingInfo ? "저장 중..." : "저장"}
            </button>
          </div>
          <button onClick={deleteStudent} style={{
            width:"100%", padding:"10px", background:"transparent",
            color:"rgba(224,74,74,0.7)", border:"0.5px solid rgba(224,74,74,0.2)",
            borderRadius:12, fontSize:12, cursor:"pointer", fontFamily:"inherit",
          }}>학생 삭제</button>
        </div>
      )}

      {/* 스탯 */}
      <div style={{display:"flex", gap:8, marginBottom:12}}>
        {[
          { num: totalLessons, label: "총 레슨" },
          { num: months ? `${months}개월` : "-", label: "수강 기간" },
          { num: logs.length, label: "앱 기록" },
        ].map((s, i) => (
          <div key={i} style={{
            flex:1, background:"var(--bg2)", border:"0.5px solid var(--border2)",
            borderRadius:14, padding:"14px 8px", textAlign:"center", boxShadow:"var(--shadow)",
          }}>
            <p style={{fontSize:20, fontWeight:600, color:"var(--accent)", marginBottom:2}}>{s.num}</p>
            <p style={{fontSize:8, color:"var(--text3)", letterSpacing:".06em", textTransform:"uppercase"}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* 트레이너 메모 */}
      <div className="result-card" style={{marginBottom:16}}>
        <p className="card-label">트레이너 메모</p>
        {editingMemo ? (
          <>
            <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} style={{
              width:"100%", background:"transparent", border:"none",
              outline:"none", fontSize:13, color:"var(--text1)",
              fontFamily:"inherit", resize:"none", lineHeight:1.7, marginTop:6,
            }} />
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
            <button onClick={() => setEditingMemo(true)} style={{
              fontSize:11, color:"var(--accent)", background:"none", border:"none",
              cursor:"pointer", padding:0, marginTop:8, fontFamily:"inherit", opacity:.8,
            }}>{memo ? "수정" : "+ 메모 추가"}</button>
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
        <div style={{textAlign:"center", padding:"24px 0"}}>
          <p style={{fontSize:13, color:"var(--text2)"}}>아직 레슨 기록이 없어요</p>
        </div>
      ) : (
        <div className="result-card">
          {logs.slice(0, 5).map((log, i) => (
            <div key={log.id || i} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"9px 0", borderBottom: i < Math.min(logs.length, 5) - 1 ? "0.5px solid var(--border)" : "none",
            }}>
              <span style={{fontSize:10, color:"var(--text3)", minWidth:32}}>
                {log.createdAt?.toDate?.()?.toLocaleDateString("ko-KR", {month:"numeric", day:"numeric"}) || "-"}
              </span>
              <p style={{flex:1, fontSize:12, fontWeight:500, color:"var(--text1)", lineHeight:1.5}}>
                {log.memo ? log.memo.slice(0, 30) : "레슨 기록"}
              </p>
              <span style={{fontSize:10, color:"var(--accent)", flexShrink:0, fontWeight:500}}>
                {Number(baseCount) + i + 1}회
              </span>
            </div>
          ))}
          {logs.length > 5 && (
            <p style={{fontSize:11, color:"var(--text3)", textAlign:"center", paddingTop:8}}>
              + {logs.length - 5}회 더 있어요
            </p>
          )}
        </div>
      )}

      <div style={{height:12}} />
      <button className="btn-primary" onClick={() => go("checklist", { student })}>
        레슨 시작 →
      </button>

      <NavBar go={go} active="studentsList" />
    </div>
  );
}
