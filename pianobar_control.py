from os import path

class PianobarControl:
    """
    Object for controlling a running pianobar instance via fifo.
    """

    def __init__(self, fifo=None):
        if not fifo:
            fifo = path.join(path.expanduser('~'), '.config/pianobar/ctl')
        self.fifo = open(path.abspath(fifo), "w")

    def play(self):
        self.fifo.write("P\n")
        self.fifo.flush()

    def pause(self):
        self.fifo.write("S\n")
        self.fifo.flush()

    def stop(self):
        self.fifo.write("q\n")
        self.fifo.flush()

    def next(self):
        self.fifo.write("n\n")
        self.fifo.flush()

    def select(self, station_id=0):
        self.fifo.write(str(station_id) + "\n")
        self.fifo.flush()

    def change_station(self, station_id):
        self.fifo.write("s" + str(station_id) + "\n")
        self.fifo.flush()

    def lower_volume(self):
        self.fifo.write("(\n")
        self.fifo.flush()

    def raise_volume(self):
        self.fifo.write(")\n")
        self.fifo.flush()

    def get_info(self):
        self.fifo.write("i\n")
        self.fifo.flush()
