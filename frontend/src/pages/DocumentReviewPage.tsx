import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronRight, Download, RefreshCw, Save, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { PDFViewer } from '../components/features/document-review/PDFViewer';
import { ExtractedDataPanel } from '../components/features/document-review/ExtractedDataPanel';
import {
  downloadDocumentJson,
  getDocumentDetails,
  reprocessDocument,
  updateDocument,
} from '../lib/api';
import { DocumentDetails, EditableLineItem, ExtractedField } from '../lib/types';
import { confirmAction } from '../services/feedback';

function toEditableFields(document: DocumentDetails): Record<string, ExtractedField> {
  return Object.fromEntries(
    Object.entries(document.extractedFields).map(([key, field]) => [
      key,
      {
        ...field,
        isEdited: false,
        originalValue: field.value,
      },
    ])
  );
}

function toSnapshot(fields: Record<string, ExtractedField>, lineItems: EditableLineItem[]) {
  return JSON.stringify({
    fields: Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value || ''])),
    lineItems: lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
  });
}

function buildEditedExportPayloadFromDocument(document: DocumentDetails) {
  return {
    id: document.id,
    status: document.status,
    processingTime: document.processingTime,
    overallConfidence: document.overallConfidence,
    exportedAt: new Date().toISOString(),
    extractedFields: Object.fromEntries(Object.entries(document.extractedFields).map(([fieldKey, field]) => [fieldKey, field.value || null])),
    lineItems: document.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
    validationResults: document.validationResults,
  };
}

function parseNullableNumber(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function DocumentReviewPage() {
  const { id } = useParams();
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [fields, setFields] = useState<Record<string, ExtractedField>>({});
  const [lineItems, setLineItems] = useState<EditableLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const loadDocument = async () => {
    if (!id) {
      return;
    }

    const response = await getDocumentDetails(id);
    setDocument(response);
    setFields(toEditableFields(response));
    setLineItems(response.lineItems);
  };

  useEffect(() => {
    let isActive = true;

    async function fetchDocument() {
      if (!id) {
        setErrorMessage('No document id was provided.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await getDocumentDetails(id);

        if (!isActive) {
          return;
        }

        setDocument(response);
        setFields(toEditableFields(response));
        setLineItems(response.lineItems);
      } catch (error) {
        if (isActive) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load document.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void fetchDocument();

    return () => {
      isActive = false;
    };
  }, [id]);

  const hasChanges = useMemo(() => {
    if (!document) {
      return false;
    }

    return toSnapshot(fields, lineItems) !== toSnapshot(toEditableFields(document), document.lineItems);
  }, [document, fields, lineItems]);

  const handleFieldEdit = (field: string, value: string) => {
    setFields((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        isEdited: value !== (document?.extractedFields[field]?.value || ''),
        originalValue: document?.extractedFields[field]?.value || null,
      },
    }));
  };

  const handleReset = (field: string) => {
    setFields((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        value: document?.extractedFields[field]?.value || '',
        isEdited: false,
      },
    }));
  };

  const handleLineItemChange = (lineItemId: number, field: keyof EditableLineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== lineItemId) {
          return item;
        }

        const nextItem = {
          ...item,
          [field]: field === 'description' ? value : parseNullableNumber(value),
        };

        if (field === 'quantity' || field === 'unitPrice') {
          if (nextItem.quantity !== null && nextItem.unitPrice !== null) {
            nextItem.total = Number((nextItem.quantity * nextItem.unitPrice).toFixed(2));
          }
        }

        if (field === 'total') {
          nextItem.total = parseNullableNumber(value);
        }

        return nextItem;
      })
    );
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: Math.max(0, ...prev.map((item) => item.id)) + 1,
        description: '',
        quantity: null,
        unitPrice: null,
        total: null,
      },
    ]);
  };

  const handleRemoveLineItem = (lineItemId: number) => {
    setLineItems((prev) => prev.filter((item) => item.id !== lineItemId));
  };

  const handleSaveChanges = async (): Promise<DocumentDetails | null> => {
    if (!id || !document) {
      return null;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setInfoMessage(null);

      const updated = await updateDocument(id, {
        extractedFields: Object.fromEntries(
          Object.entries(fields).map(([fieldKey, field]) => [fieldKey, field.value || null])
        ),
        lineItems: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      });

      // Re-read from backend so UI state reflects persisted database values.
      const persisted = await getDocumentDetails(id);
      setDocument(persisted);
      setFields(toEditableFields(persisted));
      setLineItems(persisted.lineItems);
      setInfoMessage('Changes saved successfully.');
      return persisted;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save changes.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const getLatestDocumentForExport = async (): Promise<DocumentDetails | null> => {
    if (!id) {
      return document;
    }

    if (hasChanges) {
      const saved = await handleSaveChanges();
      if (!saved) {
        return null;
      }
    }

    try {
      const latest = await downloadDocumentJson(id);
      setDocument(latest);
      setFields(toEditableFields(latest));
      setLineItems(latest.lineItems);
      return latest;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load latest saved document for export.');
      return null;
    }
  };

  const handleReprocess = async () => {
    if (!id || !confirmAction('Are you sure you want to reprocess this document?')) {
      return;
    }

    try {
      setErrorMessage(null);
      setInfoMessage(null);
      await reprocessDocument(id);
      setInfoMessage('Document queued for reprocessing. Refresh in a moment to see updated extraction results.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to queue document for reprocessing.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!document) {
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const latestDocument = await getLatestDocumentForExport();
      if (!latestDocument) {
        return;
      }

      const payload = buildEditedExportPayloadFromDocument(latestDocument);
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const maxWidth = pageWidth - margin * 2;
      let y = margin;

      const ensureSpace = (height = 18) => {
        if (y + height <= pageHeight - margin) {
          return;
        }

        pdf.addPage();
        y = margin;
      };

      const addHeading = (text: string) => {
        ensureSpace(26);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(text, margin, y);
        y += 24;
      };

      const addParagraph = (text: string) => {
        const lines = pdf.splitTextToSize(text, maxWidth) as string[];
        ensureSpace(lines.length * 14 + 4);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.text(lines, margin, y);
        y += lines.length * 14 + 4;
      };

      const addKeyValue = (key: string, value: string) => {
        ensureSpace(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text(`${key}:`, margin, y);

        pdf.setFont('helvetica', 'normal');
        const wrapped = pdf.splitTextToSize(value, maxWidth - 150) as string[];
        pdf.text(wrapped, margin + 150, y);
        y += Math.max(18, wrapped.length * 14);
      };

      addHeading('Docfish Invoice Correction Report');
      addParagraph(`Document ID: ${payload.id}`);
      addParagraph(`Exported at: ${payload.exportedAt}`);
      addParagraph(`Status: ${payload.status}`);
      addParagraph(`Confidence: ${payload.overallConfidence}%`);
      addParagraph(`Processing Time: ${payload.processingTime || 'n/a'}`);

      y += 8;
      addHeading('Corrected Fields');
      Object.entries(payload.extractedFields).forEach(([key, value]) => {
        addKeyValue(key, value === null ? 'N/A' : String(value));
      });

      y += 8;
      addHeading('Corrected Line Items');
      if (payload.lineItems.length === 0) {
        addParagraph('No line items present.');
      } else {
        addParagraph('Description | Quantity | Unit Price | Line Total');
        payload.lineItems.forEach((item, index) => {
          addParagraph(
            `${index + 1}. ${item.description || 'Item'} | ${item.quantity ?? 'N/A'} | ${
              item.unitPrice !== null ? item.unitPrice.toFixed(2) : 'N/A'
            } | ${item.total !== null ? item.total.toFixed(2) : 'N/A'}`
          );
        });
      }

      y += 8;
      addHeading('Validation Results');
      payload.validationResults.forEach((result, index) => {
        addParagraph(`${index + 1}. ${result.title}: ${result.message}`);
      });

      pdf.save(`document-${payload.id}-corrected.pdf`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to download corrected PDF.');
    }
  };

  const handleDownloadJSON = async () => {
    if (!document) {
      return;
    }

    try {
      const latestDocument = await getLatestDocumentForExport();
      if (!latestDocument) {
        return;
      }

      const payload = buildEditedExportPayloadFromDocument(latestDocument);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = `document-${payload.id}-corrected.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to download corrected JSON.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-6 text-center shadow-lg">
          <div className="w-10 h-10 border-4 border-[var(--df-navy)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-gray-700">Loading document workspace...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-6">
        <div className="rounded-2xl border border-red-200 bg-white px-8 py-6 text-center shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Document unavailable</h1>
          <p className="text-sm text-red-700 mb-6">{errorMessage || 'The requested document could not be loaded.'}</p>
          <Link to="/documents" className="inline-flex items-center justify-center px-5 py-3 bg-[var(--df-navy)] text-white rounded-xl font-semibold">
            Back to documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4">
        <div className="flex items-center justify-between max-w-[1920px] mx-auto flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/documents" className="text-gray-600 hover:text-[var(--df-navy)] transition-colors font-medium">
              Invoices
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold">{document.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleReprocess} className="df-btn-secondary px-4 py-2 text-sm">
              <RefreshCw className="w-4 h-4" />
              Reprocess
            </button>

            <button onClick={handleDownloadPDF} className="df-btn-secondary px-4 py-2 text-sm">
              <Download className="w-4 h-4" />
              PDF
            </button>

            <button onClick={handleDownloadJSON} className="df-btn-secondary px-4 py-2 text-sm">
              <FileText className="w-4 h-4" />
              JSON
            </button>

            <motion.button
              onClick={handleSaveChanges}
              disabled={!hasChanges || isSaving}
              animate={{
                scale: hasChanges ? [1, 1.03, 1] : 1,
                translateY: hasChanges ? 0 : 3,
                translateX: hasChanges ? 0 : 3,
              }}
              className={`px-6 py-2 rounded-[6px] font-bold border-1.5 border-[#1A1A1A] transition-all flex items-center gap-2 text-sm ${
                hasChanges && !isSaving
                  ? 'bg-[var(--df-lime)] text-gray-900 shadow-[3px_3px_0_#1A1A1A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
                  : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </div>

        {hasChanges ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <p className="text-sm text-yellow-800">
              You have unsaved changes. Save when you’re ready to update the backend record.
            </p>
          </motion.div>
        ) : null}

        {infoMessage ? (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {infoMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-gray-200">
          <PDFViewer documentUrl={document.documentUrl} />
        </div>

        <div className="w-1/2">
          <ExtractedDataPanel
            document={document}
            fields={fields}
            lineItems={lineItems}
            onFieldEdit={handleFieldEdit}
            onReset={handleReset}
            onLineItemChange={handleLineItemChange}
            onAddLineItem={handleAddLineItem}
            onRemoveLineItem={handleRemoveLineItem}
          />
        </div>
      </div>
    </div>
  );
}
