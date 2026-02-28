import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const musicTracks = pgTable("music_tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  albumArt: text("album_art"),
  audioUrl: text("audio_url").notNull(),
  duration: text("duration"),
  isAutoPlay: boolean("is_auto_play").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brandItems = pgTable("brand_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  link: text("link"),
  category: text("category"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const memoryItems = pgTable("memory_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  link: text("link"),
  category: text("category"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true, read: true });
export const insertMusicTrackSchema = createInsertSchema(musicTracks).omit({ id: true, createdAt: true });
export const insertBrandItemSchema = createInsertSchema(brandItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMemoryItemSchema = createInsertSchema(memoryItems).omit({ id: true, createdAt: true, updatedAt: true });

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type CreateBlogPostRequest = InsertBlogPost;
export type UpdateBlogPostRequest = Partial<InsertBlogPost>;
export type BlogPostResponse = BlogPost;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type CreateContactMessageRequest = InsertContactMessage;
export type ContactMessageResponse = ContactMessage;

export type MusicTrack = typeof musicTracks.$inferSelect;
export type InsertMusicTrack = z.infer<typeof insertMusicTrackSchema>;
export type CreateMusicTrackRequest = InsertMusicTrack;
export type UpdateMusicTrackRequest = Partial<InsertMusicTrack>;
export type MusicTrackResponse = MusicTrack;

export type BrandItem = typeof brandItems.$inferSelect;
export type InsertBrandItem = z.infer<typeof insertBrandItemSchema>;
export type CreateBrandItemRequest = InsertBrandItem;
export type UpdateBrandItemRequest = Partial<InsertBrandItem>;
export type BrandItemResponse = BrandItem;

export type MemoryItem = typeof memoryItems.$inferSelect;
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
    id: number;
    username: string;
    name: string;
    email: string;
  };
  message?: string;
}

export interface CurrentUserResponse {
  id: number;
  username: string;
  name: string;
  email: string;
}