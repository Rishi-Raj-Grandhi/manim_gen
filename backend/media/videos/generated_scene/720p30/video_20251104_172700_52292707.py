from manim import *

class BallScene(Scene):
    def construct(self):
        ball = Circle(color=BLUE, fill_opacity=1).scale(0.5)
        self.play(Create(ball))
        self.wait(1)