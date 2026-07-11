import { defineField, defineType } from "sanity";

export const appScreenType = defineType({
  name: "appScreen",
  title: "App Screen",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(3).max(120),
    }),
    defineField({
      name: "screenType",
      title: "Screen type",
      type: "string",
      options: {
        list: [
          { title: "Patient mobile", value: "patient-mobile" },
          { title: "Patient portal", value: "patient-portal" },
          { title: "Physiotherapist dashboard", value: "physio-dashboard" },
          { title: "Admin dashboard", value: "admin-dashboard" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required().max(1000),
    }),
    defineField({
      name: "screenshot",
      title: "Screenshot",
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
    defineField({ name: "order", title: "Order", type: "number", initialValue: 10 }),
    defineField({ name: "isPublished", title: "Published", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "title", subtitle: "screenType", media: "screenshot" },
  },
});
