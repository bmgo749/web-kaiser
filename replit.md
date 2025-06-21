# Admin Management System with WhatsApp Integration

## Overview

This is a comprehensive admin management system with advanced user interaction and monitoring capabilities. The system features WhatsApp messaging integration using the Baileys library, allowing administrators to send and receive messages, manage templates, and monitor chat activity in real-time. The application includes admin logging, user activity tracking, and a responsive mobile-friendly interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **3D Graphics**: React Three Fiber (@react-three/fiber) with Three.js
- **3D Utilities**: @react-three/drei for enhanced 3D components and helpers
- **UI Components**: Radix UI primitives with custom styling via Tailwind CSS
- **State Management**: Zustand for lightweight state management
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite with custom configuration for 3D assets

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling

### Key Design Decisions
- **Monorepo Structure**: Client and server code in separate directories with shared schemas
- **3D-First Approach**: Built around Three.js for immersive solar system visualization
- **Component-Based UI**: Radix UI provides accessible, unstyled components styled with Tailwind
- **Type Safety**: Full TypeScript implementation across frontend, backend, and shared code

## Key Components

### 3D Scene Components
- **SolarSystem**: Main container managing all celestial objects and time progression
- **Star**: Central star (S-Centagma) with glow effects and pulsing animation
- **Planet**: Individual planet components with orbital mechanics and interaction
- **AsteroidBelt**: Procedurally generated asteroid field between planets
- **Floor**: Ground reference plane (currently in development)

### UI Components
- **TimeControls**: Play/pause, time scale adjustment, and reset functionality
- **PlanetInfo**: Detailed information panel for selected planets
- **Interface**: Game state management and audio controls
- **IntroSequence**: Welcome screen with animated text sequence and blur effects

### State Management
- **useSolarSystem**: Manages time scale, pause state, elapsed time, and planet selection
- **useGame**: Handles game phases (ready, playing, ended)
- **useAudio**: Audio system for background music and sound effects
- **useIntro**: Controls intro sequence state and text transitions

## Data Flow

1. **Time Progression**: SolarSystem component updates elapsed time based on time scale
2. **Orbital Mechanics**: Each Planet calculates its position using elapsed time and orbital period
3. **User Interaction**: Planet clicks update selected planet state, triggering info panel display
4. **Time Controls**: UI controls modify time scale and pause state, affecting all orbital calculations
5. **Camera Controls**: OrbitControls provide user navigation around the 3D scene

## External Dependencies

### Production Dependencies
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Three.js utilities and helpers
- **@react-three/postprocessing**: Visual effects and post-processing
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management (prepared for future API integration)
- **zustand**: Lightweight state management
- **three**: 3D graphics library
- **express**: Web server framework
- **drizzle-orm**: Type-safe SQL ORM
- **@neondatabase/serverless**: PostgreSQL database adapter

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development
- Uses Vite dev server with HMR for frontend
- tsx for TypeScript execution of Express server
- Concurrent development on port 5000

### Production Build
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Deployment**: Replit autoscale deployment serving on port 80

### Database Strategy
- Drizzle ORM configured for PostgreSQL
- Schema definitions in shared directory
- Migration system ready for database deployment
- In-memory storage fallback for development

### Asset Handling
- Support for 3D models (.gltf, .glb)
- Audio files (.mp3, .ogg, .wav)
- GLSL shader support via vite-plugin-glsl
- Font loading with @fontsource/inter

## Changelog
- June 19, 2025. Initial setup
- June 19, 2025. Updated Gaugaria system with authentic planet data and orbital periods
- June 19, 2025. Scaled all celestial objects 3x larger for better visibility
- June 19, 2025. Enhanced asteroid belt size and brightness
- June 19, 2025. Improved planet materials with subtle glow effects
- June 19, 2025. Adjusted orbital mechanics to avoid asteroid belt collisions
- June 19, 2025. Updated scale system to 10 million km = 1024 dm in website
- June 19, 2025. Repositioned all celestial objects with new scale system
- June 19, 2025. Adjusted asteroid belt to 266.24 dm and cosmic dust to 512.0 dm
- June 19, 2025. Made Serion's orbit trail consistent with other planets (gray color)
- June 19, 2025. Removed moving trail dots from all planets
- June 19, 2025. Reduced all planet orbital speeds by 3x for slower movement
- June 19, 2025. Updated Rinnia to orbit Hopper independently at 6dm distance with 6-month period
- June 19, 2025. Further reduced planet speeds by 3x (9x total reduction)
- June 19, 2025. Increased Rinnia-Hopper distance to 50dm
- June 19, 2025. Reduced planet speeds by additional 5x (45x total reduction)
- June 19, 2025. Set Rinnia-Hopper orbit distance to 25dm with proper trail following
- June 19, 2025. Increased Tester-Plata spacing by 50% and Plata-Hopper by 75%
- June 19, 2025. Moved cosmic dust further out to 600dm behind Hopper-Rinnia
- June 19, 2025. Slowed Rinnia's local orbit by 2x (1 year period)
- June 19, 2025. Made gas giants 3x further apart: Tester at 450dm, Plata at 650dm, Hopper at 950dm
- June 19, 2025. Expanded cosmic storm 3x wider (24k particles) positioned at 1000-1300dm behind Hopper
- June 19, 2025. Made Serion's orbit speed 1.3x faster than Hopper (similar orbital period)
- June 19, 2025. Removed Rinnia's orbit trail (hidden)
- June 19, 2025. Reduced all planet speeds by additional 3x (135x total reduction)
- June 19, 2025. Moved cosmic storm back 100dm to 1100-1400dm range
- June 19, 2025. Updated H-Alfa to habitable planet with blue color and life-supporting description
- June 19, 2025. Increased size of inner planets and star by 2.1x (Insignia, Alfa, Serion, Forto, Centagma)
- June 19, 2025. Increased inner planet distances by 2.1x (except Insignia 1.4x), moved asteroid belt 2.1x further from Forto
- June 19, 2025. Repositioned inner planets: Alfa halfway to Insignia, Serion 1.6x closer, Forto 1.4x closer, asteroid belt adjusted
- June 19, 2025. Final positioning: Asteroid belt at 75% between Forto-Tester, Forto moved back to 310dm, Serion moved back 100dm to 324.39dm
- June 19, 2025. Moved Serion back additional 63dm to 387.39dm total
- June 19, 2025. Moved Serion forward 18dm to final position of 369.39dm
- June 19, 2025. Complete planet surface overhaul: realistic materials, temperatures (K), gravity (m/s²)
- June 19, 2025. Increased Centagma star size by 2.4x with stellar properties
- June 19, 2025. Updated UI to display temperature and gravity instead of distance and color
- June 19, 2025. Added intro sequence with blurred background and Indonesian welcome text animation
- June 19, 2025. Updated intro timing: 6.6-second fade transitions, 2-second blink intervals, added "click anywhere" text
- June 19, 2025. Refined intro timing: 3-second fades, 8-second display time, centered Start System button, 13px click anywhere text
- June 19, 2025. Increased blink speed to 0.3 seconds for faster text pulsing effect
- June 19, 2025. Removed time controls completely, updated timing: 5.8s display, 0.63s blink, 2.33s final fade
- June 19, 2025. Added beta status indicator in top-left corner showing "Not Finished" and system code
- June 19, 2025. Enhanced planet info UI: added close button (X), responsive mobile sizing (25% smaller), 11px intro text
- June 19, 2025. Updated navigation text to "Solar System Navigation", simplified planet types to letter codes (H=Habitable, G=Gas, P=Planet, S=Star), added clickable S-Centagma with star description
- June 19, 2025. Fixed intro text sizing: "enjoy seeing" text now matches main text but 2px smaller, updated planet info to show full type names (Star/Planet/Habitable/Gas) and simplified object names without prefix codes
- June 19, 2025. Optimized mobile planet info: made panel 15% smaller on mobile, streamlined layout with compact spacing, abbreviated labels (Period/Temp/Size/Gravity)
- June 19, 2025. Prepared GitHub deployment: created .gitignore, GitHub Actions workflow, README.md, and deployment guide
- June 20, 2025. WhatsApp messaging system overhaul: removed QR code display, added incoming message logging with group/private ID tracking, implemented 100-template limit, removed default templates, fixed template add/delete functionality
- June 20, 2025. Enhanced message filtering: excluded bot's own messages, status broadcasts, newsletters, and system notifications; added localStorage persistence for templates; implemented proper message validation
- June 20, 2025. Removed "Pesan Masuk WhatsApp" UI section from WhatsApp messaging panel; chat logs remain visible in terminal log section with [WhatsApp] prefix for monitoring purposes
- June 20, 2025. Implemented shared template system: templates stored server-side, visible across all admin users, shows creator username, removed Captain1 admin user, added Tupolev (SS01A1010?N*) and Aldxx (AD82A0283!P@&) admin users
- June 20, 2025. Enhanced message sending: activated send button when message and group ID present, added sent message history below form, implemented success notification alert for 3-second display
- June 20, 2025. Fixed template persistence: implemented global template system with real-time synchronization across all admin users, removed default templates, added automatic refresh every 30 seconds, enhanced socket broadcasting for template changes
- June 20, 2025. Created website icons and PWA manifest: added logo.png from provided design, implemented manifest.json for progressive web app support, enhanced mobile compatibility
- June 20, 2025. Optimized template persistence system: implemented Zustand global state with localStorage persistence, reduced API calls from excessive polling to intelligent caching, templates now persist across menu navigation without loss
- June 20, 2025. Enhanced template persistence: templates now persist permanently across browser sessions, page refreshes, and admin panel logouts using localStorage, with debug logging to verify persistence functionality
- June 20, 2025. Implemented true global template system: templates created by any admin user (Tupolev/Aldxx) are permanently stored in database and visible to ALL admin users across sessions, browsers, and devices until manually deleted
- June 20, 2025. Enhanced terminal log functionality: fixed clear logs to clear server-side data, improved export logs with proper formatting and download functionality, enhanced WhatsApp disconnect to properly logout device
- June 20, 2025. Completed global admin system: templates are now truly persistent across all admin users (Tupolev/Aldxx), survive browser closure/refresh/logout, clear logs function removes server data, export logs downloads properly formatted files, WhatsApp disconnect performs complete device logout
- June 20, 2025. Added admin log management: implemented clear admin logs functionality with export feature, admin activity logs can now be cleared and exported with proper formatting
- June 20, 2025. Implemented permanent global template storage: templates now persist forever across all admin users, browser closure, offline periods, and page refreshes using enhanced global storage system with merge functionality
- June 20, 2025. Fixed excessive API polling: eliminated redundant template loading requests, templates now load once and persist permanently without server spam
- June 20, 2025. Resolved production build CSS issues: fixed Tailwind configuration and CSS custom properties for successful GitHub deployment
- June 20, 2025. Fixed all import path issues: converted @/ aliases to relative imports for successful production build, created complete deployment package with GitHub Actions workflow and .gitignore
- June 21, 2025. Implemented WhatsApp QR code image display system: reinstalled Baileys packages, fixed QR generation with image-only display in terminal log, removed ASCII patterns as requested
- June 21, 2025. Fixed routing structure: main page displays Gaugaria Solar System, admin panel accessible only at secure URL #/admin-ksr-secure-panel-2024
- June 21, 2025. Fixed production deployment issues for kaiserliche.my.id: enhanced CORS configuration, improved Socket.IO connection handling, fixed template creation API with proper logging, added automatic reconnection for connection drops, ensured mobile compatibility without separate app

## User Preferences

Preferred communication style: Simple, everyday language.
Planet scaling: All celestial objects should be 3x larger than normal size
Visual effects: Planets should have subtle glow effects for better visibility
Asteroid belt: Should be large and bright, positioned to avoid planet collisions
Scale system: 10 million km = 1024 dm (102.4 meters) in website
Planet order: Insignia → Alfa → Serion → Forto → [Asteroid Belt] → Tester → Plata → Hopper + Rinnia
Special orbits: P-Serion elliptical orbit, P-Rinnia orbits G-Hopper at 6mm distance
Outer elements: Cosmic dust (purple-pink with sparkling stars) at system edge, slow rotation