# Usage: git clone --depth 1 https://github.com/openchargemap/ocm-export (or a sparse checkout of data/US)
#        python3 scripts/build-charger-snapshot.py ocm-export/data src/data/chargers-demo-venue.json 39.6402 -104.7311 15
# Builds a compact snapshot of real public EV chargers near a point from the OCM export.
import json, math, os, sys
data_dir, out_path, lat0, lng0, radius = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
ref = json.load(open(os.path.join(data_dir, "referencedata.json")))
by = lambda k: {x["ID"]: x for x in ref[k]}
ops, ctypes, status, usage, prov = by("Operators"), by("ConnectionTypes"), by("StatusTypes"), by("UsageTypes"), by("DataProviders")
OPEN_PROVIDERS = {1: "Open Charge Map contributors (CC BY 4.0)", 2: "NREL / U.S. Department of Energy (any use)"}
PLUG = {"Type 1 (J1772)": "J1772", "CCS (Type 1)": "CCS", "CHAdeMO": "CHAdeMO", "NACS / Tesla Supercharger": "NACS (Tesla)",
        "Tesla (Model S/X)": "NACS (Tesla)", "Tesla (Roadster)": "Tesla Roadster", "NEMA 5-15R": "NEMA 5-15", "NEMA 5-20R": "NEMA 5-20", "NEMA 14-50R": "NEMA 14-50"}
def miles(a, b, c, d):
    r = math.radians; h = math.sin(r(c - a) / 2) ** 2 + math.cos(r(a)) * math.cos(r(c)) * math.sin(r(d - b) / 2) ** 2
    return 2 * 3958.8 * math.asin(math.sqrt(h))
out, skipped = [], {"private": 0, "license": 0, "closed": 0}
for name in os.listdir(os.path.join(data_dir, "US")):
    p = json.load(open(os.path.join(data_dir, "US", name)))
    a = p.get("AddressInfo") or {}
    la, lo = a.get("Latitude"), a.get("Longitude")
    if la is None or lo is None: continue
    d = miles(lat0, lng0, la, lo)
    if d > radius: continue
    if p.get("DataProviderID") not in OPEN_PROVIDERS: skipped["license"] += 1; continue
    u = usage.get(p.get("UsageTypeID") or 0, {})
    if u and "private" in (u.get("Title") or "").lower(): skipped["private"] += 1; continue
    st = status.get(p.get("StatusTypeID") or 0, {})
    if st and st.get("IsOperational") is False and "Removed" in (st.get("Title") or ""): skipped["closed"] += 1; continue
    fast = l2 = 0; plugs = []; kw = 0
    for c in p.get("Connections") or []:
        q = max(1, c.get("Quantity") or 1); pk = c.get("PowerKW") or 0; kw = max(kw, pk)
        if c.get("LevelID") == 3 or pk >= 50: fast += q
        elif c.get("LevelID") != 1: l2 += q
        t = (ctypes.get(c.get("ConnectionTypeID") or 0) or {}).get("Title")
        if t and "unknown" not in t.lower(): plugs.append(PLUG.get(t, t))
    if not fast and not l2 and p.get("NumberOfPoints"): l2 = p["NumberOfPoints"]
    op = (ops.get(p.get("OperatorID") or 0) or {}).get("Title") or ""
    rec = {"id": f"ocm:{p['ID']}", "name": (a.get("Title") or "EV charging").strip(), "lat": round(la, 6), "lng": round(lo, 6),
           "fast": fast, "l2": l2, "plugs": sorted(set(plugs))}
    line, town = (a.get("AddressLine1") or "").strip(), (a.get("Town") or "").strip()
    addr = line if town and town.lower() in line.lower() else ", ".join(x for x in [line, town] if x)
    if addr: rec["addr"] = addr.strip()
    if op and "unknown" not in op.lower() and "business owner" not in op.lower(): rec["net"] = op
    if kw: rec["kw"] = round(kw)
    if p.get("UsageCost"): rec["cost"] = p["UsageCost"].strip()[:60]
    if st and st.get("IsOperational") is False: rec["down"] = True
    rec["src"] = p["DataProviderID"]
    out.append(rec)
out.sort(key=lambda r: miles(lat0, lng0, r["lat"], r["lng"]))
meta = {"center": {"lat": lat0, "lng": lng0}, "radiusMiles": radius, "count": len(out), "sources": OPEN_PROVIDERS,
        "attribution": "Charging station data © Open Charge Map contributors (CC BY 4.0, openchargemap.org) and NREL / U.S. DOE Alternative Fuels Data Center."}
json.dump({"meta": meta, "stations": out}, open(out_path, "w"), separators=(",", ":"), ensure_ascii=False)
print(json.dumps(meta)); print("skipped", skipped)
print("fast sites:", sum(1 for r in out if r["fast"]), "| L2-only:", sum(1 for r in out if not r["fast"]))
for r in out[:5]: print(" ", r)
