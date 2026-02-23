const NodeHelper = require("node_helper");
const axios = require("axios");
const { spawn } = require("child_process");
const path = require("path");
const Log = require("logger");

module.exports = NodeHelper.create({
  parcels: [],

  start: function () {
    Log.info("Starting Express server for MMM-track-deliveries...");

    this.expressServer = spawn(
      "node",
      [path.join(__dirname, "dist/server.js")],
      {
        shell: false,
        stdio: "inherit",
      }
    );

    this.expressServer.on("close", (code) => {
      Log.info(`Express server exited with code ${code}`);
    });
  },

  stop: function () {
    if (this.expressServer) {
      this.expressServer.kill();
    }
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_TRACKING_DATA") {
      Log.debug(
        `[socketNotificationReceived] GET_TRACKING_DATA is triggered ${JSON.stringify(payload.trackingDocs)}`
      );
      if (payload.trackingDocs?.length) {
        this.fetchTracking(payload.trackingDocs);
      }
    }
  },

  fetchTracking: async function (trackingDocs) {
    try {
      const response = await axios.post(
        `http://localhost:${process.env.PORT}/api/tracking`,
        {
          trackingDocs,
        }
      );

      if (response.data && response.data.data) {
        const newParcels = response.data.data;

        newParcels.forEach((np) => {
          const existing = this.parcels.findIndex(
            (p) => p.Number === np.Number
          );
          if (existing !== -1) {
            this.parcels[existing] = np;
          } else {
            this.parcels.push(np);
          }
        });

        this.sendSocketNotification("TRACKING_RESULT", { data: this.parcels });
      }
    } catch (err) {
      Log.info("Error fetching tracking:", err.message);
      this.sendSocketNotification("TRACKING_ERROR", err.message);
    }
  },
});
