import { defineField, defineType } from "sanity";

export const faqItemType = defineType({
  name: "faqItem",
  title: "FAQ Item",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "answer", title: "Answer", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Pacientë", value: "paciente" },
          { title: "Fizioterapeutë", value: "fizioterapeute" },
          { title: "AI & Siguri", value: "ai-siguri" },
          { title: "Pagesa", value: "pagesa" },
          { title: "Privatësi", value: "privatesi" },
        ],
      },
      initialValue: "paciente",
    }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 10 }),
    defineField({ name: "isPublished", title: "Published", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: {
      title: "question",
      subtitle: "category",
    },
  },
});
