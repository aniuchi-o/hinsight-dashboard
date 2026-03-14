import os
import sqlite3

paths = [
    r"C:\Users\tonyc\hinsight-dashboard-backend\hinsight_ca.db",
    r"C:\Users\tonyc\hinsight-dashboard-backend\hinsight_us.db",
]

q = """
SELECT ts, region, actor_type, actor_id, action, resource, outcome, status_code, request_id
FROM audit_events
ORDER BY ts DESC
LIMIT 10;
"""

for p in paths:
    print("\n==============================")
    print("DB:", os.path.basename(p))
    print("==============================")
    conn = sqlite3.connect(p)
    cur = conn.cursor()
    cur.execute(q)
    rows = cur.fetchall()
    for r in rows:
        print(r)
    conn.close()
