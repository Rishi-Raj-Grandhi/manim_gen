from manim import *

class RectangleArea(Scene):
    def construct(self):
        rectangle = Rectangle(width=3, height=2, color=BLUE)
        area_text = Text("Area = Length x Breadth", color=WHITE).next_to(rectangle, DOWN)

        self.play(Create(rectangle))
        self.play(Write(area_text))
        self.wait(2)
        self.play(FadeOut(rectangle), FadeOut(area_text))