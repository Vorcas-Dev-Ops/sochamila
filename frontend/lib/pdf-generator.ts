import jsPDF from "jspdf";
import api from "./axios";

export interface MockupDetails {
    productId: string;
    productName: string;
    frontName?: string;
    elements?: Array<{ type: string; content: string }>;
    previewImages: Record<string, string | null>;
    stickerUrls?: string[];
    graphicUrls?: string[];
}

export const PDFGenerator = {
    generatePreviewMockup: async (details: MockupDetails): Promise<Blob> => {
        // Create new PDF (A4 size, portrait)
        const doc = new jsPDF("p", "mm", "a4");

        // Add Title
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.text("Custom Design Mockup", 105, 20, { align: "center" });

        // Add Product Details
        doc.setFontSize(14);
        doc.text(`Product: ${details.productName}`, 20, 40);
        doc.text(`ID: ${details.productId}`, 20, 50);
        if (details.frontName) {
            doc.text(`Custom Text: ${details.frontName}`, 20, 60);
        }

        // Function to add image to PDF URL
        const addImageToPdf = async (url: string, x: number, y: number, w: number, h: number) => {
            try {
                // We can just pass the data URL directly if it's base64
                if (url.startsWith("data:image")) {
                    // extract extension
                    const ext = url.split(";")[0].split("/")[1].toUpperCase();
                    const format = ext === "SVG+XML" ? "SVG" : ext;
                    // Note: jsPDF might not support SVG directly well without addSvgAsImage
                    doc.addImage(url, format === "PNG" ? "PNG" : "JPEG", x, y, w, h);
                } else {
                    // If it's a remote URL, we might need to fetch it and convert to dataUrl
                    // For now, since previews are captured via html2canvas, they are data:image/png;base64,...
                    doc.addImage(url, "PNG", x, y, w, h);
                }
            } catch (e) {
                console.error("Failed to add image to PDF:", e);
            }
        };

        let currentY = 80;

        // Add Images
        const sides = Object.keys(details.previewImages);
        for (const side of sides) {
            const imgData = details.previewImages[side];
            if (imgData) {
                // Add new page if we run out of space
                if (currentY > 220) {
                    doc.addPage();
                    currentY = 20;
                }

                doc.setFontSize(16);
                doc.text(`${side.charAt(0).toUpperCase() + side.slice(1)} View`, 105, currentY, { align: "center" });
                currentY += 10;

                await addImageToPdf(imgData, 55, currentY, 100, 100);
                currentY += 110;
            }
        }

        // Return the PDF as Blob
        return doc.output("blob");
    },

    uploadPdf: async (pdfBlob: Blob, filename: string): Promise<string> => {
        // Create FormData
        const formData = new FormData();
        formData.append("file", pdfBlob, filename);

        // Upload POST request to /api/uploads
        try {
            const res = await api.post("/uploads", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data?.success && res.data?.url) {
                return res.data.url;
            } else {
                throw new Error("Failed to upload PDF: " + JSON.stringify(res.data));
            }
        } catch (e: any) {
            console.error("PDF upload failed:", e);
            throw e; // Let the caller alert it
        }
    }
};
