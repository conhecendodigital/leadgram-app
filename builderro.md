10:05:05.599 Running build in Portland, USA (West) – pdx1
10:05:05.600 Build machine configuration: 2 cores, 8 GB
10:05:05.706 Cloning github.com/conhecendodigital/leadgram-app (Branch: main, Commit: c0a7290)
10:05:06.463 Cloning completed: 756.000ms
10:05:06.974 Restored build cache from previous deployment (EmBjHRFGdnb7isV5kaTB3EEaLYfW)
10:05:07.710 Running "vercel build"
10:05:08.148 Vercel CLI 48.10.5
10:05:08.517 Installing dependencies...
10:05:09.916 
10:05:09.917 up to date in 1s
10:05:09.917 
10:05:09.917 171 packages are looking for funding
10:05:09.918   run `npm fund` for details
10:05:09.947 Detected Next.js version: 16.0.1
10:05:09.951 Running "npm run build"
10:05:10.059 
10:05:10.059 > leadgram-app@0.1.0 build
10:05:10.060 > next build
10:05:10.060 
10:05:11.154    ▲ Next.js 16.0.1 (Turbopack)
10:05:11.155    - Experiments (use with caution):
10:05:11.156      · optimizePackageImports
10:05:11.156      ✓ webpackMemoryOptimizations
10:05:11.156 
10:05:11.229    Creating an optimized production build ...
10:05:54.030  ✓ Compiled successfully in 42s
10:05:54.036    Running TypeScript ...
10:06:21.244 Failed to compile.
10:06:21.244 
10:06:21.244 ./lib/services/otp-service.ts:56:10
10:06:21.244 Type error: No overload matches this call.
10:06:21.244   Overload 1 of 2, '(values: never, options?: { count?: "exact" | "planned" | "estimated" | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "email_otp_codes", never, "POST">', gave the following error.
10:06:21.244     Argument of type '{ user_id: string | null; email: string; code: string; purpose: string; expires_at: string; attempts: number; max_attempts: number; }' is not assignable to parameter of type 'never'.
10:06:21.244   Overload 2 of 2, '(values: never[], options?: { count?: "exact" | "planned" | "estimated" | undefined; defaultToNull?: boolean | undefined; } | undefined): PostgrestFilterBuilder<{ PostgrestVersion: "12"; }, never, never, null, "email_otp_codes", never, "POST">', gave the following error.
10:06:21.245     Object literal may only specify known properties, and 'user_id' does not exist in type 'never[]'.
10:06:21.246 
10:06:21.246 [0m [90m 54 |[39m       [36mconst[39m { error[33m:[39m dbError } [33m=[39m [36mawait[39m supabase
10:06:21.246  [90m 55 |[39m         [33m.[39m[36mfrom[39m([32m'email_otp_codes'[39m)
10:06:21.246 [31m[1m>[22m[39m[90m 56 |[39m         [33m.[39minsert({
10:06:21.246  [90m    |[39m          [31m[1m^[22m[39m
10:06:21.246  [90m 57 |[39m           user_id[33m:[39m userId [33m||[39m [36mnull[39m[33m,[39m
10:06:21.247  [90m 58 |[39m           email[33m,[39m
10:06:21.247  [90m 59 |[39m           code[33m,[39m[0m
10:06:21.353 Next.js build worker exited with code: 1 and signal: null
10:06:21.392 Error: Command "npm run build" exited with 1