import { useState } from "react";
import BackButton from "../../components/BackButton";
import NavBar from "../../components/NavBar";
import { useLessonLogs, useCategories } from "../../hooks/useFirestore";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { moveStudentToTrash } from "../../lib/trash";
import HomeworkCard, { HwDot } from "../../components/HomeworkCard";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function getMonthDiff(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return months < 1 ? 1 : months;
}

export default function StudentDetail({ go, params }) {
  const student = params?.student;
  const { logs, insertLog } = useLessonLogs(student?.id);
  const { categories } = useCategories();

  const [memo, setMemo] = useState(student?.memo || "");
  const [editingMemo, setEditingMemo] = useState(false);
  const [savingMemo, setSavingMemo] = useState(false);

  const [editingInfo, setEditingInfo] = useState(false);
  const [category, setCategory] = useState(student?.category || "");
  const [startDate, setStartDate] = useState(student?.startDate || "");
  const [baseCount, setBaseCount] = useState(student?.baseCount || 0);
  const [savingInfo, setSavingInfo] = useState(false);

  const [addingLesson, setAddingLesson] = useState(false);
  const [newLessonMemo, setNewLessonMemo] = useState("");
  const [savingLesson, setSavingLesson] = useState(false);
  const [insertNo, setInsertNo] = useState("");
  const [newLessonDate, setNewLessonDate] = useState("");

  const [showAll, setShowAll] = useState(false);

  const cat = categories.find(c => c.id === category);
  const totalLessons = logs.length + Number(baseCount);
  const months = getMonthDiff(startDate);

  const getRef = () => doc(db, "trainers", auth.currentUser.uid, "students", student.id);

  const saveMemo = async () => {
    setSavingMemo(true);
    await updateDoc(getRef(), { memo });
    go("studentDetail", { student: { ...student, memo } });
    setSavingMemo(false);
    setEditingMemo(false);
  };

  const saveInfo = async () => {
    setSavingInfo(true);
    await updateDoc(getRef(), { category, startDate, baseCount: Number(baseCount) });
    go("studentDetail", { student: { ...student, category, startDate, baseCount: Number(baseCount) } });
    setSavingInfo(false);
    setEditingInfo(false);
  };

  const deleteStudent = async () => {
    if (!confirm(`${student.name} 학생을 휴지통으로 옮길까요?\n30일 안에 설정 → 휴지통에서 되살릴 수 있어요.`)) return;
    try {
      await moveStudentToTrash(student.id);
    } catch (e) {
      console.error(e);
      alert("삭제하지 못했어요: " + (e.code || e.message));
      return;
    }
    go("studentsList");
  };

  const saveLesson = async () => {
    if (!newLessonMemo.trim()) return;
    const base = Number(baseCount);
    const no = Number(insertNo);
    const pos = no - base; // 앱 기록 안에서의 순번
    if (!Number.isInteger(no) || pos < 1 || pos > logs.length + 1) {
      alert(`${base + 1}회 ~ ${base + logs.length + 1}회 사이로 입력해주세요`);
      return;
    }
    setSavingLesson(true);
    await insertLog({ position: pos, memo: newLessonMemo.trim(), date: newLessonDate });
    setNewLessonMemo("");
    setAddingLesson(false);
    setSavingLesson(false);
  };

  if (!student) return null;

  const visibleLogs = showAll ? logs : logs.slice(0, 5);

  const baseNum = Number(baseCount);
  const nextNo = baseNum + logs.length + 1;
  const noNum = Number(insertNo);
  let insertHint = "";
  if (insertNo !== "" && Number.isInteger(noNum)) {
    if (noNum === nextNo) insertHint = "가장 최근 기록으로 추가돼요";
    else if (noNum > baseNum && noNum < nextNo)
      insertHint = `${noNum}회차 자리에 들어가고, 지금 ${noNum}회차인 기록부터 한 칸씩 뒤로 밀려요`;
    else insertHint = `${baseNum + 1}회 ~ ${nextNo}회 사이로 입력해주세요`;
  }

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
        <button onClick={() => setEditingInfo(!editingInfo)} style={{
          fontSize:11, color:"var(--accent)", background:"none",
          border:"0.5px solid var(--accent-mid)", borderRadius:8,
          padding:"5px 10px", cursor:"pointer", fontFamily:"inherit", opacity:.8,
        }}>{editingInfo ? "닫기" : "수정"}</button>
      </div>

      {/* 학생 정보 수정 */}
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

      <HomeworkCard logs={logs} baseCount={baseCount} student={student} go={go} />

      <div className="section-divider" />

      {/* 레슨 기록 */}
      <div className="section-header">
        <p className="section-title">레슨 기록</p>
        <button onClick={() => {
          if (!addingLesson) {
            setInsertNo(String(Number(baseCount) + logs.length + 1));
            setNewLessonDate(todayStr());
          }
          setAddingLesson(!addingLesson);
        }} style={{
          fontSize:12, color:"var(--accent)", background:"none", border:"none",
          cursor:"pointer", fontFamily:"inherit", opacity:.85,
        }}>{addingLesson ? "취소" : "+ 레슨 추가"}</button>
      </div>

      {/* 레슨 직접 추가 */}
      {addingLesson && (
        <div className="card" style={{marginBottom:10}}>
          <p className="card-label">몇 회차 자리에 넣을까요?</p>
          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
            <input type="number" value={insertNo} min="1" onChange={e => setInsertNo(e.target.value)} style={{
              width:90, padding:"10px 12px", borderRadius:10, textAlign:"center",
              background:"var(--bg3)", border:"0.5px solid var(--border2)",
              color:"var(--text1)", fontSize:14, fontFamily:"inherit", outline:"none",
            }} />
            <span style={{fontSize:13, color:"var(--text2)"}}>회차</span>
          </div>
          <p style={{fontSize:11, color:"var(--text3)", marginBottom:14, lineHeight:1.6, minHeight:16}}>{insertHint}</p>

          <p className="card-label">날짜 (선택)</p>
          <div style={{display:"flex", gap:8, alignItems:"center", marginBottom:14}}>
            <input type="date" value={newLessonDate} onChange={e => setNewLessonDate(e.target.value)} style={{
              flex:1, padding:"10px 12px", borderRadius:10,
              background:"var(--bg3)", border:"0.5px solid var(--border2)",
              color:"var(--text1)", fontSize:13, fontFamily:"inherit", outline:"none",
            }} />
            <button onClick={() => setNewLessonDate("")} style={{
              fontSize:11, color:"var(--text3)", background:"none", whiteSpace:"nowrap",
              border:"0.5px solid var(--border2)", borderRadius:8,
              padding:"9px 10px", cursor:"pointer", fontFamily:"inherit",
            }}>날짜 모름</button>
          </div>

          <p className="card-label">레슨 내용</p>
          <textarea
            value={newLessonMemo} onChange={e => setNewLessonMemo(e.target.value)} rows={5}
            placeholder="오늘 레슨에서 다룬 내용을 자유롭게 적어보세요"
            autoFocus
            style={{
              width:"100%", background:"var(--bg3)", border:"0.5px solid var(--border2)",
              borderRadius:12, padding:"12px", outline:"none",
              fontSize:13, color:"var(--text1)", fontFamily:"inherit",
              resize:"vertical", lineHeight:1.7, minHeight:100,
            }}
          />
          <button className="btn-primary" style={{marginTop:10}}
            disabled={!newLessonMemo.trim() || savingLesson} onClick={saveLesson}>
            {savingLesson ? "저장 중..." : "레슨 기록 추가"}
          </button>
        </div>
      )}

      {logs.length === 0 ? (
        <div style={{textAlign:"center", padding:"24px 0"}}>
          <p style={{fontSize:13, color:"var(--text2)"}}>아직 레슨 기록이 없어요</p>
        </div>
      ) : (
        <div className="result-card">
          {visibleLogs.map((log, i) => {
            const lessonNo = Number(baseCount) + logs.length - i;
            return (
              <div key={log.id || i}
                onClick={() => go("lessonDetail", { student, log, lessonNo })}
                style={{
                  display:"flex", alignItems:"center", gap:10, cursor:"pointer",
                  padding:"11px 0",
                  borderBottom: i < visibleLogs.length - 1 ? "0.5px solid var(--border)" : "none",
                }}>
                <span style={{fontSize:10, color:"var(--text3)", minWidth:40, whiteSpace:"nowrap"}}>
                  {log.date?.toDate?.()?.toLocaleDateString("ko-KR", {month:"numeric", day:"numeric"}) || "날짜 미상"}
                </span>
                <p style={{flex:1, fontSize:12, fontWeight:500, color:"var(--text1)", lineHeight:1.5}}>
                  {log.memo ? (log.memo.length > 28 ? log.memo.slice(0, 28) + "..." : log.memo) : "레슨 기록"}
                </p>
                <HwDot log={log} /><span style={{fontSize:10, color:"var(--accent)", flexShrink:0, fontWeight:500}}>{lessonNo}회</span>
                <span style={{fontSize:12, color:"var(--text3)", flexShrink:0}}>›</span>
              </div>
            );
          })}
          {logs.length > 5 && (
            <button onClick={() => setShowAll(!showAll)} style={{
              width:"100%", paddingTop:10, background:"none", border:"none",
              fontSize:11, color:"var(--text3)", cursor:"pointer", fontFamily:"inherit",
            }}>
              {showAll ? "접기" : `+ ${logs.length - 5}회 더 보기`}
            </button>
          )}
        </div>
      )}

      <div style={{height:12}} />
      <button className="btn-primary" onClick={() => go("lessonRecord", { student })}>
        레슨 시작 →
      </button>

      <NavBar go={go} active="studentsList" />
    </div>
  );
}
