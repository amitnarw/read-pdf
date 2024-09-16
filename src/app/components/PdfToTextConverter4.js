'use client';

import React, { useState, useEffect } from 'react';

const PdfToTextConverter = () => {
    const [text, setText] = useState('');
    const [pdfjsLib, setPdfjsLib] = useState(null);

    useEffect(() => {
        import('pdfjs-dist/webpack').then(pdfjs => {
            setPdfjsLib(pdfjs);
        }).catch(error => {
            console.error('Error loading PDF.js library:', error);
        });
    }, []);

    const extractTextFromPDF = async (file) => {
        if (!pdfjsLib) return;

        const reader = new FileReader();
        reader.onload = async () => {
            const typedArray = new Uint8Array(reader.result);
            try {
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                let textArray = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();

                    // Process text items with their position
                    textArray.push(...content.items.map(item => ({
                        str: item.str,
                        x: item.transform[4],
                        y: item.transform[5],
                    })));
                }

                // Format as columns
                const formattedText = formatTextAsColumns(textArray);
                setText(formattedText);
            } catch (error) {
                console.error('Error extracting text from PDF:', error);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const formatTextAsColumns = (textArray) => {
        // Group text items by x position (column)
        const columns = [];
        const xThreshold = 50; // Adjust as needed

        textArray.forEach(item => {
            const x = item.x;
            let column = columns.find(col => Math.abs(col[0].x - x) < xThreshold);

            if (!column) {
                column = [];
                columns.push(column);
            }

            column.push(item);
        });

        // Sort each column by y position (row)
        columns.forEach(column => column.sort((a, b) => b.y - a.y));

        // Build table from columns
        const maxRows = Math.max(...columns.map(col => col.length));
        let formattedText = '';

        for (let row = 0; row < maxRows; row++) {
            formattedText += columns.map(col => (col[row] ? col[row].str : '')).join(' | ') + '\n';
        }

        return formattedText.trim();
    };

    return (
        <div>
            <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        extractTextFromPDF(file);
                    }
                }}
            />
            <pre>{text}</pre>
        </div>
    );
};

export default PdfToTextConverter;
