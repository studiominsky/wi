import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Word Inventory",
    short_name: "Wi",
    description: "Your German word inventory. Powered by AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfbfb",
    theme_color: "#011C42",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
