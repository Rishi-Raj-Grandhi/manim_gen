from manim import *

class RIhsiRaj(Scene):
    def construct(self):
        text = Text("RIhsi raj", font="Arial").scale(2)
        text.set_color(RED)
        
        self.play(Write(text), run_time=2)
        self.wait(1)
        self.play(FadeOut(text), run_time=1)