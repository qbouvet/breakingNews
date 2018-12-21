import pandas as pd
import time
import json

# Read all events
base_path = "./../../data/gdelt/"
events = "events/"

mc = set();
vc = set();
mco = set();
vco = set();

add_dict = {
    1: lambda x : vc.add(x),
    2: lambda x : mc.add(x),
    3: lambda x : vco.add(x),
    4: lambda x : mco.add(x)
}

day = "20181105"
mins = ['00', '15', '30', '45']
for h in ["%.2d" % i for i in range(24)]:
    for mi in mins:

        print("About to do ", (h + mi + '00.json ...'))

        # Events
        with open(base_path + events + day + h + mi + '00.json') as f:
            euf = json.load(f)
            for event in euf:
                add_dict[event['Class']](event['Code'])

print("vc : ", vc)
print("mc : ", mc)
print("vco : ", vco)
print("mco : ", mco)
