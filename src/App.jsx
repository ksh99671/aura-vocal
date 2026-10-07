import { useState, useEffect, useLayoutEffect } from "react";
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

  const go = (screen, params = {}) => setNav({ screen, params });
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
