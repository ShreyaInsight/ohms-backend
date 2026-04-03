const { app } = require("./app");
const { port } = require("./config/env");

app.listen(port, () => {
  console.log(`MedCore HMS server running at http://localhost:${port}`);
});
