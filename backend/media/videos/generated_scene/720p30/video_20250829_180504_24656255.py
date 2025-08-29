from manim import *

class TwoCirclesMoving(Scene):
    def construct(self):
        circle1 = Circle(color=RED, radius=1)
        circle2 = Circle(color=GREEN, radius=1)

        circle1.shift(LEFT*2)
        circle2.shift(LEFT*2)

        self.play(Create(circle1), Create(circle2))
        self.play(
            circle1.animate.shift(RIGHT*4),
            circle2.animate.shift(RIGHT*4),
            run_time=2
        )
        self.wait(1)