from manim import *

class RedCircleAnimation(Scene):
    def construct(self):
        circle = Circle(color=RED, fill_opacity=1)
        self.play(Create(circle))
        self.wait(1)
        self.play(FadeOut(circle))
