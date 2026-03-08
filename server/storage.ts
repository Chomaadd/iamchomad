import mongoose from 'mongoose';
  import {
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
  import { 
    AdminModel, 
    BlogPostModel, 
    ContactMessageModel, 
    MusicTrackModel, 
    BrandItemModel, 
    MemoryItemModel 
  } from "./db";

  export interface IStorage {
    getAdminByUsername(username: string): Promise<Admin | undefined>;
    getAdminById(id: string): Promise<Admin | undefined>;
    createAdmin(username: string, password: string, name: string, email: string): Promise<Admin>;
    
    getBlogPosts(published?: boolean): Promise<BlogPost[]>;
    getBlogPost(slug: string): Promise<BlogPost | undefined>;
    createBlogPost(post: CreateBlogPostRequest): Promise<BlogPost>;
    updateBlogPost(id: string, updates: UpdateBlogPostRequest): Promise<BlogPost>;
    deleteBlogPost(id: string): Promise<void>;
    
    getContactMessages(): Promise<ContactMessage[]>;
    createContactMessage(message: CreateContactMessageRequest): Promise<ContactMessage>;
    markContactMessageRead(id: string, read: boolean): Promise<ContactMessage>;
    deleteContactMessage(id: string): Promise<void>;
    
    getMusicTracks(): Promise<MusicTrack[]>;
    getMusicTrack(id: string): Promise<MusicTrack | undefined>;
    createMusicTrack(track: CreateMusicTrackRequest): Promise<MusicTrack>;
    updateMusicTrack(id: string, updates: UpdateMusicTrackRequest): Promise<MusicTrack>;
    deleteMusicTrack(id: string): Promise<void>;
    
    getBrandItems(): Promise<BrandItem[]>;
    getBrandItem(id: string): Promise<BrandItem | undefined>;
    createBrandItem(item: CreateBrandItemRequest): Promise<BrandItem>;
    updateBrandItem(id: string, updates: UpdateBrandItemRequest): Promise<BrandItem>;
    deleteBrandItem(id: string): Promise<void>;

    getMemoryItems(): Promise<MemoryItem[]>;
    getMemoryItem(id: string): Promise<MemoryItem | undefined>;
    createMemoryItem(item: CreateMemoryItemRequest): Promise<MemoryItem>;
    updateMemoryItem(id: string, updates: UpdateMemoryItemRequest): Promise<MemoryItem>;
    deleteMemoryItem(id: string): Promise<void>;
  }

  function mapId<T>(doc: any): T {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    if (obj._id) {
      obj.id = obj._id.toString();
      delete obj._id;
    }
    delete obj.__v;
    return obj as T;
  }

  export class DatabaseStorage implements IStorage {
    async getAdminByUsername(username: string): Promise<Admin | undefined> {
      const admin = await AdminModel.findOne({ username });
      return admin ? mapId(admin) : undefined;
    }

    async getAdminById(id: string): Promise<Admin | undefined> {
      const admin = await AdminModel.findById(id);
      return admin ? mapId(admin) : undefined;
    }

    async createAdmin(username: string, password: string, name: string, email: string): Promise<Admin> {
      const admin = await AdminModel.create({ username, password, name, email });
      return mapId(admin);
    }

    async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
      const query = published !== undefined ? { published } : {};
      const posts = await BlogPostModel.find(query).sort({ createdAt: 1 });
      return posts.map(p => mapId<BlogPost>(p));
    }

    async getPost(id: string): Promise<BlogPost | undefined> {
      const post = await BlogPostModel.findById(id);
      return post ? mapId(post) : undefined;
    }

    async getBlogPost(slug: string): Promise<BlogPost | undefined> {
      const post = await BlogPostModel.findOne({ slug });
      return post ? mapId(post) : undefined;
    }

    async createBlogPost(post: CreateBlogPostRequest): Promise<BlogPost> {
      const created = await BlogPostModel.create(post);
      return mapId(created);
    }

    async updateBlogPost(id: string, updates: UpdateBlogPostRequest): Promise<BlogPost> {
      const updated = await BlogPostModel.findByIdAndUpdate(
        id, 
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      if (!updated) throw new Error('Blog post not found');
      return mapId(updated);
    }

    async deleteBlogPost(id: string): Promise<void> {
      await BlogPostModel.findByIdAndDelete(id);
    }

    async getContactMessages(): Promise<ContactMessage[]> {
      const messages = await ContactMessageModel.find().sort({ createdAt: 1 });
      return messages.map(m => mapId<ContactMessage>(m));
    }

    async createContactMessage(message: CreateContactMessageRequest): Promise<ContactMessage> {
      const created = await ContactMessageModel.create(message);
      return mapId(created);
    }

    async markContactMessageRead(id: string, read: boolean): Promise<ContactMessage> {
      const updated = await ContactMessageModel.findByIdAndUpdate(
        id,
        { read },
        { new: true }
      );
      if (!updated) throw new Error('Message not found');
      return mapId(updated);
    }

    async deleteContactMessage(id: string): Promise<void> {
      await ContactMessageModel.findByIdAndDelete(id);
    }

    async getMusicTracks(): Promise<MusicTrack[]> {
      const tracks = await MusicTrackModel.find().sort({ createdAt: 1 });
      return tracks.map(t => mapId<MusicTrack>(t));
    }

    async getMusicTrack(id: string): Promise<MusicTrack | undefined> {
      const track = await MusicTrackModel.findById(id);
      return track ? mapId(track) : undefined;
    }

    async createMusicTrack(track: CreateMusicTrackRequest): Promise<MusicTrack> {
      if (track.isAutoPlay) {
        await MusicTrackModel.updateMany({}, { isAutoPlay: false });
      }
      const created = await MusicTrackModel.create(track);
      return mapId(created);
    }

    async updateMusicTrack(id: string, updates: UpdateMusicTrackRequest): Promise<MusicTrack> {
      if (updates.isAutoPlay) {
        await MusicTrackModel.updateMany({}, { isAutoPlay: false });
      }
      const updated = await MusicTrackModel.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );
      if (!updated) throw new Error('Music track not found');
      return mapId(updated);
    }

    async deleteMusicTrack(id: string): Promise<void> {
      await MusicTrackModel.findByIdAndDelete(id);
    }

    async getBrandItems(): Promise<BrandItem[]> {
      const items = await BrandItemModel.find().sort({ createdAt: 1 });
      return items.map(i => mapId<BrandItem>(i));
    }

    async getBrandItem(id: string): Promise<BrandItem | undefined> {
      const item = await BrandItemModel.findById(id);
      return item ? mapId(item) : undefined;
    }

    async createBrandItem(item: CreateBrandItemRequest): Promise<BrandItem> {
      const created = await BrandItemModel.create(item);
      return mapId(created);
    }

    async updateBrandItem(id: string, updates: UpdateBrandItemRequest): Promise<BrandItem> {
      const updated = await BrandItemModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      if (!updated) throw new Error('Brand item not found');
      return mapId(updated);
    }

    async deleteBrandItem(id: string): Promise<void> {
      await BrandItemModel.findByIdAndDelete(id);
    }

    async getMemoryItems(): Promise<MemoryItem[]> {
      const items = await MemoryItemModel.find().sort({ createdAt: 1 });
      return items.map(i => mapId<MemoryItem>(i));
    }

    async getMemoryItem(id: string): Promise<MemoryItem | undefined> {
      const item = await MemoryItemModel.findById(id);
      return item ? mapId(item) : undefined;
    }

    async createMemoryItem(item: CreateMemoryItemRequest): Promise<MemoryItem> {
      const created = await MemoryItemModel.create(item);
      return mapId(created);
    }

    async updateMemoryItem(id: string, updates: UpdateMemoryItemRequest): Promise<MemoryItem> {
      const updated = await MemoryItemModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      if (!updated) throw new Error('Memory item not found');
      return mapId(updated);
    }

    async deleteMemoryItem(id: string): Promise<void> {
      await MemoryItemModel.findByIdAndDelete(id);
    }
  }

  export const storage = new DatabaseStorage();
  