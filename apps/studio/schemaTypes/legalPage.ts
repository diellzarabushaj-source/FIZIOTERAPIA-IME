import { defineArrayMember, defineField, defineType } from "sanity";

export const legalPageType = defineType({
  name: "legalPage",
  title: "Legal & Safety Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: "badge", title: "Badge", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "lastUpdated", title: "Last updated", type: "string", initialValue: "Korrik 2026" }),
    defineField({
      name: "pageType",
      title: "Page type",
      type: "string",
      options: {
        list: [
          { title: "Legal", value: "legal" },
          { title: "Safety", value: "safety" },
          { title: "Privacy", value: "privacy" },
        ],
      },
      initialValue: "legal",
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "legalSection",
          fields: [
            defineField({ name: "title", title: "Section title", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "body", title: "Section body", type: "text", rows: 5, validation: (rule) => rule.required() }),
          ],
          preview: {
            select: { title: "title", subtitle: "body" },
          },
        }),
      ],
    }),
    defineField({ name: "reviewed", title: "Reviewed", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
  },
});
