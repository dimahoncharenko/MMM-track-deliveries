Module.register("MMM-track-deliveries", {
  defaults: {
    apiUrl: "http://localhost:8080/api/track",
    updateInterval: 10 * 60 * 1000,
    phone: "",
    trackId: "",
  },

  start: function () {
    this.trackingData = null;
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
    if (notification === "TRACKING_RESULT") {
      this.trackingData = payload;
      this.updateDom();
    }
  },

  notificationReceived: function (notification, payload) {
    if (notification === "TRACK_NEW_PARCEL") {
      console.log("Отримано нову ТТН від бота:", payload.number);
      this.sendSocketNotification("ADD_TRACKING_NUMBER", payload);
    }
  },

  getStyles: function () {
    return ["MMM-track-deliveries.css"];
  },
});
