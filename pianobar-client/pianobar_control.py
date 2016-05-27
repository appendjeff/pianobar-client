from os import path

class PianobarControl:
    """
    Object for controlling a running pianobar instance via fifo.
    """

    def __init__(self, fifo=None):
        if not fifo:
            fifo = path.join(path.expanduser('~'), '.config/pianobar/ctl')
        self.fifo = open(path.abspath(fifo), "w")

    def call(self, command):
        self.fifo.write(''.join([command, '\n']))
        self.fifo.flush()

    def play(self):
        self.call("P")

    def pause(self):
        self.call("S")

    def stop(self):
        self.call("q")

    def next(self):
        self.call("n")

    def select(self, station_id=0):
        self.call(str(station_id))

    def change_station(self, station_id):
        self.call("s" + str(station_id))

    def lower_volume(self):
        self.call("(")

    def raise_volume(self):
        self.call(")")

    def get_info(self):
        self.call("i")
