import pandas as pd
import time
import json
from collections import defaultdict

# Read all events
base_path = "./../../data/gdelt/"
events = "events/"
mentions = "mentions/"
out = "./../../data/v3/"

event_count = 0
mention_count =0

ec = defaultdict(lambda: 0)

day = "20181105"
mins = ['00', '15', '30', '45']
for h in ["%.2d" % i for i in range(24)]:
    for mi in mins:

        print("About to do ", (h + mi + '00.json ...'))

        # Events
        with open(base_path + events + day + h + mi + '00.json') as f:
            euf = json.load(f)
            for event in euf:
                event_count += 1


        # Mentions
        with open(base_path + mentions + day + h + mi + '00.json') as f:
            muf = json.load(f)
            for mention in muf:
                mention_count += 1
                ec[mention['GLOBALEVENTID']] = ec[mention['GLOBALEVENTID']] + 1

ekeep = []
count2 = 0;
for k, v in ec.items():
    if v > 5:
        count2 += 1
        ekeep.append(k)

print(event_count)
print(count2)
print(mention_count)

count3=0;
for h in ["%.2d" % i for i in range(24)]:
    for mi in mins:

        print("About to do ", (h + mi + '00.json ...'))

        # Events
        with open(base_path + events + day + h + mi + '00.json') as f:
            euf = json.load(f)
            ek = []
            for event in euf:
                if event['ID'] in ekeep:
                    ek.append(event)
                    if event['Action_Location'] == 'null' or event['Source'] == 'null':
                        print(event)

        ename = "events/" + day + h + mi + '00.json'
        with open(ename, "w", encoding='utf-8') as out:
            json.dump(ek, out)


        # Mentions
        with open(base_path + mentions + day + h + mi + '00.json') as f:
            muf = json.load(f)
            mf = []
            for mention in muf:
                nm = {}
                nm['GLOBALEVENTID'] = mention['GLOBALEVENTID']
                nm['EventTimeDate'] = mention['EventTimeDate']
                nm['MentionTimeDate'] = mention['MentionTimeDate']
                nm['MentionSourceName'] = mention['MentionSourceName']
                if nm['GLOBALEVENTID'] in ekeep:
                    mf.append(nm)

        mname = "mentions/" + day + h + mi + '00.json'
        with open(mname, "w", encoding='utf-8') as out:
            json.dump(mf, out)

print(count3)
