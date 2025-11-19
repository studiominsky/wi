import { blogPosts } from "@/lib/blog-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  ClockIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} - Word Inventory Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-20">
      <div className=" pt-12 pb-16">
        <div className="container px-4 md:px-6 mx-auto max-w-3xl">
          <Link href="/blog">
            <Button
              variant="ghost"
              size="sm"
              className="mb-8 pl-0 hover:bg-transparent hover:text-primary"
            >
              <ArrowLeftIcon className="mr-2 size-4" /> Back to Blog
            </Button>
          </Link>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="bg-[#c4e456] text-black px-2.5 py-0.5 rounded-full text-xs font-medium font-mono uppercase tracking-wide">
                {post.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold font-grotesk leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <UserIcon className="size-4" />
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <CalendarBlankIcon className="size-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="size-4" />
                {post.readTime}
              </div>
            </div>
          </div>
        </div>
      </div>

      <article className="container px-4 md:px-6 mx-auto max-w-3xl -mt-8">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-10 bg-muted border">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div
          className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-grotesk prose-a:text-primary hover:prose-a:underline prose-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <hr className="my-12 border-border" />

        <div className="bg-muted/30 rounded-xl p-8 text-center space-y-4 border border-border/50">
          <h3 className="text-2xl font-bold">Ready to start your inventory?</h3>
          <p className="text-muted-foreground">
            Join thousands of learners building their personal vocabulary
            database.
          </p>
          <Link href="/signup">
            <Button size="lg" className="mt-2">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
