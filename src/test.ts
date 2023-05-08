import { Canvas } from 'canvas';
import Table2canvas from './index.js';
import fs from 'fs';
import { IColumn } from './type.js';

const columns: IColumn[] = [
    {
        title: 'name', children: [
            {
                title: 'first',
                dataIndex: 'first'
            },
            {
                title: 'last',
                dataIndex: 'last',
                render: (text, row, i) => {
                    if (i === 0) {
                        return { text, rowSpan: 3 }
                    }
                    if (i === 1) {
                        return { text, rowSpan: 0 }
                    }
                    if (i === 2) {
                        return { text, rowSpan: 0 }
                    }
                    return text;
                }
            }
        ]
    },
    { title: 'age', dataIndex: 'age', textAlign: 'center', textColor: 'blue' },
    { title: 'weight', dataIndex: 'weight', render: '{c}kg' },
    { title: 'address', dataIndex: 'address', width: 200 },
    {
        title: 'other-abcd', children: [
            {
                title: 'a',
                dataIndex: 'a',
                render: (text, row, i) => {
                    if (i === 2) {
                        return { text, colSpan: 2, rowSpan: 2 }
                    }
                    if (i === 3) {
                        return { text, colSpan: 0, rowSpan: 0 }
                    }
                    return text;
                }
            },
            {
                title: 'b',
                dataIndex: 'b',
                render: (text, row, i) => {
                    if (i === 2 || i === 3) {
                        return { text, colSpan: 0, rowSpan: 0 }
                    }
                    return text;
                }
            },
            {
                title: 'c+d',
                children: [
                    {
                        title: 'c',
                        dataIndex: 'c'
                    },
                    {
                        title: 'd',
                        dataIndex: 'd'
                    }
                ]
            }
        ]
    }
]

const dataSource: any[] = [
    { first: 'Jack', last: 'smith', age: 16, weight: 50, address: '1.somewhere\n2.somewhere', a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
    { first: 'Jack', last: 'smith', age: 26, weight: 60, address: 'street9527123456789no.,it is a to long adress!', a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
    { first: 'Jack', last: 'last', age: 36, weight: 70, address: 'where', a: 'merge-a+b\nline2\nline3', b: 'merge-a+b', c: 'c3', d: 'd3' },
    { first: 'Tom', last: 'last', age: 46, weight: 80, address: 'where', a: 'merge-a+b', b: 'merge-a+b', c: 'c4', d: 'd4' },
]

const table = new Table2canvas({
    canvas: new Canvas(2, 2),
    columns: columns,
    dataSource: dataSource,
    bgColor: '#fff',
    text: 'This is table title!',
})

// table.appendData(dataSource);

const buffer = table.canvas.toBuffer();

fs.writeFileSync('a.png', buffer);
