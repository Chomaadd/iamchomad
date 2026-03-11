import { z } from "zod";

export const adminSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  name: z.string(),
  email: z.string(),
});
export const insertAdminSchema = adminSchema.omit({ id: true });

export const blogPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string(),
  imageUrl: z.string().nullable().optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  viewCount: z.number().default(0),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
});
export const insertBlogPostSchema = blogPostSchema.omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });

export const contactMessageSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
  read: z.boolean().default(false).optional(),
  createdAt: z.union([z.date(), z.string()]).optional(),
});
export const insertContactMessageSchema = contactMessageSchema.omit({ id: true, createdAt: true, read: true });

export const musicTrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  albumArt: z.string().nullable().optional(),
  audioUrl: z.string(),
  duration: z.string().nullable().optional(),
  isAutoPlay: z.boolean().default(false).optional(),
  createdAt: z.union([z.date(), z.string()]).optional(),
});
export const insertMusicTrackSchema = musicTrackSchema.omit({ id: true, createdAt: true });

export const brandItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  featured: z.boolean().default(false).optional(),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
});
export const insertBrandItemSchema = brandItemSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const memoryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  featured: z.boolean().default(false).optional(),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
});
export const insertMemoryItemSchema = memoryItemSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type Admin = z.infer<typeof adminSchema>;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type BlogPost = z.infer<typeof blogPostSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type CreateBlogPostRequest = InsertBlogPost;
export type UpdateBlogPostRequest = Partial<InsertBlogPost>;
export type BlogPostResponse = BlogPost;

export type ContactMessage = z.infer<typeof contactMessageSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type CreateContactMessageRequest = InsertContactMessage;
export type ContactMessageResponse = ContactMessage;

export type MusicTrack = z.infer<typeof musicTrackSchema>;
export type InsertMusicTrack = z.infer<typeof insertMusicTrackSchema>;
export type CreateMusicTrackRequest = InsertMusicTrack;
export type UpdateMusicTrackRequest = Partial<InsertMusicTrack>;
export type MusicTrackResponse = MusicTrack;

export type BrandItem = z.infer<typeof brandItemSchema>;
export type InsertBrandItem = z.infer<typeof insertBrandItemSchema>;
export type CreateBrandItemRequest = InsertBrandItem;
export type UpdateBrandItemRequest = Partial<InsertBrandItem>;
export type BrandItemResponse = BrandItem;

export type MemoryItem = z.infer<typeof memoryItemSchema>;
export type InsertMemoryItem = z.infer<typeof insertMemoryItemSchema>;
export type CreateMemoryItemRequest = InsertMemoryItem;
export type UpdateMemoryItemRequest = Partial<InsertMemoryItem>;
export type MemoryItemResponse = MemoryItem;

export const resumeItemSchema = z.object({
  id: z.string(),
  type: z.enum(["experience", "education", "skill"]),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  order: z.number().default(0),
  tags: z.array(z.string()).default([]),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
});
export const insertResumeItemSchema = resumeItemSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type ResumeItem = z.infer<typeof resumeItemSchema>;
export type InsertResumeItem = z.infer<typeof insertResumeItemSchema>;
export type CreateResumeItemRequest = InsertResumeItem;
export type UpdateResumeItemRequest = Partial<InsertResumeItem>;
export type ResumeItemResponse = ResumeItem;

export const pageViewSchema = z.object({
  id: z.string(),
  page: z.string(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  createdAt: z.union([z.date(), z.string()]).optional(),
});
export type PageView = z.infer<typeof pageViewSchema>;

export const analyticsSchema = z.object({
  totalViews: z.number(),
  todayViews: z.number(),
  weekViews: z.number(),
  monthViews: z.number(),
  dailyViews: z.array(z.object({ date: z.string(), views: z.number() })),
  topPages: z.array(z.object({ page: z.string(), views: z.number() })),
  deviceBreakdown: z.array(z.object({ device: z.string(), views: z.number() })),
});
export type Analytics = z.infer<typeof analyticsSchema>;

export const availabilityStatusSchema = z.enum(["open", "busy", "unavailable"]);
export const siteSettingsSchema = z.object({
  id: z.string(),
  availabilityStatus: availabilityStatusSchema.default("open"),
  availabilityLabel: z.string().default("Open to Work"),
});
export const updateSiteSettingsSchema = siteSettingsSchema.omit({ id: true }).partial();

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type UpdateSiteSettings = z.infer<typeof updateSiteSettingsSchema>;
export type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  admin?: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
  message?: string;
}

export interface CurrentUserResponse {
  id: string;
  username: string;
  name: string;
  email: string;
}
