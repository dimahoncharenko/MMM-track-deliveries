Module.register("MMM-track-deliveries", {
  defaults: {
    updateInterval: 10 * 60 * 1000,
  },

  start: function () {
    this.trackingData = null;
    this.config.apiUrl = `http://localhost:${this.config.port}/api/tracking`;
    this.sendSocketNotification("GET_TRACKING_DATA", { config: this.config });

    setInterval(() => {
      this.sendSocketNotification("GET_TRACKING_DATA", { config: this.config });
    }, this.config.updateInterval);
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "track-container";

    if (
      !this.trackingData ||
      !this.trackingData.data ||
      this.trackingData.data.length === 0
    ) {
      wrapper.innerHTML =
        "<span class='dimmed xsmall'>Немає активних посилок</span>";
      return wrapper;
    }

    this.trackingData.data.forEach((item) => {
      const parcelCard = document.createElement("div");
      parcelCard.className = "parcel-card";

      const header = document.createElement("div");
      header.className = "parcel-header bright small";
      header.innerHTML = `<i class="fa fa-box-open color-np"></i> <span>${item.Number}</span>`;
      parcelCard.appendChild(header);

      const status = document.createElement("div");
      status.className = "parcel-status normal medium";
      status.innerText = item.Status;
      parcelCard.appendChild(status);

      const route = document.createElement("div");
      route.className = "parcel-route xsmall dimmed";
      route.innerHTML = `
            <i class="fa fa-map-marker-alt"></i> ${item.CitySender} 
            <i class="fa fa-long-arrow-alt-right"></i> 
            ${item.CityRecipient}
        `;
      parcelCard.appendChild(route);

      if (item.WarehouseRecipient) {
        const warehouse = document.createElement("div");
        warehouse.className = "parcel-warehouse xsmall dimmed";
        warehouse.innerHTML = `<i class="fa fa-store"></i> ${item.WarehouseRecipient}`;
        parcelCard.appendChild(warehouse);
      }

      const footer = document.createElement("div");
      footer.className = "parcel-footer xsmall dimmed";
      const date = item.ScheduledDeliveryDate || item.TrackingUpdateDate;
      footer.innerHTML = `<i class="fa fa-calendar-alt"></i> Очікується: ${date}`;
      parcelCard.appendChild(footer);

      wrapper.appendChild(parcelCard);
    });

    return wrapper;
  },

  socketNotificationReceived: function (notification, payload) {
    Log.info(
      `[socketNotificationReceived] ${notification} ${JSON.stringify(payload)}`
    );
    if (notification === "TRACKING_RESULT") {
      this.trackingData = payload;
      this.updateDom();
    }
  },

  notificationReceived: function (notification, payload) {
    if (notification === "TRACK_NEW_PARCEL" && payload?.trackingDocs) {
      Log.info(`Отримано нові ТТН від бота: ${payload.trackingDocs}`);
      this.sendSocketNotification("GET_TRACKING_DATA", payload);
    }
  },

  getStyles: function () {
    return ["MMM-track-deliveries.css"];
  },
});
