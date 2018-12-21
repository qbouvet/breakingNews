import pandas as pd
import time
import json
from collections import defaultdict

# Read all events
base_path = "./../../data/gdelt/"
events = "events/"
mentions = "mentions/"
out = "./../../data/v3/"

mention2 = 0
mention_count =0

es = set();

day = "20181105"
mins = ['00', '15', '30', '45']
for h in ["%.2d" % i for i in range(24)]:
    for mi in mins:

        print("About to do ", (h + mi + '00.json ...'))

        # Events
        with open(base_path + events + day + h + mi + '00.json') as f:
            euf = json.load(f)
            for event in euf:
                es.add(event['ID']);

        # Mentions
        with open(base_path + mentions + day + h + mi + '00.json') as f:
            muf = json.load(f)
            for mention in muf:
                mention_count += 1
                if mention['GLOBALEVENTID'] in es:
                    mention2 += 1

print(mention_count)
print(mention2)
