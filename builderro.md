09:58:46.535 Running build in Portland, USA (West) – pdx1
09:58:46.536 Build machine configuration: 2 cores, 8 GB
09:58:46.649 Cloning github.com/conhecendodigital/leadgram-app (Branch: main, Commit: 207d25f)
09:58:47.465 Cloning completed: 816.000ms
09:58:47.790 Restored build cache from previous deployment (EmBjHRFGdnb7isV5kaTB3EEaLYfW)
09:58:48.549 Running "vercel build"
09:58:48.933 Vercel CLI 48.10.5
09:58:49.285 Installing dependencies...
09:58:50.522 
09:58:50.523 up to date in 1s
09:58:50.524 
09:58:50.524 171 packages are looking for funding
09:58:50.524   run `npm fund` for details
09:58:50.552 Detected Next.js version: 16.0.1
09:58:50.557 Running "npm run build"
09:58:50.662 
09:58:50.662 > leadgram-app@0.1.0 build
09:58:50.663 > next build
09:58:50.663 
09:58:51.702    ▲ Next.js 16.0.1 (Turbopack)
09:58:51.704    - Experiments (use with caution):
09:58:51.704      · optimizePackageImports
09:58:51.704      ✓ webpackMemoryOptimizations
09:58:51.705 
09:58:51.778    Creating an optimized production build ...
09:59:32.956  ✓ Compiled successfully in 41s
09:59:32.960    Running TypeScript ...
09:59:58.892 Failed to compile.
09:59:58.893 
09:59:58.893 ./lib/services/email-service.ts:974:49
09:59:58.893 Type error: Property 'sendEmail' does not exist on type 'GoTrueAdminApi'.
09:59:58.893 
09:59:58.893 [0m [90m 972 |[39m     [36mconst[39m supabase [33m=[39m createServiceClient()[33m;[39m
09:59:58.893  [90m 973 |[39m
09:59:58.894 [31m[1m>[22m[39m[90m 974 |[39m     [36mconst[39m { error } [33m=[39m [36mawait[39m supabase[33m.[39mauth[33m.[39madmin[33m.[39msendEmail({
09:59:58.894  [90m     |[39m                                                 [31m[1m^[22m[39m
09:59:58.894  [90m 975 |[39m       email[33m,[39m
09:59:58.894  [90m 976 |[39m       emailData[33m:[39m {
09:59:58.894  [90m 977 |[39m         html[33m,[39m[0m
09:59:59.017 Next.js build worker exited with code: 1 and signal: null
09:59:59.052 Error: Command "npm run build" exited with 1