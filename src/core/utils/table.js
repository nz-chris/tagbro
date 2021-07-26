const { range, sum } = require('lodash');

const padSize = 1; // How many spaces to go on each side of the cell.

const border = {
    hBar: '─',
    vBar: '│',
    cross: '┼',

    topJoin: '┬',
    topLeft: '┌',
    topRight: '┐',

    bottomJoin: '┴',
    bottomLeft: '└',
    bottomRight: '┘',

    joinLeft: '├',
    joinRight: '┤',
};

const getCellText = cell => cell?.text || cell || '';
const getCellLines = cell => getCellText(cell).split('\n');
const getCellTextWidth = cell => Math.max(...getCellLines(cell).map(line => line.length));
const getCellSpan = cell => cell?.span || 1;
const getExtraWidth = cell => (getCellSpan(cell) - 1) * (padSize * 2 + 1);

const getColumnWidths = data => {
    const numColumns = Math.max(...data.map(row => row.length));
    const effectiveCellWidths = data.map(row => (
        row.map(cell => {
            const span = getCellSpan(cell);
            const chunkSize = Math.max(Math.ceil((getCellTextWidth(cell) - getExtraWidth(cell)) / span), 0);
            return range(span).map(() => chunkSize);
        }).flat()
    ))
    return range(numColumns).map((c) => Math.max(...effectiveCellWidths.map(row => row[c])));
};

const getRowHeights = data => data.map(row => Math.max(...row.map(cell => getCellLines(cell).length)));

module.exports = data => {
    const columnWidths = getColumnWidths(data);
    const rowHeights = getRowHeights(data);

    const table = data.map((row, rowIndex) => (
        range(rowHeights[rowIndex]).map(lineIndex => (
            row.map((cell, colIndex) => {
                const span = getCellSpan(cell);
                const cellWidth = sum(columnWidths.slice(colIndex, colIndex + span)) + getExtraWidth(cell);
                const alignmentPadding = cell?.align === 'r' ? 'padStart' : 'padEnd';
                const cellPadding = cell?.align === 'r' ? 'padEnd' : 'padStart';
                const lineText = getCellLines(cell)[lineIndex] || '';
                let paddedText = lineText[alignmentPadding](cellWidth + padSize);
                paddedText = paddedText[cellPadding](paddedText.length + padSize);
                return `${border.vBar}${paddedText}`;
            }).join('')
        ))
    )).map(row => `${row.join(`${border.vBar}\n`)}${border.vBar}`);

    const numColumns = columnWidths.length;
    const tableWidth = sum(columnWidths) + numColumns + 1 + numColumns * padSize * 2;
    const getLine = (prevRow, nextRow) => {
        const aboveRow = prevRow || nextRow;
        const belowRow = nextRow || prevRow;
        let { cross, joinLeft, joinRight } = border;
        if (!prevRow) {
            cross = border.topJoin;
            joinLeft = border.topLeft;
            joinRight = border.topRight;
        }
        if (!nextRow) {
            cross = border.bottomJoin;
            joinLeft = border.bottomLeft;
            joinRight = border.bottomRight;
        }
        return range(tableWidth).map(i => (
            i === 0 ? (
                joinLeft
            ) : (
                i === tableWidth - 1 ? (
                    joinRight
                ) : (
                    aboveRow[i] === border.vBar && belowRow[i] === border.vBar ? (
                        cross
                    ) : (
                        aboveRow[i] === border.vBar ? (
                            border.bottomJoin
                        ) : (
                            belowRow[i] === border.vBar ? (
                                border.topJoin
                            ) : (
                                border.hBar
                            )
                        )
                    )
                )
            )
        )).join('');
    }
    return `${getLine(null, table[0])}\n` +
        `${table.map((row, rowIndex) => `${row}\n${getLine(row, table[rowIndex + 1])}`).join('\n')}`;
};
