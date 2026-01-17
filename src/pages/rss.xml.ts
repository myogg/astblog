import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { fetchBlogPosts } from "../lib/github";

export async function GET(context: APIContext) {
  const posts = await fetchBlogPosts();

  return rss({
    title: "Kai's Blog",
    description:
      "A front-end developer's blog about life and technology, powered by GitHub Issues",
    site: context.site || "https://example.com",
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      link: `/post/${post.slug}`,
      pubDate: post.created_at,
      categories: post.labels,
    })),
    customData: `<language>en-us</language>`,
  });
}
