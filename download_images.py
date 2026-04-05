import urllib.request
import json
import re
import os

def search_duckduckgo_images(query, max_results=1):
    url = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}&t=h_&iax=images&ia=images"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        vqd_match = re.search(r'vqd=([\d-]+)', html)
        if not vqd_match:
            return []
        vqd = vqd_match.group(1)
        
        search_url = f"https://duckduckgo.com/i.js?q={urllib.parse.quote(query)}&o=json&p=1&s=0&u=bing&f=,,,&l=us-en&vqd={vqd}"
        req2 = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req2).read().decode('utf-8')
        data = json.loads(res)
        return [item['image'] for item in data.get('results', [])[:max_results]]
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []

characters = ['Duggee', 'Norrie', 'Tag', 'Roly', 'Betty']
os.makedirs('images', exist_ok=True)

for char in characters:
    print(f"Searching for {char}...")
    urls = search_duckduckgo_images(f"Hey Duggee {char} transparent character png", 5)
    success = False
    for img_url in urls:
        try:
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, timeout=10).read()
            with open(f'images/{char.lower()}.png', 'wb') as f:
                f.write(data)
            # check if valid png
            with os.popen(f'file images/{char.lower()}.png') as f:
                res = f.read()
                if 'PNG image data' in res or 'JPEG image data' in res:
                    print(f"Downloaded {char} from {img_url}")
                    success = True
                    break
        except Exception as e:
            continue
    if not success:
        print(f"Failed to download {char}")

