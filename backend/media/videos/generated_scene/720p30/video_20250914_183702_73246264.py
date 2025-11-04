from manim import *

class BouncingBoobs(Scene):
    def construct(self):
        boobs = SVGMobject("boobs.svg").set_fill(PINK).scale(2)
        
        self.play(ShowCreation(boobs), run_time=2)
        self.play(ApplyMethod(boobs.shift, UP*2), rate_func=there_and_back, run_time=1)
        self.play(ApplyMethod(boobs.shift, DOWN*2), rate_func=there_and_back, run_time=1)
        self.wait(1)