// 사진 저장소 — 화면은 이 파일의 함수만 사용한다.
// 테스트 단계: Firestore에 저장한다.
// 정식 출시 때는 이 파일의 putPhoto / getPhoto / removePhoto만
// Firebase Storage(또는 R2)용으로 바꾸면 되고, 화면은 건드리지 않는다.
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

export const MAX_PHOTOS = 5;
const MAX_FULL_CHARS = 700000; // Firestore 문서 1MiB 제한 안쪽으로

const photoDoc = (noteId, photoId) =>
  doc(db, "trainers", auth.currentUser.uid, "vault", noteId, "photos", photoId);

const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("이미지를 읽을 수 없어요")); };
    img.src = url;
  });
}

function toDataUrl(img, maxSide, quality) {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

// 파일 -> { id, full(원본을 줄인 것), thumb(작은 썸네일) } — 아직 저장은 안 함
export async function prepareImage(file) {
  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 올릴 수 있어요");
  }
  const img = await loadImage(file);
  let side = 1280;
  let quality = 0.8;
  let full = "";
  for (let i = 0; i < 6; i++) {
    full = toDataUrl(img, side, quality);
    if (full.length <= MAX_FULL_CHARS) break;
    side = Math.round(side * 0.8);
    quality = Math.max(0.5, quality - 0.08);
  }
  if (full.length > MAX_FULL_CHARS) throw new Error("사진이 너무 커서 줄일 수 없어요");
  const thumb = toDataUrl(img, 300, 0.65);
  return { id: newId(), full, thumb };
}

export async function putPhoto(noteId, photo) {
  await setDoc(photoDoc(noteId, photo.id), { data: photo.full, createdAt: serverTimestamp() });
}

export async function getPhoto(noteId, photoId) {
  const snap = await getDoc(photoDoc(noteId, photoId));
  return snap.exists() ? snap.data().data : null;
}

export async function removePhoto(noteId, photoId) {
  await deleteDoc(photoDoc(noteId, photoId));
}
