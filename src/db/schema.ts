import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const domains = sqliteTable("domains", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  address: text("address").notNull(),
});

export type InsertDomain = typeof domains.$inferInsert;
export type SelectDomain = typeof domains.$inferSelect;
