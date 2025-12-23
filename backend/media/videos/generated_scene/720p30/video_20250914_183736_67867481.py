from manim import *

class BouncingBalls(Scene):
    def construct(self):
        balls = VGroup(*[Dot(color=color, radius=0.3).shift(2 * np.random.random_sample(2) - 1) for color in [BLUE, GREEN, RED]])
        
        self.play(Create(balls), run_time=2)
        self.wait(1)
        
        for _ in range(50):
            self.play(
                balls.animate.apply_matrix(np.array([[1, 0.5], [0, 1]])),
                rate_func=there_and_back,
                run_time=2
            )
        
        self.wait(1)