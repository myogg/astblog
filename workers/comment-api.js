export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;

		// CORS headers
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		};

		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			// Get comments for a page
			if (path === "/comments" && request.method === "GET") {
				const page = url.searchParams.get("page") || "/";
				const { results } = await env.DB.prepare(
					"SELECT * FROM comments WHERE page = ? ORDER BY created_at DESC",
				)
					.bind(page)
					.all();

				return new Response(JSON.stringify(results), {
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				});
			}

			// Post a comment
			if (path === "/comments" && request.method === "POST") {
				const { page, name, email, content } = await request.json();

				if (!content || !page) {
					return new Response(
						JSON.stringify({ error: "Missing required fields" }),
						{
							status: 400,
							headers: { ...corsHeaders, "Content-Type": "application/json" },
						},
					);
				}

				const result = await env.DB.prepare(
					"INSERT INTO comments (page, name, email, content, created_at) VALUES (?, ?, ?, ?, ?)",
				)
					.bind(
						page,
						name || "匿名",
						email || "",
						content,
						new Date().toISOString(),
					)
					.run();

				return new Response(
					JSON.stringify({ success: true, id: result.meta.last_row_id }),
					{
						headers: { ...corsHeaders, "Content-Type": "application/json" },
					},
				);
			}

			return new Response("Not Found", { status: 404 });
		} catch (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}
	},
};
