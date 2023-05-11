import symforce.symbolic as sf

pose = sf.Pose2(
    t=sf.V2.symbolic("t"),
    R=sf.Ro2.symbolic("R")
)
landmark = sf.V2.symbolic("L")

landmark_body = pose.inverse() * landmark

print(pose)