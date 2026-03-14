import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, categories, feedbackItems, votes, comments } from "./schema";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql);

  console.log("Seeding database...");

  // Categories
  const cats = await db
    .insert(categories)
    .values([
      { name: "UI/UX", slug: "ui-ux", color: "#8b5cf6", displayOrder: 0 },
      { name: "Performance", slug: "performance", color: "#f59e0b", displayOrder: 1 },
      { name: "Integrations", slug: "integrations", color: "#3b82f6", displayOrder: 2 },
      { name: "New Feature", slug: "new-feature", color: "#10b981", displayOrder: 3 },
      { name: "Mobile", slug: "mobile", color: "#ec4899", displayOrder: 4 },
      { name: "API", slug: "api", color: "#6366f1", displayOrder: 5 },
      { name: "Analytics", slug: "analytics", color: "#14b8a6", displayOrder: 6 },
      { name: "Security", slug: "security", color: "#ef4444", displayOrder: 7 },
    ])
    .returning();
  console.log(`  Created ${cats.length} categories`);

  // Users
  const seedUsers = await db
    .insert(users)
    .values([
      { email: "admin@feedbackflow.dev", name: "Sarah Chen", avatarUrl: null, role: "admin" },
      { email: "pm@feedbackflow.dev", name: "Marcus Johnson", avatarUrl: null, role: "admin" },
      { email: "alex@example.com", name: "Alex Rivera", avatarUrl: null, role: "customer" },
      { email: "jordan@example.com", name: "Jordan Lee", avatarUrl: null, role: "customer" },
      { email: "sam@example.com", name: "Sam Patel", avatarUrl: null, role: "customer" },
      { email: "taylor@example.com", name: "Taylor Kim", avatarUrl: null, role: "customer" },
      { email: "chris@example.com", name: "Chris Morgan", avatarUrl: null, role: "customer" },
      { email: "dana@example.com", name: "Dana Brooks", avatarUrl: null, role: "customer" },
    ])
    .returning();
  console.log(`  Created ${seedUsers.length} users`);

  const [admin, pm, alex, jordan, sam, taylor, chris, dana] = seedUsers;

  // Feedback items
  const ideas = await db
    .insert(feedbackItems)
    .values([
      {
        title: "Dark mode support",
        description: "Add a dark mode toggle that respects system preferences. Many of us work late nights managing orders and the bright white screen is painful.",
        status: "in_progress",
        category: "UI/UX",
        voteCount: 342,
        commentCount: 8,
        authorId: alex.id,
        statusExplanation: "We're actively building this — dark mode will ship in the next release.",
      },
      {
        title: "Export feedback to CSV",
        description: "Allow admins to export all feedback data to CSV for analysis in spreadsheets. Should include vote counts, status, category, and timestamps.",
        status: "planned",
        category: "New Feature",
        voteCount: 218,
        commentCount: 5,
        authorId: jordan.id,
        statusExplanation: "Scheduled for next quarter. We'll support CSV and JSON export formats.",
      },
      {
        title: "Slack notifications when status changes",
        description: "Send a Slack notification to a configured channel whenever a feedback item's status changes. Would help our team stay on top of product updates.",
        status: "under_review",
        category: "Integrations",
        voteCount: 156,
        commentCount: 3,
        authorId: sam.id,
      },
      {
        title: "Mobile app for submitting ideas",
        description: "A native mobile app or at least a PWA that makes it easy to submit and vote on ideas from a phone. The current mobile web experience could be better.",
        status: "under_review",
        category: "Mobile",
        voteCount: 134,
        commentCount: 4,
        authorId: taylor.id,
      },
      {
        title: "Bulk actions for admin dashboard",
        description: "Allow admins to select multiple feedback items and change their status, category, or merge them in bulk. Currently have to do it one by one.",
        status: "planned",
        category: "New Feature",
        voteCount: 127,
        commentCount: 2,
        authorId: chris.id,
        statusExplanation: "Coming in the next admin dashboard update.",
      },
      {
        title: "API access for programmatic submissions",
        description: "Expose a REST API so we can submit feedback programmatically from our own app. Would allow in-app feedback widgets.",
        status: "under_review",
        category: "API",
        voteCount: 98,
        commentCount: 6,
        authorId: dana.id,
      },
      {
        title: "Advanced search with filters",
        description: "Improved search that supports filtering by date range, vote count, and multiple categories simultaneously.",
        status: "shipped",
        category: "UI/UX",
        voteCount: 287,
        commentCount: 7,
        authorId: alex.id,
        statusExplanation: "Shipped! You can now filter by category, status, and sort by multiple criteria.",
      },
      {
        title: "Real-time vote count updates",
        description: "Vote counts should update in real-time without needing to refresh the page. Makes the portal feel more alive and interactive.",
        status: "shipped",
        category: "Performance",
        voteCount: 203,
        commentCount: 3,
        authorId: jordan.id,
        statusExplanation: "Now live — vote counts update instantly using optimistic UI.",
      },
      {
        title: "SAML/SSO login support",
        description: "Support SAML-based single sign-on for enterprise customers who require it for compliance.",
        status: "declined",
        category: "Security",
        voteCount: 45,
        commentCount: 2,
        authorId: sam.id,
        statusExplanation: "Not planned for now — our target users are SMBs where Google OAuth is sufficient.",
      },
      {
        title: "Keyboard shortcuts for power users",
        description: "Add keyboard shortcuts for common actions: J/K to navigate ideas, V to vote, S to submit, / to search.",
        status: "under_review",
        category: "UI/UX",
        voteCount: 89,
        commentCount: 1,
        authorId: taylor.id,
      },
      {
        title: "Email digest of trending ideas",
        description: "Weekly email summary of the most popular new ideas and status changes. Keeps stakeholders in the loop without checking the portal daily.",
        status: "planned",
        category: "New Feature",
        voteCount: 176,
        commentCount: 4,
        authorId: chris.id,
        statusExplanation: "We'll add configurable email digests — weekly and daily options.",
      },
      {
        title: "Custom categories per portal",
        description: "Let portal admins create their own categories instead of using a fixed set. Different products need different categorization.",
        status: "in_progress",
        category: "New Feature",
        voteCount: 163,
        commentCount: 3,
        authorId: dana.id,
        statusExplanation: "Being built now — admins will be able to CRUD categories from the dashboard.",
      },
      {
        title: "Webhook events for integrations",
        description: "Fire webhooks on key events (new idea, status change, vote threshold) so other tools can react. Would unlock lots of automation.",
        status: "under_review",
        category: "API",
        voteCount: 112,
        commentCount: 5,
        authorId: alex.id,
      },
      {
        title: "Idea templates for common requests",
        description: "Pre-built templates that guide users to provide the right information when submitting. E.g., 'Bug Report' template asks for steps to reproduce.",
        status: "under_review",
        category: "UI/UX",
        voteCount: 67,
        commentCount: 2,
        authorId: jordan.id,
      },
      {
        title: "Performance dashboard for admins",
        description: "Show response time metrics, resolution rates, and average time-to-ship for feedback items. Helps PMs track their responsiveness.",
        status: "planned",
        category: "Analytics",
        voteCount: 143,
        commentCount: 3,
        authorId: sam.id,
        statusExplanation: "Analytics dashboard is on the roadmap for Q3.",
      },
      {
        title: "Multi-language support",
        description: "Support for multiple languages so international users can browse and submit in their preferred language.",
        status: "under_review",
        category: "New Feature",
        voteCount: 78,
        commentCount: 1,
        authorId: taylor.id,
      },
      {
        title: "Merge duplicate ideas",
        description: "Admin tool to merge duplicate feedback items, combining vote counts and comments into one unified item.",
        status: "in_progress",
        category: "New Feature",
        voteCount: 195,
        commentCount: 6,
        authorId: chris.id,
        statusExplanation: "In development — will transfer all votes and redirect old URLs.",
      },
      {
        title: "Rich text editor for descriptions",
        description: "Replace the plain textarea with a rich text editor supporting formatting, lists, code blocks, and inline images.",
        status: "shipped",
        category: "UI/UX",
        voteCount: 231,
        commentCount: 4,
        authorId: dana.id,
        statusExplanation: "Shipped with Markdown support including bold, italic, lists, code, and links.",
      },
      {
        title: "Public API documentation",
        description: "Interactive API docs (Swagger/OpenAPI) so developers can easily integrate with the feedback portal.",
        status: "under_review",
        category: "API",
        voteCount: 54,
        commentCount: 2,
        authorId: alex.id,
      },
      {
        title: "Upvote notifications",
        description: "Notify idea authors when their idea reaches vote milestones (10, 50, 100, 500 votes). Keeps submitters engaged.",
        status: "planned",
        category: "New Feature",
        voteCount: 91,
        commentCount: 1,
        authorId: jordan.id,
        statusExplanation: "Will be part of the notification system rollout.",
      },
    ])
    .returning();
  console.log(`  Created ${ideas.length} feedback items`);

  // Comments on popular items
  const commentData = [
    { content: "This is my most requested feature! The bright white is really hard on the eyes during late-night sessions.", authorId: jordan.id, feedbackItemId: ideas[0].id, isAdminResponse: false },
    { content: "We're targeting the next release for dark mode. It will respect your system preference and also have a manual toggle.", authorId: admin.id, feedbackItemId: ideas[0].id, isAdminResponse: true },
    { content: "+1, would love this. Any chance of custom themes too?", authorId: sam.id, feedbackItemId: ideas[0].id, isAdminResponse: false },
    { content: "Custom themes are a great idea but out of scope for v1. Let's ship dark mode first and iterate.", authorId: admin.id, feedbackItemId: ideas[0].id, isAdminResponse: true },
    { content: "CSV export would be really helpful for our quarterly business reviews.", authorId: taylor.id, feedbackItemId: ideas[1].id, isAdminResponse: false },
    { content: "Could you also include the ability to filter before exporting? Don't need all 10k rows every time.", authorId: chris.id, feedbackItemId: ideas[1].id, isAdminResponse: false },
    { content: "Good call — we'll add category and status filters to the export dialog.", authorId: pm.id, feedbackItemId: ideas[1].id, isAdminResponse: true },
    { content: "We use Slack for everything — this would save us from checking the portal constantly.", authorId: alex.id, feedbackItemId: ideas[2].id, isAdminResponse: false },
    { content: "Which Slack events would be most useful? Status changes only, or also new submissions and vote milestones?", authorId: admin.id, feedbackItemId: ideas[2].id, isAdminResponse: true },
    { content: "Status changes and when something hits 100 votes would be great.", authorId: alex.id, feedbackItemId: ideas[2].id, isAdminResponse: false },
    { content: "Even a responsive PWA would be a huge improvement over the current mobile experience.", authorId: dana.id, feedbackItemId: ideas[3].id, isAdminResponse: false },
    { content: "Agree — I try to submit ideas from my phone at trade shows and it's frustrating.", authorId: chris.id, feedbackItemId: ideas[3].id, isAdminResponse: false },
    { content: "The search improvements are fantastic! So much faster to find what I'm looking for.", authorId: sam.id, feedbackItemId: ideas[6].id, isAdminResponse: false },
    { content: "Glad you like it! Let us know if there are any other filter options you'd find useful.", authorId: pm.id, feedbackItemId: ideas[6].id, isAdminResponse: true },
    { content: "The real-time updates make the portal feel so much more modern. Great work!", authorId: taylor.id, feedbackItemId: ideas[7].id, isAdminResponse: false },
    { content: "Enterprise SSO is table stakes for B2B SaaS. Disappointing to see this declined.", authorId: dana.id, feedbackItemId: ideas[8].id, isAdminResponse: false },
    { content: "We hear you. It's not off the table forever — just not a fit for our current SMB focus. We'll revisit as we grow.", authorId: admin.id, feedbackItemId: ideas[8].id, isAdminResponse: true },
    { content: "The merge duplicates feature is going to clean up our portal so much. Can't wait!", authorId: alex.id, feedbackItemId: ideas[16].id, isAdminResponse: false },
    { content: "Will merged items redirect automatically? We've shared links to some of these.", authorId: jordan.id, feedbackItemId: ideas[16].id, isAdminResponse: false },
    { content: "Yes — old URLs will redirect to the merged parent item. No broken links.", authorId: pm.id, feedbackItemId: ideas[16].id, isAdminResponse: true },
  ];

  const insertedComments = await db.insert(comments).values(commentData).returning();
  console.log(`  Created ${insertedComments.length} comments`);

  // Generate votes (we'll just create a reasonable number of vote records)
  const voteRecords = [];
  const customerIds = [alex.id, jordan.id, sam.id, taylor.id, chris.id, dana.id];

  for (const idea of ideas) {
    // Each customer votes on ~60% of ideas randomly
    for (const customerId of customerIds) {
      if (Math.random() < 0.6) {
        voteRecords.push({
          userId: customerId,
          feedbackItemId: idea.id,
        });
      }
    }
  }

  if (voteRecords.length > 0) {
    await db.insert(votes).values(voteRecords);
  }
  console.log(`  Created ${voteRecords.length} votes`);

  console.log("Seeding complete!");
}

seed().catch(console.error);
