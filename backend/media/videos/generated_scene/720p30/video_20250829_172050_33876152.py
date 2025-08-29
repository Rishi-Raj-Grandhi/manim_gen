from manim import *

class CirclesMoving(Scene):
    def construct(self):
        circle1 = Circle(color=GREEN).shift(LEFT*2)
        circle2 = Circle(color=RED).shift(RIGHT*2)

        self.play(Create(circle1), run_time=2)
        self.play(Create(circle2), run_time=2)
        self.play(
            circle1.animate.shift(RIGHT*4),
            circle2.animate.shift(RIGHT*4),
            run_time=4
        )
        self.wait(1)