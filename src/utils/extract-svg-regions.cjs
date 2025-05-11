#!/usr/bin/env node
// © 2025 Dr. Jana Katharina Dahlmanns. All Rights Reserved.
// This file is part of the OrganIQ project.
// No reuse, redistribution, or modification is permitted without explicit written permission.

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');
const parsePath = require('svg-path-parser');

// --- Utility: round to 4 decimals
const round4 = (num) => Math.round(num * 10000) / 10000;

// --- Utility: apply scale transform if present
function applyTransform(point, transform) {
    if (!transform) return point;
    const scaleMatch = transform.match(/scale\(([\d.]+)(?:[ ,]+([\d.]+))?\)/);
    if (scaleMatch) {
        const sx = parseFloat(scaleMatch[1]);
        const sy = scaleMatch[2] ? parseFloat(scaleMatch[2]) : sx;
        return { x: point.x * sx, y: point.y * sy };
    }
    return point;
}

// --- Parse the d attribute into points
function pathToPolygonPoints(d, transform) {
    const commands = parsePath(d);
    const points = [];
    let current = { x: 0, y: 0 };
    let subpathStart = null;

    for (const cmd of commands) {
        let point;
        switch (cmd.code) {
            case 'M':
            case 'L':
                point = { x: cmd.x, y: cmd.y };
                break;
            case 'm':
            case 'l':
                point = { x: current.x + cmd.x, y: current.y + cmd.y };
                break;
            case 'H':
                point = { x: cmd.x, y: current.y };
                break;
            case 'h':
                point = { x: current.x + cmd.x, y: current.y };
                break;
            case 'V':
                point = { x: current.x, y: cmd.y };
                break;
            case 'v':
                point = { x: current.x, y: current.y + cmd.y };
                break;
            case 'C':
                point = { x: cmd.x, y: cmd.y };
                break;
            case 'c':
                point = { x: current.x + cmd.x, y: current.y + cmd.y };
                break;
            case 'S':
            case 's':
            case 'Q':
            case 'q':
            case 'T':
            case 't':
            case 'A':
            case 'a':
                // Ignore control points, treat like line to end
                point = cmd.relative
                    ? { x: current.x + cmd.x, y: current.y + cmd.y }
                    : { x: cmd.x, y: cmd.y };
                break;
            case 'Z':
            case 'z':
                if (subpathStart) {
                    const scaled = applyTransform(subpathStart, transform);
                    points.push({
                        x: round4(scaled.x),
                        y: round4(scaled.y)
                    });
                }
                continue;
            default:
                continue;
        }

        // Save subpath start point for Z
        if (cmd.code === 'M' || cmd.code === 'm') {
            subpathStart = point;
        }

        const scaled = applyTransform(point, transform);
        current = point;

        points.push({
            x: round4(scaled.x),
            y: round4(scaled.y)
        });
    }

    return points;
}

// --- Main
function extractRegions(svgPath) {
    const svgText = fs.readFileSync(svgPath, 'utf-8');
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const paths = Array.from(doc.getElementsByTagName('path'));

    const regions = paths.map((el) => {
        const d = el.getAttribute('d');
        const label = el.getAttribute('inkscape:label') || el.getAttribute('id');
        const transform = el.getAttribute('transform');

        const points = pathToPolygonPoints(d, transform);

        return {
            name: label || 'unnamed',
            shape: 'polygon',
            points
        };
    });

    const outPath =
        path.join(path.dirname(svgPath), path.basename(svgPath, '.svg') + '.regions.json');
    fs.writeFileSync(outPath, JSON.stringify(regions, null, 2), 'utf-8');

    console.log(`✅ Extracted ${regions.length} region(s) to: ${outPath}`);
}

// --- CLI entry
const inputPath = process.argv[2];
if (!inputPath) {
    console.error('❌ Usage: node extract-svg-regions.cjs <path-to-svg>');
    process.exit(1);
}

extractRegions(inputPath);
