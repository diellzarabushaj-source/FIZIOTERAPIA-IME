import { defineField, defineType } from "sanity";

export const featureCardType = defineType({
  name: "featureCard",
  title: "Feature Card",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(3).max(120),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(700),
    }),
    defineField({
      name: "audience",
      title: "Audience",
      type: "string",
      options: {
        list: [
          { title: "Patient", value: "patient" },
          { title: "Physiotherapist", value: "physio" },
          { title: "Administrator", value: "admin" },
          { title: "Clinic", value: "clinic" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "iconLabel", title: "Icon label", type: "string", validation: (rule) => rule.max(40) }),
    defineField({
      name: "image",
      title: "Image",
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
    select: { title: "title", subtitle: "audience", media: "image" },
  },
});
