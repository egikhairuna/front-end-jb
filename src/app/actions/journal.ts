"use server";

import { client } from "@/lib/graphql/client";
import { GET_POSTS } from "@/lib/graphql/queries";

interface Post {
    id: string;
    title: string;
    slug: string;
    date: string;
    excerpt: string;
    featuredImage?: {
        node: {
            sourceUrl: string;
            altText: string;
        }
    }
}

export async function fetchMorePosts({ after }: { after: string }) {
    try {
        const data: any = await client.request(GET_POSTS, {
            first: 6, // Consistent with initial load
            after
        });

        return {
            nodes: data.posts.nodes as Post[],
            pageInfo: data.posts.pageInfo
        };
    } catch (error) {
        console.error("Error fetching more posts:", error);
        return { 
            nodes: [], 
            pageInfo: { hasNextPage: false, endCursor: null } 
        };
    }
}
