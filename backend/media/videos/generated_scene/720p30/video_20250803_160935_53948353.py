from manim import *

class TwoRectangles(Scene):
    def construct(self):
        rect1 = Rectangle(width=2, height=1, color=BLUE, fill_opacity=0.5)
        rect2 = Rectangle(width=1, height=2, color=RED, fill_opacity=0.5)

        self.play(Create(rect1))
        self.wait(0.5)
        self.play(Transform(rect1, rect2))
        self.wait(0.5)
        self.play(FadeOut(rect1))

        self.wait(1)