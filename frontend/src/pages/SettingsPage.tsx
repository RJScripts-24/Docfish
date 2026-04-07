import { Sidebar } from '../components/layout/Sidebar';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { VersionHistory, PromptVersion } from '../components/features/settings/VersionHistory';
import { PromptEditor } from '../components/features/settings/PromptEditor';
import { TestPromptPanel } from '../components/features/settings/TestPromptPanel';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Plus, Beaker } from 'lucide-react';

// Mock prompt versions
const mockVersions: PromptVersion[] = [
  {
    id: 'v1.3',
    name: 'v1.3 - Enhanced vendor extraction',
    description: 'Improved vendor name detection with better handling of complex business names and address parsing.',
    timestamp: 'Updated 2 days ago',
    status: 'active',
    tags: ['stable', 'production'],
  },
  {
    id: 'v1.2',
    name: 'v1.2 - Line item improvements',
    description: 'Better extraction of line items with quantity, unit price, and total calculations.',
    timestamp: 'Updated 1 week ago',
    status: 'draft',
    tags: ['experimental'],
  },
  {
    id: 'v1.1',
    name: 'v1.1 - Tax calculation fix',
    description: 'Fixed issues with tax amount extraction and percentage calculation.',
    timestamp: 'Updated 2 weeks ago',
    status: 'draft',
  },
  {
    id: 'v1.0',
    name: 'v1.0 - Initial release',
    description: 'First production version with basic invoice extraction capabilities.',
    timestamp: 'Updated 1 month ago',
    status: 'draft',
    tags: ['baseline'],
  },
];

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
- Flag any inconsistencies in validation_warnings

**Output Format:**
{
  "vendor_name": { "value": "...", "confidence": 0.95 },
  "invoice_number": { "value": "...", "confidence": 0.98 },
  ...
}`;

export default function SettingsPage() {
  const [versions, setVersions] = useState<PromptVersion[]>(mockVersions);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('v1.3');
  const [showTestPanel, setShowTestPanel] = useState(false);

  // Find selected version
  const selectedVersion = versions.find((v) => v.id === selectedVersionId) || versions[0];

  // Editor state
  const [versionName, setVersionName] = useState(selectedVersion.name);
  const [description, setDescription] = useState(selectedVersion.description);
  const [promptContent, setPromptContent] = useState(defaultPromptContent);
  const [status, setStatus] = useState<'active' | 'draft'>(selectedVersion.status);

  const handleSelectVersion = (id: string) => {
    const version = versions.find((v) => v.id === id);
    if (version) {
      setSelectedVersionId(id);
      setVersionName(version.name);
      setDescription(version.description);
      setStatus(version.status);
      // In a real app, would load prompt content from API
    }
  };

  const handleActivateVersion = (id: string) => {
    if (confirm('Are you sure you want to activate this version?')) {
      setVersions((prev) =>
        prev.map((v) => ({
          ...v,
          status: v.id === id ? 'active' : 'draft',
        }))
      );
      alert('Version activated successfully!');
    }
  };

  const handleDeleteVersion = (id: string) => {
    const version = versions.find((v) => v.id === id);
    if (version?.status === 'active') {
      alert('Cannot delete active version. Please activate another version first.');
      return;
    }

    if (confirm('Are you sure you want to delete this version?')) {
      setVersions((prev) => prev.filter((v) => v.id !== id));
      if (selectedVersionId === id) {
        setSelectedVersionId(versions[0].id);
      }
      alert('Version deleted successfully!');
    }
  };

  const handleSaveNewVersion = () => {
    const newId = `v${versions.length + 1}.0`;
    const newVersion: PromptVersion = {
      id: newId,
      name: versionName || `v${versions.length + 1}.0 - New version`,
      description: description || 'New prompt version',
      timestamp: 'Just now',
      status: 'draft',
    };

    setVersions((prev) => [newVersion, ...prev]);
    setSelectedVersionId(newId);
    alert('New version created successfully!');
  };

  const handleUpdateVersion = () => {
    setVersions((prev) =>
      prev.map((v) =>
        v.id === selectedVersionId
          ? { ...v, name: versionName, description, status }
          : v
      )
    );
    alert('Version updated successfully!');
  };

  const handleSetActive = () => {
    setVersions((prev) =>
      prev.map((v) => ({
        ...v,
        status: v.id === selectedVersionId ? 'active' : 'draft',
      }))
    );
    setStatus('active');
    alert('Version set as active!');
  };

  const handleCreateNew = () => {
    setVersionName('');
    setDescription('');
    setPromptContent(defaultPromptContent);
    setStatus('draft');
    setSelectedVersionId('');
  };

  const handleRunTest = (sampleText: string) => {
    console.log('Running test with:', sampleText);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col">
        <DashboardHeader />

        {/* Page Header */}
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-[1920px] mx-auto">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Prompt Management
              </h1>
              <p className="text-gray-600 mt-1">
                Configure and version AI extraction prompts
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTestPanel(true)}
                className="px-5 py-2.5 bg-white border-2 border-purple-500 text-purple-700 rounded-xl hover:bg-purple-50 transition-all font-semibold flex items-center gap-2"
              >
                <Beaker className="w-5 h-5" />
                Test Prompt
              </button>
              <button
                onClick={handleCreateNew}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Version
              </button>
            </div>
          </div>
        </div>

        {/* Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Version History */}
          <div className="w-1/3">
            <VersionHistory
              versions={versions}
              selectedVersionId={selectedVersionId}
              onSelectVersion={handleSelectVersion}
              onActivateVersion={handleActivateVersion}
              onDeleteVersion={handleDeleteVersion}
            />
          </div>

          {/* Right Panel - Prompt Editor */}
          <div className="flex-1">
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
          </div>
        </div>
      </div>

      {/* Test Prompt Panel */}
      <TestPromptPanel
        isOpen={showTestPanel}
        onClose={() => setShowTestPanel(false)}
        onRunTest={handleRunTest}
      />
    </div>
  );
}