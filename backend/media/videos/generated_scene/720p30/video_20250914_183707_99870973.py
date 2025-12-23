from manim import *

class BouncingBoobs(Scene):
    def construct(self):
        boobs = SVGMobject("boobs.svg").set_fill(RED, opacity=1).scale(2)
        
        self.play(ShowCreation(boobs), run_time=2)
        self.play(boobs.animate.shift(UP*2).set_fill(BLUE, opacity=1), run_time=1)
        self.play(boobs.animate.shift(DOWN*4).set_fill(GREEN, opacity=1), run_time=1)
        self.play(boobs.animate.shift(UP*2).set_fill(YELLOW, opacity=1), run_time=1)
        self.wait(1)