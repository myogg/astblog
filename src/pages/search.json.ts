import type { APIRoute } from "astro";
import { fetchBlogPosts } from "../lib/github";

export const GET: APIRoute = async () => {
	const posts = await fetchBlogPosts();

	const searchIndex = posts.map((post) => ({
		slug: post.slug,
		title: post.title,
		description: post.description,
		dateFormatted: post.dateFormatted,
		labels: post.labels.map((l) => l.name),
	}));

	return new Response(JSON.stringify(searchIndex), {
		headers: { "Content-Type": "application/json" },
	});
};
