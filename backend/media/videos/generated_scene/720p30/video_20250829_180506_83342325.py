from manim import *

class TwoCirclesMoving(Scene):
    def construct(self):
        circle1 = Circle(color=RED, fill_opacity=0.5)
        circle2 = Circle(color=GREEN, fill_opacity=0.5)
        
        circle1.move_to(LEFT*3)
        circle2.move_to(RIGHT*3)
        
        self.play(Create(circle1), Create(circle2))
        self.play(
            circle1.animate.shift(RIGHT*6),
            circle2.animate.shift(RIGHT*6)
        )
        self.wait(1)