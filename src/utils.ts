export function handlePadding(padding?: number[] | number): [number, number, number, number] {
    if (typeof padding === 'number') {
        return [padding, padding, padding, padding];
    } else if (padding instanceof Array && padding.length) {
        return [...padding, ...padding, ...padding, ...padding].slice(0, 4) as any;
    }
    return [10, 10, 10, 10]
}

/**
 * 多行字符串打印
 * @returns 文案的高度
 */
export function fillTexts(ctx: CanvasRenderingContext2D, opt: { text?: string, width: number, lineHeight: number }) {
    const { width, lineHeight } = opt;
    const list = (opt.text?.split('\n') || []).filter(str => str !== '' && str != null);
    let text = list.shift() || '';
    if (!text) return lineHeight;
    ctx.save();
    let lineNum = 1;

    for (let n = 1; n <= text.length; n++) {
        const allWidth = ctx.measureText(text).width;//整体文字长度
        if (allWidth <= width) {
            if (ctx.textAlign === 'center') {
                ctx.fillText(text, width / 2, lineHeight / 2);
            } else if (ctx.textAlign === 'right') {
                ctx.fillText(text, width, lineHeight / 2);
            } else {
                ctx.fillText(text, 0, lineHeight / 2);
            }
            if (list.length) {
                n = 0;
                text = list.shift() as string;
                lineNum += 1;
                ctx.translate(0, lineHeight);
            } else {
                break;
            }
        } else {
            const nowStr = text.substring(0, n);
            const nextStr = text.substring(0, n + 1);
            const nextWidth = ctx.measureText(nextStr).width;
            if (nextWidth > width) {
                text = text.substring(n);
                n = 0;
                lineNum += 1;
                if (ctx.textAlign === 'center') {
                    ctx.fillText(nowStr, width / 2, lineHeight / 2);

                } else if (ctx.textAlign === 'right') {
                    ctx.fillText(nowStr, width, lineHeight / 2);
                } else {
                    ctx.fillText(nowStr, 0, lineHeight / 2);
                }
                ctx.translate(0, lineHeight);
            }
        }
    }
    ctx.stroke();
    ctx.restore();
    return lineNum * lineHeight;
}

export function getTextHeight(ctx: CanvasRenderingContext2D, opt: { text?: string, width: number, lineHeight: number }) {
    const { width, lineHeight } = opt;
    if (width <= 0) {
        return lineHeight;
    }
    const list = (opt.text?.split('\n') || []).filter(str => str !== '' && str != null);
    let text = list.shift() || '';
    if (!text) return lineHeight;
    let lineNum = 1;
    for (let n = 1; n <= text.length; n++) {
        const allWidth = ctx.measureText(text).width;//整体文字长度
        if (allWidth <= width) {
            if (list.length) {
                n = 0;
                text = list.shift() as string;
                lineNum += 1;
            } else {
                break;
            }
        } else {
            const nextStr = text.substring(0, n + 1);
            const nextWidth = ctx.measureText(nextStr).width;
            if (nextWidth > width) {
                text = text.substring(n);
                n = 0;
                lineNum += 1;
            }
        }
    }
    return lineNum * lineHeight;
}

/**
 * 通过每个字符串的字节的长度，截取一定长度(width)值的字符串
 * @param str 目标字符串
 * @param width 容器的长度 
 */
export function getSubStr(ctx: CanvasRenderingContext2D, str: string, width = 150) {
    if (str.length === 1) {
        return str;
    }
    for (let n = 1, l = str.length; n < l; n++) {
        if (ctx.measureText(str.slice(0, n + 1)).width >= width) {
            if (ctx.measureText(str.slice(0, n - 1) + '…').width <= width) {
                return str.slice(0, n - 1) + '…';
            }
            if (ctx.measureText(str.slice(0, n - 2) + '…').width <= width) {
                return str.slice(0, n - 2) + '…';
            }
            if (n <= 2) {
                return '…';
            }
            return str.slice(0, n - 3) + '…';
        }
    }
    return str;
}

export function getRowSpanHeight(trHeights: number[], index: number, rowSpan: number) {
    if (!rowSpan || rowSpan < 0) {
        return 0;
    }
    let height = trHeights[index];
    for (let i = 1; i < rowSpan; i++) {
        height += trHeights[index + i] || 0;
    }
    return height;
}
