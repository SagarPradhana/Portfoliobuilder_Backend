import express from "express";
import {
  createResume,
  deleteResume,
  duplicateResume,
  getPublicResume,
  getResumeById,
  getResumes,
  publishResume,
  unpublishResume,
  updateResume
} from "../controllers/resumeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/public/:slug", getPublicResume);

router.use(protect);

router.route("/").get(getResumes).post(createResume);
router.route("/:id").get(getResumeById).put(updateResume).delete(deleteResume);
router.post("/:id/duplicate", duplicateResume);
router.post("/:id/publish", publishResume);
router.post("/:id/unpublish", unpublishResume);

export default router;

