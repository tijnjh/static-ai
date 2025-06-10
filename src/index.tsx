import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

const google = createGoogleGenerativeAI({
  apiKey: process.env.API_KEY,
});

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": () => (
      <html>
        <head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>
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
          <head>
            <meta charSet="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <meta name="description" content={text} />
            <title>{prompt}</title>
          </head>
          {html(cleanHtml)}
        </html>
      );
    },
  },
});

console.log(
  `Server is running at ${server.hostname}:${server.port}`,
);
