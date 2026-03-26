# Personal Portfolio Website - Choiril Ahmad

A personal portfolio website with blog, brand showcase, music collection, and contact functionality. Features an elegant black/white theme toggle and secure admin dashboard for content management.

## Features

### Multi-Language Support
- English (EN) and Indonesian (ID) with toggle in navbar
- Language preference persisted in localStorage
- All public page UI text translated; dynamic content from DB stays as-is
- Date formatting adapts to selected locale
- Translation system: `client/src/lib/i18n.ts` + `client/src/hooks/use-language.tsx`

### Public Pages
- **Home** (`/`) - Landing page with featured content
- **About** (`/about`) - Personal information and professional background
- **Blog** (`/blog`) - Article listing with slug-based URLs (`/blog/:slug`), search bar, and category tag filter
  - Each article has: view count, share buttons (WhatsApp, X, copy link), reaction buttons (👍 ❤️), and Table of Contents sidebar (auto-extracted from headings, visible on desktop for articles with 2+ sections)
- **Brand** (`/brand`) - Showcase of brand items and projects
- **Music** (`/music`) - Music collection player with auto-play support
- **Resume** (`/resume`) - Professional CV/resume with experience, education, skills sections and print/PDF support
- **Contact** (`/contact`) - Working contact form for visitor messages
- **Links** (`/links`) - Linktree-style page listing all important links with emoji icons, manageable from admin
- **Novel & Komik** (`/novel`) - Reading platform for stories with grid cover display, search & category filter
  - Story detail (`/novel/:slug`) - Synopsis, season & chapter accordion list with read time estimate
  - Reading page (`/novel/:slug/season-:n/bab-:n`) - Clean reading view with prev/next chapter navigation
  - Supports categories: novel, komik, cerpen, puisi, lainnya; statuses: ongoing, completed, hiatus

### Admin Dashboard
- **Secure Authentication** - Session-based login (no public registration)
- **Dashboard** (`/admin`) - Overview stats
- **Analytics** (`/admin/analytics`) - Site analytics: total/today/week/month views, 30-day bar chart, top pages, device breakdown (desktop vs mobile)
- **Blog Management** (`/admin/blog`) - Create, edit, delete blog posts with image uploads
- **Brand Management** (`/admin/brand`) - Manage brand portfolio items
- **Music Management** (`/admin/music`) - Add/manage music tracks with auto-duration detection
- **Resume Management** (`/admin/resume`) - Manage resume/CV items (experience, education, skills) with ordering. Includes **Profile Info** tab to set personal biographical data (full name, job title, about me, photo URL, birth date, nationality, phone, address, email, website) that appears in the PDF printout
- **Links Management** (`/admin/links`) - Add/edit/delete links with title, URL, emoji icon, description, order, and visibility toggle
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
- music-metadata for audio duration extraction
- RESTful API design

### Data Collections (MongoDB)
- `blogposts` - Blog articles with images
- `contactmessages` - Visitor messages
- `musictracks` - Music collection with duration
- `branditems` - Brand portfolio
- `resumeitems` - Resume/CV items (experience, education, skills)

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
- `POST /api/blog/:slug/view` - Increment view count (public)
- `POST /api/blog/:slug/react` - Add reaction `{ type: 'thumbsUp' | 'heart' }` (public, localStorage prevents duplicates)

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

### Brand & Resume (same CRUD pattern)
- `GET /api/brand` / `GET /api/resume` - List items
- `GET /api/brand/:id` / `GET /api/resume/:id` - Get item
- `POST /api/brand` / `POST /api/resume` - Create (auth required)
- `PUT /api/brand/:id` / `PUT /api/resume/:id` - Update (auth required)
- `DELETE /api/brand/:id` / `DELETE /api/resume/:id` - Delete (auth required)

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
- File uploads stored in MongoDB GridFS (persistent across deployments), served at `/uploads/:filename`
- Falls back to local `./uploads/` directory for legacy files
- All upload fetch calls include `credentials: "include"` for session auth
- Audio files get auto-detected duration formatted as "M:SS"
- Blog posts use slug-based URLs (not ID-based)
- MongoDB `_id` mapped to `id` string via `mapId<T>()` helper
- Production uses MongoStore for sessions, dev uses MemoryStore
- Server starts immediately for healthchecks, initializes DB/routes async
