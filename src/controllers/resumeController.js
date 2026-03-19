import crypto from "node:crypto";
import slugify from "slugify";
import {
  createResumeRecord,
  deleteResumeRecord,
  findPublicResumeBySlug,
  findResumeById,
  listResumesByUser,
  updateResumeRecord
} from "../utils/fileDb.js";

const buildShareSlug = (title, userId) =>
  `${slugify(title || "resume", { lower: true, strict: true })}-${String(userId).slice(-6)}-${Date.now()
    .toString()
    .slice(-5)}`;

const baseResume = (userId) => ({
  user: userId,
  title: "Untitled Resume",
  template: "aurora",
  themeMode: "dark",
  fontStyle: "modern",
  personalInfo: {
    fullName: "Your Name",
    role: "Senior Product Designer",
    email: "you@example.com",
    phone: "+1 (555) 555-5555",
    location: "San Francisco, CA",
    website: "https://your-site.com",
    linkedin: "https://linkedin.com/in/yourname",
    github: "https://github.com/yourname",
    summary:
      "Design-forward builder creating ambitious products with strong storytelling, systems thinking, and measurable outcomes."
  },
  experience: [
    {
      id: crypto.randomUUID(),
      role: "Lead Product Designer",
      company: "Nova Labs",
      location: "Remote",
      startDate: "2023",
      endDate: "Present",
      current: true,
      summary: "Led a cross-functional redesign that increased activation by 28% and improved premium conversion."
    }
  ],
  education: [
    {
      id: crypto.randomUUID(),
      school: "Rhode Island School of Design",
      degree: "BFA",
      field: "Graphic Design",
      startDate: "2016",
      endDate: "2020",
      score: "3.9 GPA",
      summary: "Focused on editorial systems, identity, and digital product storytelling."
    }
  ],
  skills: [
    { id: crypto.randomUUID(), name: "Product Strategy", level: "Expert" },
    { id: crypto.randomUUID(), name: "React", level: "Advanced" },
    { id: crypto.randomUUID(), name: "Motion Design", level: "Advanced" }
  ],
  projects: [
    {
      id: crypto.randomUUID(),
      name: "Orbit Portfolio",
      description: "Interactive portfolio experience with animated storytelling and case-study-driven conversion.",
      link: "https://example.com",
      stack: ["React", "Framer Motion", "Node.js"]
    }
  ],
  sectionOrder: ["personalInfo", "experience", "education", "skills", "projects"]
});

export const createResume = async (req, res) => {
  const resume = await createResumeRecord(baseResume(req.user._id));
  return res.status(201).json(resume);
};

export const getResumes = async (req, res) => {
  const resumes = await listResumesByUser(req.user._id);
  return res.json(resumes);
};

export const getResumeById = async (req, res) => {
  const resume = await findResumeById(req.params.id, req.user._id);

  if (!resume) {
    return res.status(404).json({ message: "Resume not found" });
  }

  return res.json(resume);
};

export const updateResume = async (req, res) => {
  const { _id, user, createdAt, updatedAt, shareSlug, isPublic, ...safeUpdates } = req.body;
  const resume = await updateResumeRecord(req.params.id, req.user._id, safeUpdates);

  if (!resume) {
    return res.status(404).json({ message: "Resume not found" });
  }

  return res.json(resume);
};

export const deleteResume = async (req, res) => {
  const resume = await deleteResumeRecord(req.params.id, req.user._id);

  if (!resume) {
    return res.status(404).json({ message: "Resume not found" });
  }

  return res.json({ message: "Resume deleted" });
};

export const duplicateResume = async (req, res) => {
  const resume = await findResumeById(req.params.id, req.user._id);

  if (!resume) {
    return res.status(404).json({ message: "Resume not found" });
  }

  const { _id, createdAt, updatedAt, ...rest } = resume;
  const duplicate = await createResumeRecord({
    ...rest,
    title: `${resume.title} Copy`,
    user: req.user._id,
    isPublic: false,
    shareSlug: undefined
  });

  return res.status(201).json(duplicate);
};

export const publishResume = async (req, res) => {
  const existing = await findResumeById(req.params.id, req.user._id);

  if (!existing) {
    return res.status(404).json({ message: "Resume not found" });
  }

  const resume = await updateResumeRecord(req.params.id, req.user._id, {
    isPublic: true,
    shareSlug: existing.shareSlug || buildShareSlug(existing.title, req.user._id)
  });

  return res.json({
    shareSlug: resume.shareSlug,
    shareUrl: `${process.env.CLIENT_URL}/portfolio/${resume.shareSlug}`
  });
};

export const unpublishResume = async (req, res) => {
  const resume = await findResumeById(req.params.id, req.user._id);

  if (!resume) {
    return res.status(404).json({ message: "Resume not found" });
  }

  await updateResumeRecord(req.params.id, req.user._id, { isPublic: false });

  return res.json({ message: "Resume unpublished" });
};

export const getPublicResume = async (req, res) => {
  const resume = await findPublicResumeBySlug(req.params.slug);

  if (!resume) {
    return res.status(404).json({ message: "Portfolio not found" });
  }

  return res.json(resume);
};
