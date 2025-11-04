from manim import *

class MovieTitleCard(Scene):
    def construct(self):
        title = Text("Bahubali : the epic", font_size=60, color=RED)
        fire_references = Text("with fire references", font_size=30, color=ORANGE)

        self.play(Write(title))
        self.wait(1)
        self.play(Write(fire_references))
        self.wait(2)