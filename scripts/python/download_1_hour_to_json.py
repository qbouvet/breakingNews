'''
Author: Tobia Albergoni

Launch this script with an argument in the format YYYYMMDDHH, and it will download the 4 updates of the
GDELT 2.0 database during that hour (HH:00, HH:15, HH:30, HH:45) and convert them to json files ready
to be loaded by the visualization.
'''

# Imports
import pandas as pd
import requests as req
import zipfile
import io
import sys
import os

# Get arguments
yyyymmddhh = sys.argv[1]

# Constants
data_folder ='./../data/gdeltjson/'
base_URL = 'http://data.gdeltproject.org/gdeltv2/'
events_URL = '.export'
mentions_URL = '.mentions'
ext_csv = '.CSV'
ext_zip = '.zip'

relevant_cols_events = [0, 31, 32, 33, 53, 56, 57, 59]
header_events = ['ID', '#Mentions', '#Sources', '#Articles', 'CountryCode', 'Lat', 'Long', 'Date']

relevant_cols_mentions = [0, 4]
header_mentions = ['ID', 'Source']

# Functions

# This will download the 4 updates of the given hour (00, 15, 30, 45)
def download_data(GDELT_type, YMDH):
    
    hours_ticks = ['00', '15', '30', '45']
    filenames = []
    
    # For each of the 4 updates
    for minutes in hours_ticks:
        # Store filename
        filename =  YMDH + minutes + '00' + GDELT_type + ext_csv
        filenames.append(filename)
        
        # Request ZIP
        req_URL = base_URL + filename + ext_zip
        r = req.get(req_URL)
        
        # Extract from ZIP
        z = zipfile.ZipFile(io.BytesIO(r.content)) 
        z.extractall()
    
    return filenames

# This will turn a csv file into a cleaned JSON
def to_clean_json(filename, GDELT_type):
        
    # Read csv file
    cols = relevant_cols_events if (GDELT_type == events_URL) else relevant_cols_mentions
    df = pd.read_csv(filename, encoding='utf-8', sep='\t', header=None, usecols=cols)
    
    # Clean the dataframe
    header = header_events if(GDELT_type == events_URL) else header_mentions
    df.columns = header
    
    if (GDELT_type == mentions_URL):
        df = df.groupby(['ID']).apply(lambda x: set(x['Source'].values))
        
    # Write json
    json_name = data_folder + filename.split('.')[0] + GDELT_type + '.json'
    df.to_json(json_name, orient='records')
    
def delete_csv():
    dir_name = "./"
    test = os.listdir(dir_name)

    for item in test:
        if item.endswith(".CSV"):
            os.remove(os.path.join(dir_name, item))


# Download csv files
events_filenames = download_data(events_URL, yyyymmddhh)
mentions_filenames = download_data(mentions_URL, yyyymmddhh)

# Convert to JSON
for ef in events_filenames:
    to_clean_json(ef, events_URL)

for mf in mentions_filenames:
    to_clean_json(mf, mentions_URL)
    
# Cleanup folder
delete_csv()

