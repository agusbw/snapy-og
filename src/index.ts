import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { validator } from "hono/validator";
import url from "url";
import { getImage } from "./service.js";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "OG image generator by @agus_bw" });
});

app.get(
  "/get",
  validator("query", (value, c) => {
    const targetURL = value["url"];
    if (
      !targetURL ||
      typeof targetURL !== "string" ||
      !url.URL.canParse(targetURL)
    ) {
      return c.json({ message: "URL parameter is missing" }, 400);
    }
    return {
      targetUrl: targetURL,
    };
  }),
  async (c) => {
    const { targetUrl } = c.req.valid("query");
    try {
      const image = await getImage(targetUrl);
      c.header("Content-Type", "image/png");
      return c.body(image);
    } catch (err) {
      console.error(err);
      return c.json(
        {
          message: `Failed to generate the OG image for: ${targetUrl}`,
        },
        500
      );
    }
  }
);

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
