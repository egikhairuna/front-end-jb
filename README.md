# Headless WooCommerce with Next.js (Hybrid Architecture)

A premium headless WooCommerce store built with Next.js (App Router), leveraging a hybrid architecture for maximum stability and performance.

## 🏗️ Architecture

This project uses a **Hybrid Architecture** designed to solve common headless WooCommerce pain points (session loss, unstable checkout, CORS issues).

-   **Frontend**: Next.js (App Router)
-   **Catalog/Read**: [WPGraphQL](https://wpgraphql.com/) + [WooCommerce GraphQL](https://woographql.com/)
-   **Checkout/Write**: [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Shipping**: Custom JNE Integration (Indonesia)

### Why Hybrid?

| Feature | GraphQL (Read) | REST API (Write) |
| :--- | :--- | :--- |
| **Performance** | High (Optimized Queries) | Standard |
| **Session Control** | Cookie-based (Unstable) | Stateless (Secure) |
| **Checkout** | Schema Mismatches | Official Support |
| **Payment** | Complex Integration | Battle-tested |

---

## 🚀 Getting Started

### Prerequisites

-   WordPress with **WooCommerce** & **WPGraphQL** installed.
-   WooCommerce REST API keys (Consumer Key & Secret).

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# 🌐 WordPress Configuration
NEXT_PUBLIC_WORDPRESS_URL=your-site.com
NEXT_PUBLIC_GRAPHQL_ENDPOINT=your-site.com/graphql

# 🔐 WooCommerce REST API (Server-side Only)
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_API_URL=your-site.com/wp-json/wc/v3

# 📦 Shipping API (JNE)
JNE_USERNAME=your_username
JNE_API_KEY=your_key
```

### Installation

```bash
npm install
npm run dev
```

---

## 🛠️ Project Structure

-   `src/app/api/orders/create/route.ts`: Secure order creation handler via REST API.
-   `src/lib/woocommerce/client.ts`: Dedicated WooCommerce REST client.
-   `src/lib/woocommerce/transformers.ts`: Data mappers for cart-to-order logic.
-   `src/components/checkout/CheckoutForm.tsx`: Stateless checkout implementation.
-   `src/lib/store/cart.ts`: Client-side cart persistence using Zustand.

---

## 📦 Checkout Flow

1.  **Catalog**: Products are fetched and displayed using **WPGraphQL**.
2.  **Cart**: Managed exclusively on the **Client (Zustand)** for speed.
3.  **Shipping**: Real-time JNE rate calculation via API Route.
4.  **Order Creation**:
    -   Payload is sent to `/api/orders/create`.
    -   Server-side transformation to WooCommerce REST format.
    -   Secure submission to WooCommerce core.
    -   Automatic stock reduction & email triggers.
5.  **Success**: Redirect to order confirmation or payment gateway.

---

## 🧪 Verification & Testing

### Create Test Order
1. Add items to cart.
2. Fill shipping details (BCA Bank Transfer default).
3. Verify JNE rates load.
4. Submit and verify order in WordPress Admin.

### Automated Checks
```bash
npm run build
npm run lint
```

---

## 🛡️ Best Practices Implemented

-   **Security**: API keys are never exposed to the client.
-   **Statelessness**: No dependency on PHP sessions or cookies for checkout.
-   **Error Handling**: Detailed mapping of WooCommerce error codes to user messages.
-   **Typescript**: Full type safety for WooCommerce REST payloads.
-   **SEO**: Semantic HTML and meta optimizations.

---

## 📄 License

MIT

