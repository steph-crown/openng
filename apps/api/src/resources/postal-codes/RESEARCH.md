Option 1 — Scrape NIPOST's own postcode finder
nipost.gov.ng/postcode-finder/ has a search UI. You can write a scraper that iterates through all states and LGAs systematically, queries the finder, and collects the results. This gives you data directly from the authoritative source. The downside: it's tedious, NIPOST's website is unreliable, and the scraper may need babysitting.

Option 2 — Community-compiled datasets (fastest)
Several websites have already done this work:

nigeriapostcodes.com — lists all 36 states and FCT with their LGAs and postal codes, arranged by NIPOST's regional system Humanitarian Data Exchange
postcode.com.ng — comprehensive database of Nigerian postal codes by state, LGA, and street level Knoema
showpostcodes.com.ng — covers every state, LGA, and area with a navigation structure of region → state → LGA data.world

None of these offer a CSV download but all are scrapeable. Cross-referencing two or three of them gives you higher confidence data.
There are also GitHub repositories with partial datasets — the arilwan/Nigeria repo has LGA data, and temikeezy/nigeria-geojson-data has states, LGAs, and wards with geographic coordinates GitHub though it notes postal codes are not yet included and invites contributions.

Option 3 — GeoNames (international dataset)
GeoNames maintains a global postal code dataset. It covers postal codes with geocoordinates parsed from GeoNames data GitHub but Nigeria's coverage is patchy at the street level — it has the major city codes but not comprehensive LGA-level coverage.

## The Recommended Approach for OpenNG
Primary source: Scrape nipost.gov.ng/postcode-finder/ for the authoritative codes. Write a script that queries by state → LGA systematically and captures everything it returns.
Cross-check: Run the same state/LGA combinations against postcode.com.ng and compare. Where they agree, mark is_verified = true. Where they differ, flag for manual review.
Gap fill: For any LGA that the NIPOST finder returns nothing for (common in rural areas), use community data from the GitHub repos as a fallback, marked with a lower confidence source.
This is more work than holidays or fuel prices — it's the first resource where you genuinely need a scraper strategy rather than a PDF download. But once seeded, it never needs updating unless NIPOST restructures their system, which happens rarely.
Worth noting: NIPOST itself says customers are advised to familiarise themselves with the postcodes of their areas GlobalPetrolPrices — which is a roundabout admission that their own postcode directory is not easily accessible. OpenNG fixing this is exactly the problem it was built to solve.
