from manim import *

class RectangleAnimation(Scene):
    def construct(self):
        rectangle = Rectangle(color=BLUE, fill_opacity=0.5)
        self.play(Create(rectangle))
        self.wait(1)
        self.play(FadeOut(rectangle))
