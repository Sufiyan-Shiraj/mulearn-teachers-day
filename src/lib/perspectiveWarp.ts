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
 * Calculates rotation angle, bounding box, dimensions and relative clip polygon from 4 quad points
 */
export function getQuadBoundsAndRotation(quad: QuadPoints) {
  // Angle of the top edge in degrees
  const dxTop = quad.topRight.x - quad.topLeft.x;
  const dyTop = quad.topRight.y - quad.topLeft.y;
  const angle = Math.atan2(dyTop, dxTop) * (180 / Math.PI);

  // Center
  const cx = (quad.topLeft.x + quad.topRight.x + quad.bottomRight.x + quad.bottomLeft.x) / 4;
  const cy = (quad.topLeft.y + quad.topRight.y + quad.bottomRight.y + quad.bottomLeft.y) / 4;

  // Approximate width & height of the quadrilateral
  const wTop = Math.hypot(quad.topRight.x - quad.topLeft.x, quad.topRight.y - quad.topLeft.y);
  const wBottom = Math.hypot(quad.bottomRight.x - quad.bottomLeft.x, quad.bottomRight.y - quad.bottomLeft.y);
  const width = Math.max(1, (wTop + wBottom) / 2);

  const hLeft = Math.hypot(quad.bottomLeft.x - quad.topLeft.x, quad.bottomLeft.y - quad.topLeft.y);
  const hRight = Math.hypot(quad.bottomRight.x - quad.topRight.x, quad.bottomRight.y - quad.topRight.y);
  const height = Math.max(1, (hLeft + hRight) / 2);

  const minX = Math.min(quad.topLeft.x, quad.bottomLeft.x);
  const minY = Math.min(quad.topLeft.y, quad.topRight.y);
  const maxX = Math.max(quad.topRight.x, quad.bottomRight.x);
  const maxY = Math.max(quad.bottomLeft.y, quad.bottomRight.y);
  const bboxW = Math.max(1, maxX - minX);
  const bboxH = Math.max(1, maxY - minY);

  // Relative polygon clip path within the bounding box (0-100%)
  const relTL = { x: ((quad.topLeft.x - minX) / bboxW) * 100, y: ((quad.topLeft.y - minY) / bboxH) * 100 };
  const relTR = { x: ((quad.topRight.x - minX) / bboxW) * 100, y: ((quad.topRight.y - minY) / bboxH) * 100 };
  const relBR = { x: ((quad.bottomRight.x - minX) / bboxW) * 100, y: ((quad.bottomRight.y - minY) / bboxH) * 100 };
  const relBL = { x: ((quad.bottomLeft.x - minX) / bboxW) * 100, y: ((quad.bottomLeft.y - minY) / bboxH) * 100 };

  const relativeClipPath = `polygon(${relTL.x}% ${relTL.y}%, ${relTR.x}% ${relTR.y}%, ${relBR.x}% ${relBR.y}%, ${relBL.x}% ${relBL.y}%)`;

  return {
    cx: Math.round(cx * 10) / 10,
    cy: Math.round(cy * 10) / 10,
    width: Math.round(width * 10) / 10,
    height: Math.round(height * 10) / 10,
    rotation: Math.round(angle * 10) / 10,
    minX: Math.round(minX * 10) / 10,
    minY: Math.round(minY * 10) / 10,
    bboxW: Math.round(bboxW * 10) / 10,
    bboxH: Math.round(bboxH * 10) / 10,
    relativeClipPath,
  };
}

/**
 * Returns a CSS clip-path polygon from 4 quadrilateral points across the full canvas
 */
export function getPolygonClipPath(quad: QuadPoints): string {
  return `polygon(${quad.topLeft.x}% ${quad.topLeft.y}%, ${quad.topRight.x}% ${quad.topRight.y}%, ${quad.bottomRight.x}% ${quad.bottomRight.y}%, ${quad.bottomLeft.x}% ${quad.bottomLeft.y}%)`;
}
