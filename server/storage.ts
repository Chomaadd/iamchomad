import mongoose from 'mongoose';
  import {
    type Admin,
    type BlogPost,
    type ContactMessage,
    type MusicTrack,
    type BrandItem,
    type MemoryItem,
    type ResumeItem,
    type SiteSettings,
    type UpdateSiteSettings,
    type Analytics,
    type CreateBlogPostRequest,
    type UpdateBlogPostRequest,
    type CreateContactMessageRequest,
    type CreateMusicTrackRequest,
    type UpdateMusicTrackRequest,
    type CreateBrandItemRequest,
    type UpdateBrandItemRequest,
    type CreateMemoryItemRequest,
    type UpdateMemoryItemRequest,
    type CreateResumeItemRequest,
    type UpdateResumeItemRequest,
    type LinkItem,
    type CreateLinkItemRequest,
    type UpdateLinkItemRequest,
    type AnonMessage,
    type InsertAnonMessage,
  } from "@shared/schema";
  import { 
    AdminModel, 
    BlogPostModel, 
    ContactMessageModel, 
    MusicTrackModel, 
    BrandItemModel, 
    MemoryItemModel,
    ResumeItemModel,
    LinkItemModel,
    SiteSettingsModel,
    PageViewModel,
    AnonMessageModel,
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
    incrementViewCount(slug: string): Promise<BlogPost>;
    reactToBlogPost(slug: string, type: 'thumbsUp' | 'heart'): Promise<BlogPost>;
    
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

    getResumeItems(): Promise<ResumeItem[]>;
    getResumeItem(id: string): Promise<ResumeItem | undefined>;
    createResumeItem(item: CreateResumeItemRequest): Promise<ResumeItem>;
    updateResumeItem(id: string, updates: UpdateResumeItemRequest): Promise<ResumeItem>;
    deleteResumeItem(id: string): Promise<void>;

    getLinkItems(): Promise<LinkItem[]>;
    createLinkItem(item: CreateLinkItemRequest): Promise<LinkItem>;
    updateLinkItem(id: string, updates: UpdateLinkItemRequest): Promise<LinkItem>;
    deleteLinkItem(id: string): Promise<void>;

    getSiteSettings(): Promise<SiteSettings>;
    updateSiteSettings(updates: UpdateSiteSettings): Promise<SiteSettings>;

    recordPageView(page: string, userAgent?: string, referrer?: string): Promise<void>;
    getAnalytics(): Promise<Analytics>;

    getAnonMessages(): Promise<AnonMessage[]>;
    createAnonMessage(data: InsertAnonMessage): Promise<AnonMessage>;
    markAnonMessageRead(id: string): Promise<AnonMessage>;
    deleteAnonMessage(id: string): Promise<void>;
    getUnreadAnonMessageCount(): Promise<number>;
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

    async incrementViewCount(slug: string): Promise<BlogPost> {
      const updated = await BlogPostModel.findOneAndUpdate(
        { slug },
        { $inc: { viewCount: 1 } },
        { new: true }
      );
      if (!updated) throw new Error('Blog post not found');
      return mapId(updated);
    }

    async reactToBlogPost(slug: string, type: 'thumbsUp' | 'heart'): Promise<BlogPost> {
      const updated = await BlogPostModel.findOneAndUpdate(
        { slug },
        { $inc: { [`reactions.${type}`]: 1 } },
        { new: true }
      );
      if (!updated) throw new Error('Blog post not found');
      return mapId(updated);
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

    async getResumeItems(): Promise<ResumeItem[]> {
      const items = await ResumeItemModel.find().sort({ order: 1, createdAt: -1 });
      return items.map(i => mapId<ResumeItem>(i));
    }

    async getResumeItem(id: string): Promise<ResumeItem | undefined> {
      const item = await ResumeItemModel.findById(id);
      return item ? mapId(item) : undefined;
    }

    async createResumeItem(item: CreateResumeItemRequest): Promise<ResumeItem> {
      const created = await ResumeItemModel.create(item);
      return mapId(created);
    }

    async updateResumeItem(id: string, updates: UpdateResumeItemRequest): Promise<ResumeItem> {
      const updated = await ResumeItemModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      if (!updated) throw new Error('Resume item not found');
      return mapId(updated);
    }

    async deleteResumeItem(id: string): Promise<void> {
      await ResumeItemModel.findByIdAndDelete(id);
    }

    async getLinkItems(): Promise<LinkItem[]> {
      const items = await LinkItemModel.find().sort({ order: 1 });
      return items.map(i => mapId<LinkItem>(i));
    }

    async createLinkItem(item: CreateLinkItemRequest): Promise<LinkItem> {
      const created = await LinkItemModel.create(item);
      return mapId(created);
    }

    async updateLinkItem(id: string, updates: UpdateLinkItemRequest): Promise<LinkItem> {
      const updated = await LinkItemModel.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) throw new Error('Link item not found');
      return mapId(updated);
    }

    async deleteLinkItem(id: string): Promise<void> {
      await LinkItemModel.findByIdAndDelete(id);
    }

    async getSiteSettings(): Promise<SiteSettings> {
      const doc = await SiteSettingsModel.findOne();
      if (!doc) {
        const created = await SiteSettingsModel.create({
          availabilityStatus: 'open',
          availabilityLabel: 'Open to Work',
        });
        return mapId(created);
      }
      return mapId(doc);
    }

    async updateSiteSettings(updates: UpdateSiteSettings): Promise<SiteSettings> {
      const doc = await SiteSettingsModel.findOneAndUpdate(
        {},
        { $set: updates },
        { new: true, upsert: true }
      );
      return mapId(doc);
    }

    async recordPageView(page: string, userAgent?: string, referrer?: string): Promise<void> {
      await PageViewModel.create({ page, userAgent, referrer });
    }

    async getAnalytics(): Promise<Analytics> {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thirtyDaysAgo = new Date(startOfToday);
      thirtyDaysAgo.setDate(startOfToday.getDate() - 29);

      const [totalViews, todayViews, weekViews, monthViews, rawDaily, rawTopPages, rawUserAgents] = await Promise.all([
        PageViewModel.countDocuments(),
        PageViewModel.countDocuments({ createdAt: { $gte: startOfToday } }),
        PageViewModel.countDocuments({ createdAt: { $gte: startOfWeek } }),
        PageViewModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
        PageViewModel.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, views: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        PageViewModel.aggregate([
          { $group: { _id: '$page', views: { $sum: 1 } } },
          { $sort: { views: -1 } },
          { $limit: 10 },
        ]),
        PageViewModel.aggregate([
          { $group: { _id: '$userAgent', count: { $sum: 1 } } },
        ]),
      ]);

      const dailyMap = new Map<string, number>(rawDaily.map((d: any) => [d._id, d.views]));
      const dailyViews: { date: string; views: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(startOfToday);
        d.setDate(startOfToday.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dailyViews.push({ date: key, views: dailyMap.get(key) || 0 });
      }

      const topPages = rawTopPages.map((p: any) => ({ page: p._id, views: p.views }));

      let mobile = 0, desktop = 0;
      for (const row of rawUserAgents) {
        const ua = (row._id || '').toLowerCase();
        const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|windows phone/.test(ua);
        if (isMobile) mobile += row.count;
        else desktop += row.count;
      }
      const deviceBreakdown = [
        { device: 'Desktop', views: desktop },
        { device: 'Mobile', views: mobile },
      ];

      return { totalViews, todayViews, weekViews, monthViews, dailyViews, topPages, deviceBreakdown };
    }

    async getAnonMessages(): Promise<AnonMessage[]> {
      const docs = await AnonMessageModel.find().sort({ createdAt: -1 });
      return docs.map((d: any) => mapId<AnonMessage>(d));
    }

    async createAnonMessage(data: InsertAnonMessage): Promise<AnonMessage> {
      const doc = await AnonMessageModel.create({ message: data.message });
      return mapId<AnonMessage>(doc);
    }

    async markAnonMessageRead(id: string): Promise<AnonMessage> {
      const doc = await AnonMessageModel.findByIdAndUpdate(
        id,
        { $set: { isRead: true } },
        { new: true }
      );
      if (!doc) throw new Error("Message not found");
      return mapId<AnonMessage>(doc);
    }

    async deleteAnonMessage(id: string): Promise<void> {
      await AnonMessageModel.findByIdAndDelete(id);
    }

    async getUnreadAnonMessageCount(): Promise<number> {
      return AnonMessageModel.countDocuments({ isRead: false });
    }
  }

  export const storage = new DatabaseStorage();
  