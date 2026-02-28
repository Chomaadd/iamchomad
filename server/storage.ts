import { db } from "./db";
import {
  admins,
  blogPosts,
  contactMessages,
  musicTracks,
  brandItems,
  memoryItems,
  type Admin,
  type BlogPost,
  type ContactMessage,
  type MusicTrack,
  type BrandItem,
  type MemoryItem,
  type CreateBlogPostRequest,
  type UpdateBlogPostRequest,
  type CreateContactMessageRequest,
  type CreateMusicTrackRequest,
  type UpdateMusicTrackRequest,
  type CreateBrandItemRequest,
  type UpdateBrandItemRequest,
  type CreateMemoryItemRequest,
  type UpdateMemoryItemRequest,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  getAdminById(id: number): Promise<Admin | undefined>;
  createAdmin(username: string, password: string, name: string, email: string): Promise<Admin>;
  
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: CreateBlogPostRequest): Promise<BlogPost>;
  updateBlogPost(id: number, updates: UpdateBlogPostRequest): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: CreateContactMessageRequest): Promise<ContactMessage>;
  markContactMessageRead(id: number, read: boolean): Promise<ContactMessage>;
  deleteContactMessage(id: number): Promise<void>;
  
  getMusicTracks(): Promise<MusicTrack[]>;
  getMusicTrack(id: number): Promise<MusicTrack | undefined>;
  createMusicTrack(track: CreateMusicTrackRequest): Promise<MusicTrack>;
  updateMusicTrack(id: number, updates: UpdateMusicTrackRequest): Promise<MusicTrack>;
  deleteMusicTrack(id: number): Promise<void>;
  
  getBrandItems(): Promise<BrandItem[]>;
  getBrandItem(id: number): Promise<BrandItem | undefined>;
  createBrandItem(item: CreateBrandItemRequest): Promise<BrandItem>;
  updateBrandItem(id: number, updates: UpdateBrandItemRequest): Promise<BrandItem>;
  deleteBrandItem(id: number): Promise<void>;

  getMemoryItems(): Promise<MemoryItem[]>;
  getMemoryItem(id: number): Promise<MemoryItem | undefined>;
  createMemoryItem(item: CreateMemoryItemRequest): Promise<MemoryItem>;
  updateMemoryItem(id: number, updates: UpdateMemoryItemRequest): Promise<MemoryItem>;
  deleteMemoryItem(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username))
      .limit(1);
    return admin;
  }

  async getAdminById(id: number): Promise<Admin | undefined> {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, id))
      .limit(1);
    return admin;
  }

  async createAdmin(username: string, password: string, name: string, email: string): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values({ username, password, name, email })
      .returning();
    return admin;
  }

  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    if (published !== undefined) {
      return await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.published, published))
        .orderBy(blogPosts.createdAt);
    }
    return await db.select().from(blogPosts).orderBy(blogPosts.createdAt);
  }

  async getPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: CreateBlogPostRequest): Promise<BlogPost> {
    const [created] = await db
      .insert(blogPosts)
      .values({ ...post, updatedAt: new Date() })
      .returning();
    return created;
  }

  async updateBlogPost(id: number, updates: UpdateBlogPostRequest): Promise<BlogPost> {
    const [updated] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .orderBy(contactMessages.createdAt);
  }

  async createContactMessage(message: CreateContactMessageRequest): Promise<ContactMessage> {
    const [created] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return created;
  }

  async markContactMessageRead(id: number, read: boolean): Promise<ContactMessage> {
    const [updated] = await db
      .update(contactMessages)
      .set({ read })
      .where(eq(contactMessages.id, id))
      .returning();
    return updated;
  }

  async deleteContactMessage(id: number): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }

  async getMusicTracks(): Promise<MusicTrack[]> {
    return await db
      .select()
      .from(musicTracks)
      .orderBy(musicTracks.createdAt);
  }

  async getMusicTrack(id: number): Promise<MusicTrack | undefined> {
    const [track] = await db
      .select()
      .from(musicTracks)
      .where(eq(musicTracks.id, id))
      .limit(1);
    return track;
  }

  async createMusicTrack(track: CreateMusicTrackRequest): Promise<MusicTrack> {
    if (track.isAutoPlay) {
      await db.update(musicTracks).set({ isAutoPlay: false });
    }
    const [created] = await db
      .insert(musicTracks)
      .values(track)
      .returning();
    return created;
  }

  async updateMusicTrack(id: number, updates: UpdateMusicTrackRequest): Promise<MusicTrack> {
    if (updates.isAutoPlay) {
      await db.update(musicTracks).set({ isAutoPlay: false });
    }
    const [updated] = await db
      .update(musicTracks)
      .set(updates)
      .where(eq(musicTracks.id, id))
      .returning();
    return updated;
  }

  async deleteMusicTrack(id: number): Promise<void> {
    await db.delete(musicTracks).where(eq(musicTracks.id, id));
  }

  async getBrandItems(): Promise<BrandItem[]> {
    return await db
      .select()
      .from(brandItems)
      .orderBy(brandItems.createdAt);
  }

  async getBrandItem(id: number): Promise<BrandItem | undefined> {
    const [item] = await db
      .select()
      .from(brandItems)
      .where(eq(brandItems.id, id))
      .limit(1);
    return item;
  }

  async createBrandItem(item: CreateBrandItemRequest): Promise<BrandItem> {
    const [created] = await db
      .insert(brandItems)
      .values({ ...item, updatedAt: new Date() })
      .returning();
    return created;
  }

  async updateBrandItem(id: number, updates: UpdateBrandItemRequest): Promise<BrandItem> {
    const [updated] = await db
      .update(brandItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(brandItems.id, id))
      .returning();
    return updated;
  }

  async deleteBrandItem(id: number): Promise<void> {
    await db.delete(brandItems).where(eq(brandItems.id, id));
  }

  async getMemoryItems(): Promise<MemoryItem[]> {
    return await db
      .select()
      .from(memoryItems)
      .orderBy(memoryItems.createdAt);
  }

  async getMemoryItem(id: number): Promise<MemoryItem | undefined> {
    const [item] = await db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.id, id))
      .limit(1);
    return item;
  }

  async createMemoryItem(item: CreateMemoryItemRequest): Promise<MemoryItem> {
    const [created] = await db
      .insert(memoryItems)
      .values({ ...item, updatedAt: new Date() })
      .returning();
    return created;
  }

  async updateMemoryItem(id: number, updates: UpdateMemoryItemRequest): Promise<MemoryItem> {
    const [updated] = await db
      .update(memoryItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(memoryItems.id, id))
      .returning();
    return updated;
  }

  async deleteMemoryItem(id: number): Promise<void> {
    await db.delete(memoryItems).where(eq(memoryItems.id, id));
  }
}

export const storage = new DatabaseStorage();
