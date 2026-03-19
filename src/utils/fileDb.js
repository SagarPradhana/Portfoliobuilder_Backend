import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../../data/db.json");

const readDb = async () => {
  const raw = await fs.readFile(dbPath, "utf-8");
  return JSON.parse(raw);
};

const writeDb = async (data) => {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
};

export const createUser = async ({ name, email, password }) => {
  const db = await readDb();
  const user = {
    _id: crypto.randomUUID(),
    name,
    email: email.toLowerCase().trim(),
    password,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.push(user);
  await writeDb(db);
  return user;
};

export const findUserByEmail = async (email) => {
  const db = await readDb();
  return db.users.find((user) => user.email === email.toLowerCase().trim()) ?? null;
};

export const findUserById = async (id) => {
  const db = await readDb();
  return db.users.find((user) => user._id === id) ?? null;
};

export const createResumeRecord = async (resume) => {
  const db = await readDb();
  const record = {
    ...resume,
    _id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.resumes.push(record);
  await writeDb(db);
  return record;
};

export const listResumesByUser = async (userId) => {
  const db = await readDb();
  return db.resumes
    .filter((resume) => resume.user === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const findResumeById = async (id, userId) => {
  const db = await readDb();
  return db.resumes.find((resume) => resume._id === id && resume.user === userId) ?? null;
};

export const updateResumeRecord = async (id, userId, updates) => {
  const db = await readDb();
  const index = db.resumes.findIndex((resume) => resume._id === id && resume.user === userId);

  if (index === -1) {
    return null;
  }

  const updated = {
    ...db.resumes[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  db.resumes[index] = updated;
  await writeDb(db);
  return updated;
};

export const deleteResumeRecord = async (id, userId) => {
  const db = await readDb();
  const index = db.resumes.findIndex((resume) => resume._id === id && resume.user === userId);

  if (index === -1) {
    return null;
  }

  const [removed] = db.resumes.splice(index, 1);
  await writeDb(db);
  return removed;
};

export const findPublicResumeBySlug = async (slug) => {
  const db = await readDb();
  const resume = db.resumes.find((item) => item.shareSlug === slug && item.isPublic);

  if (!resume) {
    return null;
  }

  const { user, ...publicResume } = resume;
  return publicResume;
};
