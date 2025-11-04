from manim import *

class SineWave(Scene):
    def construct(self):
        sine_wave = FunctionGraph(lambda x: np.sin(x), x_min=-2*PI, x_max=2*PI, color=BLUE)
        self.play(ShowCreation(sine_wave), run_time=2)
        self.wait(1)