import { createClient } from "next-sanity";

export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-07-09";

export const hasSanityConfig = Boolean(sanityProjectId && sanityDataset);

export const sanityClient = createClient({
  projectId: sanityProjectId || "placeholder-project-id",
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: true,
});
