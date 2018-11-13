from helpers import *
import pandas as pd
import numpy as np

## Date constants
YEAR_MONTH = '201811'
START_DAY = 5;
MINUTES = ['00', '15', '30', '45']

# Constants
BASE_URL = 'http://data.gdeltproject.org/gdeltv2/'
E = '.export'
M = '.mentions'
CSV = '.CSV'
ZIP = '.zip'

# Keep track of week events to filter mentions
events = np.ndarray([0,])

for d in ["%.2d" % (i + START_DAY) for i in range(7)]:
    for h in ["%.2d" % i for i in range(24)]:
        for m in MINUTES:
        
            # Define names
            timestamp = YEAR_MONTH + d + h + m + '00'
            E_filename = timestamp + E + CSV
            E_url = BASE_URL + E_filename + ZIP
            M_filename = timestamp + M + CSV 
            M_url = BASE_URL + M_filename + ZIP

            # Download events
            download_data(E_url)
            E_df = read_event_csv(E_filename)
            events = np.concatenate([events, E_df.GLOBALEVENTID.values])
            
            # Download mentions
            download_data(M_url)
            M_df = read_mention_csv(M_filename, events)
            
            # Write to json
            to_json('E_' + timestamp + '.json', E_df)
            to_json('M_' + timestamp + '.json', M_df)
            
# Clean directory
delete_csv()