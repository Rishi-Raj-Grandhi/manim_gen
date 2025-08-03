from manim import *

class BallRolling(Scene):
    def construct(self):
        ball = Circle(color=BLUE, radius=0.5)
        ball.move_to(LEFT*3)

        path = Arc(start_angle=0, angle=TAU, radius=3)
        self.play(MoveAlongPath(ball, path), run_time=3)