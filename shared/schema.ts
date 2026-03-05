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
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
});
export const insertBlogPostSchema = blogPostSchema.omit({ id: true, createdAt: true, updatedAt: true });

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
