import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { purgeExpiredTrash } from "./trash";

// 앱을 새로 올릴 때마다 올린다. 관리자 프로그램이 "어느 버전을 쓰는지" 볼 때 쓴다.
export const APP_VERSION = "v38";

export function platformOf(ua = typeof navigator !== "undefined" ? navigator.userAgent : "") {
  const dev = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Macintosh/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "기타";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\/|CriOS/.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "기타";
  return `${dev} · ${br}`;
}

const KEY = (uid) => `aura:touch:${uid}`;
const HOUR = 3600000;

// 가입일, 마지막 접속, 앱 버전, 기기를 trainers/{uid}/settings/account 에 기록한다.
// 마지막 접속은 1시간에 한 번만 쓰고, 실패해도 앱은 그대로 동작한다.
export async function touchAccount(user) {
  try {
    const last = Number(localStorage.getItem(KEY(user.uid)) || 0);
    if (Date.now() - last < HOUR) return;
    const ref = doc(db, "trainers", user.uid, "settings", "account");
    const snap = await getDoc(ref);
    const cur = snap.exists() ? snap.data() : {};
    const data = { lastActiveAt: serverTimestamp(), appVersion: APP_VERSION, platform: platformOf() };
    if (!cur.createdAt) {
      const created = user.metadata?.creationTime ? new Date(user.metadata.creationTime) : new Date();
      data.createdAt = Timestamp.fromDate(isNaN(created) ? new Date() : created);
    }
    if (!cur.plan) data.plan = "free"; // 이미 정해진 플랜은 건드리지 않는다
    await setDoc(ref, data, { merge: true });
    localStorage.setItem(KEY(user.uid), String(Date.now()));
  } catch (e) {
    console.warn("계정 정보를 기록하지 못했어요", e);
  }
}

// 앱을 열었을 때 한 번: 계정 정보 기록 + 30일 지난 휴지통 정리
export function onAppOpen(user) {
  if (!user) return;
  touchAccount(user);
  purgeExpiredTrash();
}
