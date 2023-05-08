import { IColumn } from "./type.js";

export interface BaseConfig {
    /** 单元格的基本宽度 */
    width: number;
    /** 单元格的基本高度 */
    height: number;
    borderColor?: string;
    padding: number[];
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

export function genColumns(columns: IColumn[], baseConfig: BaseConfig, parent: Column | null = null, deep = 1) {
    const list: Column[] = [];
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

        instance.textWidth = instance.width - baseConfig.padding[3] - baseConfig.padding[1];
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
