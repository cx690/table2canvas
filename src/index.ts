import { Canvas } from 'canvas';
import { BaseConfig, Column, flatColumns, genColumns } from './column.js';
import { IColumn, TableStyle, TableOpt, TextStyle } from './type.js';
import { fillTexts, getRowSpanHeight, getSubStr, getTextHeight, handlePadding } from './utils.js';

const defaultStyle: Required<TableStyle> = {
    columnWidth: 150,
    borderColor: '#e8e8e8',
    textAlign: 'left',
    color: 'rgba(0,0,0,0.85)',
    fontSize: '14px',
    fontFamily: 'sans-serif',
    headerBgColor: 'rgba(0,0,0,0.02)',
    padding: 16,
    background: null,
}

class Table2canvas<T extends Record<string, any> = any>{
    canvas: Canvas;
    bgColor: string;
    text?: string;
    textStyle: TextStyle = { textAlign: 'center', lineHeight: 22 };
    sourceColumns: IColumn<T>[];
    columns: Column[];
    flatColumns: Column[];
    tableWidth = 0;
    tableHeight = 55;
    headHeight = 55;
    dataSource: T[];
    left = 10;
    top = 10;
    right = 10;
    bottom = 10;
    style: Required<TableStyle>;
    padding: [number, number, number, number];
    cellPadding: [number, number, number, number];
    width: number | 'auto';
    height: number | 'auto';
    rowHeight: number;
    trHeights: number[] = [];
    ctx: CanvasRenderingContext2D;
    constructor({ canvas, padding, columns = [], dataSource = [], style, bgColor, text, textStyle, width, height }: TableOpt<T>) {
        this.canvas = canvas;
        this.sourceColumns = columns;
        this.dataSource = dataSource || [];
        const _style = { ...defaultStyle, ...style };
        this.style = _style;
        this.bgColor = bgColor ?? 'transparent';
        this.text = text;
        this.width = width || 'auto';
        this.height = height || 'auto';
        this.padding = handlePadding(padding);
        this.textStyle = {
            ...this.textStyle,
            color: _style.color,
            fontSize: _style.fontSize,
            fontFamily: _style.fontFamily,
            ...textStyle
        };

        const cellPadding = handlePadding(_style.padding);
        this.cellPadding = cellPadding;
        const rowHeight = this.textStyle.lineHeight! + cellPadding[0] + cellPadding[2];
        this.rowHeight = rowHeight;

        if (text) {
            this.padding[0] += (this.textStyle.lineHeight! + cellPadding[0] + cellPadding[2]);
        }
        this.left = this.padding[3];
        this.right = this.padding[1];
        this.top = this.padding[0];
        this.bottom = this.padding[2];
        this.ctx = canvas.getContext('2d');

        this.columns = genColumns(columns, {
            width: _style.columnWidth,
            height: rowHeight,
            borderColor: _style.borderColor,
            padding: cellPadding,
            fontSize: _style.fontSize,
            fontFamily: _style.fontFamily,
            bgColor: _style.headerBgColor,
            textAlign: _style.textAlign,
        })

        this.flatColumns = flatColumns(this.columns);
        this.render();
    }

    private render() {
        this.resize();
        this.renderTh();
        const { dataSource, tableWidth, ctx, left, top, headHeight } = this;
        if (!dataSource.length && tableWidth) {
            this.renderNoData();
        } else {
            ctx.save();
            ctx.translate(left, top + headHeight);
            this.renderTr();
            ctx.restore();
        }
        this.renderTitle();
    }

    private renderTh() {
        const { ctx, top, left } = this;
        let x = left;
        for (const item of this.columns) {
            ctx.save();
            ctx.translate(x, top);
            this.renderThItem(item);
            ctx.restore();
            x += item.width;
        }
    }

    renderThItem(item: Column, x = 0, y = 0) {
        const { ctx } = this;
        const { borderColor, titleColor, textAlign, title, fontFamily, fontSize = '14px', bgColor, titleFontSize, titleFontWeight = 'bold' } = item.config as Required<IColumn & BaseConfig>;
        const { width, height, textWidth, baseConfig: { padding }, children } = item;
        ctx.save();
        ctx.strokeStyle = borderColor!;
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        titleColor && (ctx.fillStyle = titleColor);
        ctx.textAlign = textAlign ?? 'left';
        ctx.font = `${titleFontWeight} ${titleFontSize ?? fontSize} ${fontFamily}`;
        const midY = y + 0.5 * height;
        if (textAlign === 'center' || children?.length) {
            ctx.textAlign = 'center';
            ctx.fillText(title, x + 0.5 * width, midY, textWidth);
        } else if (textAlign === 'right') {
            ctx.fillText(title, x + width - padding[1], midY, textWidth);
        } else {
            ctx.fillText(title, x + padding[3], midY, textWidth);
        }
        ctx.fill();
        ctx.restore();

        if (children?.length) {
            let _x = x + 0;
            let _y = y + height;
            for (const c of children) {
                this.renderThItem(c, _x, _y);
                _x += c.width;
            }
        }
    }

    private renderNoData() {
        const { tableWidth, ctx, style, top, left, headHeight, rowHeight } = this;
        ctx.save();
        ctx.strokeStyle = style.borderColor;
        ctx.strokeRect(left, top + headHeight, tableWidth, rowHeight * 2);
        ctx.fillStyle = "#999";
        ctx.textAlign = 'center';
        ctx.fillText('Empty Data!', left + 0.5 * tableWidth, top + headHeight + rowHeight, tableWidth);
        ctx.restore();
    }

    private renderTr() {
        const { dataSource, ctx } = this;
        for (let i = 0, l = dataSource.length; i < l; i++) {
            const trHeight = this.getTrHeight(dataSource[i], i);
            this.renderTrItem(dataSource[i], i);
            ctx.translate(0, trHeight);
        }
    }

    private renderTrItem(row: T, i: number) {
        const { ctx, rowHeight, flatColumns, trHeights } = this;
        const trHeight = trHeights[i];
        let x = 0;
        const padding = flatColumns[0]?.config.padding;
        for (const { config: item } of flatColumns) {
            const { render, dataIndex, textAlign, fontSize = '14px', fontFamily, borderColor, textOverflow } = item;
            let { textColor, textFontSize, textFontWeight, width } = item;
            let height = trHeight;
            let text: string = '';
            if (typeof render === 'string') {
                if (dataIndex) {
                    text = render.replace(/\{c\}/g, row[dataIndex] ?? '');
                } else {
                    text = render;
                }
            } else if (typeof render === 'function') {
                const res = render(dataIndex ? (row[dataIndex] ?? '') : '', row, i);
                if (res && typeof res === 'object') {
                    const { rowSpan = 1, colSpan = 1 } = res;
                    res.textColor && (textColor = res.textColor);
                    res.textFontSize && (textFontSize = res.textFontSize);
                    res.textFontWeight && (textFontWeight = res.textFontWeight);
                    text = res.text ?? '';
                    width = width * colSpan;
                    height = getRowSpanHeight(trHeights, i, rowSpan);
                } else {
                    text = res ?? '';
                }
            } else if (dataIndex) {
                text = row[dataIndex] ?? '';
            }
            if (width && height) {
                ctx.save();
                ctx.strokeStyle = borderColor!;
                ctx.strokeRect(x, 0, width, height);
                ctx.stroke();
                ctx.restore();
                if (text !== '') {
                    text += '';
                    ctx.save();
                    const lineHeight = rowHeight - padding[0] - padding[2];
                    const maxTextHeight = height - padding[0] - padding[2];
                    const textWidth = width - padding[3] - padding[1];
                    const textHeight = getTextHeight(ctx, { text, lineHeight, width: textWidth });
                    ctx.translate(x + padding[3], padding[0] + (maxTextHeight - textHeight) / 2);
                    if (textOverflow === 'ellipsis') {
                        const fontsize = parseFloat(textFontSize ?? fontSize) || 14;
                        text = getSubStr(text, textWidth, fontsize / 2);
                    }
                    ctx.textAlign = textAlign ?? 'left';
                    textColor && (ctx.fillStyle = textColor);
                    ctx.font = `${textFontWeight ?? ''} ${textFontSize ?? fontSize} ${fontFamily}`;
                    fillTexts(ctx, { text: text, lineHeight, width: textWidth });
                    ctx.restore();
                }
            }
            x += item.width;
        }
    }

    private renderTitle() {
        if (!this.text) return;
        const { ctx, left, top, right, tableWidth, textStyle, text, rowHeight } = this;
        const { fontSize, fontFamily, color, textAlign } = textStyle;
        ctx.save();
        ctx.font = `bold ${fontSize} ${fontFamily}`;
        ctx.fillStyle = color || '#333';
        ctx.textAlign = textAlign || 'center';
        const midY = top - rowHeight * 0.5;
        const width = this.canvas.width;
        if (ctx.textAlign === 'center') {
            ctx.fillText(text, 0.5 * width, midY, tableWidth);
        } else if (ctx.textAlign === 'right') {
            ctx.fillText(text, width - right, midY, tableWidth);
        } else {
            ctx.fillText(text, left, midY, tableWidth);
        }
        ctx.restore();
    }

    private initCtxStatus() {
        const { ctx } = this;
        const { color, fontSize, fontFamily, textAlign } = this.style;
        ctx.font = `${fontSize} ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
    }

    resize() {
        const { ctx, canvas } = this;
        const maxThRowNum = Math.max(...this.flatColumns.map(v => v.deep));
        let width = 0;
        for (const item of this.columns) {
            width += item.width;
        }
        this.tableWidth = width;
        this.headHeight = maxThRowNum * this.rowHeight;
        // let height = length * this.rowHeight + this.headHeight;
        let height = this.getBodyHeight() + this.headHeight;
        this.tableHeight = height;

        const [top, right, bottom, left] = this.padding;
        width = width + left + right;
        height = height + top + bottom;

        let scale = 1
        if (this.width === 'auto' && this.height !== 'auto') {
            scale = height / this.height;

        } else if (this.width !== 'auto' && this.height === 'auto') {
            scale = width / this.width;

        } else if (this.width !== 'auto' && this.height !== 'auto') {
            scale = Math.max(width / this.width, height / this.height);
        }
        scale = scale || 1;
        scale = 1 / scale;

        canvas.width = width * scale;
        canvas.height = height * scale;
        this.initCtxStatus();


        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = this.bgColor;
        //canvas background color
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //table background color
        if (this.style.background) {
            ctx.fillStyle = this.style.background;
            ctx.fillRect(top * scale, left * scale, this.tableWidth * scale, this.tableHeight * scale);
        }
        ctx.restore();

        ctx.scale(scale, scale);
    }

    private getBodyHeight() {
        if (!this.dataSource?.length) {
            this.trHeights = [];
            return this.rowHeight * 2;
        }
        let totalHeight = 0;
        const { dataSource } = this;
        this.trHeights = [];
        for (let i = 0, l = dataSource.length; i < l; i++) {
            const trHeight = this.getTrHeight(dataSource[i], i)
            totalHeight += trHeight;
            this.trHeights.push(trHeight);
        }

        return totalHeight;
    }

    private getTrHeight(row: Record<string, any>, i: number) {
        const { ctx, rowHeight, flatColumns, textStyle, cellPadding: padding } = this;
        const { lineHeight } = textStyle;
        return Math.max(...flatColumns.map(({ config: item }) => {
            const { render, dataIndex, textOverflow } = item;
            const { fontSize = '14px', fontFamily } = item;
            if (textOverflow === 'ellipsis') {
                return rowHeight;
            }
            let { width, textFontSize, textFontWeight, } = item;
            let height = rowHeight;
            let text = '';
            let maxRowSpan = 1;
            if (typeof render === 'string') {
                if (dataIndex) {
                    text = render.replace(/\{c\}/g, row[dataIndex] ?? '');
                } else {
                    text = render;
                }
            } else if (typeof render === 'function') {
                const res = render(dataIndex ? (row[dataIndex] ?? '') : '', row, i);
                if (res && typeof res === 'object') {
                    const { rowSpan = 1, colSpan = 1 } = res;
                    res.textFontSize && (textFontSize = res.textFontSize);
                    res.textFontWeight && (textFontWeight = res.textFontWeight);
                    text = res.text ?? '';
                    width = width * colSpan;
                    height = height * rowSpan;
                    maxRowSpan = rowSpan;
                } else {
                    text = res ?? '';
                }
            } else if (dataIndex) {
                text = row[dataIndex] ?? '';
            }

            ctx.font = `${textFontWeight ?? ''} ${textFontSize ?? fontSize} ${fontFamily}`;
            const trHeight = getTextHeight(ctx, { text: text + '', lineHeight: lineHeight || 22, width: width - padding[1] - padding[3] }) + padding[0] + padding[2];
            if (maxRowSpan === 1) {
                return trHeight;
            } else if (maxRowSpan <= 0) {
                return rowHeight;
            } else if (trHeight > height) {
                return trHeight - (maxRowSpan - 1) * rowHeight;
            }
            return trHeight;
        }))
    }

    appendData(dataSource: T[]) {
        if (dataSource.length) {
            this.dataSource = this.dataSource.concat(dataSource);
            this.render();
        }
    }
}

export default Table2canvas;

export * from './type.js';
