// ─────────────────────────────────────────────────────────────
// INCARNAT — shader de la forme organique
// Matière ambiguë : ni cœur, ni cerveau, ni organe. Minérale + vivante
// + charnelle. Déplacement par bruit 3D (respiration lente), fresnel
// incarnat en contre-jour, révélation progressive depuis le noir.
// ─────────────────────────────────────────────────────────────

// Bruit simplex 3D (Ashima Arts / Stefan Gustavson — domaine public)
const SIMPLEX = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){
  float f=0.0, a=0.5;
  for(int i=0;i<4;i++){ f+=a*snoise(p); p*=2.02; a*=0.5; }
  return f;
}
`

export const organicVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uReveal;
  uniform vec2  uMouse;
  varying vec3  vNormalW;
  varying vec3  vViewDirW;
  varying float vDisp;
  varying vec3  vPos;

  ${SIMPLEX}

  void main(){
    vec3 p = position;
    // respiration lente + relief minéral qui se réorganise très lentement
    float breathe = 0.06 * sin(uTime * 0.35);
    float slow = uTime * 0.06;
    float relief = fbm(normalize(position) * 1.6 + vec3(slow, slow * 0.7, -slow));
    // le scroll fait « ouvrir » la matière : le relief s'accentue
    float amt = 0.34 + uScroll * 0.22 + breathe;
    float disp = relief * amt;
    // légère réponse à la souris (amplitude infime)
    disp += 0.03 * snoise(normalize(position) * 2.2 + vec3(uMouse * 1.5, uTime * 0.1));
    p += normal * disp;

    vDisp = relief;
    vPos = p;
    vec4 wp = modelMatrix * vec4(p, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDirW = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

export const organicFragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uScroll;
  uniform float uReveal;
  uniform vec3  uColorDeep;   // bordeaux / terre brûlée
  uniform vec3  uColorFlesh;  // incarnat
  uniform vec3  uColorGlow;   // cramoisi chaud
  uniform vec3  uLightDir;    // lumière latérale
  varying vec3  vNormalW;
  varying vec3  vViewDirW;
  varying float vDisp;
  varying vec3  vPos;

  ${SIMPLEX}

  void main(){
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(vViewDirW);
    vec3 L = normalize(uLightDir);

    // lumière latérale douce, une seule source — le reste dans l'ombre
    float diff = clamp(dot(N, L), 0.0, 1.0);
    diff = pow(diff, 1.4);

    // fresnel = contre-jour incarnat sur les bords
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.6);

    // matière : sombre par défaut, la chair n'affleure qu'où la lumière touche
    vec3 col = uColorDeep * 0.28;
    col = mix(col, uColorFlesh, diff * 0.62);
    col += uColorGlow * fres * (0.5 + uScroll * 0.4);

    // grain minéral vivant, très discret
    float g = snoise(vPos * 6.0 + vec3(0.0, 0.0, uTime * 0.15));
    col += g * 0.03;

    // veines de matière selon le relief
    col = mix(col, col * 0.6, smoothstep(0.2, -0.2, vDisp));

    // révélation depuis le noir au chargement
    float reveal = smoothstep(0.0, 1.0, uReveal);
    col *= reveal;
    // vignette de profondeur sur l'objet lui-même
    col *= 0.75 + 0.25 * diff;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`
