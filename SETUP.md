
# Headless WordPress E-commerce with Next.js, Tailwind, and Shadcn UI

This project is a headless e-commerce application using Next.js 15+ (App Router), TypeScript, Tailwind CSS, Shadcn UI, and Zustand, connected to a WordPress/WooCommerce backend via WPGraphQL.

## Prerequisites

- Node.js 18+ installed.
- WordPress site with:
  - WooCommerce
  - WPGraphQL
  - WPGraphQL WooCommerce plugin

## Getting Started

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Environment Variables:**

    The project uses `.env.local` for configuration. It has been set up with:

    ```env
    NEXT_PUBLIC_WORDPRESS_URL=https://jamesboogie.com
    NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://jamesboogie.com/graphql
    RAJAONGKIR_API_KEY=your_rajaongkir_pro_api_key
    RAJAONGKIR_ORIGIN_CITY_ID=23 # Bandung
    ```

3.  **Run Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

4.  **Build for Production:**

    ```bash
    npm run build
    npm start
    ```

## Project Structure

-   `src/app`: App Router pages and layouts.
-   `src/components`: UI components (Shadcn) and feature-specific components (`cart`, `products`, `checkout`).
-   `src/lib`: Utilities, GraphQL client (`client.ts`, `queries.ts`), and Zustand store (`store/cart.ts`).
-   `src/types`: TypeScript definitions. **Note:** `types/woocommerce.ts` contains manual type definitions as introspection was disabled on the endpoint.

## Key Features

-   **Store:** `src/lib/store/cart.ts` uses Zustand + Persist middleware for cart management.
-   **GraphQL:** `src/lib/graphql/client.ts` configured with `graphql-request`.
-   **UI:** Shadcn UI components in `src/components/ui`.
-   **Checkout:** Guest checkout form with Zod validation (`src/components/checkout/CheckoutForm.tsx`).
-   **WhatsApp:** Order success page directs users to WhatsApp with order details.

## Troubleshooting

-   **Images**: If product images don't load, ensure the domain is added to `next.config.ts` in `images.remotePatterns`. `jamesboogie.com` and `secure.gravatar.com` are currently added.
-   **GraphQL Errors during Build**: The build process fetches data. If the API is down, pages will render with empty states (handled via try-catch).
-   **TypeScript Types**: If you enable public introspection in WPGraphQL, you can run `npx graphql-codegen` to generate strict types. For now, manual types are used in `src/types/woocommerce.ts`.

## Deployment

Deploy to Vercel or any Next.js supporting host. Ensure environment variables are set in the deployment dashboard.
