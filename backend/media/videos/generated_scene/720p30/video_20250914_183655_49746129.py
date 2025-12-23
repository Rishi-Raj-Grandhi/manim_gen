from manim import *

class BouncingBoobs(Scene):
    def construct(self):
        boobs = SVGMobject("boobs.svg").set_color(RED).scale(2)
        
        self.play(ShowCreation(boobs), rate_func=there_and_back, run_time=2)
        self.wait(1)
        self.play(ApplyMethod(boobs.shift, UP), rate_func=there_and_back, run_time=1)
        self.wait(1)
        self.play(ApplyMethod(boobs.shift, DOWN), rate_func=there_and_back, run_time=1)
        self.wait(1)
        self.play(ApplyMethod(boobs.shift, UP), rate_func=there_and_back, run_time=1)
        self.wait(1)