import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("customer"), // 'customer' | 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  color: text("color").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const feedbackItems = pgTable("feedback_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("under_review"),
  // 'under_review' | 'planned' | 'in_progress' | 'shipped' | 'declined'
  category: text("category").notNull(),
  voteCount: integer("vote_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  authorId: uuid("author_id").references(() => users.id),
  statusExplanation: text("status_explanation"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  feedbackItemId: uuid("feedback_item_id")
    .references(() => feedbackItems.id, { onDelete: "cascade" })
    .notNull(),
  anonymousSessionId: text("anonymous_session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),
  feedbackItemId: uuid("feedback_item_id")
    .references(() => feedbackItems.id, { onDelete: "cascade" })
    .notNull(),
  parentCommentId: uuid("parent_comment_id"),
  isAdminResponse: boolean("is_admin_response").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type FeedbackItem = typeof feedbackItems.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Category = typeof categories.$inferSelect;
