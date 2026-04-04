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
import { sendContactNotification } from "./email";

declare module "express-session" {
  interface SessionData {
    adminId?: string;
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
      { url: "/links", priority: "0.6", changefreq: "monthly" },
      { url: "/pesan", priority: "0.5", changefreq: "yearly" },
      { url: "/novel", priority: "0.8", changefreq: "weekly" },
    ];

    const makeUrl = (loc: string, lastmod: string, changefreq: string, priority: string) =>
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

    const staticEntries = staticPages
      .map((p) => makeUrl(`${SITE_URL}${p.url}`, today, p.changefreq, p.priority))
      .join("\n");

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
          return makeUrl(`${SITE_URL}/blog/${post.slug}`, lastmod, "monthly", "0.7");
        })
        .join("\n");
    } catch {
      blogEntries = "";
    }

    let novelEntries = "";
    try {
      const stories = await storage.getNovelStories(true);
      const lines: string[] = [];
      for (const story of stories) {
        lines.push(makeUrl(`${SITE_URL}/novel/${story.slug}`, today, "weekly", "0.7"));
        const seasons = await storage.getNovelSeasons(story.id);
        for (const season of seasons) {
          const chapters = await storage.getNovelChapters(season.id, true);
          for (const chapter of chapters) {
            const lastmod = (chapter as any).updatedAt
              ? new Date((chapter as any).updatedAt).toISOString().split("T")[0]
              : today;
            lines.push(
              makeUrl(
                `${SITE_URL}/novel/${story.slug}/season-${season.seasonNumber}/bab-${chapter.chapterNumber}`,
                lastmod,
                "monthly",
                "0.6",
              ),
            );
          }
        }
      }
      novelEntries = lines.join("\n");
    } catch {
      novelEntries = "";
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${blogEntries}
${novelEntries}
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

  app.post("/api/blog/:slug/react", async (req, res) => {
    try {
      const { type } = req.body;
      if (!['thumbsUp', 'heart'].includes(type)) {
        return res.status(400).json({ message: "Invalid reaction type" });
      }
      const post = await storage.reactToBlogPost(req.params.slug, type as 'thumbsUp' | 'heart');
      res.json({ reactions: post.reactions });
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

      sendContactNotification(input).catch((err) => {
        console.error("Failed to send email notification:", err);
      });
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

  app.post('/api/anon-messages', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ message: "Message is required" });
      }
      if (message.length > 1000) {
        return res.status(400).json({ message: "Message too long (max 1000 characters)" });
      }
      const msg = await storage.createAnonMessage({ message: message.trim() });
      res.status(201).json(msg);
    } catch (err) {
      console.error("Anon message create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/anon-messages', requireAuth, async (_req, res) => {
    try {
      const messages = await storage.getAnonMessages();
      res.json(messages);
    } catch (err) {
      console.error("Anon messages get error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/anon-messages/unread-count', requireAuth, async (_req, res) => {
    try {
      const count = await storage.getUnreadAnonMessageCount();
      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch('/api/anon-messages/:id/read', requireAuth, async (req, res) => {
    try {
      const msg = await storage.markAnonMessageRead(req.params.id);
      res.json(msg);
    } catch (err) {
      console.error("Anon message read error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/anon-messages/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteAnonMessage(req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error("Anon message delete error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put('/api/settings', requireAuth, async (req, res) => {
    try {
      const {
        siteTitle, adminAvatarUrl, aboutImageUrl,
        metaDescription, metaKeywords, ogImageUrl,
        availabilityStatus, availabilityLabel, linksAvatarUrl, linksName, linksBio, linksBackgroundUrl, linksBorderStyle,
        resumeFullName, resumeTitle, resumeAbout, resumePhotoUrl,
        resumeBirthDate, resumeBirthPlace, resumeReligion, resumeGender, resumeMarriagestatus,
        resumeNationality, resumePhone, resumeAddress,
        resumeEmail, resumeWebsite,
        lanyardDiscordId, nowListening, nowReading, nowWorking, nowLocation,
      } = req.body;
      const settings = await storage.updateSiteSettings({
        siteTitle,
        adminAvatarUrl,
        aboutImageUrl,
        metaDescription,
        metaKeywords,
        ogImageUrl,
        availabilityStatus,
        availabilityLabel,
        linksAvatarUrl,
        linksName,
        linksBio,
        linksBackgroundUrl,
        linksBorderStyle,
        resumeFullName,
        resumeTitle,
        resumeAbout,
        resumePhotoUrl,
        resumeBirthDate,
        resumeBirthPlace,
        resumeReligion,
        resumeGender,
        resumeMarriagestatus,
        resumeNationality,
        resumePhone,
        resumeAddress,
        resumeEmail,
        resumeWebsite,
        lanyardDiscordId,
        nowListening,
        nowReading,
        nowWorking,
        nowLocation,
      });
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

  app.get('/api/links', async (_req, res) => {
    try {
      const items = await storage.getLinkItems();
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/links', requireAuth, async (req, res) => {
    try {
      const item = await storage.createLinkItem(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put('/api/links/:id', requireAuth, async (req, res) => {
    try {
      const item = await storage.updateLinkItem(req.params.id, req.body);
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/links/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteLinkItem(req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Novel / Story Routes ──────────────────────────────────────────────────
  // Public: get all published stories
  app.get("/api/novel/stories", async (req, res) => {
    try {
      const stories = await storage.getNovelStories(true);
      const enriched = await Promise.all(stories.map(async (story) => {
        const seasons = await storage.getNovelSeasons(story.id);
        let totalChapters = 0;
        let lastChapterAt: Date | null = null;
        for (const season of seasons) {
          const chapters = await storage.getNovelChapters(season.id, true);
          totalChapters += chapters.length;
          for (const ch of chapters) {
            const d = new Date((ch as any).createdAt);
            if (!lastChapterAt || d > lastChapterAt) lastChapterAt = d;
          }
        }
        return { ...story, totalChapters, lastChapterAt };
      }));
      res.json(enriched);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Admin: get all stories (including unpublished)
  app.get("/api/novel/stories/all", async (req, res) => {
    if (!req.session?.adminId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const stories = await storage.getNovelStories();
      res.json(stories);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Public: get single story by slug
  app.get("/api/novel/stories/:slug", async (req, res) => {
    try {
      const story = await storage.getNovelStory(req.params.slug);
      if (!story) return res.status(404).json({ message: "Story not found" });
      res.json(story);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Increment novel view count (public)
  app.patch("/api/novel/stories/:slug/view", async (req, res) => {
    try {
      const story = await storage.incrementNovelViewCount(req.params.slug);
      res.json({ viewCount: story.viewCount });
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Admin: create story
  app.post("/api/novel/stories", async (req, res) => {
    if (!req.session?.adminId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const story = await storage.createNovelStory(req.body);
      res.status(201).json(story);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Admin: update story
  app.put("/api/novel/stories/:id", async (req, res) => {
    if (!req.session?.adminId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const story = await storage.updateNovelStory(req.params.id, req.body);
      res.json(story);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Admin: delete story
  app.delete("/api/novel/stories/:id", async (req, res) => {
    if (!req.session?.adminId) return res.status(401).json({ message: "Unauthorized" });
    try {
      await storage.deleteNovelStory(req.params.id);
      res.status(204).send();
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Public: get seasons for a story (by storyId)
  app.get("/api/novel/stories/:storyId/seasons", async (req, res) => {
    try {
      const seasons = await storage.getNovelSeasons(req.params.storyId);
      res.json(seasons);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Public: story stats (total seasons + total published chapters)
  app.get("/api/novel/stories/:storyId/stats", async (req, res) => {
    try {
      const seasons = await storage.getNovelSeasons(req.params.storyId);
      let totalChapters = 0;
      for (const season of seasons) {
        const chapters = await storage.getNovelChapters(season.id, true);
        totalChapters += chapters.length;
      }
      res.json({ totalSeasons: seasons.length, totalChapters });
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Admin: create season
  app.post("/api/novel/seasons", async (req, res) => {
    if (!req.session?.adminId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const season = await storage.createNovelSeason(req.body);
      res.status(201).json(season);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Admin: update season
  app.put("/api/novel/seasons/:id", async (req, res) => {
    if (!req.session?.adminId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const season = await storage.updateNovelSeason(req.params.id, req.body);
      res.json(season);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Admin: delete season
  app.delete("/api/novel/seasons/:id", async (req, res) => {
    if (!req.session?.adminId) return res.status(401).json({ message: "Unauthorized" });
    try {
      await storage.deleteNovelSeason(req.params.id);
      res.status(204).send();
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Public: get chapters for a season (only published)
  app.get("/api/novel/seasons/:seasonId/chapters", async (req, res) => {
    try {
      const chapters = await storage.getNovelChapters(req.params.seasonId, true);
      res.json(chapters);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Admin: get all chapters for a season (including unpublished)
  app.get("/api/novel/seasons/:seasonId/chapters/all", async (req, res) => {
    if (!req.session?.adminId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const chapters = await storage.getNovelChapters(req.params.seasonId);
      res.json(chapters);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Public: get single chapter by id
  app.get("/api/novel/chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.getNovelChapter(req.params.id);
      if (!chapter || !chapter.published) return res.status(404).json({ message: "Chapter not found" });
      res.json(chapter);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Public: get chapter by slug/season/chapter number
  app.get("/api/novel/read/:slug/season-:seasonNum/bab-:chapterNum", async (req, res) => {
    try {
      const { slug, seasonNum, chapterNum } = req.params;
      const chapter = await storage.getNovelChapterByNumber(slug, seasonNum, Number(chapterNum));
      if (!chapter) return res.status(404).json({ message: "Chapter not found" });
      res.json(chapter);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Admin: create chapter
  app.post("/api/novel/chapters", async (req, res) => {
    if (!req.session?.adminId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const chapter = await storage.createNovelChapter(req.body);
      res.status(201).json(chapter);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Admin: update chapter
  app.put("/api/novel/chapters/:id", async (req, res) => {
    if (!req.session?.adminId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const chapter = await storage.updateNovelChapter(req.params.id, req.body);
      res.json(chapter);
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });

  // Admin: delete chapter
  app.delete("/api/novel/chapters/:id", async (req, res) => {
    if (!req.session?.adminId) return res.status(401).json({ message: "Unauthorized" });
    try {
      await storage.deleteNovelChapter(req.params.id);
      res.status(204).send();
    } catch { res.status(500).json({ message: "Internal server error" }); }
  });
  // ─────────────────────────────────────────────────────────────────────────

  await seedDatabase();

  // ── Social Bot OG Middleware ──────────────────────────────────────────────
  // WhatsApp, Telegram, etc. don't run JavaScript, so react-helmet tags are
  // never seen by their crawlers. We detect bots and return a minimal HTML
  // page with the correct Open Graph tags, which then redirects real users.
  const SITE_URL = "https://iamchomad.my.id";
  const DEFAULT_SITE_NAME = "Choiril Ahmad";
  const DEFAULT_LOGO_URL = `${SITE_URL}/og-thumb.png`;
  const DEFAULT_DESCRIPTION = "Personal website of Choiril Ahmad — Entrepreneur & Software Developer crafting digital experiences with precision and purpose.";

  const SOCIAL_BOTS = ["WhatsApp", "TelegramBot", "facebookexternalhit", "Twitterbot", "LinkedInBot", "Slackbot", "Discordbot", "SkypeUriPreview", "google", "bingbot"];

  app.use(async (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    const ua = req.headers["user-agent"] || "";
    const isBot = SOCIAL_BOTS.some(bot => ua.toLowerCase().includes(bot.toLowerCase()));
    if (!isBot) return next();

    const siteSettings = await storage.getSiteSettings().catch(() => null);
    const SITE_NAME = siteSettings?.siteTitle || DEFAULT_SITE_NAME;
    const LOGO_URL = siteSettings?.ogImageUrl || DEFAULT_LOGO_URL;
    const siteDesc = siteSettings?.metaDescription || DEFAULT_DESCRIPTION;

    const PAGE_META: Record<string, { title: string; description: string }> = {
      "/":        { title: `${SITE_NAME}'s`, description: siteDesc },
      "/about":   { title: `About | ${SITE_NAME}`, description: `Learn about ${SITE_NAME} — Entrepreneur & Software Developer from Indonesia, crafting digital experiences with precision and purpose.` },
      "/blog":    { title: `Blog | ${SITE_NAME}`, description: `Thoughts, stories, and ideas from ${SITE_NAME} on entrepreneurship, software development, and creativity.` },
      "/brand":   { title: `Brand | ${SITE_NAME}`, description: `Brand projects and creative work by ${SITE_NAME} — a showcase of design, identity, and visual storytelling.` },
      "/music":   { title: `Sound | ${SITE_NAME}`, description: `Music and audio collection by ${SITE_NAME} — a personal selection of sounds and compositions.` },
      "/resume":  { title: `Resume | ${SITE_NAME}`, description: `Professional resume of ${SITE_NAME} — experience, education, and skills as an Entrepreneur & Software Developer.` },
      "/contact": { title: `Contact | ${SITE_NAME}`, description: `Get in touch with ${SITE_NAME} — send a message for collaborations, projects, or just to say hello.` },
      "/links":   { title: `Links | ${SITE_NAME}`, description: `All of ${SITE_NAME}'s important links in one place — social media, portfolio, contact, and more.` },
      "/pesan":   { title: `Anonymous Message | ${SITE_NAME}`, description: `Have something to say? Send an anonymous message to ${SITE_NAME} — your identity is 100% protected.` },
      "/novel":   { title: `Novel & Comic | ${SITE_NAME}`, description: "A collection of novels and comics, stories with a rich world and lively characters." },
    };

    const meta = PAGE_META[req.path] || PAGE_META["/"];
    const canonicalUrl = `${SITE_URL}${req.path === "/" ? "" : req.path}`;

    const html = `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="utf-8">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:image" content="${LOGO_URL}">
  <meta property="og:image:alt" content="${SITE_NAME} logo">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  <meta name="twitter:image" content="${LOGO_URL}">
  <link rel="canonical" href="${canonicalUrl}">
</head><body></body></html>`;

    return res.status(200).set("Content-Type", "text/html").end(html);
  });
  // ─────────────────────────────────────────────────────────────────────────

  // ── Short URL Admin API ──────────────────────────────────────────────────
  app.get('/api/short-urls', requireAuth, async (_req, res) => {
    try {
      const urls = await storage.getShortUrls();
      res.json(urls);
    } catch (err) {
      console.error("Short URL list error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post('/api/short-urls', requireAuth, async (req, res) => {
    try {
      const { targetUrl, title, slug, expiryDays } = req.body;
      if (!targetUrl) return res.status(400).json({ message: "targetUrl required" });
      const finalSlug = slug || Math.random().toString(36).slice(2, 9);
      const existing = await storage.getShortUrlBySlug(finalSlug);
      if (existing) return res.status(409).json({ message: "Slug already taken" });
      let expiresAt: Date | null = null;
      if (expiryDays && expiryDays !== "permanent") {
        expiresAt = new Date(Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000);
      }
      const url = await storage.createShortUrl({ targetUrl, title: title || undefined, slug: finalSlug, expiresAt });
      res.status(201).json(url);
    } catch (err) {
      console.error("Short URL create error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete('/api/short-urls/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteShortUrl(req.params.id);
      res.status(204).end();
    } catch (err) {
      console.error("Short URL delete error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Short URL Public Redirect ───────────────────────────────────────────
  app.get('/:slug', async (req, res, next) => {
    try {
      const { slug } = req.params;
      if (!/^[a-z0-9]{4,12}$/.test(slug)) return next();
      const shortUrl = await storage.getShortUrlBySlug(slug);
      if (!shortUrl) return next();
      if (shortUrl.expiresAt && new Date(shortUrl.expiresAt) < new Date()) {
        const expiredHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Expired — iamchomad.my.id</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0a0a;
      --card: #111111;
      --border: #222222;
      --text: #fafafa;
      --muted: #888888;
      --primary: #a78bfa;
    }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 440px;
      width: 100%;
      text-align: center;
    }
    .icon {
      width: 64px;
      height: 64px;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 28px;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #ef4444;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 14px;
      color: var(--muted);
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .slug {
      font-family: monospace;
      font-size: 13px;
      color: var(--primary);
      background: rgba(167,139,250,0.08);
      border: 1px solid rgba(167,139,250,0.15);
      padding: 8px 16px;
      border-radius: 8px;
      display: inline-block;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--primary);
      color: #0a0a0a;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 12px;
      text-decoration: none;
      transition: opacity 0.15s;
    }
    .btn:hover { opacity: 0.85; }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #444;
    }
    .footer a { color: #666; text-decoration: none; }
    .footer a:hover { color: var(--muted); }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⏰</div>
    <div class="badge">Expired</div>
    <h1>Link Sudah Tidak Aktif</h1>
    <p>Tautan pendek ini sudah melewati masa berlakunya dan tidak bisa lagi digunakan untuk mengakses halaman tujuan.</p>
    <div class="slug">iamchomad.my.id/${shortUrl.slug}</div>
    <br>
    <a href="https://iamchomad.my.id" class="btn">
      ← Kembali ke Beranda
    </a>
  </div>
  <div class="footer">
    Short URL by <a href="https://iamchomad.my.id">iamchomad.my.id</a>
  </div>
</body>
</html>`;
        return res.status(410).send(expiredHtml);
      }
      await storage.incrementShortUrlClicks(shortUrl.id);
      return res.redirect(302, shortUrl.targetUrl);
    } catch {
      next();
    }
  });
  // ─────────────────────────────────────────────────────────────────────────

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

    log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
