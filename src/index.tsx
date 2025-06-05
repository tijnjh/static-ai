import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { Html, html } from "@elysiajs/html";
import { Elysia } from "elysia";

const google = createGoogleGenerativeAI({
  apiKey: process.env.API_KEY,
});

const app = new Elysia();

app.use(html());

app.get("/", () => (
  <html>
    <head>
      <meta charset="UTF-8" />
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
));

app.get("/response", async ({ query: { prompt }, redirect }) => {
  if (!prompt) {
    return redirect("/");
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
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta name="description" content={text} />
        <title>{prompt}</title>
      </head>
      {cleanHtml}
    </html>
  );
});

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
