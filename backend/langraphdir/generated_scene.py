from manim import *

class BallCollision(Scene):
    def construct(self):
        red_ball = Circle(color=RED, fill_color=RED, fill_opacity=1).scale(0.5).shift(LEFT*4)
        blue_ball = Circle(color=BLUE, fill_color=BLUE, fill_opacity=1).scale(0.5).shift(RIGHT*4)
        
        self.play(Create(red_ball), Create(blue_ball))
        self.wait(1)
        
        self.play(red_ball.animate.move_to(0), blue_ball.animate.move_to(0), rate_func=there_and_back)
        self.play(red_ball.animate.scale(0.2).stretch(2, 0), blue_ball.animate.scale(0.2).stretch(2, 0))
        self.wait(0.5)
        
        self.play(red_ball.animate.scale(0.5).stretch(0.5, 2), blue_ball.animate.scale(0.5).stretch(0.5, 2))
        self.wait(0.5)