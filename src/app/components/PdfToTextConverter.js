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
                let extractedText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    extractedText += content.items.map(item => item.str).join(' ') + '\n';
                }

                setText(extractedText);
            } catch (error) {
                console.error('Error extracting text from PDF:', error);
            }
        };
        reader.readAsArrayBuffer(file);
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
