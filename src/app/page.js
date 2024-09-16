import PdfToTextConverter from './components/PdfToTextConverter';
import PdfToTextConverter2 from './components/PdfToTextConverter2';
import PdfToTextConverter3 from './components/PdfToTextConverter3';
import PdfToTextConverter4 from './components/PdfToTextConverter4';

export default function Home() {
  return (
    <div>
      <h1>PDF to Text Converter</h1>
      <PdfToTextConverter />
      <PdfToTextConverter2 />
      <PdfToTextConverter3 />
      <PdfToTextConverter4 />
    </div>
  );
}
