from manim import *

class RollingBall(Scene):
    def construct(self):
        ball = Circle(color=BLUE, fill_opacity=1).shift(UP*3)
        self.play(Create(ball))
        
        self.play(ApplyMethod(ball.shift, RIGHT*6), run_time=2)
        self.play(ApplyMethod(ball.shift, DOWN*3), run_time=2)
        self.play(ApplyMethod(ball.shift, LEFT*6), run_time=2)
        self.play(ApplyMethod(ball.shift, UP*3), run_time=2)
        
        self.wait(1)