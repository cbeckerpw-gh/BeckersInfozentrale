import { axios } from "@pipedream/platform";

export default defineComponent({
  async run({ steps, $ }) {
    const method = steps.trigger.event.method;

    // POST: Empfängt neue Telemetriedaten und speichert sie in Data Stores / kümmert sich um Aufbereitung
    if (method === "POST") {
      const body = steps.trigger.event.body;
      
      const payload = {
        pv: parseFloat(body.pv || 0.0),
        battery: parseFloat(body.battery || 0.0),
        house: parseFloat(body.house || 0.0),
        grid: parseFloat(body.grid || 0.0),
        zappi: parseFloat(body.zappi || 0.0),
        shelly: {
          oskarLight: body.shelly?.oskarLight || "AUS"
        },
        updatedAt: new Date().toISOString()
      };

      await $.respond({
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: { success: true, data: payload }
      });

      return payload;
    }

    // GET: Liefert den aktuellen Stand an das Dashboard zurück
    await $.respond({
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: {
        timestamp: new Date().toLocaleTimeString('de-DE'),
        energy: {
          pv: 3.4,
          battery: 1.2,
          house: 0.8,
          grid: 0.0,
          zappi: 1.4
        },
        shelly: {
          oskarLight: "AUS"
        }
      }
    });
  },
});
