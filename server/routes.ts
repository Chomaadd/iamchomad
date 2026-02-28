import type { Express } from "express";
import type { Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { usePosts } from "@/hooks/use-blog";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import express from 'express';

declare module "express-session" {
  interface SessionData {
    adminId?: number;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storageConfig = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      cb(null, uploadDir);
    },
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage: storageConfig });

  app.post('/api/upload', requireAuth, upload.single('file'), (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  app.use('/uploads', express.static(uploadDir));

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
        id: 1,
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
          field: err.errors[0].path.join('.'),
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
      id: 1,
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
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Blog create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
    
  app.put(api.blog.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.blog.update.input.parse(req.body);
      const post = await storage.updateBlogPost(Number(req.params.id), input);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Blog update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.blog.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteBlogPost(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      console.error("Blog delete error:", err);
      res.status(500).json({ message: "Internal server error" });
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
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Contact create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.contact.markRead.path, requireAuth, async (req, res) => {
    try {
      const message = await storage.markContactMessageRead(Number(req.params.id), true);
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
      await storage.deleteContactMessage(Number(req.params.id));
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
      const track = await storage.getMusicTrack(Number(req.params.id));
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
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Music create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.music.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.music.update.input.parse(req.body);
      const track = await storage.updateMusicTrack(Number(req.params.id), input);
      if (!track) {
        return res.status(404).json({ message: "Music track not found" });
      }
      res.json(track);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Music update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.music.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteMusicTrack(Number(req.params.id));
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
      const item = await storage.getBrandItem(Number(req.params.id));
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
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Brand create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.brand.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.brand.update.input.parse(req.body);
      const item = await storage.updateBrandItem(Number(req.params.id), input);
      if (!item) {
        return res.status(404).json({ message: "Brand item not found" });
      }
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Brand update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.brand.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteBrandItem(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      console.error("Brand delete error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get(api.memory.list.path, async (_req, res) => {
    try {
      const items = await storage.getMemoryItems();
      res.json(items);
    } catch (err) {
      console.error("Memory list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.memory.get.path, async (req, res) => {
    try {
      const item = await storage.getMemoryItem(Number(req.params.id));
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
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Memory create error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.memory.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.memory.update.input.parse(req.body);
      const item = await storage.updateMemoryItem(Number(req.params.id), input);
      if (!item) {
        return res.status(404).json({ message: "Memory item not found" });
      }
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Memory update error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.memory.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteMemoryItem(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      console.error("Memory delete error:", err);
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
      console.log("Seeding blog posts...");
      await storage.createBlogPost({
        title: existingPosts.title,
        slug: existingPosts.slug,
        content: existingPosts.content,
        excerpt: existingPosts.excerpt,
        imageUrl: existingPosts.imageUrl,
        published: existingTracks.published,
      });
    }

    const existingTracks = await storage.getMusicTracks();
    if (existingTracks.length === 0) {
      console.log("Seeding music tracks...");
      await storage.createMusicTrack({
        title: existingTracks.title,
        artist: existingTracks.artist,
        audioUrl: existingTracks.audioUrl,
        albumArt: existingTracks.albumArt,
        duration: existingTracks.duration,
        isAutoPlay: existingTracks.isAutoPlay,
      });
    }

    const existingBrand = await storage.getBrandItems();
    if (existingBrand.length === 0) {
      console.log("Seeding brand items...");
      await storage.createBrandItem({
        title: existingBrand.title,
        description: existingBrand.description,
        imageUrl: existingBrand.imageUrl,
        category: existingBrand.category,
        featured: existingBrand.featured,
      });

    const existingMemory = await storage.getMemoryItems();
    if (existingMemory.length === 0) {
        console.log("Seeding memory items...");
        await storage.createMemoryItem({
          title: existingMemory.title,
          description: existingMemory.description,
          imageUrl: existingMemory.imageUrl,
          category: existingMemory.category,
          featured: existingMemory.featured,
        });
      }
    }

    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
