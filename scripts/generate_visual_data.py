import re
import json

with open("scripts/raw_visual_pdf.txt") as f:
    lines = [l.strip() for l in f if l.strip()]

records = []

for idx, line in enumerate(lines):
    pct_match = re.search(r"(\d+(?:\.\d+)?%)", line)
    pct_str = pct_match.group(1)
    pct_start = pct_match.start()
    pct_end = pct_match.end()
    
    before_pct = line[:pct_start].strip().split()
    after_pct = line[pct_end:].strip()
    
    fail_qty = int(before_pct[-1])
    pass_qty = int(before_pct[-2])
    total_check = int(before_pct[-3])
    
    month = before_pct[0]
    raw_date = before_pct[1]
    model = " ".join(before_pct[2:-3])
    
    layer = "Single Side"
    product = after_pct
    if "Double Side" in after_pct:
        layer = "Double Side"
        product = after_pct.replace("Double Side", "").strip()
    elif "Single Side" in after_pct:
        layer = "Single Side"
        product = after_pct.replace("Single Side", "").strip()
    elif "Add Layer Please......" in after_pct:
        layer = "Add Layer Please......"
        product = after_pct.replace("Add Layer Please......", "").strip()
    
    d_clean = raw_date.replace("//", "/")
    parts = d_clean.split("/")
    if len(parts) == 3:
        m, d, y = parts[0], parts[1], parts[2]
        if len(y) == 2:
            y = "20" + y
        iso_date = f"{y}-{m.zfill(2)}-{d.zfill(2)}"
    else:
        iso_date = raw_date

    rec = {
        "id": f"pcb-vis-{idx+1:03d}",
        "sheet": "visual",
        "date": iso_date,
        "Date": iso_date,
        "Month": month,
        "month": month,
        "model": model,
        "Model": model,
        "Product": product,
        "product": product,
        "Layer": layer,
        "layer": layer,
        "checkQty": total_check,
        "Total Check": str(total_check),
        "Pass QTY": str(pass_qty),
        "faultQty": fail_qty,
        "Fail QTY": str(fail_qty),
        "Fail percentage": pct_str,
        "faultRate": float(pct_str.replace("%", "")),
        "rawDate": raw_date,
        "createdAt": f"{iso_date}T08:00:00.000Z"
    }
    records.append(rec)

ts_content = f"""import type {{ PcbQualityRecord }} from '../services/pcbRecords';

export const PCB_VISUAL_RECORDS: PcbQualityRecord[] = {json.dumps(records, indent=2)};
"""

with open("src/data/pcbVisualRecords.ts", "w") as out:
    out.write(ts_content)

print(f"Generated src/data/pcbVisualRecords.ts with {len(records)} records.")
