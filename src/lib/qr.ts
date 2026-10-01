import QRCode from "qrcode";

/** Black-on-white SVG QR code sized by CSS (no width/height attributes). */
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
}
