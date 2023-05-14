# Setup
# https://symforce.org/tutorials/geometry_tutorial.html
import symforce

symforce.set_symbolic_api("sympy")
symforce.set_log_level("warning")

from symforce.notebook_util import display
import symforce.symbolic as sf
from symforce import ops

# Matrix construction. The statements below all create the same 2x3 matrix object

# Construction from 2D list
m1 = sf.Matrix([[1, 2, 3], [4, 5, 6]])

# Construction using specified size + data
m2 = sf.Matrix(2, 3, [1, 2, 3, 4, 5, 6])

# sf.MatrixNM creates a matrix with shape NxM (defined by default for 6x6
# matrices and smaller)
m3 = sf.Matrix23(1, 2, 3, 4, 5, 6)
m4 = sf.Matrix23([1, 2, 3, 4, 5, 6])

# Construction using aliases
m5 = sf.M([[1, 2, 3], [4, 5, 6]])
m6 = sf.M(2, 3, [1, 2, 3, 4, 5, 6])
m7 = sf.M23(1, 2, 3, 4, 5, 6)
m8 = sf.M23([1, 2, 3, 4, 5, 6])

# Construction from block matrices of appropriate dimensions
m9 = sf.Matrix23.block_matrix([[sf.M13([1, 2, 3])], [sf.M13([3, 4, 5])]])

# Vector constructors. The statements below all create the same 3x1 vector object

# Construction from 2D list
v1 = sf.Matrix([[1], [2], [3]])

# Construction from 1D list. We assume a 1D list represents a column vector.
v2 = sf.Matrix([1, 2, 3])

# Construction using aliases (defined by default for 9x1 vectors and smaller)
v3 = sf.Matrix31(1, 2, 3)
v4 = sf.M31(1, 2, 3)
v5 = sf.Vector3(1, 2, 3)
v6 = sf.V3(1, 2, 3)

# Matrix of zeros
z1 = sf.Matrix23.zero()
z2 = sf.Matrix.zeros(2, 3)

# Matrix of ones
o1 = sf.Matrix23.one()
o2 = sf.Matrix.ones(2, 3)

zero_matrix = sf.Matrix33.zero()
identity_matrix = sf.Matrix33.eye()

# We could also write:
zero_matrix = ops.GroupOps.identity(sf.Matrix33)

display(zero_matrix)
display(identity_matrix)

# Matrix multiplication
m23 = sf.M23.symbolic("lhs")
m31 = sf.V3.symbolic("rhs")
display(m23 * m31)

# Vector operations
norm = m31.norm()
squared_norm = m31.squared_norm()
unit_vec = m31.normalized()
display(unit_vec)

m33 = 5 * sf.Matrix33.eye()  # Element-wise multiplication with scalar
display(m33.inv())  # Matrix inverse

R0 = sf.Rot3.symbolic("R0")
R1 = sf.Rot3.symbolic("R1")
residual = sf.M(R0.local_coordinates(R1))
display(residual)

jacobian = residual.jacobian(R1)
# The jacobian is quite a complex symbolic expression, so we don't display it for
# convenience.
# The shape is equal to (dimension of residual) x (dimension of tangent space)
display(jacobian.shape)