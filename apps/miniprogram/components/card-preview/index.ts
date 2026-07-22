Component({
  properties: {
    visible: { type: Boolean, value: false },
    imagePath: { type: String, value: "" },
    roman: { type: String, value: "" },
    name: { type: String, value: "" },
    englishName: { type: String, value: "" },
    orientation: { type: String, value: "upright" },
    orientationLabel: { type: String, value: "" },
    positionLabel: { type: String, value: "" },
  },

  methods: {
    closePreview() {
      this.triggerEvent("close");
    },

    holdPreview() {
      // Stops a tap on the artwork from reaching the backdrop close target.
    },

  },
});
