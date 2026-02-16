import { Metadata } from 'next';
import { Footer } from "@/components/layout/Footer";
import { serverClient } from "@/lib/graphql/server-client";
import { GET_POSTS } from "@/lib/graphql/queries";
import { JournalGrid } from "@/components/journal/JournalGrid";

export const metadata: Metadata = {
    title: "Journal",
    description: "Explore the James Boogie Journal for the latest stories, lookbooks, and insights into Pop Military fashion and culture.",
    alternates: {
        canonical: "/journal",
    },
};

// Post Interface
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

async function getPosts() {
    try {
        const data: any = await serverClient.request(GET_POSTS, { first: 6 });
        return {
            nodes: data.posts.nodes as Post[],
            pageInfo: data.posts.pageInfo
        };
    } catch (error) {
        console.error("Error fetching posts:", error);
        return { 
            nodes: [], 
            pageInfo: { hasNextPage: false, endCursor: null } 
        };
    }
}

export default async function JournalPage() {
    const { nodes: posts, pageInfo } = await getPosts();

  return (
    <div className="flex-1 min-h-screen pt-[120px] pb-20 px-6 md:px-10">
                <div className="max-w-[1920px] mx-auto">
                    <h1 className="text-4xl px-0 md:text-4xl font-heading font-bold uppercase mb-12 md:mb-20 tracking-tight">
                        Journal
                    </h1>
                    
                    <div className="">
                        <JournalGrid 
                            initialPosts={posts} 
                            initialPageInfo={pageInfo} 
                        />
                    </div>
                </div>
    </div>
  );
}
