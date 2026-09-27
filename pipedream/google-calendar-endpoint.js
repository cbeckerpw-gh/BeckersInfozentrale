import { axios } from "@pipedream/platform";

export default defineComponent({
  props: {
    google_calendar: {
      type: "app",
      app: "google_calendar",
    }
  },
  async run({ steps, $ }) {
    // Zeitfenster berechnen: Ab heute 00:00 Uhr bis Übermorgen 23:59 Uhr
    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    const maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);
    const timeMax = maxDate.toISOString();

    try {
      // Abruf der Google Calendar Events über die Pipedream App API Connection
      const response = await axios($, {
        url: `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
        headers: {
          Authorization: `Bearer \({this.google_calendar.\)auth.oauth_access_token}`,
        },
        params: {
          timeMin: timeMin,
          timeMax: timeMax,
          singleEvents: true,
          orderBy: "startTime"
        }
      });

      // Hilfsfunktion zur Zuordnung von Tagen (heute, morgen, uebermorgen)
      const getDayTarget = (eventStartDate) => {
        const eventDay = new Date(eventStartDate).setHours(0,0,0,0);
        const today = new Date().setHours(0,0,0,0);
        const diffDays = Math.round((eventDay - today) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "heute";
        if (diffDays === 1) return "morgen";
        if (diffDays === 2) return "uebermorgen";
        return null;
      };

      // Hilfsfunktion zur Personen-Zuordnung basierend auf Event-Titel / Keywords
      const getPersonClass = (summary = "") => {
        const lower = summary.toLowerCase();
        if (lower.includes("papa")) return "papa";
        if (lower.includes("mama")) return "mama";
        if (lower.includes("oskar")) return "oskar";
        if (lower.includes("irma")) return "irma";
        return "eltern";
      };

      const events = (response.items || []).map(event => {
        const start = event.start.dateTime || event.start.date;
        const dayTarget = getDayTarget(start);

        if (!dayTarget) return null;

        const timeString = event.start.dateTime 
          ? new Date(event.start.dateTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
          : "Ganztägig";

        return {
          id: event.id,
          title: event.summary,
          time: timeString,
          dayTarget: dayTarget,
          personClass: getPersonClass(event.summary)
        };
      }).filter(Boolean);

      await $.respond({
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        },
        body: { events }
      });

    } catch (error) {
      await $.respond({
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: { error: error.message }
      });
    }
  },
});
