import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

// 수업 중 눌러서 기록하는 "수업 항목" 칩. 설정에서 트레이너가 직접 고친다.
export const DEFAULT_ITEMS = [
  { id: "li_breath", name: "호흡", color: "#5ec4a0", song: false },
  { id: "li_voice", name: "발성", color: "#6ab0e0", song: false },
  { id: "li_high", name: "고음", color: "#e0a06a", song: false },
  { id: "li_song", name: "곡 연습", color: "#a78bda", song: true },
  { id: "li_expr", name: "표현", color: "#c9a96e", song: false },
];

export const ITEM_COLORS = ["#5ec4a0", "#6ab0e0", "#e0a06a", "#a78bda", "#c9a96e", "#e07b6a"];

const itemsDoc = () => doc(db, "trainers", auth.currentUser.uid, "settings", "lessonItems");

export function useLessonItems() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [loaded, setLoaded] = useState(false);
  // 가장 최근 목록. 빠르게 연달아 고쳐도 앞의 변경을 덮어쓰지 않도록 항상 이걸 기준으로 저장한다.
  const latest = useRef(DEFAULT_ITEMS);
  const loadedRef = useRef(false); // 서버에서 읽어오기 전에는 저장하지 않는다 (기본값이 내 목록을 덮어쓰는 일 방지)

  useEffect(() => {
    const done = () => {
      loadedRef.current = true;
      setLoaded(true);
    };
    const fallback = setTimeout(() => !loadedRef.current && done(), 3000);
    if (!auth.currentUser) return () => clearTimeout(fallback);
    const unsub = onSnapshot(
      itemsDoc(),
      (snap) => {
        const list = snap.exists() && Array.isArray(snap.data().list) ? snap.data().list : null;
        latest.current = list || DEFAULT_ITEMS;
        setItems(latest.current);
        done();
      },
      (e) => {
        console.error(e);
        done();
      }
    );
    return () => {
      clearTimeout(fallback);
      unsub();
    };
  }, []);

  const save = async (list) => {
    if (!loadedRef.current) return;
    latest.current = list;
    setItems(list); // 저장이 끝나기 전에도 화면은 바로 바뀐다
    await setDoc(itemsDoc(), { list });
  };
  const addItem = (name, color) =>
    save([...latest.current, { id: `li_${Date.now().toString(36)}`, name, color, song: false }]);
  const updateItem = (id, patch) => save(latest.current.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const deleteItem = (id) => save(latest.current.filter((i) => i.id !== id));
  const moveItem = (id, dir) => {
    const cur = latest.current;
    const idx = cur.findIndex((i) => i.id === id);
    const to = idx + dir;
    if (idx < 0 || to < 0 || to >= cur.length) return Promise.resolve();
    const list = [...cur];
    [list[idx], list[to]] = [list[to], list[idx]];
    return save(list);
  };
  const resetItems = () => save(DEFAULT_ITEMS);

  return { items, loaded, addItem, updateItem, deleteItem, moveItem, resetItems };
}
