import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "./types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const builder = projectId
  ? createImageUrlBuilder({ projectId, dataset })
  : null;

export function getSanityImageUrl(
  image: SanityImageSource | undefined,
  options: { width: number; height: number },
) {
  if (!image) return undefined;
  if (image.url) return image.url;
  if (!builder || !image.asset) return undefined;

  return builder
    .image(image)
    .width(options.width)
    .height(options.height)
    .fit("crop")
    .auto("format")
    .url();
}
