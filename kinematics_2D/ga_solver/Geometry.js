function ccw(A, B, C){
    return (C[1]-A[1]) * (B[0]-A[0]) > (B[1]-A[1]) * (C[0]-A[0])
}

// Return true if line segments AB and CD intersect
function intersect(A,B,C,D){
    return ccw(A,C,D) != ccw(B,C,D) && ccw(A,B,C) != ccw(A,B,D)
}