# AI Story Studio - Copilot Instructions

## Project Overview

AI Story Studio is a Next.js 15 application for creating stories, screenplays, and scripts with AI assistance. It features multi-language support (English, Hindi, Telugu), token-based usage tracking, subscription tiers (Free/Pro), and integrations with OpenAI, Google Generative AI, and Cloudinary.

## Architecture Patterns

### Multi-Language Support (I18n)

- **Structure**: JSON translation files in `public/locales/{lang}/` (en, hi, te) and `src/locales/{lang}/`
- **Hook**: `useI18n()` in [src/hooks/useI18n.ts](src/hooks/useI18n.ts) - namespace-based loading with caching
- **Context**: `TranslationProvider` in [src/components/TranslationProvider.tsx](src/components/TranslationProvider.tsx) wraps app sections
- **Async Translation**: `useTranslation()` hook for runtime translation of dynamic content; use `await translateAsync(text)` for non-UI strings
- **Key Namespaces**: `common`, `dashboard`, `editor`, `projects` - namespace-lazy loaded on demand
- **Pattern**: Avoid hardcoding user-facing strings; always wrap in translation keys first

### Authentication & Authorization

- **Provider**: NextAuth v4 with PrismaAdapter (Google OAuth + Email/Password)
- **Setup**: [src/lib/auth.ts](src/lib/auth.ts) exports `authOptions`; session context via `SessionProvider` in [src/app/layout.tsx](src/app/layout.tsx)
- **User Model**: Includes `subscriptionStatus` (free/pro/admin) and `isAdmin` fields in [prisma/schema.prisma](prisma/schema.prisma)
- **Protected Routes**: Use `getServerSession(authOptions)` in API routes; client-side SessionProvider for UI gating

### Token Usage Tracking

- **Core Logic**: [src/lib/openai.ts](src/lib/openai.ts) - `trackTokenUsage()` records per-model usage for each operation
- **User Limits**: `tokenUsageThisMonth` and `imageUsageThisMonth` on User model; checked in API endpoints before AI operations
- **Subscription Tiers** in [src/lib/subscription.ts](src/lib/subscription.ts) define monthly token/image allocations for each plan
- **Pattern**: Always track usage in token-consuming API endpoints (translate, generate, image); reset monthly via cron (not yet implemented)

### Data Models & Relationships

- **User** → Projects → (Scenes/Chapters, Characters, OutlineBeats, Cards)
- **TokenUsage** table tracks all AI operations with model, usage totals, timestamp
- **Project Types**: story, shortfilm, screenplay, novel, shortstory, synopsis (determines available fields)
- **Key Fields**: `logline`, `idea`, `treatment`, `fullScript`, `worldBuilding`, `plotPoints` (all stored as TEXT)

### UI Component Library

- **Radix UI** (headless) + **shadcn** components for accessible, consistent UI
- **Styling**: Tailwind CSS with CVA (Class Variance Authority) for component variants
- **Theme**: [src/lib/theme-provider.tsx](src/lib/theme-provider.tsx) with next-themes (dark/light toggle)
- **Icons**: Lucide React throughout; Radix UI icons for specific cases
- **Toast Notifications**: Sonner library; prefer `toast.success()` / `toast.error()` over alerts

### API Route Structure

- **Location**: [src/app/api](src/app/api) organized by domain (auth, projects, translate, upload, user, subscription)
- **Pattern**: RESTful endpoints returning `{success, data, error}` JSON
- **Auth Middleware**: Check `getServerSession()` at route start; return 401 if missing
- **Error Handling**: Wrap AI calls in try-catch; log to console/DB; return user-friendly messages
- **Rate Limiting**: Not yet implemented; consider adding for free tier

## Development Workflows

### Running the App

- **Dev Server**: `npm run dev` (uses Turbopack for fast refresh)
- **Build**: `npm run build` (runs Prisma codegen + Next.js build)
- **Deploy**: Vercel (configured in vercel.json); postbuild sitemap generation via next-sitemap

### Database

- **ORM**: Prisma v6 with PostgreSQL
- **Migrations**: In `prisma/migrations/` with descriptive names; run `npx prisma migrate dev` after schema changes
- **Client**: Always import `prisma` from `@/lib/prisma` (singleton pattern)

### Common Commands

- **Lint**: `npm run lint` (ESLint + Next.js rules)
- **Translate Workflow**: `node update-translations.js` (bulk update JSON); `node test-translation.js` (verify keys exist)
- **Validate Translations**: `node validate-translations.js` (check all namespaces)

## Project-Specific Conventions

### Naming & Code Style

- **File Extensions**: TypeScript preferred (`.ts`, `.tsx`); no `.jsx` or `.js` except config
- **Component Naming**: PascalCase for React components; match file name exactly
- **Hooks**: `use*` prefix (e.g., `useI18n`, `useTranslation`)
- **API Routes**: Lowercase with hyphens (e.g., `/api/projects/create`)
- **Types**: Define in separate `.d.ts` files or at top of component; use `type` keyword (not `interface` for most cases)

### Async Patterns

- **Client Components**: "use client" directive required for hooks like `useState`, `useEffect`, translation providers
- **Server Components**: Default; use for data fetching and auth checks
- **API Calls**: Use Fetch API or axios from client; await always before usage
- **Translation**: Call `translate()` for cached, sync usage in UI; `await translateAsync()` for batch operations

### Key Files to Reference When Adding Features

- **New Page Layout**: See [src/app/dashboard](src/app/dashboard) for page structure with TranslationProvider
- **AI Integration**: [src/app/api/projects/generate-script](src/app/api/projects/generate-script) shows API pattern with token tracking
- **Translation Setup**: [src/components/TranslationProvider.tsx](src/components/TranslationProvider.tsx) for context injection
- **Form Patterns**: Use react-hook-form + Radix UI components (see dashboard components)

### Known Technical Debt

- Monthly token reset implemented via user action, not cron job (plan for background job)
- No rate limiting on free tier (should add to prevent abuse)
- Image upload via Cloudinary; ensure proper error handling for failed uploads
- Mobile responsiveness in Editor needs testing (MobileWarning component exists)

## External Dependencies & Integrations

- **OpenAI API**: Token counting via `js-tiktoken` library; gpt-4, gpt-3.5-turbo models
- **Google Generative AI**: Alternative AI provider (configured but secondary)
- **Cloudinary**: Image hosting and transformation (CldUploadWidget in components)
- **Razorpay**: Payment processing for Pro subscriptions (INR currency)
- **Google OAuth**: Primary auth method; fallback to email/password

## Cross-Component Communication

- **Context**: TranslationProvider, SessionProvider, ThemeProvider (nested in layout)
- **State Management**: Minimal; mostly local component state + Prisma queries
- **API Calls**: Fetch from client components via API routes; handle loading/error states with try-catch and toast notifications
