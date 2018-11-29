from const import *
from gdelt_dictionaries import *

import pandas as pd
import numpy as np
import requests as req
import os
import zipfile
import io


def download_data(url):
	print('Dowloading %s' % url)

	# Request ZIP
	r = req.get(url)

	# Extract from ZIP
	z = zipfile.ZipFile(io.BytesIO(r.content))
	z.extractall()


def delete_csv():
	dir_name = "./"
	test = os.listdir(dir_name)

	for item in test:
		if item.endswith(".CSV"):
			os.remove(os.path.join(dir_name, item))


def read_event_csv(filename):
	# Read csv file
	E_df = pd.read_csv(filename, encoding='utf-8', sep='\t', header=None, usecols=E_cols)
	E_df.columns = E_names

	# Drop nans
	E_df = E_df.dropna(axis=0, subset=E_not_nan)
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

def to_json_events(filename, df):

	folder ='./../../data/gdelt/events/'
	json_name = folder + filename
	df.to_json(json_name, orient='records')


def to_json_mentions(filename, df):

	folder ='./../../data/gdelt/mentions/'

	# Write json
	json_name = folder + filename
	df.to_json(json_name, orient='records')


def join_names(d, h, m):
	t = YEAR_MONTH + d + h + m + '00'
	E_f = t + E + CSV
	E_u = BASE_URL + E_f + ZIP
	M_f = t + M + CSV
	M_u = BASE_URL + M_f + ZIP

	return t, E_f, E_u, M_f, M_u

def iterate_week():

	# Keep track of week events to filter mentions
	events = np.ndarray([0,])

	for d in ["%.2d" % (i + START_DAY) for i in range(7)]:
		for h in ["%.2d" % i for i in range(24)]:
			for m in MINUTES:

				# Define names
				timestamp, E_filename, E_url, M_filename, M_url = join_names(d, h, m)

				# Download events
				download_data(E_url)
				E_df = read_event_csv(E_filename)
				events = np.concatenate([events, E_df.ID.values])

				# Download mentions
				download_data(M_url)
				M_df = read_mention_csv(M_filename, events)

				# Write to json
				to_json_events(timestamp + '.json', E_df)
				to_json_mentions(timestamp + '.json', M_df)

				# Clean directory
				delete_csv()

iterate_week()
