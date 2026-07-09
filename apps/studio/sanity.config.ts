import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "your-project-id";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "fizioterapiaImeStudio",
  title: "Fizioterapia ime Blog",
  projectId,
  dataset,
  basePath: "/",
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
