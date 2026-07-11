import { defineField, defineType } from "sanity";

export const pricingPlanType = defineType({
  name: "pricingPlan",
  title: "Pricing Plan",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(3).max(120),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "billingNote",
      title: "Billing note",
      type: "string",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(1000),
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.required().min(1).max(20),
    }),
    defineField({ name: "isHighlighted", title: "Highlighted", type: "boolean", initialValue: false }),
    defineField({ name: "isPublished", title: "Published", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { title: "title", subtitle: "price" },
  },
});
