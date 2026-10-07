import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { onAppOpen } from "./lib/accountMeta";
import { useAuth } from "./hooks/useAuth";
import Login from "./screens/Login";
import Home from "./screens/Home";
import Settings from "./screens/Settings";
import SelfHub from "./screens/self/SelfHub";
import AudioRecord from "./screens/self/AudioRecord";
import SymptomSelect from "./screens/self/SymptomSelect";
import SelfResult from "./screens/self/SelfResult";
import LessonHub from "./screens/lesson/LessonHub";
import LessonStart from "./screens/lesson/LessonStart";
import LessonRecord from "./screens/lesson/LessonRecord";
import StudentSelect from "./screens/lesson/StudentSelect";
import Checklist from "./screens/lesson/Checklist";
import LessonResult from "./screens/lesson/LessonResult";
import Library from "./screens/shared/Library";
import VaultList from "./screens/vault/VaultList";
import VaultNote from "./screens/vault/VaultNote";
import VaultEdit from "./screens/vault/VaultEdit";
import History from "./screens/shared/History";
import StudentsList from "./screens/students/StudentsList";
import StudentDetail from "./screens/students/StudentDetail";
import LessonDetail from "./screens/students/LessonDetail";

const SCREENS = {
  home: Home, settings: Settings,
  selfHub: SelfHub, audioRecord: AudioRecord,
  symptomSelect: SymptomSelect, selfResult: SelfResult,
  lessonHub: LessonStart, studentSelect: LessonStart, lessonRecord: LessonRecord,
  checklist: Checklist, lessonResult: LessonResult,
  library: VaultList, vaultNote: VaultNote, vaultEdit: VaultEdit, history: History,
  studentsList: StudentsList, studentDetail: StudentDetail, lessonDetail: LessonDetail,
};

export default function App() {
  const { user, loading, signIn, logOut } = useAuth();
  const [{ screen, params }, setNav] = useState({ screen: "home", params: {} });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const isStudentPage = new URLSearchParams(window.location.search).has("id");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ── 화면 이동 기록: 폰/브라우저/마우스의 뒤로 가기와 앱 안의 "돌아가기"가 같은 기록을 쓴다 ──
  const nav = useRef({ trail: [0], map: new Map([[0, { screen: "home", params: {} }]]), pos: 0, next: 1, pending: null });
  useEffect(() => {
    window.history.replaceState({ auraNav: 0 }, "");
    const onPop = (e) => {
      const id = e.state && typeof e.state.auraNav === "number" ? e.state.auraNav : null;
      if (id === null) return;
      const n = nav.current;
      let pos = n.trail.indexOf(id);
      if (pos < 0) { n.trail = [id]; pos = 0; } // 새로고침 뒤처럼 기록을 모르는 자리는 새 시작점으로
      n.pos = pos;
      const entry = n.map.get(id) || { screen: "home", params: {} };
      const next = n.pending ? { screen: entry.screen, params: n.pending } : entry;
      n.pending = null;
      n.map.set(id, next);
      setNav(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const go = (screen, params = {}, opts = {}) => {
    const n = nav.current;
    const curId = n.trail[n.pos];
    const cur = n.map.get(curId);
    const prev = n.pos > 0 ? n.map.get(n.trail[n.pos - 1]) : null;
    const sameStu = (a, b) => (a?.student?.id ?? null) === (b?.student?.id ?? null);
    const entry = { screen, params };
    if (!opts.push && !opts.replace && prev && prev.screen === screen && sameStu(prev.params, params)) {
      n.pending = params; // 바로 이전 화면으로 가는 건 "뒤로"로 처리 (기록이 쌓이지 않게, 화면 정보는 새것으로)
      window.history.back();
      return;
    }
    if (opts.replace || (cur && cur.screen === screen && sameStu(cur.params, params))) {
      n.map.set(curId, entry);
      window.history.replaceState({ auraNav: curId }, "");
      setNav(entry);
      return;
    }
    const id = n.next++;
    n.trail = [...n.trail.slice(0, n.pos + 1), id];
    n.pos = n.trail.length - 1;
    n.map.set(id, entry);
    window.history.pushState({ auraNav: id }, "");
    setNav(entry);
  };
  go.back = () => { if (nav.current.pos > 0) window.history.back(); };
  go.canBack = nav.current.pos > 0;

  // 가입일, 마지막 접속, 앱 버전을 기록하고 30일 지난 휴지통을 정리한다 (실패해도 앱은 그대로 동작)
  useEffect(() => { onAppOpen(user); }, [user]);
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  // 화면이 바뀐 직후에만 "화면 진입 효과"를 켠다. (나중에 생기는 입력칸/폼에는 진입 효과가 붙지 않게)
  // html의 data-screen 으로 화면마다 다른 효과를 고른다. (index.css의 AURA-MOTION 블록이 사용)
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-screen", screen);
    root.setAttribute("data-entering", "");
    const sp = parseFloat(getComputedStyle(root).getPropertyValue("--speed")) || 1;
    const id = setTimeout(() => root.removeAttribute("data-entering"), 1300 * sp + 200);
    return () => clearTimeout(id);
  }, [screen, user, loading]);

  // 사이드바(NavBar)의 테마 전환 버튼이 보내는 신호를 받는다
  useEffect(() => {
    const onToggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    window.addEventListener("aura-toggle-theme", onToggle);
    return () => window.removeEventListener("aura-toggle-theme", onToggle);
  }, []);

  if (loading) {
    return (
      <div style={{minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center"}}>
        <p style={{color:"var(--text2)", fontSize:14}}>로딩 중...</p>
      </div>
    );
  }

  if (!user) return <Login onSignIn={signIn} />;

  // Students 탭은 studentsList로
  const resolvedScreen = screen === "studentSelect" && params?.fromTab ? "studentsList" : screen;
  const Screen = SCREENS[resolvedScreen] ?? Home;

  return (
    <div className="app-root">
      <Screen go={go} params={params} theme={theme} toggleTheme={toggleTheme} user={user} logOut={logOut} />
    </div>
  );
}
