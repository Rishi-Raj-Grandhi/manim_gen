from manim import *

class RotateTriangle(Scene):
    def construct(self):
        triangle = Polygon(
            ORIGIN, 2 * LEFT, 2 * RIGHT,
            fill_color=GREEN, fill_opacity=1
        )
        self.play(Rotate(triangle, angle=TAU, run_time=2))