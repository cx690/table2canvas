import { NodeCanvasRenderingContext2D } from "canvas";
import { Column, getPaddingLR, getTextWidth } from "./column";

export function renderTr<T extends Record<string, any> = any>(ctx: NodeCanvasRenderingContext2D, row: T, i: number, flatColumns: Column[], rowHeight: number) {
    let x = 0;
    const { paddingL, paddingR } = getPaddingLR(flatColumns[0]?.config.paddingLR);
    for (const { config: item } of flatColumns) {
        const { render, dataIndex, textColor, textAlign, fontSize = '14px', fontFamily, borderColor, textFontSize, textFontWeight } = item;
        let { width } = item;
        let height = rowHeight;
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
                text = res.text ?? '';
                width = width * colSpan;
                height = height * rowSpan;
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
                ctx.save();
                const midY = height * 0.5;
                const textWidth = getTextWidth(width, paddingL, paddingR);
                ctx.textAlign = textAlign ?? 'left';
                textColor && (ctx.fillStyle = textColor);
                ctx.font = `${textFontWeight ?? ''} ${textFontSize ?? fontSize} ${fontFamily}`;
                if (textAlign === 'center') {
                    ctx.textAlign = 'center';
                    ctx.fillText(text, x + 0.5 * width, midY, textWidth);
                } else if (textAlign === 'right') {
                    ctx.fillText(text, x + width - paddingR, midY, textWidth);
                } else {
                    ctx.fillText(text, x + paddingL, midY, textWidth);
                }
                ctx.restore();
            }
        }
        x += item.width;
    }
}