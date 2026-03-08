# Personal Portfolio Website - Choiril Ahmad

A personal portfolio website with blog, brand showcase, music collection, memory gallery, and contact functionality. Features an elegant black/white theme toggle and secure admin dashboard for content management.

## Features

### Public Pages
- **Home** (`/`) - Landing page with featured content
- **About** (`/about`) - Personal information and professional background
- **Blog** (`/blog`) - Article listing with slug-based URLs (`/blog/:slug`)
- **Brand** (`/brand`) - Showcase of brand items and projects
- **Memory** (`/memory`) - Memory/gallery page
- **Music** (`/music`) - Music collection player with auto-play support
- **Contact** (`/contact`) - Working contact form for visitor messages

### Admin Dashboard
- **Secure Authentication** - Session-based login (no public registration)
- **Dashboard** (`/admin`) - Overview stats
- **Blog Management** (`/admin/blog`) - Create, edit, delete blog posts with image uploads
- **Brand Management** (`/admin/brand`) - Manage brand portfolio items
- **Memory Management** (`/admin/memory`) - Manage memory/gallery items
- **Music Management** (`/admin/music`) - Add/manage music tracks with auto-duration detection
- **Messages** (`/admin/messages`) - View and manage contact messages

## Admin Access

**Login URL:** `/login`

Credentials are configured via environment secrets:
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD` - Admin password

## Technology Stack

### Frontend
- React with TypeScript
- TanStack Query v5 for data fetching
- Wouter for routing
- Framer Motion for animations
- Lucide React for icons
- Shadcn/ui components
- Tailwind CSS

### Backend
- Node.js with Express
- **MongoDB** with Mongoose ODM
- Session-based authentication (express-session + connect-mongo)
- Multer for file uploads
- mp3-duration for audio duration extraction
- RESTful API design

### Data Collections (MongoDB)
- `blogposts` - Blog articles with images
- `contactmessages` - Visitor messages
- `musictracks` - Music collection with duration
- `branditems` - Brand portfolio
- `memoryitems` - Memory/gallery items

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user

### Blog
- `GET /api/blog` - List all posts
- `GET /api/blog/:slug` - Get post by slug
- `POST /api/blog` - Create post (auth required)
- `PUT /api/blog/:id` - Update post (auth required)
- `DELETE /api/blog/:id` - Delete post (auth required)

### Contact
- `POST /api/contact` - Submit message
- `GET /api/contact` - List messages (auth required)
- `PATCH /api/contact/:id/read` - Mark as read (auth required)
- `DELETE /api/contact/:id` - Delete message (auth required)

### Music
- `GET /api/music` - List tracks
- `GET /api/music/:id` - Get track
- `POST /api/music` - Add track (auth required)
- `PUT /api/music/:id` - Update track (auth required)
- `DELETE /api/music/:id` - Delete track (auth required)

### Brand & Memory (same CRUD pattern)
- `GET /api/brand` / `GET /api/memory` - List items
- `GET /api/brand/:id` / `GET /api/memory/:id` - Get item
- `POST /api/brand` / `POST /api/memory` - Create (auth required)
- `PUT /api/brand/:id` / `PUT /api/memory/:id` - Update (auth required)
- `DELETE /api/brand/:id` / `DELETE /api/memory/:id` - Delete (auth required)

### File Upload
- `POST /api/upload` - Upload file (auth required, returns URL and duration for audio)

## Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Session encryption secret
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password
- `PORT` - Server port (default: 5000)

## Development
- `npm run dev` - Start development server (Express + Vite)
- `npm run build` - Build for production
- Production: `node ./dist/index.cjs` serves from `build/` directory

## Key Implementation Details
- File uploads saved to `./uploads/`, served at `/uploads/`
- All upload fetch calls include `credentials: "include"` for session auth
- Audio files get auto-detected duration formatted as "M:SS"
- Blog posts use slug-based URLs (not ID-based)
- MongoDB `_id` mapped to `id` string via `mapId<T>()` helper
- Production uses MongoStore for sessions, dev uses MemoryStore
- Server starts immediately for healthchecks, initializes DB/routes async
