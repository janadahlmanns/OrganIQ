// utils/extract-svg-regions.cjs
// Parses SVG with <polygon> or <path> (including inside <g>) and outputs region JSON
// Supports transform="scale(...)" and simplified 'd' parsing for paths

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const inputFilePath = process.argv[2];
if (!inputFilePath) {
    console.error('Usage: node extract-svg-regions.cjs <your-file.svg>');
    process.exit(1);
}

const parser = new xml2js.Parser();

fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) throw err;

    parser.parseString(data, (err, result) => {
        if (err) throw err;

        const regions = [];
        const scaleRegex = /scale\(([^)]+)\)/;

        const traverse = (nodes, transformScale = 1) => {
            if (!Array.isArray(nodes)) return;

            for (const node of nodes) {
                const nodeScale = node.$?.transform?.match(scaleRegex);
                const currentScale = nodeScale ? parseFloat(nodeScale[1]) : transformScale;

                if (node.polygon) {
                    for (const el of node.polygon) {
                        const id = el.$.id || `region${regions.length}`;
                        const points = el.$.points.trim().split(' ').map(p => {
                            const [x, y] = p.split(',').map(Number);
                            return { x: x * currentScale, y: y * currentScale };
                        });
                        regions.push({ id, name: id, shape: 'polygon', points });
                    }
                }

                if (node.path) {
                    for (const el of node.path) {
                        const id = el.$.id || `region${regions.length}`;
                        const d = el.$.d;
                        const points = [];
                        const cmdRegex = /([ML])\s*([\d.\-]+)[ ,]([\d.\-]+)/gi;
                        let match;
                        while ((match = cmdRegex.exec(d)) !== null) {
                            const [, , x, y] = match;
                            points.push({ x: parseFloat(x) * currentScale, y: parseFloat(y) * currentScale });
                        }
                        if (points.length > 0) {
                            regions.push({ id, name: id, shape: 'polygon', points });
                        }
                    }
                }

                // Recursively handle groups
                if (node.g) {
                    traverse(node.g, currentScale);
                }
            }
        };

        traverse([result.svg]);

        const outputPath = path.join(
            path.dirname(inputFilePath),
            path.basename(inputFilePath, '.svg') + '.regions.json'
        );

        fs.writeFileSync(outputPath, JSON.stringify(regions, null, 2));
        console.log(`✅ Extracted ${regions.length} regions → ${outputPath}`);
    });
});
