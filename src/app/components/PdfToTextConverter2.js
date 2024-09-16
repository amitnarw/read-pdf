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
                    const items = content.items.map(item => ({
                        str: item.str,
                        transform: item.transform, // Contains x, y positions
                    }));

                    textArray.push(...items);
                }

                // Process textArray to format as a table
                const formattedText = formatTextAsTable(textArray);
                setText(formattedText);
            } catch (error) {
                console.error('Error extracting text from PDF:', error);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // Function to format text as a table based on position
    const formatTextAsTable = (textArray) => {
        // Sort text items by their vertical position (y-coordinate)
        textArray.sort((a, b) => b.transform[5] - a.transform[5]);

        // Group items into rows
        const rows = [];
        let currentRow = [];
        let lastY = null;
        const yThreshold = 10; // Threshold for row separation

        textArray.forEach(item => {
            const y = item.transform[5];

            // Start a new row if y position differs significantly
            if (lastY === null || Math.abs(lastY - y) > yThreshold) {
                if (currentRow.length > 0) {
                    rows.push(currentRow);
                    console.log(currentRow, "33")
                }
                currentRow = [];
            }
            currentRow.push(item.str);
            lastY = y;
        });

        if (currentRow.length > 0) {
            rows.push(currentRow);
        }

        // Convert rows into a table string
        return rows.map(row => row.join(' | ')).join('\n');
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
