from bs4 import BeautifulSoup, element
import requests

def get_artist_bio(artist):
    wiki_artist = artist.title().replace(' ','_')
    url = 'https://en.wikipedia.org/wiki/%s'%(wiki_artist)
    res = requests.get(url)
    soup = BeautifulSoup(res.text, 'html.parser')

    i = 0
    html = ''
    for child in soup.find("div", {"id": "mw-content-text"}).children:
        if isinstance(child, element.Tag):
            if child.name == 'p':
                html += str(child)
            #print child print child.get('class')
            if child.get('class') == 'tac':
                break
        if i > 10: break
        i+=1
    html = html.replace('/wiki/', 'https://en.wikipedia.org/wiki/').replace(
            '#cite_note', str(res.url) + '#cite_note')
    html += '<p><a href="%s">Read more at wikipedia</a></p>' %str(res.url)
    return html

if __name__ == '__main__':
    main()
