import { NodeCanvasRenderingContext2D } from "canvas";
import { Column, getPaddingLR, getTextWidth } from "./column";

export function renderTr<T extends Record<string, any> = any>(ctx: NodeCanvasRenderingContext2D, row: T, i: number, flatColumns: Column[], rowHeight: number) {
    let x = 0;
    const { paddingL, paddingR } = getPaddingLR(flatColumns[0]?.config.paddingLR);
    for (const { config: item } of flatColumns) {
        const { render, dataIndex, textAlign, fontSize = '14px', fontFamily, borderColor, textOverflow } = item;
        let { textColor, textFontSize, textFontWeight } = item;
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
                res.textColor && (textColor = res.textColor);
                res.textFontSize && (textFontSize = res.textFontSize);
                res.textFontWeight && (textFontWeight = res.textFontWeight);
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
                if (textOverflow === 'ellipsis') {
                    const fontsize = parseFloat(textFontSize ?? fontSize) || 14;
                    text = getSubStr(text, textWidth, fontsize / 2);
                }
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

/**
 * 通过每个字符串的字节的长度，截取一定长度(width)值的字符串
 * @param str 目标字符串
 * @param width 容器的长度 
 * @param byWidth 每个比特所占的长度 默认8
 */
function getSubStr(str: string, width = 150, byWidth = 7) {
    const l = getBt(str);
    const maxL = Math.floor(width / byWidth) - 1;
    if (l > maxL) {
        return subStrByByte(str as string, 0, maxL);
    }
    return str;
}

/**
 * 获取字符串的比特长度
 * @param str 字符串
 */
function getBt(str?: string | null) {
    if (str === null || str === undefined) return 0;
    const char = str.replace(
        /[\u4e00-\u9fa5,\u3002,\uff1b,\uff0c,\uff1a,\u201c,\u201d,\uff08,\uff09,\u3001,\uff1f,\u300a,\u300b]/g,
        "**"
    );
    // const char = str.replace(/[^\x00-\xff]/g, '**');
    return char.length;
}

/**
 * 通过比特长度截取字符串
 * @param str 字符串
 * @param start 开始索引
 * @param end 结束索引
 */
function subStrByByte(str: string, start: number, end: number) {
    const l = str.length;
    let _str = "";
    for (let i = start, now = 0; i < l && now < end; i++) {
        const item = str[i];
        if (escape(item).length > 4) {
            now += 2;
        } else {
            now += 1;
        }
        _str += item;
    }
    if (_str.length === 0) {
        return _str;
    }
    return _str + "…";
}