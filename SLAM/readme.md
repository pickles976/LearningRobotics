# SLAM implementation from scratch

## TODO:
- [ ] Finish Bag of Words dictionary
- [ ] Implement Loop Closure
- [ ] Use Loop closure to optimize pose graph
- [ ] Clean up
- [ ] Add 3D reconstruction


## BAG OF WORDS:
- [x] K-means clustering
- [x] Histogram generation
- [ ] ~~TFIDF scoring~~
- [ ] Return closest match brute force
- [ ] Compare prior similarity
- [ ] Detect loop closure
- [ ] Apply LSH https://github.com/kayzhu/LSHash
http://ethen8181.github.io/machine-learning/recsys/content_based/lsh_text.html#Locality-Sensitive-Hashing-(LSH)---Cosine-Distance

This folder consists of me following along with the SLAM book english translation in Python

## Symforce documentation

https://symforce.org/#guides

a^ = A creates a skew-symmetric matrix from vector a
Av = a creates a vector, a from skew symmetric matrix

# Examples from other guy
https://github.com/sudo-robot-destroy/slambook_python/tree/master

export PYTHONPATH="$PYTHONPATH:/home/sebastian/Projects/symforce:/home/sebastian/Projects/symforce/build/lcmtypes/python2.7"


