from bs4 import BeautifulSoup
import requests

def get_first_p(artist):
    wiki_artist = artist.title().replace(' ','_')
    url = 'https://en.wikipedia.org/wiki/%s'%(wiki_artist)
    soup = BeautifulSoup(requests.get(url).text)
    artist_info = str(soup.find("div", {"id": "mw-content-text"}).find('p'))
    return artist_info.replace('/wiki/', 'https://en.wikipedia.org/wiki/')
    
if __name__ == '__main__':
    main()
