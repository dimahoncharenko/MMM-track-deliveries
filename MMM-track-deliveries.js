Module.register("MMM-track-deliveries", {
  defaults: {
    updateInterval: 10 * 60 * 1000,
    ttl: 40 * 1000,
    maxHeight: "400px",
  },

  start: function () {
    this.trackingData = { data: [] };
    this.config.apiUrl = `http://localhost:${this.config.port}/api/tracking`;
    this.scrollDirection = 1;

    setInterval(() => {
      this.checkExpiry();
    }, 1000);
  },

  checkExpiry: function () {
    if (!this.trackingData.data.length) return;

    const now = Date.now();
    const originalLength = this.trackingData.data.length;

    this.trackingData.data = this.trackingData.data.filter((item) => {
      return now - item.addedAt < this.config.ttl;
    });

    if (this.trackingData.data.length !== originalLength) {
      this.updateDom(500);
    }
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

    const listWrapper = document.createElement("div");
    listWrapper.className = "parcel-list";

    this.trackingData.data.forEach((item, index) => {
      const parcelCard = document.createElement("div");
      parcelCard.className = "parcel-card";

      parcelCard.style.animationDelay = (index + 1) * 0.5 + "s";

      if (Date.now() - item.addedAt > this.config.ttl - 2000) {
        parcelCard.classList.add("exit");
      }

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

      listWrapper.appendChild(parcelCard);
    });

    wrapper.appendChild(listWrapper);
    return wrapper;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "TRACKING_RESULT") {
      const now = Date.now();

      payload?.data?.forEach((item) => {
        if (!item.addedAt) item.addedAt = now;
      });

      this.trackingData = payload;
      this.updateDom();

      setTimeout(() => this.initAutoScroll(), 2000);
    }
  },

  initAutoScroll: function () {
    const container = document.querySelector(".parcel-list");
    if (!container || container.scrollHeight <= container.clientHeight) return;

    if (this.scrollTimer) clearInterval(this.scrollTimer);

    this.scrollTimer = setInterval(() => {
      const maxScroll = container.scrollHeight - container.clientHeight;

      if (container.scrollTop >= maxScroll) this.scrollDirection = -1;
      if (container.scrollTop <= 0) this.scrollDirection = 1;

      container.scrollBy({
        top: this.scrollDirection * 1,
        behavior: "smooth",
      });
    }, 50);
  },

  notificationReceived: function (notification, payload) {
    if (notification === "TRACK_NEW_PARCEL" && payload?.trackingDocs) {
      this.sendSocketNotification("GET_TRACKING_DATA", payload);
    }
  },

  getStyles: function () {
    return ["MMM-track-deliveries.css"];
  },
});
