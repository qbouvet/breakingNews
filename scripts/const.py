
## Date
YEAR_MONTH = '201811'
START_DAY = 5;
MINUTES = ['00', '15', '30', '45']

# Download
BASE_URL = 'http://data.gdeltproject.org/gdeltv2/'
E = '.export'
M = '.mentions'
CSV = '.CSV'
ZIP = '.zip'

# Event table
E_cols = [0, 6, 7, 16, 17, 26, 29, 36, 44, 52, 56, 57, 59, 60]
E_names = ['ID', 'Actor1', 'Actor1_Country', 'Actor2', 'Actor2_Country', 'Code', 'Class', 'Actor1_Location', 'Actor2_Location', 'Action_Location', 'Lat', 'Long', 'Timestamp', 'Source']
E_not_nan = ['Actor1', 'Actor2', 'Code', 'Class']

# Mentions
M_cols = [0, 1, 2, 3, 4, 5, 11, 12, 13]
M_names = ['GLOBALEVENTID', 'EventTimeDate', 'MentionTimeDate', 'MentionType', 'MentionSourceName', 'MentionIdentifier', 'Confidence', 'MentionDocLen', 'MentionDocTone']
