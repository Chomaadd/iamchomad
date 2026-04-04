import mongoose from 'mongoose';
  import * as schema from '@shared/schema';

  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI must be set in production.");
  }

  export async function connectToDatabase() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
      await mongoose.connect(uri);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }

  const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
  });

  const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    imageUrl: { type: String },
    published: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    viewCount: { type: Number, default: 0 },
    reactions: {
      thumbsUp: { type: Number, default: 0 },
      heart: { type: Number, default: 0 },
    },
  }, { timestamps: true });

  const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  }, { timestamps: { createdAt: true, updatedAt: false } });

  const musicTrackSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    albumArt: { type: String },
    audioUrl: { type: String, required: true },
    duration: { type: String },
    isAutoPlay: { type: Boolean, default: false },
  }, { timestamps: { createdAt: true, updatedAt: false } });

  const brandItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    link: { type: String },
    category: { type: String },
    featured: { type: Boolean, default: false },
  }, { timestamps: true });

  const resumeItemSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['experience', 'education', 'skill'] },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    order: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  }, { timestamps: true });

  const linkItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  });

  const pageViewSchema = new mongoose.Schema({
    page: { type: String, required: true },
    userAgent: { type: String },
    referrer: { type: String },
  }, { timestamps: { createdAt: true, updatedAt: false } });

  const siteSettingsSchema = new mongoose.Schema({
    siteTitle: { type: String },
    adminAvatarUrl: { type: String },
    aboutImageUrl: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    ogImageUrl: { type: String },
    availabilityStatus: { type: String, enum: ['open', 'busy', 'unavailable'], default: 'open' },
    availabilityLabel: { type: String, default: 'Open to Work' },
    linksAvatarUrl: { type: String },
    linksName: { type: String },
    linksBio: { type: String },
    linksBackgroundUrl: { type: String },
    linksBorderStyle: { type: String, default: 'default' },
    lanyardDiscordId: { type: String },
    nowListening: { type: String },
    nowReading: { type: String },
    nowWorking: { type: String },
    nowLocation: { type: String },
    resumeFullName: { type: String },
    resumeTitle: { type: String },
    resumeAbout: { type: String },
    resumePhotoUrl: { type: String },
    resumeBirthDate: { type: String },
    resumeBirthPlace: { type: String },
    resumeReligion: { type: String },
    resumeGender: { type: String },
    resumeMarriagestatus: { type: String },
    resumeNationality: { type: String },
    resumePhone: { type: String },
    resumeAddress: { type: String },
    resumeEmail: { type: String },
    resumeWebsite: { type: String },
  });

  const anonMessageSchema = new mongoose.Schema({
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  }, { timestamps: { createdAt: true, updatedAt: false } });

  const novelStorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    coverUrl: { type: String },
    description: { type: String },
    category: { type: String, default: 'novel' },
    status: { type: String, enum: ['ongoing', 'completed', 'hiatus'], default: 'ongoing' },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
  }, { timestamps: true });

  const novelSeasonSchema = new mongoose.Schema({
    storyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'NovelStory' },
    seasonNumber: { type: Number, required: true },
    title: { type: String, required: true },
  }, { timestamps: { createdAt: true, updatedAt: false } });

  const novelChapterSchema = new mongoose.Schema({
    storyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'NovelStory' },
    seasonId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'NovelSeason' },
    chapterNumber: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    published: { type: Boolean, default: false },
  }, { timestamps: true });

  export const AdminModel = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
  export const BlogPostModel = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
  export const ContactMessageModel = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);
  export const MusicTrackModel = mongoose.models.MusicTrack || mongoose.model('MusicTrack', musicTrackSchema);
  export const BrandItemModel = mongoose.models.BrandItem || mongoose.model('BrandItem', brandItemSchema);
  export const ResumeItemModel = mongoose.models.ResumeItem || mongoose.model('ResumeItem', resumeItemSchema);
  export const LinkItemModel = mongoose.models.LinkItem || mongoose.model('LinkItem', linkItemSchema);
  export const SiteSettingsModel = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
  export const PageViewModel = mongoose.models.PageView || mongoose.model('PageView', pageViewSchema);
  export const AnonMessageModel = mongoose.models.AnonMessage || mongoose.model('AnonMessage', anonMessageSchema);
  export const NovelStoryModel = mongoose.models.NovelStory || mongoose.model('NovelStory', novelStorySchema);
  export const NovelSeasonModel = mongoose.models.NovelSeason || mongoose.model('NovelSeason', novelSeasonSchema);
  export const NovelChapterModel = mongoose.models.NovelChapter || mongoose.model('NovelChapter', novelChapterSchema);
  