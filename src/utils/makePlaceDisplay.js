export function makePlaceDisplay(it = {}) {
  const name = (it.name || "").trim();
  const prov = (it.provinceName || "").trim();
  const hasDistinctProvince = prov && prov !== name && !prov.includes(name);

  const parts = [];
  if (hasDistinctProvince) parts.push(prov);
  if (it.countryCode === "VN") parts.push("Việt Nam");
  else if (it.countryName) parts.push(it.countryName);

  return `${name}${parts.length ? `, ${parts.join(", ")}` : ""}`;
}