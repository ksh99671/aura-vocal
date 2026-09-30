import { useState, useEffect } from "react";
import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { putPhoto, removePhoto } from "../lib/photoStore";

const uid = () => auth.currentUser?.uid;
const notesCol = () => collection(db, "trainers", uid(), "vault");
const noteDoc = (id) => doc(db, "trainers", uid(), "vault", id);
const catsDoc = () => doc(db, "trainers", uid(), "settings", "vaultCategories");
const ms = (t) => t?.toMillis?.() ?? Date.now();

// ── 노트 목록 (최근 수정순) ──
export function useVaultNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid()) return;
    const unsub = onSnapshot(
      notesCol(),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => ms(b.updatedAt) - ms(a.updatedAt));
        setNotes(list);
        setLoading(false);
      },
      (e) => {
        console.error(e);
        setError(e.code || e.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { notes, loading, error };
}

// ── Vault 카테고리 (이름 + 색상) ──
export function useVaultCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!uid()) return;
    const unsub = onSnapshot(
      catsDoc(),
      (snap) => {
        const list = snap.exists() && Array.isArray(snap.data().list) ? snap.data().list : [];
        setCategories(list);
      },
      (e) => console.error(e)
    );
    return unsub;
  }, []);

  const save = async (list) => {
    await setDoc(catsDoc(), { list });
  };
  const addCategory = async (name, color) =>
    save([...categories, { id: `vc_${Date.now()}`, name, color }]);
  const deleteCategory = async (id) => save(categories.filter((c) => c.id !== id));

  return { categories, addCategory, deleteCategory };
}

// ── 노트 저장/삭제 ──
export const newNoteId = () => doc(notesCol()).id;

export async function saveNote(id, fields, { isNew, pending = [], removedIds = [] }) {
  // 사진 원본을 먼저 저장해서, 노트가 없는 사진을 가리키는 일이 없게 한다
  for (const p of pending) await putPhoto(id, p);
  await setDoc(
    noteDoc(id),
    {
      title: fields.title,
      body: fields.body,
      categoryId: fields.categoryId,
      visibility: fields.visibility,
      sharedWith: fields.sharedWith,
      photos: fields.photos.map((p) => ({ id: p.id, thumb: p.thumb })),
      updatedAt: serverTimestamp(),
      ...(isNew ? { createdAt: serverTimestamp() } : {}),
    },
    { merge: true }
  );
  for (const rid of removedIds) await removePhoto(id, rid);
}

export async function deleteNote(note) {
  for (const p of note.photos || []) await removePhoto(note.id, p.id);
  await deleteDoc(noteDoc(note.id));
}

// 공개 범위만 바로 저장 (수정 화면 없이). 목록 순서(updatedAt)는 바꾸지 않는다.
// sharedWith는 visibility가 "some"일 때만 의미가 있어서, 다른 값이면 비운다.
export async function setNoteVisibility(id, visibility, sharedWith) {
  await updateDoc(noteDoc(id), {
    visibility,
    sharedWith: visibility === "some" ? sharedWith : [],
  });
}

// 제목/내용만 바로 저장 (수정 화면 없이). 고친 노트는 목록 맨 앞으로 올라온다.
export async function updateNoteText(id, { title, body }) {
  const fields = { updatedAt: serverTimestamp() };
  if (title !== undefined) fields.title = title;
  if (body !== undefined) fields.body = body;
  await updateDoc(noteDoc(id), fields);
}
