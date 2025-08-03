from manim import *

class BallAnimation(Scene):
    def construct(self):
        ball = Circle(color=BLUE, fill_opacity=1).shift(UP*2)
        self.play(Create(ball))
        self.play(ball.animate.shift(DOWN*4), rate_func=there_and_back, run_time=2)