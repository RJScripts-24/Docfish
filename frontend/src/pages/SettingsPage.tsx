import { useEffect, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { VersionHistory } from '../components/features/settings/VersionHistory';
import { PromptEditor } from '../components/features/settings/PromptEditor';
import { TestPromptPanel } from '../components/features/settings/TestPromptPanel';
import { Plus, Beaker } from 'lucide-react';
import {
  activatePrompt,
  createPrompt,
  deletePrompt,
  listPrompts,
  testPrompt,
  updatePrompt,
} from '../lib/api';
import { PromptVersion } from '../lib/types';

const defaultPromptContent = `You are an AI assistant specialized in extracting structured data from invoices and documents.

Extract the following information from the document:

1. **Vendor Information:**
   - vendor_name: Full legal name of the vendor/supplier
   - vendor_address: Complete address
   - vendor_contact: Phone, email, or website

2. **Invoice Details:**
   - invoice_number: Unique invoice identifier
   - invoice_date: Date when invoice was issued (format: YYYY-MM-DD)
   - due_date: Payment due date (format: YYYY-MM-DD)
   - currency: Currency code (e.g., USD, EUR)

3. **Line Items:**
   For each line item, extract:
   - description: Product/service description
   - quantity: Number of units
   - unit_price: Price per unit
   - line_total: Total for this line item

4. **Totals:**
   - subtotal: Sum before taxes
   - tax_amount: Total tax amount
   - tax_rate: Tax percentage
   - total_amount: Final amount to be paid

5. **Additional Information:**
   - payment_terms: Terms of payment (e.g., Net 30)
   - notes: Any special notes or instructions

**Instructions:**
- Return data in JSON format
- Include confidence scores (0-1) for each extracted field
- If a field is not found, set value to null
- Ensure line items sum matches total_amount
- Flag any inconsistencies in validation_warnings`;

export default function SettingsPage() {
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [versionName, setVersionName] = useState('');
  const [description, setDescription] = useState('');
  const [promptContent, setPromptContent] = useState(defaultPromptContent);
  const [status, setStatus] = useState<'active' | 'draft'>('draft');

  const applyVersion = (version: PromptVersion | null) => {
    if (!version) {
      setSelectedVersionId('');
      setVersionName('');
      setDescription('');
      setPromptContent(defaultPromptContent);
      setStatus('draft');
      return;
    }

    setSelectedVersionId(version.id);
    setVersionName(version.name);
    setDescription(version.description);
    setPromptContent(version.content || defaultPromptContent);
    setStatus(version.status);
  };

  const loadVersions = async (preferredId?: string) => {
    const response = await listPrompts();
    setVersions(response);

    const preferred =
      response.find((item) => item.id === preferredId) ||
      response.find((item) => item.status === 'active') ||
      response[0] ||
      null;

    applyVersion(preferred);
  };

  useEffect(() => {
    let isActive = true;

    async function fetchPrompts() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await listPrompts();

        if (!isActive) {
          return;
        }

        setVersions(response);
        applyVersion(response.find((item) => item.status === 'active') || response[0] || null);
      } catch (error) {
        if (isActive) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load prompt versions.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void fetchPrompts();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSelectVersion = (id: string) => {
    const version = versions.find((item) => item.id === id) || null;
    applyVersion(version);
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const handleActivateVersion = async (id: string) => {
    try {
      setErrorMessage(null);
      const activated = await activatePrompt(id);
      await loadVersions(activated.id);
      setInfoMessage('Prompt version activated successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to activate prompt version.');
    }
  };

  const handleDeleteVersion = async (id: string) => {
    try {
      setErrorMessage(null);
      await deletePrompt(id);
      await loadVersions();
      setInfoMessage('Prompt version deleted successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete prompt version.');
    }
  };

  const handleSaveNewVersion = async () => {
    try {
      setErrorMessage(null);
      const created = await createPrompt({
        name: versionName || 'Untitled prompt version',
        description,
        content: promptContent,
      });

      if (status === 'active') {
        await activatePrompt(created.id);
      }

      await loadVersions(created.id);
      setInfoMessage('New prompt version created successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create prompt version.');
    }
  };

  const handleUpdateVersion = async () => {
    if (!selectedVersionId) {
      await handleSaveNewVersion();
      return;
    }

    try {
      setErrorMessage(null);
      await updatePrompt(selectedVersionId, {
        name: versionName,
        description,
        content: promptContent,
        status,
      });
      await loadVersions(selectedVersionId);
      setInfoMessage('Prompt version updated successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update prompt version.');
    }
  };

  const handleSetActive = async () => {
    if (!selectedVersionId) {
      setErrorMessage('Create or select a prompt version before activating it.');
      return;
    }

    await handleActivateVersion(selectedVersionId);
  };

  const handleCreateNew = () => {
    setErrorMessage(null);
    setInfoMessage(null);
    applyVersion(null);
  };

  const handleRunTest = async (sampleText: string) => {
    if (!selectedVersionId) {
      throw new Error('Save a prompt version before running a test.');
    }

    return testPrompt(selectedVersionId, sampleText);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col">
        <DashboardHeader />

        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-[1920px] mx-auto">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prompt Management</h1>
              <p className="text-gray-600 mt-1">Configure and version AI extraction prompts</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowTestPanel(true)}
                className="df-btn-secondary px-5 py-2.5 bg-white border-purple-600 text-purple-700 shadow-[3px_3px_0_#9333ea]"
              >
                <Beaker className="w-5 h-5 text-purple-600" />
                Test Prompt
              </button>
              <button
                onClick={handleCreateNew}
                className="df-btn-primary px-5 py-2.5 shadow-[3px_3px_0_var(--df-black)]"
              >
                <Plus className="w-5 h-5 text-black" />
                Create New Version
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {infoMessage ? (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {infoMessage}
            </div>
          ) : null}
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3">
            <VersionHistory
              versions={versions}
              selectedVersionId={selectedVersionId}
              onSelectVersion={handleSelectVersion}
              onActivateVersion={handleActivateVersion}
              onDeleteVersion={handleDeleteVersion}
            />
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">Loading prompt versions...</div>
            ) : (
              <PromptEditor
                versionName={versionName}
                description={description}
                promptContent={promptContent}
                status={status}
                onVersionNameChange={setVersionName}
                onDescriptionChange={setDescription}
                onPromptContentChange={setPromptContent}
                onStatusChange={setStatus}
                onSaveNewVersion={handleSaveNewVersion}
                onUpdateVersion={handleUpdateVersion}
                onSetActive={handleSetActive}
              />
            )}
          </div>
        </div>
      </div>

      <TestPromptPanel
        isOpen={showTestPanel}
        onClose={() => setShowTestPanel(false)}
        onRunTest={handleRunTest}
      />
    </div>
  );
}
