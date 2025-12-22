/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./utils/schema.js",
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_RkgU5LKQGZs8@ep-dark-silence-ahyqzv59-pooler.c-3.us-east-1.aws.neon.tech/ai-interview?sslmode=require&channel_binding=require',
  }
};