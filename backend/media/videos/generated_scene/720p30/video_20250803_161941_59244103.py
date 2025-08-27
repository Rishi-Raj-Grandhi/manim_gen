from manim import *

class DisplayText(Scene):
    def construct(self):
        text = Text("Rishi raj", font_size=72, color=BLUE)
        self.play(Write(text), run_time=2)
        self.wait(1)