This script uses the Cloudflare API to fetch DNS zones and their records, replacing any record with the specified old IP address with a new IP address.

- The `getZones` and `getDNSRecords` functions fetch zones and DNS records.
- The `updateDNSRecord` function updates records with the new IP.
- The `updateAllRecords` function orchestrates these steps.
