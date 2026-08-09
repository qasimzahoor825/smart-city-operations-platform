/**
 * @swagger
 * tags:
 *   name: GIS
 *   description: Spatial layers, map markers & geospatial search
 */

/**
 * @swagger
 * /gis/layers:
 *   get:
 *     tags: [GIS]
 *     summary: List city map layers (traffic, water, zoning)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Layer definitions fetched
 *
 * /gis/markers:
 *   get:
 *     tags: [GIS]
 *     summary: List map markers (filter by type, status, bounding box)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: type, in: query, schema: { type: string, enum: [complaint, asset, hospital, police, emergency] } }
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: bbox, in: query, schema: { type: string }, description: "minLon,minLat,maxLon,maxLat" }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated list of markers
 *   post:
 *     tags: [GIS]
 *     summary: Create a map marker (staff only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, latitude, longitude]
 *             properties:
 *               type: { type: string, enum: [complaint, asset, hospital, police, emergency] }
 *               title: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               status: { type: string }
 *               severity: { type: string }
 *               address: { type: string }
 *     responses:
 *       201:
 *         description: Marker created
 *
 * /gis/markers/stats:
 *   get:
 *     tags: [GIS]
 *     summary: Marker counts by type
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Aggregated marker statistics
 *
 * /gis/search:
 *   get:
 *     tags: [GIS]
 *     summary: Search markers by keyword
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: q, in: query, schema: { type: string }, required: true }
 *     responses:
 *       200:
 *         description: Matching markers
 */
export const gisSwagger = { tag: "GIS" };
export default gisSwagger;