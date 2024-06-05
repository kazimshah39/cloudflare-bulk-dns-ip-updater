import axios from "axios";

// Replace with your Cloudflare API token
const API_TOKEN = "your_cloudflare_api_token";
const OLD_IP = "89.117.9.69";
const NEW_IP = "89.117.9.70";

const apiClient = axios.create({
  baseURL: "https://api.cloudflare.com/client/v4",
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

async function getZones() {
  try {
    const response = await apiClient.get("/zones");
    if (!response.data.success) {
      throw new Error(
        "Failed to fetch zones: " +
          response.data.errors.map((e) => e.message).join(", ")
      );
    }
    return response.data.result;
  } catch (error) {
    console.error("Error fetching zones:", error.message);
    throw error;
  }
}

async function getDNSRecords(zoneId) {
  try {
    const response = await apiClient.get(`/zones/${zoneId}/dns_records`);
    if (!response.data.success) {
      throw new Error(
        "Failed to fetch DNS records: " +
          response.data.errors.map((e) => e.message).join(", ")
      );
    }
    return response.data.result;
  } catch (error) {
    console.error(
      "Error fetching DNS records for zone",
      zoneId,
      ":",
      error.message
    );
    throw error;
  }
}

async function updateDNSRecord(zoneId, record) {
  const payload = {
    type: record.type,
    name: record.name,
    content: NEW_IP,
    ttl: record.ttl,
    proxied: record.proxied,
  };

  try {
    console.log(`Updating DNS record with payload: ${JSON.stringify(payload)}`);
    const response = await apiClient.put(
      `/zones/${zoneId}/dns_records/${record.id}`,
      payload
    );
    if (!response.data.success) {
      throw new Error(
        "Failed to update DNS record: " +
          response.data.errors.map((e) => e.message).join(", ")
      );
    }
    return response.data.result;
  } catch (error) {
    console.error(
      "Error updating DNS record",
      record.id,
      "in zone",
      zoneId,
      ":",
      error.message
    );
    throw error;
  }
}

async function updateAllRecords() {
  try {
    const zones = await getZones();
    for (const zone of zones) {
      const records = await getDNSRecords(zone.id);
      for (const record of records) {
        if (record.content === OLD_IP) {
          await updateDNSRecord(zone.id, record);
          console.log(
            `Updated record ${record.id} in zone ${zone.id} to new IP ${NEW_IP}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

updateAllRecords();
