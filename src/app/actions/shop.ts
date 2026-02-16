"use server";

import { serverClient } from "@/lib/graphql/server-client";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import { Product } from "@/types/woocommerce";

export async function fetchMoreProducts({ 
    after, 
    category, 
    search,
    stockStatus,
    first = 12
}: { 
    after?: string; 
    category?: string; 
    search?: string;
    stockStatus?: string;
    first?: number;
}) {
    try {
        const data: any = await serverClient.request(GET_PRODUCTS, {
            first, // Use the provided first or default to 12
            after,
            category: category || null,
            search: search || null,
            stockStatus: stockStatus ? [stockStatus] : null
        });

        return {
            nodes: data.products.nodes as Product[],
            pageInfo: data.products.pageInfo
        };
    } catch (error) {
        console.error("Error fetching more products:", error);
        return { 
            nodes: [], 
            pageInfo: { hasNextPage: false, endCursor: null } 
        };
    }
}
