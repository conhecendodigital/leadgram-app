10:10:26.251 Running build in Portland, USA (West) – pdx1
10:10:26.252 Build machine configuration: 2 cores, 8 GB
10:10:26.367 Cloning github.com/conhecendodigital/leadgram-app (Branch: main, Commit: 5acaac8)
10:10:27.022 Cloning completed: 654.000ms
10:10:27.620 Restored build cache from previous deployment (EmBjHRFGdnb7isV5kaTB3EEaLYfW)
10:10:28.417 Running "vercel build"
10:10:28.992 Vercel CLI 48.10.5
10:10:29.354 Installing dependencies...
10:10:30.686 
10:10:30.687 up to date in 1s
10:10:30.688 
10:10:30.688 171 packages are looking for funding
10:10:30.688   run `npm fund` for details
10:10:30.717 Detected Next.js version: 16.0.1
10:10:30.722 Running "npm run build"
10:10:30.862 
10:10:30.863 > leadgram-app@0.1.0 build
10:10:30.863 > next build
10:10:30.863 
10:10:31.911    ▲ Next.js 16.0.1 (Turbopack)
10:10:31.912    - Experiments (use with caution):
10:10:31.912      · optimizePackageImports
10:10:31.912      ✓ webpackMemoryOptimizations
10:10:31.913 
10:10:31.986    Creating an optimized production build ...
10:11:14.805  ✓ Compiled successfully in 42s
10:11:14.894    Running TypeScript ...
10:11:41.270 Failed to compile.
10:11:41.270 
10:11:41.271 ./lib/services/otp-service.ts:114:29
10:11:41.272 Type error: Property 'user_id' does not exist on type 'never'.
10:11:41.272 
10:11:41.272 [0m [90m 112 |[39m       [36mconst[39m { error[33m:[39m dbError } [33m=[39m [36mawait[39m (supabase[33m.[39m[36mfrom[39m([32m'email_otp_codes'[39m) [36mas[39m any)
10:11:41.272  [90m 113 |[39m         [33m.[39minsert({
10:11:41.272 [31m[1m>[22m[39m[90m 114 |[39m           user_id[33m:[39m userData[33m.[39muser_id[33m,[39m
10:11:41.272  [90m     |[39m                             [31m[1m^[22m[39m
10:11:41.272  [90m 115 |[39m           email[33m,[39m
10:11:41.272  [90m 116 |[39m           code[33m,[39m
10:11:41.272  [90m 117 |[39m           purpose[33m:[39m [32m'password_reset'[39m[33m,[39m[0m
10:11:41.395 Next.js build worker exited with code: 1 and signal: null
10:11:41.438 Error: Command "npm run build" exited with 1