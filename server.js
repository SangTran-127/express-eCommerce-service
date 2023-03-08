const app = require("./src/app");

const PORT = 2077;

const server = app.listen(PORT, () => {
  console.log(`eCommerce start with port ${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => console.log(`Server is close`));
});
