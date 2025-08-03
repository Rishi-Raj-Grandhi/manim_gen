```python
from manim import *

class RotateSquare(Scene):
    def construct(self):
        square = Square(color=GREEN, fill_opacity=1)
        self.play(Rotate(square, angle=PI/2, run_time=2))
        self.wait()
```