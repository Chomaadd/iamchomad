# Personal Portfolio Website

A sophisticated personal website with blog, brand showcase, music collection, and contact functionality. Features an elegant black/white theme toggle and secure admin dashboard for content management.

## Features

### Public Pages
- **Home** - Eye-catching landing page with featured content
- **About** - Personal information and professional background
- **Blog** - Article listing and detailed post views with images
- **Brand** - Showcase of brand items and services
- **Music** - Curated music collection player
- **Contact** - Working contact form for visitor messages

### Admin Dashboard
- **Secure Authentication** - Session-based login (no public registration)
- **Blog Management** - Create, edit, and delete blog posts with images
- **Contact Messages** - View and manage messages from visitors
- **Music Library** - Add and manage music tracks
- **Brand Management** - Update brand portfolio items
- **Dashboard Stats** - Overview of all content

### Theme
- Elegant monochrome design (black/white)
- Full dark mode / light mode toggle
- Professional aesthetic for personal branding

## Admin Access

**Login URL:** `/login`

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Change the default password after first login!

## Technology Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching
- React Hook Form with Zod validation
- Wouter for routing
- Framer Motion for animations
- Lucide React for icons
- Shadcn/ui components

### Backend
- Node.js with Express
- PostgreSQL database with Drizzle ORM
- Session-based authentication with bcrypt
- Express session middleware
- RESTful API design

### Database Schema
- `admins` - Admin users
- `blog_posts` - Blog articles with images
- `contact_messages` - Visitor messages
- `music_tracks` - Music collection
- `brand_items` - Brand portfolio

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user

### Blog (Public read, Admin write)
- `GET /api/blog` - List all posts
- `GET /api/blog/:id` - Get single post
- `POST /api/blog` - Create post (auth required)
- `PUT /api/blog/:id` - Update post (auth required)
- `DELETE /api/blog/:id` - Delete post (auth required)

### Contact (Public write, Admin read)
- `POST /api/contact` - Submit message
- `GET /api/contact` - List messages (auth required)
- `PATCH /api/contact/:id/read` - Mark as read (auth required)
- `DELETE /api/contact/:id` - Delete message (auth required)

### Music (Public read, Admin write)
- `GET /api/music` - List tracks
- `POST /api/music` - Add track (auth required)
- `PUT /api/music/:id` - Update track (auth required)
- `DELETE /api/music/:id` - Delete track (auth required)

### Brand (Public read, Admin write)
- `GET /api/brand` - List items
- `POST /api/brand` - Add item (auth required)
- `PUT /api/brand/:id` - Update item (auth required)
- `DELETE /api/brand/:id` - Delete item (auth required)

## Development

The application uses:
- `npm run dev` - Start development server (auto-restarts)
- `npm run db:push` - Push schema changes to database

## Security Notes

- Admin authentication uses secure bcrypt password hashing
- Session cookies with httpOnly flag
- No public user registration - admin access only
- SESSION_SECRET environment variable for production

## Sample Data

The database is pre-populated with:
- 3 sample blog posts
- 2 music tracks
- 3 brand items
- 1 admin user (admin/admin123)

All sample content uses professional Unsplash images to maintain the premium aesthetic.
