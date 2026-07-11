import { defineField, defineType } from "sanity";

export const pageSectionType = defineType({
  name: "pageSection",
  title: "Page Section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(2).max(140),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required().max(1800),
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.max(20),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "body" },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: typeof subtitle === "string" ? subtitle.slice(0, 90) : "",
      };
    },
  },
});
