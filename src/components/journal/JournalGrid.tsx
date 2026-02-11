"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { fetchMorePosts } from "@/app/actions/journal";
import { Loader2 } from "lucide-react";

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

type PageInfo = {
    hasNextPage: boolean;
    endCursor: string | null;
};

type Props = {
    initialPosts: Post[];
    initialPageInfo: PageInfo;
};

export function JournalGrid({ initialPosts, initialPageInfo }: Props) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
    const [loading, setLoading] = useState(false);

    const loadMore = async () => {
        if (!pageInfo.hasNextPage || !pageInfo.endCursor || loading) return;

        setLoading(true);
        try {
            const result = await fetchMorePosts({
                after: pageInfo.endCursor
            });

            setPosts([...posts, ...result.nodes]);
            setPageInfo(result.pageInfo);
        } catch (error) {
            console.error("Failed to load more posts", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-16">
                {posts.map((post) => (
                    <Link key={post.id} href={`/journal/${post.slug}`} className="group block">
                        <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-neutral-100 mb-6">
                                {post.featuredImage?.node?.sourceUrl ? (
                                <Image
                                    src={post.featuredImage.node.sourceUrl}
                                    alt={post.featuredImage.node.altText || post.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                    No Image
                                </div>
                                )}
                        </div>
                        <div className="space-y-2 px-4">
                            <span className="text-xs font-bold tracking-widest uppercase text-neutral-500">
                                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <h2 className="text-xl md:text-2xl font-bold uppercase leading-tight group-hover:underline">
                                {post.title}
                            </h2>
                            <div 
                                className="text-sm text-neutral-600 line-clamp-3 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: post.excerpt }}
                            />
                        </div>
                    </Link>
                ))}
            </div>

            {pageInfo.hasNextPage && (
                <div className="flex justify-center pt-8">
                    <Button 
                        onClick={loadMore} 
                        disabled={loading}
                        size="lg"
                        className="min-w-[150px] uppercase font-bold tracking-widest"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load More"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
