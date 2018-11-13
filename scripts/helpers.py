import pandas as pd
import requests as req
import zipfile
import io
import os

def download_data(url):
    print(url)
    # Request ZIP
    r = req.get(url)
        
    # Extract from ZIP
    z = zipfile.ZipFile(io.BytesIO(r.content)) 
    z.extractall()

E_cols = [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 29, 30, 31, 32, 33, 34, 35, 36, 37, 40, 41, 43, 44, 45, 48, 49, 51, 52, 53, 56, 57, 59, 60]

E_names = ['GLOBALEVENTID', 'Actor1Code', 'Actor1Name', 'Actor1CountryCode', 'Actor1KnownGroupCode', 'Actor1EthnicCode', 'Actor1Religion1Code', 'Actor1Religion2Code', 'Actor1Type1Code', 'Actor1Type2Code', 'Actor1Type3Code', 'Actor2Code', 'Actor2Name', 'Actor2CountryCode', 'Actor2KnownGroupCode', 'Actor2EthnicCode', 'Actor2Religion1Code', 'Actor2Religion2Code', 'Actor2Type1Code', 'Actor2Type2Code', 'Actor2Type3Code', 'EventCode', 'QuadClass', 'GoldsteinScale', 'NumMentions', 'NumSources', 'NumArticles', 'AvgTone', 'Actor1Geo_Type', 'Actor1Geo_FullName', 'Actor1Geo_CountryCode', 'Actor1Geo_Lat', 'Actor1Geo_Long', 'Actor2Geo_Type', 'Actor2Geo_FullName', 'Actor2Geo_CountryCode', 'Actor2Geo_Lat', 'Actor2Geo_Long', 'ActionGeo_Type', 'ActionGeo_FullName', 'ActionGeo_CountryCode', 'ActionGeo_Lat', 'ActionGeo_Long', 'DATEADDED', 'SOURCEURL']

M_cols = [0, 1, 2, 3, 4, 5, 11, 12, 13]

M_names = ['GLOBALEVENTID', 'EventTimeDate', 'MentionTimeDate', 'MentionType', 'MentionSourceName', 'MentionIdentifier', 'Confidence', 'MentionDocLen', 'MentionDocTone']

def read_event_csv(filename):
    # Read csv file
    E_df = pd.read_csv(filename, encoding='utf-8', sep='\t', header=None, usecols=E_cols)
    E_df.columns = E_names
    return E_df

def read_mention_csv(filename, events):
    # Read csv file
    M_df = pd.read_csv(filename, encoding='utf-8', sep='\t', header=None, usecols=M_cols)
    M_df.columns = M_names
    
    # Take only WEB mentions
    M_df = M_df[M_df.MentionType == 1]

    # Take only mentions of the event set (older ones are useless)
    M_df = M_df[M_df.GLOBALEVENTID.isin(events)]
    
    return M_df  

def to_json(filename, df):
    
    DATA_FOLDER ='./../data/week/'
    
    # Write json
    json_name = DATA_FOLDER + filename
    df.to_json(json_name, orient='records')
    
def delete_csv():
    dir_name = "./"
    test = os.listdir(dir_name)

    for item in test:
        if item.endswith(".CSV"):
            os.remove(os.path.join(dir_name, item))