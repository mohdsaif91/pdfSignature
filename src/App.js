import React, { useRef, useEffect, useState } from "react";
import WebViewer from "@pdftron/webviewer";
import { BlendMode, degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import download from "downloadjs";
import SignatureCanvas from "react-signature-canvas";

import "./App.css";

const App = () => {
  const [pdfInfo, setPdfInfo] = useState();
  const [signature, setSignature] = useState();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const signatureRef = useRef(null);

  const modifyPDF = async () => {
    const url = "/files/second.pdf";
    console.log(url);
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    const pngImage = await pdfDoc.embedPng(signature);
    const pngDims = pngImage.scale(0.5);
    firstPage.drawImage(pngImage, {
      x: parseInt(position.x),
      y: parseInt(position.y),
      width: pngDims.width,
      height: pngDims.height,
    });

    firstPage.drawText(`sign above`, {
      x: parseInt(position.x),
      y: parseInt(position.y),
      size: 15,
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfData = await pdfDoc.save();
    const bytes = new Uint8Array(pdfData);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const docUrl = URL.createObjectURL(blob);
    // const docUrl = URL.createObjectURL(
    //   new Blob(pdfData, { type: "application/pdf" })
    // );
    // console.log(docUrl);
    setPdfInfo(docUrl);

    // Trigger the browser to download the PDF document
    // download(pdfData, "pdf-lib_modification_example.pdf", "application/pdf");
  };

  const saveSignature = () => {
    const base64Img = signatureRef.current.toDataURL();
    setSignature(base64Img);
  };

  const getTrimSignature = () => {
    const trimBase64Img = signatureRef.current.getTrimmedCanvas();
    console.log(trimBase64Img.toDataURL());
  };

  // console.log(signature);

  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="canvas-container">
        <div>
          <h2>Get signature Position</h2>
          <div>
            <label>X(Horizontal) Position</label>
            <input
              onChange={(e) => setPosition({ ...position, x: e.target.value })}
              value={position.x}
              type="number"
            />
          </div>
          <div>
            <label>Y(Verticle) Position</label>
            <input
              value={position.y}
              onChange={(e) => setPosition({ ...position, y: e.target.value })}
              type="number"
            />
          </div>
          <div>
            <button onClick={() => modifyPDF()}>DOWNLOAD THE PDF</button>
          </div>
        </div>
        <div className="signature-container">
          <div className="signature-pad">
            <SignatureCanvas
              // penColor="green"
              ref={signatureRef}
              canvasProps={{ height: 200, className: "sigCanvas" }}
              onEnd={saveSignature}
            />
          </div>
          <div className="btn-container">
            <button onClick={() => getTrimSignature()}>
              Trim the white space
            </button>
            <button>Clear Signature</button>
          </div>
        </div>
      </div>
      <>
        {
          <iframe
            height="700"
            title="test-frame"
            src={pdfInfo}
            type="application/pdf"
          />
        }
      </>

      {/* <button onClick={saveSignature}>Save Signature on PDf</button> */}

      {/* <div className="webviewer" ref={viewer}></div> */}
    </div>
  );
};

export default App;
