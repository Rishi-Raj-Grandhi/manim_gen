from manim import *

class TicTacToeGame(Scene):
    def construct(self):
        # Create tic tac toe board
        board = VGroup(
            Line(LEFT*3, RIGHT*3, color=WHITE),
            Line(LEFT*1, RIGHT*1, color=WHITE),
            Line(LEFT*3, RIGHT*3, color=WHITE).shift(UP*3),
            Line(LEFT*1, RIGHT*1, color=WHITE).shift(UP*1),
            Line(LEFT*3, RIGHT*3, color=WHITE).shift(DOWN*3),
            Line(LEFT*1, RIGHT*1, color=WHITE).shift(DOWN*1),
            Line(UP*3, DOWN*3, color=WHITE),
            Line(UP*1, DOWN*1, color=WHITE),
            Line(UP*3, DOWN*3, color=WHITE).shift(RIGHT*3),
            Line(UP*1, DOWN*1, color=WHITE).shift(RIGHT*1),
            Line(UP*3, DOWN*3, color=WHITE).shift(LEFT*3),
            Line(UP*1, DOWN*1, color=WHITE).shift(LEFT*1)
        )
        
        self.play(Create(board))
        self.wait(1)
        
        # Play the game
        moves = [(0, 0), (1, 1), (2, 2), (0, 1), (1, 0), (1, 2), (2, 0), (0, 2), (2, 1)]
        player = "X"
        
        for move in moves:
            row, col = move
            mark = Text(player, font_size=48, color=BLUE).move_to(board[row*4 + col].get_center())
            self.play(Write(mark))
            self.wait(0.5)
            
            if player == "X":
                player = "O"
            else:
                player = "X"
        
        self.wait(1)