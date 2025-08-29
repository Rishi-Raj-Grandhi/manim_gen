from manim import *

class RedSquare(Scene):
    def construct(self):
        square = Square(color=RED, fill_color=RED, fill_opacity=1)
        self.play(Create(square))
        self.wait(1)