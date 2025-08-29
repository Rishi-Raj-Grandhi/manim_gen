from manim import *

class MyScene(Scene):
    def construct(self):
        circle = Circle(color=WHITE)
        triangle = Triangle(color=GREEN)

        self.play(Create(circle))
        self.wait(1)
        self.play(Transform(circle, triangle))
        self.wait(1)