import { Octokit } from "@octokit/rest";

export interface BlogPost {
  slug: string; // "1-hello-world"
  title: string; // Issue title
  description: string; // Extracted description
  dateFormatted: string; // "January 15 2024"
  content: string; // Markdown content
  created_at: Date; // Creation time
  updated_at: Date; // Update time
  number: number; // Issue number
  labels: string[]; // Label list
  url: string; // GitHub Issue URL
}

// Initialize Octokit with optional token
const octokit = new Octokit({
  auth: import.meta.env.GITHUB_TOKEN,
});

const GITHUB_OWNER = import.meta.env.GITHUB_OWNER;
const GITHUB_REPO = import.meta.env.GITHUB_REPO;

/**
 * Slugify a string for URL-friendly format
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-\u4e00-\u9fa5]+/g, "") // Remove all non-word chars except Chinese
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Format date to "Month DD, YYYY" format
 */
function formatDate(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Extract description from issue body
 * Takes first 150 characters or first paragraph
 */
function extractDescription(body: string | null | undefined): string {
  if (!body) return "";

  // Remove markdown code blocks
  const withoutCode = body.replace(/```[\s\S]*?```/g, "");

  // Remove markdown images
  const withoutImages = withoutCode.replace(/!\[.*?\]\(.*?\)/g, "");

  // Get first paragraph
  const firstParagraph = withoutImages.split("\n\n")[0];

  // Trim to 150 characters
  const description = firstParagraph.trim();
  if (description.length > 150) {
    return description.substring(0, 150) + "...";
  }

  return description;
}

/**
 * Fetch all blog posts from GitHub Issues
 * Filters out Pull Requests and only includes open issues
 */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    if (!GITHUB_OWNER || !GITHUB_REPO) {
      console.warn(
        "GitHub configuration missing. Please set GITHUB_OWNER and GITHUB_REPO in .env file."
      );
      console.warn(
        "Create .env file based on .env.example and configure your repository."
      );
      return [];
    }

    const { data: issues } = await octokit.issues.listForRepo({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      state: "open",
      per_page: 100,
    });

    // Filter out Pull Requests (they have a pull_request property)
    const blogPosts: BlogPost[] = issues
      .filter((issue) => !issue.pull_request)
      .map((issue) => {
        const created = new Date(issue.created_at);
        const updated = new Date(issue.updated_at);
        const slug = `${issue.number}-${slugify(issue.title)}`;

        return {
          slug,
          title: issue.title,
          description: extractDescription(issue.body),
          dateFormatted: formatDate(created),
          content: issue.body || "",
          created_at: created,
          updated_at: updated,
          number: issue.number,
          labels: issue.labels.map((label) =>
            typeof label === "string" ? label : label.name || ""
          ),
          url: issue.html_url,
        };
      });

    return blogPosts;
  } catch (error) {
    console.error("Error fetching blog posts from GitHub:", error);

    // Return empty array instead of throwing to allow build to complete
    // Users should check their configuration if no posts appear
    console.warn(
      "Returning empty posts array. Please check your GitHub configuration."
    );
    return [];
  }
}

/**
 * Fetch a single blog post by slug
 * Slug format: {number}-{title-slugified}
 */
export async function fetchBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  try {
    // Extract issue number from slug
    const numberMatch = slug.match(/^(\d+)-/);
    if (!numberMatch) {
      console.warn(`Invalid slug format: ${slug}`);
      return null;
    }

    const issueNumber = Number.parseInt(numberMatch[1], 10);

    if (!GITHUB_OWNER || !GITHUB_REPO) {
      console.warn(
        "GitHub configuration missing. Please set GITHUB_OWNER and GITHUB_REPO in .env file."
      );
      return null;
    }

    const { data: issue } = await octokit.issues.get({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      issue_number: issueNumber,
    });

    // Check if it's a pull request
    if (issue.pull_request) {
      return null;
    }

    const created = new Date(issue.created_at);
    const updated = new Date(issue.updated_at);
    const generatedSlug = `${issue.number}-${slugify(issue.title)}`;

    return {
      slug: generatedSlug,
      title: issue.title,
      description: extractDescription(issue.body),
      dateFormatted: formatDate(created),
      content: issue.body || "",
      created_at: created,
      updated_at: updated,
      number: issue.number,
      labels: issue.labels.map((label) =>
        typeof label === "string" ? label : label.name || ""
      ),
      url: issue.html_url,
    };
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error);
    return null;
  }
}
