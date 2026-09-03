export interface Point2D {
  x: number; // percentage 0-100 or px
  y: number; // percentage 0-100 or px
}

export interface QuadPoints {
  topLeft: Point2D;
  topRight: Point2D;
  bottomRight: Point2D;
  bottomLeft: Point2D;
}

/**
 * Computes the 3x3 projective transformation matrix (Homography)
 * mapping unit square (0,0),(1,0),(1,1),(0,1) to arbitrary quadrilateral (x0,y0),(x1,y1),(x2,y2),(x3,y3)
 */
export function getPerspectiveTransformMatrix(
  srcWidth: number,
  srcHeight: number,
  quad: QuadPoints,
  canvasWidth: number,
  canvasHeight: number
): number[] {
  // Convert quad percentage points to canvas pixel coordinates
  const p0 = { x: (quad.topLeft.x / 100) * canvasWidth, y: (quad.topLeft.y / 100) * canvasHeight };
  const p1 = { x: (quad.topRight.x / 100) * canvasWidth, y: (quad.topRight.y / 100) * canvasHeight };
  const p2 = { x: (quad.bottomRight.x / 100) * canvasWidth, y: (quad.bottomRight.y / 100) * canvasHeight };
  const p3 = { x: (quad.bottomLeft.x / 100) * canvasWidth, y: (quad.bottomLeft.y / 100) * canvasHeight };

  const dx1 = p1.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dx2 = p3.x - p2.x;
  const dy2 = p3.y - p2.y;

  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;

  let g = 0;
  let h = 0;

  if (sx === 0 && sy === 0) {
    // Affine transform
    const a = p1.x - p0.x;
    const b = p3.x - p0.x;
    const c = p0.x;
    const d = p1.y - p0.y;
    const e = p3.y - p0.y;
    const f = p0.y;
    return [a / srcWidth, d / srcWidth, 0, 0, b / srcHeight, e / srcHeight, 0, 0, 0, 0, 1, 0, c, f, 0, 1];
  } else {
    const det = dx1 * dy2 - dy1 * dx2;
    g = (sx * dy2 - sy * dx2) / det;
    h = (dx1 * sy - dy1 * sx) / det;

    const a = p1.x - p0.x + g * p1.x;
    const b = p3.x - p0.x + h * p3.x;
    const c = p0.x;
    const d = p1.y - p0.y + g * p1.y;
    const e = p3.y - p0.y + h * p3.y;
    const f = p0.y;

    // Convert to CSS matrix3d representation
    return [
      a / srcWidth,
      d / srcWidth,
      0,
      g / srcWidth,
      b / srcHeight,
      e / srcHeight,
      0,
      h / srcHeight,
      0,
      0,
      1,
      0,
      c,
      f,
      0,
      1,
    ];
  }
}

/**
 * Returns a CSS clip-path polygon from 4 quadrilateral points
 */
export function getPolygonClipPath(quad: QuadPoints): string {
  return `polygon(${quad.topLeft.x}% ${quad.topLeft.y}%, ${quad.topRight.x}% ${quad.topRight.y}%, ${quad.bottomRight.x}% ${quad.bottomRight.y}%, ${quad.bottomLeft.x}% ${quad.bottomLeft.y}%)`;
}
