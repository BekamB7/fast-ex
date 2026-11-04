This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Development and production

Copy `.env.example` to `.env.local` for local development and set
`NEXT_PUBLIC_API_URL` to the local backend, normally
`http://localhost:5000/api`. The API URL is public browser configuration; never
put credentials or secrets in a `NEXT_PUBLIC_*` variable.

On Vercel, configure `NEXT_PUBLIC_API_URL` separately for the **Preview** and
**Production** environments. Preview builds should point to the development
backend, while Production builds should point to the stable production backend.
Changing this value requires a new frontend deployment. `NEXT_PRODUCTION_API_URL`
is not exposed to browser code; use `NEXT_PUBLIC_API_URL` in the relevant Vercel
environment instead. The backend must include each frontend origin in
`FRONTEND_URL` (development) or `FRONTEND_URL_PRODUCTION` (production); separate
multiple origins with commas.

Use `dev` as the integration branch and `main` for production. Open pull requests
into either branch and wait for the GitHub Actions CI workflow to pass before
merging. Promote a change by merging `dev` into `main`; configure the hosting
provider to deploy `dev` as Preview and `main` as Production.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
