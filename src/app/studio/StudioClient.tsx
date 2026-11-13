"use client";

import dynamic from "next/dynamic";
import config from "../../../sanity/sanity.config";

const Studio = dynamic(
  () => import("sanity").then((module) => module.Studio),
  { ssr: false },
);

export default function StudioClient() {
  return (
    <div className="h-screen w-full">
      <Studio config={config} />
    </div>
  );
}
