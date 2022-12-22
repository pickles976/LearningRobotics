Now that I have added more constraints, I see the real issues with SGD. Genetic algorithms might be slow, but they are a lot better at jumping out of local minima (evolution moment). I think this is gonna require a lot of hyperparameter optimization.

Some things to optimize over:

- PENALTY
- MAX_DLOSS
- LEARN RATE
- MOMENTUM
- DECAY