import type { Express } from "express";
import type { Server } from "http";
import session from "express-session";
import mongoose from "mongoose";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { log } from "./index";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { parseBuffer } from "music-metadata";

declare module "express-session" {
  interface SessionData {
    adminId?: string;
    memoryUnlocked?: boolean;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Configure session store - use MongoDB in production, memory store in development/fallback
  let store: session.Store;
  if (process.env.NODE_ENV === "production") {
    try {
      const mongoUrl =
        process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";
      const connectMongo = require("connect-mongo");
      const MongoStore = connectMongo.default || connectMongo;
      store = new MongoStore({
        mongoUrl: mongoUrl,
        touchAfter: 24 * 3600, // lazy session update
      });
      log("Using MongoDB session store", "express");
    } catch (error) {
      log(
        `Failed to initialize MongoDB store: ${error}, falling back to MemoryStore`,
        "express",
      );
      store = new session.MemoryStore();
    }
  } else {
    // Use default MemoryStore for development
    store = new session.MemoryStore();
  }

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(
    session({
      store: store,
      secret:
        process.env.SESSION_SECRET || "your-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  function getGridFSBucket() {
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB not connected");
    return new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });
  }

  async function extractDurationFromBuffer(
    buf: Buffer,
    filename: string,
  ): Promise<string | null> {
    try {
      const metadata = await parseBuffer(buf);
      const durationSeconds = metadata.format.duration;
      if (
        !durationSeconds ||
        !isFinite(durationSeconds) ||
        isNaN(durationSeconds) ||
        durationSeconds <= 0
      ) {
        console.log(`No valid duration found for ${filename}`);
        return null;
      }
      const totalSeconds = Math.round(durationSeconds);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      console.log(`Duration ${formatted} from ${filename}`);
      return formatted;
    } catch (err: any) {
      console.log(`Duration extraction error for ${filename}: ${err?.message}`);
      return null;
    }
  }

  app.post(
    "/api/upload",
    requireAuth,
    upload.single("file"),
    async (req: any, res: any) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const bucket = getGridFSBucket();
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(req.file.originalname);
        const filename = `file-${uniqueSuffix}${ext}`;

        const uploadStream = bucket.openUploadStream(filename, {
          contentType: req.file.mimetype,
        });

        await new Promise<void>((resolve, reject) => {
          uploadStream.on('finish', resolve);
          uploadStream.on('error', reject);
          uploadStream.end(req.file.buffer);
        });

        const url = `/uploads/${filename}`;

        let fileDuration: string | null = null;
        const isAudio =
          req.file.mimetype?.includes("audio") ||
          req.file.originalname?.toLowerCase().endsWith(".mp3") ||
          req.file.originalname?.toLowerCase().endsWith(".wav") ||
          req.file.originalname?.toLowerCase().endsWith(".m4a");

        if (isAudio) {
          fileDuration = await extractDurationFromBuffer(
            req.file.buffer,
            filename,
          );
        }

        return res.json({ url, duration: fileDuration });
      } catch (err) {
        console.error("Upload route error:", err);
        return res
          .status(500)
          .json({ message: "Internal server error during upload" });
      }
    },
  );

  app.get("/uploads/:filename", async (req, res) => {
    const filename = req.params.filename;
    const localDir = path.join(process.cwd(), "uploads");
    const localPath = path.join(localDir, filename);

    try {
      const bucket = getGridFSBucket();
      const files = await bucket.find({ filename }).toArray();

      if (files && files.length > 0) {
        const file = files[0];
        if (file.contentType) {
          res.set("Content-Type", file.contentType);
        }
        res.set("Cache-Control", "public, max-age=31536000");

        const downloadStream = bucket.openDownloadStreamByName(filename);
        downloadStream.on("error", (err) => {
          console.error("GridFS download stream error:", err);
          if (!res.headersSent) {
            res.status(500).json({ message: "Error streaming file" });
          }
        });
        downloadStream.pipe(res);
        return;
      }
    } catch (err) {
      console.error("GridFS lookup error, trying local fallback:", err);
    }

    if (fs.existsSync(localPath)) {
      return res.sendFile(localPath);
    }
    return res.status(404).json({ message: "File not found" });
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);

      const adminUsername = process.env.ADMIN_USERNAME || "user";
      const adminPassword = process.env.ADMIN_PASSWORD || "Makanseblak123#";

      if (input.username !== adminUsername) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (input.password !== adminPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const admin = {
        id: "1",
        username: adminUsername,
        name: "Choiril Ahmad",
        email: "iamchoirilfk@gmail.com",
      };

      req.session.adminId = admin.id;

      res.json({
        success: true,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Login error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session.adminId) {
      return res.json(null);
    }

    const adminUsername = process.env.ADMIN_USERNAME || "admin";

    res.json({
      id: "1",
      username: adminUsername,
      name: "Choiril Ahmad",
      email: "iamchoirilfk@gmail.com",
    });
  });

  app.get(api.blog.list.path, async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (err) {
      console.error("Blog list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/robots.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.send(
      `User-agent: *\nAllow: /\n\nSitemap: https://iamchomad.my.id/sitemap.xml\n`,
    );
  });

  app.get("/sitemap.xml", async (_req, res) => {
    const SITE_URL = "https://iamchomad.my.id";
    const today = new Date().toISOString().split("T")[0];

    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "weekly" },
      { url: "/about", priority: "0.8", changefreq: "monthly" },
      { url: "/blog", priority: "0.9", changefreq: "daily" },
      { url: "/brand", priority: "0.7", changefreq: "monthly" },
      { url: "/music", priority: "0.7", changefreq: "monthly" },
      { url: "/resume", priority: "0.8", changefreq: "monthly" },
      { url: "/contact", priority: "0.6", changefreq: "yearly" },
    ];

    let blogEntries = "";
    try {
      const posts = await storage.getBlogPosts();
      const published = posts.filter((p: any) => p.published);
      blogEntries = published
        .map((post: any) => {
          const lastmod = post.updatedAt
            ? new Date(post.updatedAt).toISOString().split("T")[0]
            : post.createdAt
              ? new Date(post.createdAt).toISOString().split("T")[0]
              : today;
          return `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        })
        .join("\n");
    } catch {
      blogEntries = "";
    }

    const staticEntries = staticPages
      .map(
        (p) => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${blogEntries}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  });

  app.get(api.blog.get.path, async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (err) {
      console.error("Blog get error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.blog.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.blog.create.input.parse(req.body);
      const post = await storage.createBlogPost(input);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Blog create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.blog.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.blog.update.input.parse(req.body);
      const post = await storage.updateBlogPost(req.params.id, input);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Blog update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.blog.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteBlogPost(req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error("Blog delete error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/blog/:slug/view", async (req, res) => {
    try {
      const post = await storage.incrementViewCount(req.params.slug);
      res.json({ viewCount: post.viewCount });
    } catch (err) {
      res.status(404).json({ message: "Blog post not found" });
    }
  });

  app.get(api.contact.list.path, requireAuth, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (err) {
      console.error("Contact list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.contact.create.path, async (req, res) => {
    try {
      const input = api.contact.create.input.parse(req.body);
      const message = await storage.createContactMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Contact create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.contact.markRead.path, requireAuth, async (req, res) => {
    try {
      const message = await storage.markContactMessageRead(req.params.id, true);
      if (!message) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      res.json(message);
    } catch (err) {
      console.error("Contact mark read error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.contact.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteContactMessage(req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error("Contact delete error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.music.list.path, async (req, res) => {
    try {
      const tracks = await storage.getMusicTracks();
      res.json(tracks);
    } catch (err) {
      console.error("Music list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.music.get.path, async (req, res) => {
    try {
      const track = await storage.getMusicTrack(req.params.id);
      if (!track) {
        return res.status(404).json({ message: "Music track not found" });
      }
      res.json(track);
    } catch (err) {
      console.error("Music get error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.music.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.music.create.input.parse(req.body);
      const track = await storage.createMusicTrack(input);
      res.status(201).json(track);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Music create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.music.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.music.update.input.parse(req.body);
      const track = await storage.updateMusicTrack(req.params.id, input);
      if (!track) {
        return res.status(404).json({ message: "Music track not found" });
      }
      res.json(track);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Music update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.music.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteMusicTrack(req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error("Music delete error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.brand.list.path, async (_req, res) => {
    try {
      const items = await storage.getBrandItems();
      res.json(items);
    } catch (err) {
      console.error("Brand list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.brand.get.path, async (req, res) => {
    try {
      const item = await storage.getBrandItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Brand item not found" });
      }
      res.json(item);
    } catch (err) {
      console.error("Brand get error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.brand.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.brand.create.input.parse(req.body);
      const item = await storage.createBrandItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Brand create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.brand.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.brand.update.input.parse(req.body);
      const item = await storage.updateBrandItem(req.params.id, input);
      if (!item) {
        return res.status(404).json({ message: "Brand item not found" });
      }
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Brand update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.brand.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteBrandItem(req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error("Brand delete error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/memory/verify", (req, res) => {
    const { password } = req.body;
    const memoryPassword = process.env.MEMORY_PASSWORD;

    if (!memoryPassword) {
      return res
        .status(500)
        .json({ message: "Memory password not configured" });
    }

    if (password === memoryPassword) {
      req.session.memoryUnlocked = true;
      return res.json({ success: true });
    }

    return res.status(401).json({ message: "Incorrect password" });
  });

  app.get("/api/memory/status", (req, res) => {
    res.json({
      unlocked: !!req.session.memoryUnlocked || !!req.session.adminId,
    });
  });

  const requireMemoryAccess = (req: any, res: any, next: any) => {
    if (!req.session.memoryUnlocked && !req.session.adminId) {
      return res.status(401).json({ message: "Memory access denied" });
    }
    next();
  };

  app.get(api.memory.list.path, requireMemoryAccess, async (_req, res) => {
    try {
      const items = await storage.getMemoryItems();
      res.json(items);
    } catch (err) {
      console.error("Memory list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.memory.get.path, requireMemoryAccess, async (req, res) => {
    try {
      const item = await storage.getMemoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Memory item not found" });
      }
      res.json(item);
    } catch (err) {
      console.error("Memory get error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.memory.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.memory.create.input.parse(req.body);
      const item = await storage.createMemoryItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Memory create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.memory.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.memory.update.input.parse(req.body);
      const item = await storage.updateMemoryItem(req.params.id, input);
      if (!item) {
        return res.status(404).json({ message: "Memory item not found" });
      }
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Memory update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.memory.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteMemoryItem(req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error("Memory delete error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.resume.list.path, async (_req, res) => {
    try {
      const items = await storage.getResumeItems();
      res.json(items);
    } catch (err) {
      console.error("Resume list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.resume.get.path, async (req, res) => {
    try {
      const item = await storage.getResumeItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Resume item not found" });
      }
      res.json(item);
    } catch (err) {
      console.error("Resume get error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.resume.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.resume.create.input.parse(req.body);
      const item = await storage.createResumeItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Resume create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.resume.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.resume.update.input.parse(req.body);
      const item = await storage.updateResumeItem(req.params.id, input);
      if (!item) {
        return res.status(404).json({ message: "Resume item not found" });
      }
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Resume update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.resume.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteResumeItem(req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error("Resume delete error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/settings', async (_req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (err) {
      console.error("Settings get error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put('/api/settings', requireAuth, async (req, res) => {
    try {
      const { availabilityStatus, availabilityLabel } = req.body;
      const settings = await storage.updateSiteSettings({ availabilityStatus, availabilityLabel });
      res.json(settings);
    } catch (err) {
      console.error("Settings update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/analytics/pageview', async (req, res) => {
    try {
      const { page } = req.body;
      if (!page || typeof page !== 'string') {
        return res.status(400).json({ message: "page is required" });
      }
      const userAgent = req.headers['user-agent'] || '';
      const referrer = req.headers['referer'] || '';
      await storage.recordPageView(page, userAgent, referrer);
      res.status(204).send();
    } catch (err) {
      console.error("Analytics pageview error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/analytics', requireAuth, async (_req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (err) {
      console.error("Analytics get error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  try {
    const existingPosts = await storage.getBlogPosts();
    if (existingPosts.length === 0) {
      log("Seeding blog posts...");
      await storage.createBlogPost({
        title: "Welcome to Choiril Ahmad's Website",
        slug: "welcome-to-my-blog",
        content:
          "This is my personal platform built with elegance and precision.",
        excerpt: "Welcome to my personal website and journal.",
        imageUrl:
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643",
        published: true,
      });
    }

    const existingTracks = await storage.getMusicTracks();
    if (existingTracks.length === 0) {
      log("Seeding music tracks...");
      await storage.createMusicTrack({
        title: "eńau feat. Ari Lesmana - Sesi Potret",
        artist: "eńau",
        audioUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        albumArt:
          "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
        duration: "4:00",
        isAutoPlay: true,
      });
    }

    const existingBrand = await storage.getBrandItems();
    if (existingBrand.length === 0) {
      log("Seeding brand items...");
      await storage.createBrandItem({
        title: "Professional Consulting Services",
        description:
          "Offering expert consulting in business strategy, digital transformation, and leadership development. Helping organizations navigate change and achieve sustainable growth.",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978",
        category: "Services",
        featured: true,
      });
    }

    const existingMemory = await storage.getMemoryItems();
    if (existingMemory.length === 0) {
      log("Seeding memory items...");
      await storage.createMemoryItem({
        title: "Erlangga Solid Victory",
        description:
          "It is an extraordinary trust to be able to join PT Penerbit Elangga and meet good people.",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978",
        category: "Life",
        featured: true,
      });
    }

    log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
