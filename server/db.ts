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

  const memoryItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    link: { type: String },
    category: { type: String },
    featured: { type: Boolean, default: false },
  }, { timestamps: true });

  export const AdminModel = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
  export const BlogPostModel = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
  export const ContactMessageModel = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);
  export const MusicTrackModel = mongoose.models.MusicTrack || mongoose.model('MusicTrack', musicTrackSchema);
  export const BrandItemModel = mongoose.models.BrandItem || mongoose.model('BrandItem', brandItemSchema);
  export const MemoryItemModel = mongoose.models.MemoryItem || mongoose.model('MemoryItem', memoryItemSchema);
  