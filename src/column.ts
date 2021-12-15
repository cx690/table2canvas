import { NodeCanvasRenderingContext2D } from "canvas";
import { IColumn } from "./type";

export interface BaseConfig {
    /** 单元格的基本宽度 */
    width: number;
    /** 单元格的基本高度 */
    height: number;
    borderColor?: string;
    paddingLR: [number, number] | number;
    fontSize: string;
    fontFamily: string;
    bgColor: string;
    textAlign: 'left' | 'right' | 'center';
}

export class Column {
    width: number;
    textWidth: number = 0;
    height: number;
    column: IColumn;
    baseConfig: BaseConfig;
    parent: Column | null;
    config: IColumn & BaseConfig;
    children?: Column[];
    paddingL: number = 0;
    paddingR: number = 0;
    deep = 1;
    colSpan = 1;
    constructor(column: IColumn, baseConfig: BaseConfig, parent: Column | null = null, deep = 1) {
        const config = { ...baseConfig, ...column };
        const { width, height } = config;
        this.width = width;
        this.height = height;
        this.column = column;
        this.baseConfig = baseConfig;
        this.config = config;
        this.parent = parent;
        this.deep = deep;
    }
}


export function renderTh(ctx: NodeCanvasRenderingContext2D, item: Column, x = 0, y = 0) {
    const { borderColor, titleColor, textAlign, title, fontFamily, fontSize, bgColor } = item.config as Required<IColumn & BaseConfig>;
    const { width, height, textWidth, paddingL, paddingR, children } = item;
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
    ctx.font = `bold ${fontSize} ${fontFamily}`;
    const midY = y + 0.5 * height;
    if (textAlign === 'center' || children?.length) {
        ctx.textAlign = 'center';
        ctx.fillText(title, x + 0.5 * width, midY, textWidth);
    } else if (textAlign === 'right') {
        ctx.fillText(title, x + width - paddingR, midY, textWidth);
    } else {
        ctx.fillText(title, x + paddingL, midY, textWidth);
    }
    ctx.fill();
    ctx.restore();

    if (children?.length) {
        let _x = x + 0;
        let _y = y + height;
        for (const c of children) {
            renderTh(ctx, c, _x, _y);
            _x += c.width;
        }
    }
}

export function genColumns(columns: IColumn[], baseConfig: BaseConfig, parent: Column | null = null, deep = 1) {
    const list: Column[] = [];
    const { paddingL, paddingR } = getPaddingLR(baseConfig.paddingLR);
    for (const item of columns) {
        const instance = new Column(item, baseConfig, parent, deep);
        if (item.children?.length) {
            instance.children = genColumns(item.children, baseConfig, instance, deep + 1);
        }

        if (instance.children?.length) {
            const columns = flatColumns(instance.children);
            let width = 0;
            for (const item of columns) {
                width += item.width;
            }
            instance.width = width;
        }

        instance.paddingL = paddingL;
        instance.paddingR = paddingR;
        instance.textWidth = getTextWidth(instance.width, paddingL, paddingR);
        list.push(instance);
    }
    setThHeight(list, baseConfig.height);
    return list;
}
/**
 * 获取children或者本身的最后一层数据集合
 * @param columns 
 * @returns 
 */
export function flatColumns(columns: Column[]) {
    const list: Column[] = [];
    for (const column of columns) {
        if (column.children?.length) {
            list.push(...flatColumns(column.children));
        } else {
            list.push(column);
        }
    }
    return list;
}

export function getTextWidth(width: number, paddingL: number, paddingR: number) {
    return width - paddingR - paddingL;
}

/**
 * 设置每个th的高度
 * @param columns 当前所有的column
 * @param baseHeight 基本配置项中的高度
 * @param height 当前th的必然高度
 */
function setThHeight(columns: Column[], baseHeight: number, height?: number) {
    const maxRowNum = Math.max(...flatColumns(columns).map(v => v.deep));
    if (typeof height === 'number') {
        for (const item of columns) {
            if (item.children?.length) {
                item.height = height;
                setThHeight(item.children, baseHeight, height);
            } else {
                const itRowNum = maxRowNum - Math.max(...flatColumns([item]).map(v => v.deep)) + 1;
                item.height = height * itRowNum;
            }
        }
        return;
    }

    if (maxRowNum <= 1) return;
    const maxHeight = baseHeight * maxRowNum;

    for (const item of columns) {
        if (!item.children?.length) {
            item.height = maxHeight;
        } else {
            const itRowNum = Math.max(...flatColumns([item]).map(v => v.deep));
            const height = maxHeight / itRowNum;
            item.height = height;
            setThHeight(item.children, baseHeight, height);
        }
    }
}

export function getPaddingLR(paddingLR?: number | [number, number]) {
    let paddingL = 8, paddingR = 8;
    if (typeof paddingLR === 'number') {
        paddingL = paddingLR;
        paddingR = paddingLR;
    } else if (paddingLR instanceof Array && typeof paddingLR[0] === 'number' && typeof paddingLR[1] === 'number') {
        paddingL = paddingLR[0];
        paddingR = paddingLR[1];
    }
    return { paddingL, paddingR };
}