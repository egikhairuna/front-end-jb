
import { graphql } from "@/lib/graphql/gql";

export const PRODUCT_FRAGMENT = graphql(`
  fragment ProductFragment on Product {
    id
    databaseId
    name
    slug
    shortDescription
    image {
      sourceUrl
      altText
    }
    productCategories {
      nodes {
        id
        name
        slug
      }
    }
    ... on SimpleProduct {
      price
      rawPrice: price(format: RAW)
      regularPrice
      stockStatus
      stockQuantity
      weight
    }
    ... on VariableProduct {
      price
      rawPrice: price(format: RAW)
      regularPrice
      stockStatus
      weight
    }
  }
`);

export const GET_PRODUCTS = graphql(`
  ${PRODUCT_FRAGMENT}
  query GetProducts($first: Int!, $after: String, $category: String, $search: String, $stockStatus: [StockStatusEnum]) {
    products(first: $first, after: $after, where: { category: $category, search: $search, stockStatus: $stockStatus }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ProductFragment
      }
    }
  }
`);

export const GET_PRODUCT = graphql(`
  ${PRODUCT_FRAGMENT}
  query GetProduct($id: ID!, $idType: ProductIdTypeEnum!) {
    product(id: $id, idType: $idType) {
      ...ProductFragment
      description
      features {
        features
      }
      sizeChart {
        sizeChart
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
        }
      }
      ... on VariableProduct {
        variations {
          nodes {
             id
             databaseId
             name
             price
             stockStatus
             stockQuantity
             attributes {
                nodes {
                  name
                  value
                }
             }
          }
        }
      }
    }
  }
`);

export const GET_CATEGORIES = graphql(`
  query GetCategories {
    productCategories(first: 100) {
      nodes {
        id
        name
        slug
        count
      }
    }
  }
`);

export const GET_RELATED_PRODUCTS = graphql(`
    ${PRODUCT_FRAGMENT}
    query GetRelatedProducts($categoryId: Int!) {
        products(first: 4, where: { categoryIdIn: [$categoryId]}) {
            nodes {
                ...ProductFragment
            }
        }
    }
`)


export const ADD_TO_CART_MUTATION = graphql(`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      cartItem {
        key
        product {
          node {
            id
            name
          }
        }
        quantity
      }
    }
  }
`);

export const EMPTY_CART_MUTATION = graphql(`
  mutation EmptyCart($input: EmptyCartInput!) {
    emptyCart(input: $input) {
      cart {
        isEmpty
      }
    }
  }
`);

export const UPDATE_CUSTOMER_MUTATION = graphql(`
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer {
        id
        billing {
          firstName
          lastName
          address1
          city
          postcode
          country
          email
          phone
        }
        shipping {
          firstName
          lastName
          address1
          city
          postcode
          country
        }
      }
    }
  }
`);

export const UPDATE_SHIPPING_METHOD_MUTATION = graphql(`
  mutation UpdateShippingMethod($input: UpdateShippingMethodInput!) {
    updateShippingMethod(input: $input) {
      cart {
        chosenShippingMethods
        shippingTotal
        total
      }
    }
  }
`);

export const GET_CART = graphql(`
  query GetCart {
    cart {
      contents {
        nodes {
          key
          product {
            node {
              id
              name
            }
          }
          quantity
        }
      }
      total
      subtotal
      isEmpty
    }
  }
`);

export const CHECKOUT_MUTATION = graphql(`
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      order {
        id
        orderNumber
        status
        total
      }
      result
      redirect
    }
  }
`);

export const POST_FRAGMENT = graphql(`
  fragment PostFragment on Post {
    id
    databaseId
    title
    slug
    date
    excerpt
    content
    featuredImage {
      node {
        sourceUrl
        altText
      }
    }
  }
`);

export const GET_POSTS = graphql(`
  ${POST_FRAGMENT}
  query GetPosts($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...PostFragment
      }
    }
  }
`);

export const GET_POST_BY_SLUG = graphql(`
  ${POST_FRAGMENT}
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ...PostFragment
    }
  }
`);

export const GET_ORDER_DETAILS = graphql(`
  query GetOrderDetails($id: ID!) {
    order(id: $id, idType: DATABASE_ID) {
      id
      databaseId
      orderNumber
      total
      paymentMethod
      paymentMethodTitle
      uniquePaymentCode
      transferAmount
      status
      date
      billing {
        firstName
        lastName
        email
        phone
      }
      lineItems {
        nodes {
          productId
          quantity
          total
          product {
            node {
              name
            }
          }
        }
      }
      feeLines {
        nodes {
          name
          total
        }
      }
  }
`);

// Sitemap Queries - Fetch all published content with minimal fields
export const GET_ALL_POSTS_FOR_SITEMAP = graphql(`
  query GetAllPostsForSitemap {
    posts(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
        modified
      }
    }
  }
`);

export const GET_ALL_PRODUCTS_FOR_SITEMAP = graphql(`
  query GetAllProductsForSitemap {
    products(first: 1000, where: { status: "publish" }) {
      nodes {
        slug
        modified
      }
    }
  }
`);

