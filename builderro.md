09:48:57.120 Running build in Portland, USA (West) – pdx1
09:48:57.121 Build machine configuration: 2 cores, 8 GB
09:48:57.317 Cloning github.com/conhecendodigital/leadgram-app (Branch: main, Commit: df64bc9)
09:48:58.258 Cloning completed: 940.000ms
09:48:58.682 Restored build cache from previous deployment (EmBjHRFGdnb7isV5kaTB3EEaLYfW)
09:48:59.434 Running "vercel build"
09:48:59.832 Vercel CLI 48.10.5
09:49:00.219 Installing dependencies...
09:49:01.633 
09:49:01.634 up to date in 1s
09:49:01.634 
09:49:01.634 171 packages are looking for funding
09:49:01.635   run `npm fund` for details
09:49:01.664 Detected Next.js version: 16.0.1
09:49:01.669 Running "npm run build"
09:49:01.780 
09:49:01.781 > leadgram-app@0.1.0 build
09:49:01.781 > next build
09:49:01.781 
09:49:03.038    ▲ Next.js 16.0.1 (Turbopack)
09:49:03.040    - Experiments (use with caution):
09:49:03.040      · optimizePackageImports
09:49:03.041      ✓ webpackMemoryOptimizations
09:49:03.041 
09:49:03.118    Creating an optimized production build ...
09:49:49.101 
09:49:49.102 > Build error occurred
09:49:49.106 Error: Turbopack build failed with 3 errors:
09:49:49.106 ./lib/supabase/server.ts:2:1
09:49:49.106 Ecmascript file had an error
09:49:49.107 [0m [90m 1 |[39m [36mimport[39m { createServerClient [36mas[39m createClient } [36mfrom[39m [32m'@supabase/ssr'[39m
09:49:49.107 [31m[1m>[22m[39m[90m 2 |[39m [36mimport[39m { cookies } [36mfrom[39m [32m'next/headers'[39m
09:49:49.107  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
09:49:49.107  [90m 3 |[39m [36mimport[39m type { [33mDatabase[39m } [36mfrom[39m [32m'@/types/database.types'[39m
09:49:49.107  [90m 4 |[39m
09:49:49.107  [90m 5 |[39m [36mexport[39m [36mconst[39m createServerClient [33m=[39m [36masync[39m () [33m=>[39m {[0m
09:49:49.107 
09:49:49.107 You're importing a component that needs "next/headers". That only works in a Server Component which is not supported in the pages/ directory. Read more: https://nextjs.org/docs/app/building-your-application/rendering/server-components
09:49:49.107 
09:49:49.107 
09:49:49.107 
09:49:49.107 Import traces:
09:49:49.107   App Route:
09:49:49.108     ./lib/supabase/server.ts
09:49:49.108     ./app/api/admin/mercadopago/connect/route.ts
09:49:49.108 
09:49:49.108   Server Component:
09:49:49.108     ./lib/supabase/server.ts
09:49:49.108     ./app/(admin)/admin/dashboard/page.tsx
09:49:49.108 
09:49:49.108   Client Component Browser:
09:49:49.108     ./lib/supabase/server.ts [Client Component Browser]
09:49:49.108     ./lib/services/email-service.ts [Client Component Browser]
09:49:49.108     ./app/(admin)/admin/settings/page.tsx [Client Component Browser]
09:49:49.108     ./app/(admin)/admin/settings/page.tsx [Server Component]
09:49:49.108 
09:49:49.108   Client Component SSR:
09:49:49.108     ./lib/supabase/server.ts [Client Component SSR]
09:49:49.108     ./lib/services/email-service.ts [Client Component SSR]
09:49:49.108     ./app/(admin)/admin/settings/page.tsx [Client Component SSR]
09:49:49.108     ./app/(admin)/admin/settings/page.tsx [Server Component]
09:49:49.108 
09:49:49.108 
09:49:49.108 ./app/api/auth/update-password/route.ts:2:1
09:49:49.108 Module not found: Can't resolve '@/lib/supabase/service'
09:49:49.108 [0m [90m 1 |[39m [36mimport[39m { [33mNextResponse[39m } [36mfrom[39m [32m'next/server'[39m
09:49:49.109 [31m[1m>[22m[39m[90m 2 |[39m [36mimport[39m { createServiceClient } [36mfrom[39m [32m'@/lib/supabase/service'[39m
09:49:49.109  [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
09:49:49.111  [90m 3 |[39m
09:49:49.111  [90m 4 |[39m [90m/**[39m
09:49:49.112  [90m 5 |[39m [90m * POST /api/auth/update-password[39m[0m
09:49:49.117 
09:49:49.117 Import map: aliased to relative './lib/supabase/service' inside of [project]/
09:49:49.117 
09:49:49.117 
09:49:49.117 https://nextjs.org/docs/messages/module-not-found
09:49:49.117 
09:49:49.117 
09:49:49.117 ./lib/services/otp-service.ts:8:1
09:49:49.117 Module not found: Can't resolve '@/lib/supabase/service'
09:49:49.117 [0m [90m  6 |[39m [90m */[39m
09:49:49.117  [90m  7 |[39m
09:49:49.117 [31m[1m>[22m[39m[90m  8 |[39m [36mimport[39m { createServiceClient } [36mfrom[39m [32m'@/lib/supabase/service'[39m
09:49:49.117  [90m    |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m
09:49:49.117  [90m  9 |[39m [36mimport[39m { [33mEmailService[39m } [36mfrom[39m [32m'./email-service'[39m
09:49:49.117  [90m 10 |[39m
09:49:49.117  [90m 11 |[39m [36mexport[39m [36minterface[39m [33mOTPCode[39m {[0m
09:49:49.117 
09:49:49.117 Import map: aliased to relative './lib/supabase/service' inside of [project]/
09:49:49.118 
09:49:49.118 
09:49:49.118 Import trace:
09:49:49.118   App Route:
09:49:49.118     ./lib/services/otp-service.ts
09:49:49.118     ./app/api/otp/send/route.ts
09:49:49.118 
09:49:49.118 https://nextjs.org/docs/messages/module-not-found
09:49:49.118 
09:49:49.119 
09:49:49.119     at <unknown> (./lib/supabase/server.ts:2:1)
09:49:49.119     at <unknown> (./app/api/auth/update-password/route.ts:2:1)
09:49:49.119     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
09:49:49.119     at <unknown> (./lib/services/otp-service.ts:8:1)
09:49:49.120     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
09:49:49.212 Error: Command "npm run build" exited with 1