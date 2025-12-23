from manim import *

class BouncingBalls(Scene):
    def construct(self):
        balls = VGroup(*[Dot(color=color, radius=0.2).shift(3 * np.random.random_sample(3) - 1.5) for color in [BLUE, GREEN, RED]])

        self.play(Create(balls))
        self.wait(1)

        for _ in range(50):
            self.play(balls.shift, 0.5 * np.random.random_sample(3) - 0.25)
            self.wait(0.1)