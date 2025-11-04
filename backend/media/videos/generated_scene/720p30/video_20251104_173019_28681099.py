from manim import *

class BahubaliTitleCard(Scene):
    def construct(self):
        title = Text("Bahubali : the epic", font="Arial").scale(2)
        title.set_color(RED)
        
        fire1 = Fire().shift(UP*2)
        fire2 = Fire().shift(DOWN*2)
        
        self.play(Write(title))
        self.play(ShowCreation(fire1), ShowCreation(fire2))
        self.wait(2)
        self.play(FadeOut(title), FadeOut(fire1), FadeOut(fire2))