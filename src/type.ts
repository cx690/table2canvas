export interface TableOpt<T extends Record<string, any> = any> {
    /** Canvas | HTMLCanvasElement */
    canvas: any;
    /** table in canvas's padding default 10，[top and bottom, left and right] */
    padding?: number | number[];
    columns: IColumn<T>[];
    dataSource?: T[];
    /** canvas's width default 'atuo',0 is also 'auto' */
    width?: number | 'auto';
    /** canas's height default 'atuo',0 is also 'auto' */
    height?: number | 'auto';
    /** canvas's background color default 'transparent' */
    bgColor?: string;
    /** Table's title */
    text?: string;
    /** Table's title style */
    textStyle?: TextStyle,
    /** Table's style */
    style?: TableStyle;
}

export interface IColumn<T extends Record<string, any> = any> {
    /** Table's td text */
    title: string;
    /** Display field of the data record */
    dataIndex?: string;
    /** color of column's head defaule 'rgba(0,0,0,0.85)' */
    titleColor?: string;
    /** font weight of column's head defaule 'bold' */
    titleFontWeight?: string;
    /** font size of column's head defaule inherit TableStyle.fontSize */
    titleFontSize?: string;
    /** The specify which way that column is aligned default 'left'  */
    textAlign?: 'left' | 'right' | 'center';
    /** color of column's body defaule 'rgba(0,0,0,0.85)' */
    textColor?: string;
    /** font weight of column's body defaule '' */
    textFontWeight?: string;
    /** font size of column's body defaule inherit TableStyle.fontSize */
    textFontSize?: string;
    /** Width of this column */
    width?: number;
    /** Group table head */
    children?: IColumn<T>[];
    /** custom render,if is string,{c} is row[dataIndex] */
    render?: ((text: string, row: T, index: number) => string | null | void | CellInfo) | string;
}

/** Rtntype of render */
export interface CellInfo {
    text?: string | null;
    colSpan?: number;
    rowSpan?: number;
    textColor?: string;
    textFontSize?: string;
    textFontWeight?: string;
}

export interface TableStyle {
    /** height of header cell default value of rowHeight */
    headerRowHeight?: number;
    /** height of each row default 55 */
    rowHeight?: number;
    /** default width of all columns default 150 */
    columnWidth?: number;
    /** color of border default '#e8e8e8' */
    borderColor?: string;
    /** The specify which way that column is aligned default 'left'  */
    textAlign?: 'left' | 'right' | 'center';
    /** color of table defaule 'rgba(0,0,0,0.85)' */
    color?: string;
    /** default '14px' */
    fontSize?: string;
    /** default 'sans-serif' */
    fontFamily?: string;
    /** background color of header cell default 'rgba(0,0,0,0.02)' */
    headerBgColor?: string;
    /** both left and right padding of table cell  default 8*/
    paddingLR?: number | [number, number];
}

export interface TextStyle {
    /** default inherit style.color */
    color?: string;
    /** default inherit style.fontSize */
    fontSize?: string;
    /** default inherit style.fontFamily */
    fontFamily?: string;
    /** default 'center' */
    textAlign?: 'left' | 'right' | 'center';
    /** default 55 */
    lineHeight?: number;
}