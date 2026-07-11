import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "your-project-id";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "fizioterapiaImeStudio",
  title: "Fizioterapia ime",
  projectId,
  dataset,
  basePath: "/",
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
