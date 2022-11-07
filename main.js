const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const queryString = require("query-string");
const middleware = jsonServer.defaults();

// Set default middleware (logger, static, cors and no-cache)
server.use(middleware);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === "POST") {
    req.body.createdAt = Date.now();
    req.body.updatedAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

router.render = (req, res) => {
  try {
    if (req.method === "GET" && Array.isArray(res.locals.data)) {
      const query = queryString.parse(req._parsedUrl.query);
      const total = res.get("X-Total-Count") || res.locals.data.length;

      return res.jsonp({
        ok: true,
        items: res.locals.data,
        pageSize: Number.parseInt(query._limit) || res.locals.data.length,
        total,
        length: res.locals.data.length,
        pageNumber: Number.parseInt(query._page) || 1,
      });
    }

    res.jsonp({
      ok: true,
      item: res.locals.data,
    });
  } catch (error) {
    res.status(500).jsonp({
      ok: false,
      message: error.message,
    });
  }
};

// Use default router
server.use("/api", router);

server.use((req, res, next) => {
  res.status(404).jsonp({
    ok: false,
    message: "No matching route",
  });
});

server.listen(5000, () => {
  console.log("JSON Server is running");
});
