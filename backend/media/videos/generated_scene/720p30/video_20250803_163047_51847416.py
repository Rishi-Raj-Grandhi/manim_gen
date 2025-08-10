from manim import *

class NumberAnimation(Scene):
    def construct(self):
        numbers = [Text(str(i), font_size=2) for i in range(1, 6)]
        
        for i, number in enumerate(numbers):
            number.move_to(2*LEFT + i*RIGHT)
            self.play(Write(number), run_time=1)
            self.wait(0.5)

        self.wait(1)