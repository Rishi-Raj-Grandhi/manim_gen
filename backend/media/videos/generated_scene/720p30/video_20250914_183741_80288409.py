from manim import *

class BouncingBalls(Scene):
    def construct(self):
        balls = VGroup(*[Dot(color=color, radius=0.3).shift(2 * np.random.random(3) - 1) for color in [BLUE, GREEN, RED]])
        
        self.play(Create(balls))
        self.wait(1)
        
        for _ in range(50):
            self.play(balls.shift, 0.5 * np.random.random(3) - 0.25, run_time=0.5)
        
        self.wait(1)