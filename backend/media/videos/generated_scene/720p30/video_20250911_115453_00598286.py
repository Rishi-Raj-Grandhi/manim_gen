from manim import *

class TicTacToe(Scene):
    def construct(self):
        grid = VGroup(*[Square().shift(2*LEFT*x + 2*UP*y) for x in range(3) for y in range(3)])
        self.play(Create(grid))

        x_positions = [grid[0].get_center(), grid[2].get_center(), grid[4].get_center()]
        o_positions = [grid[4].get_center(), grid[8].get_center(), grid[5].get_center()]

        x_marks = VGroup(*[Text("X").move_to(pos) for pos in x_positions])
        o_marks = VGroup(*[Text("O").move_to(pos) for pos in o_positions])

        self.play(Write(x_marks[0]))
        self.wait(0.5)
        self.play(Write(o_marks[0]))
        self.wait(0.5)
        self.play(Write(x_marks[1]))
        self.wait(0.5)
        self.play(Write(o_marks[1]))
        self.wait(0.5)
        self.play(Write(x_marks[2]))

        winning_line = Line(grid[0].get_center(), grid[8].get_center(), color=YELLOW, stroke_width=10)
        self.play(Create(winning_line))
        self.wait(1)