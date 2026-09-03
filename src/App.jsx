import { useState, useEffect } from "react";
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
  const [{ screen, params }, setNav] = useState({ screen: "home", params: {} });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  // 학생 페이지 라우팅 — URL에 ?student=true 있으면 학생 앱으로
  const isStudentPage = new URLSearchParams(window.location.search).has("id");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const go = (screen, params = {}) => setNav({ screen, params });
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  if (isStudentPage) return <StudentApp />;

  const Screen = SCREENS[screen] ?? Home;

  return (
    <div className="app-root">
      <Screen go={go} params={params} theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}
