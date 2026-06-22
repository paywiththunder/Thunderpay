"use client";

function sanitizeFileName(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "transaction-receipt"
  );
}

function copyComputedStyles(sourceElement: Element, targetElement: Element) {
  const computedStyle = window.getComputedStyle(sourceElement);
  const targetHtmlElement = targetElement as HTMLElement;

  for (const propertyName of computedStyle) {
    targetHtmlElement.style.setProperty(
      propertyName,
      computedStyle.getPropertyValue(propertyName),
      computedStyle.getPropertyPriority(propertyName)
    );
  }

  if (sourceElement instanceof HTMLElement && targetElement instanceof HTMLElement) {
    targetElement.style.boxSizing = "border-box";
  }
}

function inlineReceiptStyles(sourceRoot: HTMLElement, clonedRoot: HTMLElement) {
  copyComputedStyles(sourceRoot, clonedRoot);
  clonedRoot.removeAttribute("class");

  const sourceElements = sourceRoot.querySelectorAll("*");
  const clonedElements = clonedRoot.querySelectorAll("*");

  sourceElements.forEach((sourceElement, index) => {
    const clonedElement = clonedElements[index];
    if (!clonedElement) {
      return;
    }

    copyComputedStyles(sourceElement, clonedElement);

    if (clonedElement instanceof HTMLElement) {
      clonedElement.removeAttribute("class");

      if (clonedElement.dataset.receiptDownload !== undefined) {
        clonedElement.style.display = "none";
      }
    }
  });
}

function buildReceiptClone(receiptElement: HTMLElement) {
  const clonedReceipt = receiptElement.cloneNode(true) as HTMLElement;
  inlineReceiptStyles(receiptElement, clonedReceipt);
  clonedReceipt.style.margin = "0 auto";
  clonedReceipt.style.width = `${receiptElement.offsetWidth}px`;
  clonedReceipt.style.maxWidth = `${receiptElement.offsetWidth}px`;
  clonedReceipt.style.minHeight = `${receiptElement.offsetHeight}px`;

  return clonedReceipt;
}

export async function renderReceiptPreviewHtml(receiptElement: HTMLElement) {
  await document.fonts.ready;
  return buildReceiptClone(receiptElement).outerHTML;
}

export async function printReceipt(
  receiptElement: HTMLElement,
  title = "Transaction Receipt"
) {
  const receiptMarkup = await renderReceiptPreviewHtml(receiptElement);
  const printWindow = window.open("", "_blank", "width=900,height=1000");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
        <style>
          html,
          body {
            margin: 0;
            padding: 0;
            background: #000000;
          }

          body {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            padding: 24px 16px;
          }

          .receipt-print-shell {
            width: 100%;
            display: flex;
            justify-content: center;
          }

          @page {
            size: auto;
            margin: 12mm;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-print-shell">${receiptMarkup}</div>
      </body>
    </html>
  `);
  printWindow.document.close();

  const safeTitle = sanitizeFileName(title);
  printWindow.document.title = safeTitle;

  printWindow.onload = () => {
    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };
}
