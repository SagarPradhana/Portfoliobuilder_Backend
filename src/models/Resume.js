import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    id: String,
    role: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    summary: String
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    id: String,
    school: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    score: String,
    summary: String
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    level: String
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    description: String,
    link: String,
    stack: [String]
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      default: "Untitled Resume"
    },
    template: {
      type: String,
      default: "aurora"
    },
    themeMode: {
      type: String,
      enum: ["dark", "light"],
      default: "dark"
    },
    shareSlug: {
      type: String,
      index: true
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    personalInfo: {
      fullName: String,
      role: String,
      email: String,
      phone: String,
      location: String,
      website: String,
      linkedin: String,
      github: String,
      summary: String
    },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [skillSchema],
    projects: [projectSchema],
    sectionOrder: {
      type: [String],
      default: ["personalInfo", "experience", "education", "skills", "projects"]
    }
  },
  {
    timestamps: true
  }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;

