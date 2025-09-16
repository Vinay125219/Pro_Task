# AchieveFlow Pro 🚀

Transform your productivity with AchieveFlow Pro - the ultimate motivational task and project management application with **cloud storage** that inspires you to unlock your potential and achieve greatness across all your devices!

## 🌟 New: External Cloud Storage

**AchieveFlow Pro now features Supabase integration for:**

- ✅ **Cross-device synchronization** - Access your tasks from anywhere
- ✅ **Real-time collaboration** - Work with your team simultaneously
- ✅ **Automatic cloud backups** - Never lose your data again
- ✅ **Offline functionality** - Works without internet with localStorage fallback
- ✅ **Free forever** - Supabase free tier supports 500MB database
- ✅ **Perfect Vercel compatibility** - Deploy with confidence

👉 **[Complete Setup Guide](./SUPABASE_SETUP.md)** - Get cloud storage in 5 minutes!

## ✨ Motivational Features

### Core Functionality

- **User Authentication** - Local authentication system with predefined users
- **Project Management** - Create, edit, delete, and track projects
- **Task Management** - Complete task lifecycle management with status tracking
- **Dashboard** - Comprehensive overview with analytics and quick actions
- **Profile Management** - User profile customization and statistics
- **Settings** - Application preferences and configuration
- **Data Export** - Export data in JSON and CSV formats

### Advanced Features

- **Task Lifecycle Tracking** - Complete audit trail of who created, started, and completed tasks
- **Priority Management** - Color-coded task priorities (Low, Medium, High)
- **Due Date Management** - Optional due dates with visual indicators
- **Real-time Updates** - Immediate UI updates with localStorage persistence
- **Motivational Quotes** - Daily inspirational quotes with refresh functionality
- **Responsive Design** - Mobile-friendly interface with modern UI

### Professional UI/UX

- **Modern Design** - Clean, professional interface with gradient themes
- **Interactive Elements** - Smooth animations and hover effects
- **Color-coded Status** - Visual status indicators for projects and tasks
- **Modal Forms** - Professional form dialogs for data entry
- **Empty States** - Helpful guidance when no data exists
- **Loading States** - Smooth transitions and feedback

## 🛠 Technology Stack

- **Frontend Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2
- **Styling**: CSS3 with modern features
- **State Management**: React Context API
- **Cloud Storage**: Supabase (PostgreSQL)
- **Local Fallback**: localStorage
- **Real-time**: Supabase subscriptions
- **Code Quality**: ESLint 9.33.0

## 📦 Installation & Setup

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd task-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Supabase (Optional for cloud storage)**

   - Follow the **[Supabase Setup Guide](./SUPABASE_SETUP.md)**
   - Or skip to use localStorage only

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Configure Supabase Environment Variables**

   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel dashboard
   - See **[Supabase Setup Guide](./SUPABASE_SETUP.md)** for details

2. **Deploy via Vercel CLI**

   ```bash
   npm i -g vercel
   vercel --prod
   ```

3. **Alternative: Connect GitHub Repository**
   - Push code to GitHub
   - Connect repository to Vercel dashboard
   - Configure environment variables in Vercel settings
   - Auto-deploy on git push

### Other Hosting Platforms

#### Netlify

1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure redirects for SPA routing

#### GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run: `npm run build && npm run deploy`

## 👥 User Accounts

The application comes with two predefined user accounts:

### User 1

- **Username**: `ravali`
- **Password**: `ravali123`

### User 2

- **Username**: `vinay`
- **Password**: `vinay123`

## 📊 Application Structure

### Components

- **Dashboard** - Main application interface with all functionality
- **Login** - Authentication component
- **Modals** - Project and task creation/editing forms

### Context Providers

- **AuthContext** - Authentication state management
- **AppContext** - Application data management (projects, tasks)

### Data Management

- **Supabase Cloud** - Primary cloud database with real-time sync
- **localStorage Fallback** - Offline functionality and backup
- **Real-time Updates** - Live collaboration across devices
- **Export Functionality** - JSON/CSV data export

## 🔧 Configuration

### Environment Variables

**For Cloud Storage (Recommended):**

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**For localhost only:** No environment variables required.

👉 **[Complete Setup Guide](./SUPABASE_SETUP.md)**

### Customization

- **Theme Colors** - Modify CSS variables in `index.css`
- **Quote Collection** - Update quotes in `utils/helpers.ts`
- **User Data** - Modify default users in `AuthContext.tsx`

## 🌐 Storage Options

### Option 1: Cloud Storage (Recommended)

- **Supabase integration** - Free PostgreSQL database
- **Cross-device sync** - Access from anywhere
- **Real-time collaboration** - Team functionality
- **Automatic backups** - Never lose data
- **Setup time**: 5 minutes
- 👉 **[Setup Guide](./SUPABASE_SETUP.md)**

### Option 2: Local Storage Only

- **localStorage** - Browser-based storage
- **Single device** - Data stays on one device
- **Instant setup** - No configuration needed
- **Privacy** - Data never leaves your device

## 🔄 Migration & Sync

- **Automatic fallback** - Works offline when cloud is unavailable
- **Seamless switching** - localStorage backup ensures no data loss
- **Easy migration** - Existing data preserved when adding cloud storage

### Dashboard

- **Overview Tab** - Statistics, quick actions, today's tasks
- **Projects Tab** - Project management with creation, editing, deletion
- **Tasks Tab** - Task management with full lifecycle tracking

### Profile Section

- **User Information** - Display name, username, member since date
- **Statistics** - Projects created, tasks created, tasks completed
- **Settings** - Profile customization options

### Settings Section

- **Appearance** - Theme selection (Light/Dark/Auto)
- **Notifications** - Enable/disable notifications
- **Data Management** - Auto-save settings and export options

### Export Features

- **JSON Export** - Complete data structure with metadata
- **CSV Export** - Spreadsheet-compatible format
- **Timestamped Files** - Automatic filename with date

## 🧪 Testing

### Manual Testing Checklist

- [ ] User authentication (login/logout)
- [ ] Project creation, editing, deletion
- [ ] Task creation, editing, deletion
- [ ] Task lifecycle (pending → in-progress → completed)
- [ ] Profile information display and editing
- [ ] Settings persistence
- [ ] Data export functionality
- [ ] Responsive design on mobile devices
- [ ] Quote refresh functionality
- [ ] Data persistence across sessions

### Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🚀 Performance

### Optimization Features

- **Vite Build System** - Fast development and optimized production builds
- **Code Splitting** - Efficient loading with modern bundling
- **Local Storage** - Fast data access without network requests
- **Optimistic Updates** - Immediate UI feedback

### Bundle Size

- **CSS**: ~19KB (gzipped: ~3.6KB)
- **JavaScript**: ~212KB (gzipped: ~65KB)
- **Total**: Professional application with minimal footprint

## 🔒 Security

### Data Security

- **Local Storage Only** - No server-side data transmission
- **Client-side Authentication** - Suitable for demo/prototype environments
- **Input Validation** - Form validation and sanitization

### Production Considerations

For production deployment, consider:

- Server-side authentication
- Database integration
- API security measures
- User session management

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:

- Check the documentation
- Review the code comments
- Test the application thoroughly
- Follow the deployment guide

---

**Task Manager Pro** - Professional task and project management made simple.
