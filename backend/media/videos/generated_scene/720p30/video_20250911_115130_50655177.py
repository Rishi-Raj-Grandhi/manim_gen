from manim import *

class SineWave(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-2*PI, 2*PI, PI/2],
            y_range=[-1, 1, 0.5],
            axis_config={"color": BLUE},
        )

        sine_graph = axes.get_graph(lambda x: np.sin(x), color=GREEN, x_range=[-2*PI, 2*PI])

        self.play(Create(axes), Create(sine_graph), run_time=2)
        self.wait(1)