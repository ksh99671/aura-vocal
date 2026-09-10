import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import Login from "./screens/Login";
import Home from "./screens/Home";
import SelfHub from "./screens/self/SelfHub";
import AudioRecord from "./screens/self/AudioRecord";
import SymptomSelect from "./screens/self/SymptomSelect";
import SelfResult from "./screens/self/SelfResult";
import LessonHub from "./screens/lesson/LessonHub";
import StudentSelect from "./screens/lesson/StudentSelect";
import Checklist from "./screens/lesson/Checklist";
import LessonResult from "./screens/lesson/LessonResult";
import Library from "./screens/shared/Library";
import History from "./screens/shared/History";
import StudentApp from "./screens/student/StudentApp";

const SCREENS = {
  home: Home, selfHub: SelfHub, audioRecord: AudioRecord,
  symptomSelect: SymptomSelect, selfResult: SelfResult,
  lessonHub: LessonHub, studentSelect: StudentSelect,
  checklist: Checklist, lessonResult: LessonResult,
  library: Library, history: History,
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

  // 학생 페이지는 로그인 불필요
  if (isStudentPage) return <StudentApp />;

  // 로딩 중
  if (loading) {
    return (
      <div style={{minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center"}}>
        <p style={{color:"var(--text2)", fontSize:14}}>로딩 중...</p>
      </div>
    );
  }

  // 로그인 안 된 경우
  if (!user) return <Login onSignIn={signIn} />;

  const Screen = SCREENS[screen] ?? Home;

  return (
    <div className="app-root">
      <Screen go={go} params={params} theme={theme} toggleTheme={toggleTheme} user={user} logOut={logOut} />
    </div>
  );
}
