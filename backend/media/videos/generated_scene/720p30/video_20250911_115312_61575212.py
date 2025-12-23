from manim import *

class PerimeterOfRectangle(Scene):
    def construct(self):
        length = 3
        breadth = 2
        perimeter = 2 * (length + breadth)
        
        rectangle = Rectangle(width=length, height=breadth, color=BLUE)
        text_length = Text("Length = {}".format(length)).next_to(rectangle, UP)
        text_breadth = Text("Breadth = {}".format(breadth)).next_to(rectangle, LEFT)
        text_formula = Text("Perimeter = 2 * (Length + Breadth)").next_to(rectangle, DOWN)
        text_perimeter = Text("Perimeter = {}".format(perimeter)).next_to(text_formula, DOWN)
        
        self.play(Create(rectangle))
        self.play(Write(text_length), Write(text_breadth))
        self.wait(1)
        self.play(Write(text_formula))
        self.wait(1)
        self.play(Write(text_perimeter))
        self.wait(2)