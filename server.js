const cds = require("@sap/cds");
const express = require("express");
const path = require("path");

module.exports = cds.server;

// Custom middleware to serve React build
cds.on("bootstrap", (app) => {
  // Serve static files from React build
  const buildPath = path.join(__dirname, "app", "employee-portal", "build");
  app.use(express.static(buildPath));

  // Handle React Router - serve index.html for any non-API routes
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (
      req.path.startsWith("/employee") ||
      req.path.startsWith("/admin") ||
      req.path.startsWith("/$metadata")
    ) {
      return next();
    }

    // Serve React app for all other routes
    res.sendFile(path.join(buildPath, "index.html"));
  });
});

// Log server information
cds.on("listening", () => {
  console.log("\n🚀 Employee Management System is running!");
  console.log("📊 Backend API: http://localhost:4004");
  console.log("🌐 Frontend App: http://localhost:4004");
  console.log("📋 API Metadata: http://localhost:4004/$metadata");
  console.log("👥 Employee Service: http://localhost:4004/employee");
  console.log("🔧 Admin Service: http://localhost:4004/admin");
  console.log("\n✨ Access the Employee Portal at: http://localhost:4004\n");
});
