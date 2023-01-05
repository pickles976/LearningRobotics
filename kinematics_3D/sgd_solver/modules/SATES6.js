import * as THREE from 'three'

class Edge {

    constructor(shape, startIndex, endIndex) {
        this.__shape = shape
        this.__startIndex = startIndex
        this.__endIndex = endIndex
    }

    StartIndex() {
        return this.__startIndex
    }
    
    EndIndex() {
        return this.__endIndex
    }
    
    ToLine() {
        return new Line(this.__shape.Vertex(this.__startIndex), this.__shape.Vertex(this.__endIndex));
    }
    
    
    Clone() {
        return new Edge(this.__shape, this.__startIndex, this.__endIndex);
    }

}

class Face {

    constructor(shape, verticesIndices) {
        this.__shape = shape
        this.__verticesIndices = verticesIndices
    }
    
    VertexIndex(i) {
        return this.__verticesIndices[i]
    }
    
    VerticesIndices() {
        return this.__verticesIndices.concat([])
    }
    
    VertexCount() {
        return this.__verticesIndices.length
    }
    
    ToPolygon() {
        let vertices = [];
        for (let i = 0; i < this.__verticesIndices.length; i++) {
            vertices.push(this.__shape.Vertex(this.__verticesIndices[i]))
        }
        return new Polygon(vertices)
    }
    
    Clone() {
        return new Face(this.__shape, this.__verticesIndices.concat([]))
    }

}

class Shape {

    constructor(vertices, faces, edges) {
        this.__vertices = (vertices) ? vertices : null
        this.__faces = (faces) ? faces.map((f) => new Face(this, f)) : null
        this.__edges = (edges) ? edges.map((e) => new Edge(this, e[0], e[1])) : null
        this.__matrix = new THREE.Matrix4()
    }

    Consolidate(shape) {
        let vertices = []
        for (let i = 0; i < this.__vertices.length; i++) {
            vertices.push(this.__vertices[i].clone().applyMatrix4(this.__matrix))
        }
        let faces = []
        for (let i = 0; i < this.__faces.length; i++) {
            faces.push(new Face(shape, this.__faces[i].VerticesIndices()))
        }
        let edges = []
        for (let i = 0; i < this.__edges.length; i++) {
            edges.push(new Edge(shape, this.__edges[i].StartIndex(), this.__edges[i].EndIndex()))
        }
        shape.__vertices = vertices;
        shape.__faces = faces;
        shape.__edges = edges;
        return shape;
    }

    ConsolidateSelf() {
        this.Consolidate(this);
        this.__matrix = new THREE.Matrix4();
        return this
    }

    ApplyMatrix4(matrix) {
        this.__matrix = new THREE.Matrix4().multiplyMatrices(matrix, this.__matrix)
        return this
    }

    Clone() {
        throw new Error("Method not implemented.")
    }

    GetX() {
        return this.__matrix.elements[12]
    }

    GetY() {
        return this.__matrix.elements[13]
    }

    GetZ() {
        return this.__matrix.elements[14]
    }

    Vertices() {
        return this.__vertices.concat([])
    }

    Faces() {
        return this.__faces.concat([])
    }

    Edges() {
        return this.__edges.concat([])
    }

    EdgeCount() {
        return this.__edges.length
    }

    FaceCount() {
        return this.__faces.length
    }

    VertexCount() {
        return this.__vertices.length
    }

    Edge(i) {
        return this.__edges[i].Clone()
    }

    Face(i) {
        return this.__faces[i].Clone()
    }

    Vertex(i) {
        return this.__vertices[i].clone()
    }

    GetTransform() {
        return this.__matrix.clone()
    }

    Translate(vertex) {
        this.__matrix.elements[12] += vertex.x
        this.__matrix.elements[13] += vertex.y
        this.__matrix.elements[14] += vertex.z
    }

    Rotate(x, y, z) {
        this.__matrix = new THREE.Matrix4().multiplyMatrices(this.__matrix, new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(x, y, z, "XYZ")))
    }

    SetPosition  (x, y, z) {
        this.__matrix.setPosition(new THREE.Vector3(x, y, z))
    }

    SetRotation  (x, y, z) {
        let quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(x / 180 * Math.PI, y / 180 * Math.PI, z / 180 * Math.PI, "XYZ"))
        let transform = new THREE.Matrix4()
        transform.makeRotationFromQuaternion(quaternion).setPosition(new THREE.Vector3(this.GetX(), this.GetY(), this.GetZ()))
        this.__matrix = transform
    }

}

class Line extends Shape {

    constructor (start, end) {
        let tempEdge = new Edge(null, 0, 1)
        super([start, end], [], [tempEdge])
        tempEdge.__shape = this

        this.__direction = new THREE.Vector3().subVectors(end, start)
        this.__length = this.__direction.length()
        this.__direction.normalize()
    }
    
    GetDirection  () {
        return this.__direction.clone()
    }
    
    Start() {
        return this.__vertices[0]
    }
    
    End() {
        return this.__vertices[1]
    }
    
    Length() {
        return this.__length
    }

}

class Polygon extends Shape  {

    constructor  (vertices) {
        // System.Assert.GreaterThan(vertices.length, 2)
        let edges = []
        for (let i = vertices.length - 1, j = 0; j < vertices.length; i = j, j++) {
            edges.push(new Edge(null, i, j))
        }

        let tempFace = new Face(null, [...Array(vertices.length).keys()])
        super(vertices, [tempFace], edges)
        tempFace.__shape = this
        edges.forEach((edge) => edge.__shape = this)

        this.__normal = null
        this.__centroid = null
        this.ComputeNormal()
        this.ComputeCentroid()
    }

    ComputeNormal  () {
        this.__normal = new THREE.Vector3();
        for (let i = this.__vertices.length - 1, j = 0; j < this.__vertices.length; i = j, j++) {
            this.__normal.x += (this.__vertices[i].z + this.__vertices[j].z) * (this.__vertices[i].y - this.__vertices[j].y)
            this.__normal.y += (this.__vertices[i].x + this.__vertices[j].x) * (this.__vertices[i].z - this.__vertices[j].z)
            this.__normal.z += (this.__vertices[i].y + this.__vertices[j].y) * (this.__vertices[i].x - this.__vertices[j].x)
        }
        this.__normal.normalize()
    }

    ComputeCentroid  () {
        let e1 = new THREE.Vector3().subVectors(this.__vertices[1], this.__vertices[0]).normalize()
        let e2 = new THREE.Vector3().crossVectors(this.__normal, e1)
        let origin = this.__vertices[0]
        let centroid = new THREE.Vector2()
        let area = 0
        for (let i = this.__vertices.length - 1, j = 0; j < this.__vertices.length; i = j, j++) {
            let v0 = this.ToLocalCoordinates(e1, e2, origin, this.__vertices[i])
            let v1 = this.ToLocalCoordinates(e1, e2, origin, this.__vertices[j])
            let b = v0.x * v1.y - v1.x * v0.y
            area += b
            centroid.x += (v0.x + v1.x) * b
            centroid.y += (v0.y + v1.y) * b
        }
        area *= 0.5
        this.__centroid = this.ToGlobalCoordinates(e1, e2, origin, centroid.divideScalar(6.0 * area))
    }

    Normal  () {
        return this.__normal
    }

    Centroid  () {
        return this.__centroid
    }

    ToLocalCoordinates  (e1, e2, origin, vertex) {
        let x = (vertex.x - origin.x) * e1.x + (vertex.y - origin.y) * e1.y + (vertex.z - origin.z) * e1.z
        let y = (vertex.x - origin.x) * e2.x + (vertex.y - origin.y) * e2.y + (vertex.z - origin.z) * e2.z
        return new THREE.Vector2(x, y)
    }

    ToGlobalCoordinates  (e1, e2, origin, vertex) {
        return new THREE.Vector3(origin.x + e1.x * vertex.x + e2.x * vertex.y,
                origin.y + e1.y * vertex.x + e2.y * vertex.y,
                origin.z + e1.z * vertex.x + e2.z * vertex.y)
    }

}

function BuildMesh(shape0, params) {
    let shape1 = shape0.Consolidate(new Shape());
    let mesh = new THREE.Object3D();

    if ((params) && (params.decoration) && params.decoration) {
        for (let i = 0; i < shape1.VertexCount(); i++) {
            let vertexMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 6), new THREE.MeshBasicMaterial({color: 0x333333}))
            let vertex = shape1.Vertex(i)
            vertexMesh.translateX(vertex.x)
            vertexMesh.translateY(vertex.y)
            vertexMesh.translateZ(vertex.z)
            mesh.add(vertexMesh)
        }

        let edgesGeometry = new THREE.Geometry()
        for (let i = 0; i < shape1.EdgeCount(); i++) {
            let edge = shape1.Edge(i).ToLine()
            let direction = edge.GetDirection()
            let arrowHelper = new THREE.ArrowHelper(direction, edge.Start(), edge.Length() * 0.5)
            edgesGeometry.merge(new THREE.CylinderGeometry(0.02, 0.02, edge.Length(), 8, 4),
                new THREE.Matrix4().makeRotationFromQuaternion(arrowHelper.quaternion).setPosition(new THREE.Vector3().addVectors(edge.Start(), direction.multiplyScalar(edge.Length() * 0.5))), 0);
        }
        mesh.add(new THREE.Mesh(edgesGeometry, new THREE.MeshBasicMaterial({color: 0x666666})))
    }

    let facesGeometry = new THREE.Geometry()
    facesGeometry.vertices = shape1.Vertices()
    let c = 0
    for (let i = 0; i < shape1.FaceCount(); i++) {
        let face = shape1.Face(i)
        for (let j = 0; j < face.VertexCount() - 2; j++) {
            let v1 = face.VertexIndex(0)
            let v2 = face.VertexIndex(j + 1)
            let v3 = face.VertexIndex(j + 2)
            facesGeometry.faces[c] = new THREE.Face3(v1, v2, v3)
            facesGeometry.faces[c].color = params.color
            c++
        }
    }

    facesGeometry.computeFaceNormals()
    facesGeometry.computeVertexNormals()

    let facesMesh = new THREE.Mesh(facesGeometry, new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors, side: THREE.FrontSide, transparent: false, opacity: 0.8}))
    facesMesh.scale.multiplyScalar(1.01)
    mesh.add(facesMesh)

    let interiorFacesMesh = new THREE.Mesh(facesGeometry, new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors, side: THREE.BackSide}))
    interiorFacesMesh.scale.multiplyScalar(0.99)
    mesh.add(interiorFacesMesh)

    mesh.matrixAutoUpdate = false
    mesh.matrix = shape1.__matrix
    mesh.matrixWorldNeedsUpdate = true

    return mesh
}

function WhichSide (V, D, P) {
    let positive = 0, negative = 0
    for (let i = 0; i < V.length; i++) {
        let t = D.dot(new THREE.Vector3().subVectors(V[i], P))
        if (t > 0) positive++; else if (t < 0) negative++
        if (positive && negative) return 0
    }
    return (positive) ? 1 : -1
}

function CheckGenericPolyhedraCollision (a0, b0) {
    let a1 = a0.Consolidate(new Shape())
    let b1 = b0.Consolidate(new Shape())

    for (let i = 0; i < a1.FaceCount(); i++) {
        let face = a1.Face(i).ToPolygon()
        if (WhichSide(b1.Vertices(), face.Normal(), face.Vertex(0)) > 0) {
            return false
        }
    }

    for (let i = 0; i < b1.FaceCount(); i++) {
        let face = b1.Face(i).ToPolygon()
        if (WhichSide(a1.Vertices(), face.Normal(), face.Vertex(0)) > 0) {
            return false
        }
    }

    for (let i = 0; i < a1.EdgeCount(); i++) {
        let e0 = a1.Edge(i).ToLine()
        for (let j = 0; j < b1.EdgeCount(); j++) {
            let e1 = b1.Edge(j).ToLine()
            let D = new THREE.Vector3().crossVectors(e0.GetDirection(), e1.GetDirection()).normalize()
            let same0
            if ((same0 = WhichSide(a1.Vertices(), D, e0.Start())) == 0) {
                continue
            }
            let same1
            if ((same1 = WhichSide(b1.Vertices(), D, e0.Start())) == 0) {
                continue
            }
            if (same0 * same1 < 0) {
                return false
            }
        }
    }
    return true
}

function InverseModel(matrix) {
    // M = | R  T |
    //     | 0  1 |
    // inv(M) = | R'    R' * T' |
    //          | 0     1       |
    let R1 = new THREE.Matrix3(matrix.elements[0], matrix.elements[1], matrix.elements[2],
        matrix.elements[4], matrix.elements[5], matrix.elements[6],
        matrix.elements[8], matrix.elements[9], matrix.elements[10])

    let T1 = new THREE.Vector3(-matrix.elements[12], -matrix.elements[13], -matrix.elements[14]).applyMatrix3(R1)

    return new THREE.Matrix4(R1.elements[0], R1.elements[3], R1.elements[6], T1.x,
        R1.elements[1], R1.elements[4], R1.elements[7], T1.y,
        R1.elements[2], R1.elements[5], R1.elements[8], T1.z,
        0.0, 0.0, 0.0, 1.0)
}

function CheckCollision(a, b) {
    return CheckGenericPolyhedraCollision(a, b)
}

function ShapeFromGeometry(geometry) {

    function toVertices(positions) {

        const vertices = [];
        for (let index = 0; index < positions.count; index++) {
            vertices.push(
            new THREE.Vector3(
                positions.getX(index),
                positions.getY(index),
                positions.getZ(index)
            )
            )
        }
        return vertices
    
    }

    let verts = toVertices(geometry.attributes.position)
            
    let indices = geometry.index.array

    let edges = []
    for(let i = 0; i < indices.length; i += 2) {
        edges.push([indices[i], indices[i+1]])
    }

    let faces = []
    for(let i = 0; i < indices.length; i += 3) {
        faces.push([indices[i], indices[i+1], indices[i + 2]])
    }

    return new Shape(verts, faces, edges)

}

export {
    Polygon, 
    Shape,
    CheckCollision,
    ShapeFromGeometry,
}