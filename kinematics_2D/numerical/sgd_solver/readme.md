# Stochastic Gradient Descent IK solver

## Some ideas for optimization

```
For all of these examples, assume our kinematics chain looks like:
O x A x B x C x D x E = F
where each letter is a homogeneous transform matrix. O is the origin matrix where our relative frame of reference is based.
```

### Caching intermediate matrices
Currently in the forward pass, we multiply every matrix from left to right to get F, the transform of our end-effector.

We should also do the opposite and work backwards from E and cache all of those matrices. 
So if we wanted to calculate C' we could pull O x A x B from our array index [i - 1] and pull D x E from index [i + 1].
Now we have [O x A x B] x C' x [D x E] = F'
Currently during the backwards pass step we generate these matrices as we loop backwards. If we just calculated the forward and backwards matrices all at once, we could easily parallelize the dθ calculations. 

Some things it would be helpful to cache
1. An array of thetas
2. An array of radii
3. An array of forward matrices
4. An array of backward matrices
5. The end effector matrix

For this method to work, we would need to forego having Layer objects and just switch to having arrays of matrices managed by the IKSystem object.

I will put this off until I add self-collision and 3D and stuff because I think that might cause issues

### Upper limit of performance

The forward pass requires O(n) matrix multiplications where n is the number of matrices
The backward pass requires O(2n) matrix multiplications where n is the number of matrices

The system usually converges after less than 250 timesteps so that's 750n matrix multiplications. Threaded per-joint means 750 matrix operations per thread.