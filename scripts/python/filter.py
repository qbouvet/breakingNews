import pandas as pd
import time
import json

# Read all events
base_path = "./../../data/gdelt/"
events = "events/"
mentions = "mentions/"
out = "./../../data/v2/"

kepe = pd.Series(pd.read_csv("./../../data/gdelt/keptEvents.csv", encoding='utf-8', header=None, names=['ID']).ID)
kepm = pd.Series(pd.read_csv("./../../data/gdelt/keptSources.csv", encoding='utf-8', header=None, names=['Name']).Name)

day = "20181105"
mins = ['00', '15', '30', '45']
for h in ["%.2d" % i for i in range(24)]:
    for mi in mins:

        print("About to do ", (h + mi + '00.json ...'))

        #e = pd.read_json(base_path + events + day + h + mi + '00.json', orient='records')
        #m = pd.read_json(base_path + mentions + day + h + mi + '00.json', orient='records')

        # Events
        with open(base_path + events + day + h + mi + '00.json') as f:
            euf = json.load(f)
            ef = []
            for event in euf:
                if event['ID'] in kepe.values:
                    ef.append(event)

        ename = "events/" + day + h + mi + '00.json'
        with open(ename, "w", encoding='utf-8') as out:
            json.dump(ef, out)

        # Mentions
        with open(base_path + mentions + day + h + mi + '00.json') as f:
            muf = json.load(f)
            mf = []
            for mention in muf:
                if mention['GLOBALEVENTID'] in kepe.values and mention['MentionSourceName'] in kepm.values:
                    mf.append(mention)

        mname = "mentions/" + day + h + mi + '00.json'
        with open(mname, "w", encoding='utf-8') as out:
            json.dump(mf, out)
