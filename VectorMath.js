function VectorSum(v1, v2){
    return [v1[0]+v2[0], v1[1]+v2[1]];
}
function VectorSub(v1, v2){
    return [v1[0]-v2[0], v1[1]-v2[1]];
}
function VectorLen(v){
    return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
}
function VectorMult(v, scalar){
    return [v[0]*scalar, v[1]*scalar];
}
function VectorNormalize(v){
    if(v[0] == 0 && v[1] == 0) { return [0,0] }
    return VectorMult(v, 1/VectorLen(v));
}
function VectorSetLen(v, scalar){
    if(v[0] == 0 && v[1] == 0) { return [0,0] }
    return VectorMult(v, scalar/VectorLen(v));
}
