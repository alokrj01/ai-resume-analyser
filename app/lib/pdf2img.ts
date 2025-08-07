export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}


//let pdfjsLib: any = null;
//let isLoading = false;
//let loadPromise: Promise<any> | null = null;

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    if (typeof window === "undefined" || !("document" in window)) {
      throw new Error("PDF conversion can only run in the browser.");
    }


//async function loadPdfJs(): Promise<any> {
  //if (pdfjsLib) return pdfjsLib;
  //if (loadPromise) return loadPromise;

  // It will Dynamically import pdfjs-dist only in browser
    const pdfjsLib = await import("pdfjs-dist");
    const pdfjsWorker = (await import("pdfjs-dist/build/pdf.worker.mjs?worker"))
      .default;

  //isLoading = true;
  //loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    // Set the worker source to use local file
    //lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    //pdfjsLib = lib;
    //isLoading = false;
    //return lib;
  //});

  pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();

  //return loadPromise;
  if (file.type !== "application/pdf") {
      return {
        imageUrl: "",
        file: null,
        error: "Uploaded file is not a PDF",
      };
}

//export async function convertPdfToImage(
  //file: File
//): Promise<PdfConversionResult> {
  //try {
    //const lib = await loadPdfJs();

   
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return {
        imageUrl: "",
        file: null,
        error: "Canvas context not available",
      };
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    //if (context) {
      //context.imageSmoothingEnabled = true;
      //context.imageSmoothingQuality = "high";
    //}
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    //await page.render({ canvasContext: context!, viewport }).promise;
    // Provide both canvas and context
    await page.render({ canvas, canvasContext: context, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err instanceof Error ? err.message : err}`,
    };
  }
}