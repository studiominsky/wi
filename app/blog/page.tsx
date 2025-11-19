import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/lib/blog-data";
import { ClockIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Blog - Word Inventory",
  description: "Tips, tricks, and guides for mastering language learning.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfb] dark:bg-[#000]">
      <div className="container px-4 md:px-6 py-12 md:py-24 mx-auto max-w-screen-lg">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <h1 className="text-4xl font-grotesk tracking-tighter sm:text-6xl">
            The Inventory Blog
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Insights on memory, linguistics, and effective study habits to help
            you learn faster.
          </p>
        </div>

        <div className="container px-4 md:px-6 py-12 mx-auto max-w-screen-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full border rounded-md overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="bg-[#c4e456] text-black px-2 py-0.5 rounded-full font-medium">
                      {post.category}
                    </span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>

                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ClockIcon className="size-3.5" />
                      {post.readTime}
                    </div>
                    <span className="text-sm font-medium flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                      Read more <ArrowRightIcon className="size-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
