const NodeHelper = require("node_helper");
const axios = require("axios");
const { spawn } = require("child_process");
const path = require("path");

module.exports = NodeHelper.create({
  start: function () {
    console.log("Starting Express server for MMM-track-deliveries...");

    this.expressServer = spawn(
      "node",
      [path.join(__dirname, "dist/server.js")],
      {
        shell: true,
        stdio: "inherit",
      }
    );

    this.expressServer.on("close", (code) => {
      console.log(`Express server exited with code ${code}`);
    });
  },
  stop: function () {
    if (this.expressServer) {
      this.expressServer.kill();
    }
  },
  socketNotificationReceived: (notification, payload) => {
    if (notification === "GET_TRACKING_DATA") {
    }
  },
  fetchTracking: async (config) => {
    try {
      const response = await axios.post(config.apiUrl, {
        track_id: config.trackId,
        phone: config.phone,
      });

      this.sendSocketNotification("TRACKING_RESULT", response.data);
    } catch (err) {
      console.error("Error fetching tracking:", error);
      this.sendSocketNotification("TRACKING_ERROR", error.message);
    }
  },
});
