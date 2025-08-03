from manim import *

class RedTriangle(Scene):
    def construct(self):
        triangle = Polygon(
            ORIGIN, 3 * LEFT, 3 * RIGHT,
            fill_color=RED, fill_opacity=1, stroke_width=0
        )
        self.play(Create(triangle), run_time=2)
        self.wait(1)