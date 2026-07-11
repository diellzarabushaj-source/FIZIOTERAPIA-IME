import { defineField, defineType } from "sanity";

export const sitePageType = defineType({
  name: "sitePage",
  title: "Site Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(3).max(140),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "badge", title: "Badge", type: "string", validation: (rule) => rule.max(80) }),
    defineField({
      name: "pageGroup",
      title: "Page group",
      type: "string",
      options: {
        list: [
          { title: "Support", value: "support" },
          { title: "Pilot", value: "pilot" },
          { title: "Launch", value: "launch" },
          { title: "Mobile", value: "mobile" },
          { title: "Clinic", value: "clinic" },
          { title: "Admin", value: "admin" },
          { title: "Patient", value: "patient" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required().max(1200),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.max(180),
        }),
      ],
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [{ type: "pageSection" }],
      validation: (rule) => rule.required().min(1).max(30),
    }),
    defineField({ name: "ctaLabel", title: "CTA label", type: "string", validation: (rule) => rule.max(100) }),
    defineField({
      name: "ctaHref",
      title: "CTA link",
      type: "string",
      validation: (rule) => rule.custom((value) => {
        if (!value) return true;
        return value.startsWith("/") || value.startsWith("https://")
          ? true
          : "Use a relative path or an HTTPS URL.";
      }),
    }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 10 }),
    defineField({ name: "isPublished", title: "Published", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "title", subtitle: "pageGroup", media: "coverImage" },
  },
});
