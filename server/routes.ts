import type { Express } from "express";
import type { Server } from "http";
import session from "express-session";
import mongoose from "mongoose";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { log } from "./index";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import express from 'express';
import duration from 'mp3-duration';

declare module "express-session" {
  interface SessionData {
    adminId?: string;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Configure session store - use MongoDB in production, memory store in development/fallback
  let store: session.Store;
  if (process.env.NODE_ENV === "production") {
    try {
      const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
      const connectMongo = require("connect-mongo");
      const MongoStore = connectMongo.default || connectMongo;
      store = new MongoStore({
        mongoUrl: mongoUrl,
        touchAfter: 24 * 3600, // lazy session update
      });
      log("Using MongoDB session store", "express");
    } catch (error) {
      log(`Failed to initialize MongoDB store: ${error}, falling back to MemoryStore`, "express");
      store = new session.MemoryStore();
    }
  } else {
    // Use default MemoryStore for development
    store = new session.MemoryStore();
  }

  app.use(
    session({
      store: store,
      secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production", // Use secure cookies only in production
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
        const ext = path.extname(file.originalname);
        cb(null, `file-${uniqueSuffix}${ext}`);
      }
  });

  const upload = multer({ storage: storageConfig });

  app.post('/api/upload', requireAuth, upload.single('file'), async (req: any, res: any) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }
        const url = `/uploads/${req.file.filename}`;
        const filePath = path.join(uploadDir, req.file.filename);
        
        let fileDuration = null;
        // Try to extract duration for audio files only
        const isAudio = req.file.mimetype?.includes('audio') || 
                       req.file.filename?.toLowerCase().endsWith('.mp3') ||
                       req.file.filename?.toLowerCase().endsWith('.wav') ||
                       req.file.filename?.toLowerCase().endsWith('.m4a');
        
        if (isAudio) {
          try {
            const durationSeconds = await duration(filePath);
            // Convert seconds to milliseconds
            fileDuration = Math.round(durationSeconds * 1000);
            console.log(`Extracted duration ${fileDuration}ms from ${req.file.filename}`);
          } catch (durationError) {
            console.log(`Could not extract duration from ${req.file.filename}:`, durationError);
            fileDuration = null;
          }
        }
        
        return res.json({ url, duration: fileDuration });
      } catch (err) {
        console.error("Upload route error:", err);
        return res.status(500).json({ message: "Internal server error during upload" });
      }
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
      const post = await storage.updateBlogPost(req.params.id, input);
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
      await storage.deleteBlogPost(req.params.id);
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
      const track = await storage.updateMusicTrack(req.params.id, input);
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
      const item = await storage.updateBrandItem(req.params.id, input);
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
      await storage.deleteBrandItem(req.params.id);
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
      const item = await storage.updateMemoryItem(req.params.id, input);
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
      await storage.deleteMemoryItem(req.params.id);
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
      log("Seeding blog posts...");
      await storage.createBlogPost({
        title: "Welcome to Choiril Ahmad's Website",
        slug: "welcome-to-my-blog",
        content: "This is my personal platform built with elegance and precision.",
        excerpt: "Welcome to my personal website and journal.",
        imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643",
        published: true,
      });
    }

    const existingTracks = await storage.getMusicTracks();
    if (existingTracks.length === 0) {
      log("Seeding music tracks...");
      await storage.createMusicTrack({
        title: "eńau feat. Ari Lesmana - Sesi Potret",
        artist: "eńau",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        albumArt: "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
        duration: "4:00",
        isAutoPlay: true,
      });
    }

    const existingBrand = await storage.getBrandItems();
    if (existingBrand.length === 0) {
      log("Seeding brand items...");
      await storage.createBrandItem({
        title: "Professional Consulting Services",
        description: "Offering expert consulting in business strategy, digital transformation, and leadership development. Helping organizations navigate change and achieve sustainable growth.",
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
        description: "It is an extraordinary trust to be able to join PT Penerbit Elangga and meet good people.",
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
