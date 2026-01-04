# AI Coding Assistant Instructions

## Project Overview
Cake shop management system built with React 19 + TypeScript, Vite, Supabase, and shadcn/ui. Manages inventory, recipes, sales, finances, and customers for a bakery business.

## Architecture
- **Frontend**: Single-page React app in `src/` with wouter routing
- **Backend**: Direct Supabase PostgreSQL queries (no custom API server)
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **State**: Local component state with async data loading
- **Data Flow**: Frontend ↔ Supabase (real-time subscriptions not used)

## Key Workflows
- **Development**: `pnpm dev` (Vite dev server on port 3000)
- **Build**: `pnpm build` (outputs to `dist/`)
- **Type Check**: `pnpm check` (TypeScript noEmit)
- **Format**: `pnpm format` (Prettier)
- **Database Setup**: Run `database.sql` or `supabase_migration_v2.sql` in Supabase SQL Editor
- **Environment**: Create `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Code Patterns
- **Pages**: Feature-based in `src/pages/`, use hooks for data loading, toast notifications
- **Components**: shadcn/ui in `src/components/ui/`, custom modals/editors in `src/components/`
- **Data Access**: All Supabase queries in `src/lib/supabaseClient.ts` with error handling
- **Types**: Strict TypeScript, interfaces in `src/lib/types.ts`
- **Styling**: Tailwind classes, responsive with `md:`, `lg:` prefixes
- **Forms**: React Hook Form + Zod validation (when used)
- **Error Handling**: `handleError` function logs Supabase errors, shows toast messages

## Conventions
- **Imports**: Absolute paths with `@/` alias (configured in `vite.config.ts`)
- **Naming**: Portuguese for business terms (e.g., `ingredientes`, `receitas`), English for code
- **Async**: `async/await` with try/catch, load data in `useEffect`
- **CRUD**: Consistent pattern - load data, modal for edit/add, confirm delete
- **Costs**: Automatic calculation in recipes/products using `recipeUtils.ts`
- **Testing**: Vitest for config validation (minimal test coverage)

## Examples
- **Add Recipe**: Use `RecipeEditorModal` with ingredients list, calls `saveFullRecipe()`
- **Data Loading**: `const [data, setData] = useState([]); useEffect(() => loadData(), []);`
- **Supabase Query**: `const { data, error } = await supabase.from('table').select('*');`
- **Toast**: `toast.success('Saved successfully')` or `toast.error('Error message')`

## Key Files
- `src/App.tsx`: Main router with Sidebar layout
- `src/lib/supabaseClient.ts`: All database operations
- `database.sql`: Schema definition
- `src/pages/Recipes.tsx`: Example CRUD page
- `src/components/RecipeEditorModal.tsx`: Complex form component