from manim import *

class SineWave(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-2*PI, 2*PI, PI/2],
            y_range=[-1, 1, 0.5],
            axis_config={"color": BLUE},
        )

        sine_graph = axes.plot(lambda x: np.sin(x), color=GREEN)
        
        self.play(Create(axes), Create(sine_graph), run_time=2)
        self.wait(2)