import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

const google = createGoogleGenerativeAI({
  apiKey: process.env.API_KEY,
});

function Head(
  { title, description }: { title?: string; description?: string },
) {
  return (
    <head>
      <meta charSet="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
      {!!title && <title>{title}</title>}
      {!!description && <meta name="description" content={description} />}
    </head>
  );
}

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": () => (
      <html>
        <Head />
        <form action="/response">
          <input
            type="text"
            required
            name="prompt"
            placeholder="Enter your prompt here"
          />
          <input type="submit" value="Submit" />
        </form>
      </html>
    ),
    "/response": async (req) => {
      const prompt = new URL(req.url).searchParams.get("prompt");

      if (!prompt) {
        return Response.redirect("/", 301);
      }

      const { text } = await generateText({
        model: google("models/gemini-2.0-flash-exp"),
        prompt,
      });

      const dirtyHtml = await marked.parse(text);
      const cleanHtml = DOMPurify.sanitize(dirtyHtml);

      return (
        <html>
          <Head title={prompt} description={text} />
          {html(cleanHtml)}
        </html>
      );
    },
  },
});

console.log(
  `Server is running at ${server.hostname}:${server.port}`,
);
