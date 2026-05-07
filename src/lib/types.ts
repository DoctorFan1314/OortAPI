export interface SkillVariable {
  name: string;
  placeholder: string;
  required: boolean;
  description?: string;
}

export interface BeforeAfterExample {
  input: string;
  outputs: {
    model: string;
    text: string;
  }[];
}

export interface RecommendedModel {
  name: string;
  strengths: string;
  useCase: string;
  audience: string;
}

export interface Skill {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  categorySlug: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  rating: number;
  usageCount: number;
  lastUpdated: string;
  version: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  beginner: boolean;
  promptOnline: string;
  promptLocal: string;
  variables: SkillVariable[];
  beforeAfter: BeforeAfterExample;
  recommendedModels: RecommendedModel[];
  usageStepsOnline: string[];
  usageStepsLocal: string[];
  advancedTips?: string[];
  likes: number;
  isPremium?: boolean;
  previewLimit?: number;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  description: string;
  skillCount?: number;
  color: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

// --- User system types ---

export interface UserProfile {
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  joinDate: string;
  preferences: {
    theme: "dark" | "light" | "system";
    language: "zh" | "en";
  };
}

export interface UserActivity {
  id: string;
  type: "like" | "bookmark" | "comment" | "submit" | "view" | "copy";
  skillId?: string;
  targetTitle?: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  skillId: string;
  userEmail: string;
  username: string;
  content: string;
  rating?: number;
  createdAt: string;
  parentId?: string;
  likes: number;
  likedBy: string[];
}

export interface Submission {
  id: string;
  name: string;
  shortDesc: string;
  category: string;
  categorySlug: string;
  promptOnline: string;
  promptLocal: string;
  usage: string;
  submittedAt: string;
  authorEmail: string;
  authorName: string;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string;
  version: string;
}

export interface PromptVersion {
  id: string;
  skillId: string;
  version: string;
  promptOnline: string;
  promptLocal: string;
  changelog: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AgentSkill {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  author: string;
  authorBadge?: string;
  developer: string;
  downloads: number;
  stars: number;
  lastUpdated: string;
  collection: string;
  category: string;
  categorySlug: string;
  installCommand: string;
  readme: string;
  license: string;
  version: string;
  files: Record<string, string>;
  demoInput: string;
  demoOutput: string;
  triggers: string[];
  tags: string[];
  featured: boolean;
  trending: boolean;
  // New fields
  screenshots?: string[];
  dependencies?: { name: string; version: string }[];
  verified?: boolean;
  platform?: string[];
  versions?: AgentSkillVersion[];
}

export interface AgentSkillVersion {
  version: string;
  date: string;
  changelog: string;
  author: string;
}

export interface Notification {
  id: string;
  type: "comment_reply" | "skill_update" | "submission_status" | "like" | "follow" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  userId: string;
}

export interface UserCollection {
  id: string;
  name: string;
  description: string;
  skillIds: string[];
  createdAt: string;
  userId: string;
  isPublic: boolean;
}

export interface UserFollow {
  followerEmail: string;
  followingAuthor: string;
  timestamp: string;
}

export interface Report {
  id: string;
  targetType: "skill" | "comment" | "prompt";
  targetId: string;
  reason: "spam" | "abuse" | "copyright" | "other";
  description: string;
  reporterEmail: string;
  timestamp: string;
  status: "pending" | "reviewed" | "resolved";
}
