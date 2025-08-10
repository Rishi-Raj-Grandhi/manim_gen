from manim import *

class RectangleWithTriangle(Scene):
    def construct(self):
        rectangle = Rectangle(height=3, width=4, color=BLUE, fill_opacity=0.5)
        triangle = Triangle(color=GREEN, fill_opacity=0.5).scale(0.5).shift(LEFT)

        self.play(Create(rectangle))
        self.play(Create(triangle))
        self.wait(1)
        self.play(FadeOut(rectangle), FadeOut(triangle))
