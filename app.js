const byId = (id) => document.getElementById(id);

const responseNode = byId("response");
const storageKey = "airbnbApiConfig";

function pretty(data) {
  return JSON.stringify(data, null, 2);
}

function setResponse(label, data, isError = false) {
  responseNode.textContent = `${label}\n${pretty(data)}`;
  responseNode.style.color = isError ? "#ffd4d4" : "#d4f5ff";
}

function getConfig() {
  const baseUrl = byId("baseUrl").value.trim().replace(/\/$/, "");
  const token = byId("accessToken").value.trim();
  return { baseUrl, token };
}

function saveConfig() {
  localStorage.setItem(storageKey, JSON.stringify(getConfig()));
  setResponse("Configuration", { message: "Saved in localStorage" });
}

function loadConfig() {
  try {
    const config = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (config.baseUrl) byId("baseUrl").value = config.baseUrl;
    if (config.token) byId("accessToken").value = config.token;
  } catch {
    localStorage.removeItem(storageKey);
  }
}

async function api(path, { method = "GET", body } = {}) {
  const { baseUrl, token } = getConfig();
  if (!baseUrl) {
    throw new Error("Please set API Base URL first.");
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const result = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await result.text();
  const data = text ? safeJson(text) : {};

  if (!result.ok) {
    throw new Error(`${result.status} ${result.statusText}: ${pretty(data)}`);
  }

  return data;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function guestPayload() {
  return {
    name: byId("guestName").value.trim(),
    gender: byId("guestGender").value.trim(),
  };
}

function parseGuestIds(input) {
  return input
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map(Number);
}

async function action(label, fn) {
  try {
    const result = await fn();
    setResponse(label, result);
  } catch (err) {
    setResponse(label, { error: err.message }, true);
  }
}

function registerEvents() {
  byId("saveConfig").onclick = () => saveConfig();
  byId("clearToken").onclick = () => {
    byId("accessToken").value = "";
    saveConfig();
  };

  byId("signupBtn").onclick = () =>
    action("Sign up", () =>
      api("/auth/signup", {
        method: "POST",
        body: {
          name: byId("authName").value.trim(),
          email: byId("authEmail").value.trim(),
          password: byId("authPassword").value.trim(),
        },
      })
    );

  byId("loginBtn").onclick = () =>
    action("Login", async () => {
      const res = await api("/auth/login", {
        method: "POST",
        body: {
          email: byId("authEmail").value.trim(),
          password: byId("authPassword").value.trim(),
        },
      });
      if (res.accessToken) {
        byId("accessToken").value = res.accessToken;
        saveConfig();
      }
      return res;
    });

  byId("refreshBtn").onclick = () =>
    action("Refresh token", () => api("/auth/refresh", { method: "POST" }));

  byId("searchHotelsBtn").onclick = () =>
    action("Search hotels", () => {
      const params = new URLSearchParams();
      const city = byId("searchCity").value.trim();
      const checkIn = byId("searchCheckIn").value;
      const checkOut = byId("searchCheckOut").value;
      if (city) params.set("city", city);
      if (checkIn) params.set("checkInDate", checkIn);
      if (checkOut) params.set("checkOutDate", checkOut);
      return api(`/hotels/search${params.toString() ? `?${params}` : ""}`);
    });

  byId("hotelInfoBtn").onclick = () =>
    action("Hotel details", () => api(`/hotels/${byId("hotelIdInfo").value.trim()}/info`));

  byId("initBookingBtn").onclick = () =>
    action("Initialize booking", () =>
      api("/bookings/init", {
        method: "POST",
        body: {
          hotelId: Number(byId("bookingHotelId").value),
          roomId: Number(byId("bookingRoomId").value),
          checkInDate: byId("bookingCheckIn").value,
          checkoutDate: byId("bookingCheckOut").value,
          guestIds: parseGuestIds(byId("bookingGuests").value),
        },
      })
    );

  byId("bookingStatusBtn").onclick = () =>
    action("Booking status", () => api(`/bookings/${byId("bookingId").value.trim()}/status`));

  byId("cancelBookingBtn").onclick = () =>
    action("Cancel booking", () =>
      api(`/bookings/${byId("bookingId").value.trim()}/cancel`, { method: "POST" })
    );

  byId("myBookingsBtn").onclick = () => action("My bookings", () => api("/users/myBookings"));

  byId("listGuestsBtn").onclick = () => action("My guests", () => api("/users/guests"));

  byId("addGuestBtn").onclick = () =>
    action("Add guest", () => api("/users/guests", { method: "POST", body: guestPayload() }));

  byId("updateGuestBtn").onclick = () =>
    action("Update guest", () =>
      api(`/users/guests/${byId("guestId").value.trim()}`, {
        method: "PUT",
        body: guestPayload(),
      })
    );

  byId("deleteGuestBtn").onclick = () =>
    action("Delete guest", () =>
      api(`/users/guests/${byId("guestId").value.trim()}`, {
        method: "DELETE",
      })
    );

  byId("adminHotelsBtn").onclick = () => action("Admin hotels", () => api("/admin/hotels"));

  byId("adminRoomsBtn").onclick = () =>
    action("Admin hotel rooms", () => api(`/admin/hotels/${byId("adminHotelId").value.trim()}/rooms`));

  byId("inventoryBtn").onclick = () =>
    action("Room inventory", () =>
      api(`/admin/inventory/rooms/${byId("adminRoomId").value.trim()}`)
    );

  byId("reportsBtn").onclick = () =>
    action("Hotel report", () => api(`/admin/hotels/${byId("adminHotelId").value.trim()}/reports`));
}

loadConfig();
registerEvents();
setResponse("Ready", { message: "Configure API base URL and start using endpoints." });
