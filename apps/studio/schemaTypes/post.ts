import { defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "category", title: "Category", type: "reference", to: [{ type: "category" }] }),
    defineField({ name: "author", title: "Author", type: "reference", to: [{ type: "author" }] }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime" }),
    defineField({ name: "readingTime", title: "Reading time", type: "string", initialValue: "4 min" }),
    defineField({ name: "hero", title: "Hero text", type: "text", rows: 3 }),
    defineField({ name: "body", title: "Body", type: "blockContent" }),
    defineField({ name: "safetyReviewed", title: "Safety reviewed", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
    },
    prepare(selection) {
      return { ...selection, subtitle: selection.author ? `by ${selection.author}` : "Fizioterapia ime" };
    },
  },
});
