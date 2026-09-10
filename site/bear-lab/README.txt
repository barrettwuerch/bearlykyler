Bearly Kyler — inflated bear interaction prototype

The bear uses the existing bear.png artwork as its front texture.
The closed front/back mesh was generated with an independent Python implementation of Poisson inflation, following the mathematical approach described in the supplied Img23d README. The Img23d application and WASM engine are not embedded or executed.

Three.js 0.170.0 renders the mesh; see THREE-LICENSE.txt.
lab.js provides bounded local spring deformation, pointer/touch input, keyboard boop, reduced-motion handling, and a depth toggle. No physics or image generation service runs in the visitor browser.

The bear.glb contains the undeformed model and its materials. It is an inflated illustration, not a fully reconstructed anatomical character.
The source generator inflate-bear.py is in the Site repository.
