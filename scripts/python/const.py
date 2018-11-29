
## Date
YEAR_MONTH_DAY = '20181105'
MINUTES = ['00', '15', '30', '45']

# Download
BASE_URL = 'http://data.gdeltproject.org/gdeltv2/'
E = '.export'
M = '.mentions'
CSV = '.CSV'
ZIP = '.zip'

# Event table
E_cols = [0, 6, 7, 16, 17, 26, 29, 52, 56, 57, 59, 60]
E_names = ['ID', 'Actor1', 'Actor1_Country', 'Actor2', 'Actor2_Country', 'Code', 'Class', 'Action_Location', 'Lat', 'Long', 'Timestamp', 'Source']
E_not_nan = ['Actor1', 'Actor2', 'Code', 'Class', 'Lat', 'Long']

# Mentions
M_cols = [0, 1, 2, 3, 4, 5]
M_names = ['GLOBALEVENTID', 'EventTimeDate', 'MentionTimeDate', 'MentionType', 'MentionSourceName', 'MentionIdentifier']

## TODO: remove events with null Action_Location
## prepare final dataset
##
