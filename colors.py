'''
Besides the get_colors() function, all of this code was taken from
Charles Leifer's blog. See the article below:
http://charlesleifer.com/blog/using-python-and-k-means-to-find-the-dominant-colors-in-images/
https://github.com/coleifer/
'''
from collections import namedtuple
from math import sqrt
import random
import urllib, cStringIO

try:
    import Image
except ImportError:
    from PIL import Image

Point = namedtuple('Point', ('coords', 'n', 'ct'))
Cluster = namedtuple('Cluster', ('points', 'center', 'n'))

def get_points(img):
    points = []
    w, h = img.size
    for count, color in img.getcolors(w * h):
        points.append(Point(color, 3, count))
    return points

rtoh = lambda rgb: '#%s' % ''.join(('%02x' % p for p in rgb))

def colorz(filename, n=3):
    img = Image.open(filename)
    img.thumbnail((200, 200))
    w, h = img.size

    points = get_points(img)
    clusters = kmeans(points, n, 1)
    rgbs = [map(int, c.center.coords) for c in clusters]
    return map(rtoh, rgbs)

def euclidean(p1, p2):
    return sqrt(sum([
        (p1.coords[i] - p2.coords[i]) ** 2 for i in range(p1.n)
    ]))

def calculate_center(points, n):
    vals = [0.0 for i in range(n)]
    plen = 0
    for p in points:
        plen += p.ct
        for i in range(n):
            vals[i] += (p.coords[i] * p.ct)
    return Point([(v / plen) for v in vals], n, 1)

def kmeans(points, k, min_diff):
    clusters = [Cluster([p], p, p.n) for p in random.sample(points, k)]

    while 1:
        plists = [[] for i in range(k)]

        for p in points:
            smallest_distance = float('Inf')
            for i in range(k):
                distance = euclidean(p, clusters[i].center)
                if distance < smallest_distance:
                    smallest_distance = distance
                    idx = i
            plists[idx].append(p)

        diff = 0
        for i in range(k):
            old = clusters[i]
            center = calculate_center(plists[i], old.n)
            new = Cluster(plists[i], center, old.n)
            clusters[i] = new
            diff = max(diff, euclidean(old.center, new.center))

        if diff < min_diff:
            break

    return clusters

def get_colors(image_url):
    remote_img = cStringIO.StringIO(urllib.urlopen(image_url).read())
    return colorz(remote_img, n=10)
html = '''\
<html>
    <head>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
        <style>
            div {
                margin: 10px;
                height: 10px;
            }
        </style>
    </head>
    <body>
        <script>

        var colorz = ['#4c3537', '#5c5e88', '#c25340', '#d9c7be', '#aeb54f'];
        var more_colors = ['#85719b', '#7ea063', '#d46235', '#983a30', '#cbab93', '#4f5386', '#ce5b5f', '#b5ba45', '#e1d5cc', '#403337'];
        colorz.forEach(function(color) {
            console.log(color);
            $('body').append('<div style="background-color:'+color+';">thissss</div>');
        });
        
        $('body').append('<div>SOMETHING</div>');
        more_colors.forEach(function(color) {
            $('body').append('<div style="background-color:'+color+';">thissss</div>');
        });
        </script>
    </body>
</html>
'''


if __name__ == '__main__':
    image_url = 'http://cont-1.p-cdn.com/images/public/rovi/albumart/4/2/9/5/093624575924_500W_500H.jpg'
    image_url = 'http://cont-1.p-cdn.com/images/public/amz/5/7/6/1/900001675_500W_500H.jpg'
    print(get_colors(image_url))

