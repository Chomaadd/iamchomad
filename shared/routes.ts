import { z } from 'zod';
import {
  insertBlogPostSchema,
  insertContactMessageSchema,
  insertMusicTrackSchema,
  insertBrandItemSchema,
  blogPosts,
  contactMessages,
  musicTracks,
  brandItems,
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.object({
          success: z.boolean(),
          admin: z.object({
            id: z.number(),
            username: z.string(),
            name: z.string(),
            email: z.string(),
          }).optional(),
          message: z.string().optional(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.object({
          id: z.number(),
          username: z.string(),
          name: z.string(),
          email: z.string(),
        }).nullable(),
      },
    },
  },
  
  blog: {
    list: {
      method: 'GET' as const,
      path: '/api/blog' as const,
      input: z.object({
        published: z.boolean().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof blogPosts.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/blog/:id' as const,
      responses: {
        200: z.custom<typeof blogPosts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/blog' as const,
      input: insertBlogPostSchema,
      responses: {
        201: z.custom<typeof blogPosts.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/blog/:id' as const,
      input: insertBlogPostSchema.partial(),
      responses: {
        200: z.custom<typeof blogPosts.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/blog/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },

  contact: {
    list: {
      method: 'GET' as const,
      path: '/api/contact' as const,
      responses: {
        200: z.array(z.custom<typeof contactMessages.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/contact' as const,
      input: insertContactMessageSchema,
      responses: {
        201: z.custom<typeof contactMessages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    markRead: {
      method: 'PATCH' as const,
      path: '/api/contact/:id/read' as const,
      responses: {
        200: z.custom<typeof contactMessages.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/contact/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },

  music: {
    list: {
      method: 'GET' as const,
      path: '/api/music' as const,
      responses: {
        200: z.array(z.custom<typeof musicTracks.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/music/:id' as const,
      responses: {
        200: z.custom<typeof musicTracks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/music' as const,
      input: insertMusicTrackSchema,
      responses: {
        201: z.custom<typeof musicTracks.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/music/:id' as const,
      input: insertMusicTrackSchema.partial(),
      responses: {
        200: z.custom<typeof musicTracks.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/music/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },

  brand: {
    list: {
      method: 'GET' as const,
      path: '/api/brand' as const,
      responses: {
        200: z.array(z.custom<typeof brandItems.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/brand/:id' as const,
      responses: {
        200: z.custom<typeof brandItems.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/brand' as const,
      input: insertBrandItemSchema,
      responses: {
        201: z.custom<typeof brandItems.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/brand/:id' as const,
      input: insertBrandItemSchema.partial(),
      responses: {
        200: z.custom<typeof brandItems.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/brand/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type LoginInput = z.infer<typeof api.auth.login.input>;
export type LoginResponse = z.infer<typeof api.auth.login.responses[200]>;
export type CurrentUserResponse = z.infer<typeof api.auth.me.responses[200]>;

export type BlogPostInput = z.infer<typeof api.blog.create.input>;
export type BlogPostUpdateInput = z.infer<typeof api.blog.update.input>;
export type BlogPostResponse = z.infer<typeof api.blog.create.responses[201]>;

export type ContactMessageInput = z.infer<typeof api.contact.create.input>;
export type ContactMessageResponse = z.infer<typeof api.contact.create.responses[201]>;

export type MusicTrackInput = z.infer<typeof api.music.create.input>;
export type MusicTrackUpdateInput = z.infer<typeof api.music.update.input>;
export type MusicTrackResponse = z.infer<typeof api.music.create.responses[201]>;

export type BrandItemInput = z.infer<typeof api.brand.create.input>;
export type BrandItemUpdateInput = z.infer<typeof api.brand.update.input>;
export type BrandItemResponse = z.infer<typeof api.brand.create.responses[201]>;
