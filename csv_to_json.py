#!/usr/bin/env python
import csv
import json
from collections import defaultdict

output = defaultdict(list)

for row in csv.DictReader(open('ports.csv')):
    info = {'label': row['label']}
    if row.get('tcp'): info['tcp'] = True
    if row.get('udp'): info['udp'] = True
    if row['official'].lower() == 'official':
        info['official'] = True

    if not row['port'].isdigit():
        start, end = map(int, row['port'].decode('utf8').split(u'\u2013'))
    else:
        start = end = int(row['port'])

    for p in range(start, end+1):
        output[p].append(info)

with open('ports.json', 'w') as outfile:
    outfile.write('var ports = ')
    json.dump(output, outfile, indent=0)
