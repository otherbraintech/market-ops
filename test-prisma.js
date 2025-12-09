try {
  console.log("Attempting to require .prisma/client/default...");
  const client = require(".prisma/client/default");
  console.log("Success!");
} catch (error) {
  console.error("Failed:", error.message);
  console.error("Stack:", error.stack);
}
