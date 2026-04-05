import urllib.request
import json
import re
import urllib.parse

def search_duckduckgo(query):
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        links = re.findall(r'href="(https?://[^"]+)"', html)
        return links
    except Exception as e:
        print(e)
        return []

links = search_duckduckgo("site:101soundboards.com hey duggee")
print(links[:10])
