import { Footer } from "@/components/layout/Footer";
import { client } from "@/lib/graphql/client";
import { GET_POST_BY_SLUG } from "@/lib/graphql/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

// Types
interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    }
  }
}

type Props = {
  params: Promise<{ slug: string }>
}

/**
 * 🔍 DYNAMIC SEO METADATA
 * Ensures each journal post has its own title and description
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data: any = await client.request(GET_POST_BY_SLUG, { slug });
    const post = data.post as Post;
    
    if (!post) return { title: "Post Not Found" };

    // Clean HTML tags from excerpt or content
    const cleanDescription = (post.excerpt || post.content || "")
      .replace(/<[^>]*>/g, "")
      .substring(0, 160);

    return {
      title: post.title,
      description: cleanDescription,
      openGraph: {
        title: post.title,
        description: cleanDescription,
        images: post.featuredImage?.node?.sourceUrl ? [{ url: post.featuredImage.node.sourceUrl }] : [],
      },
    };
  } catch (e) {
    return { title: "James Boogie Journal" };
  }
}

async function getPost(slug: string) {
    try {
        const data: any = await client.request(GET_POST_BY_SLUG, { slug });
        return data.post as Post;
    } catch (error) {
        console.error("Error fetching post:", error);
        return null;
    }
}

export default async function JournalPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="flex-1 min-h-screen pb-20">
                {/* Hero Section */}
                <div className="w-full h-[60vh] md:h-[80vh] relative bg-neutral-100">
                    {post.featuredImage?.node?.sourceUrl ? (
                         <Image
                            src={post.featuredImage.node.sourceUrl}
                            alt={post.featuredImage.node.altText || post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold uppercase tracking-widest">
                            No Featured Image
                        </div>
                    )}
                    
                    {/* Overlay Title */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="container mx-auto px-4 md:px-8 text-center text-white">
                             <div className="font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-4 opacity-90">
                                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold uppercase leading-tight max-w-4xl mx-auto text-shadow-lg">
                                {post.title}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 pt-12 md:pt-20">
                    <div className="max-w-3xl mx-auto">
                        <Link 
                            href="/journal" 
                            className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-neutral-500 hover:text-black mb-12 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Journal
                        </Link>

                         <article 
                            className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:uppercase prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-img:rounded-md prose-img:w-full prose-a:text-black prose-a:underline hover:prose-a:text-neutral-600 prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-6 prose-blockquote:italic"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>
                </div>
        </div>
    );
}
