const http = require("http");
const { parse } = require("url");

const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOST || "127.0.0.1";
const dev = process.env.NODE_ENV !== "production";

const app = next({
  dev,
  hostname,
  port
});

const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer(async (req, res) => {
        try {
          const parsedUrl = parse(req.url, true);
          await handle(req, res, parsedUrl);
        } catch (error) {
          console.error("Unhandled request error", error);
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      })
      .listen(port, hostname, () => {
        console.log(`CertPrep Academy ready on http://${hostname}:${port}`);
      });
  })
  .catch((error) => {
    console.error("Failed to start the Next.js server", error);
    process.exit(1);
  });
