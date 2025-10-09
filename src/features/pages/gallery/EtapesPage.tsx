import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import SouvenirModal from "./SouvenirModal";
import { milestones, type Milestone } from "../../../lib/milestones";

interface EtapesPageProps {
  onBack: () => void;
  onFileSelect: (file: File | null) => void;
  previewUrl: string;
  title: string;
  onTitleChange: (title: string) => void;
  date: string;
  onDateChange: (date: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  onUpload: () => void;
  uploading: boolean;
}

export default function EtapesPage({
  onBack,
  onFileSelect,
  previewUrl,
  title,
  onTitleChange,
  date,
  onDateChange,
  description,
  onDescriptionChange,
  onUpload,
  uploading
}: EtapesPageProps) {
  const [showSouvenirModal, setShowSouvenirModal] = useState(false);

  const handleMilestoneClick = (milestone: Milestone) => {
    onTitleChange(milestone.title);
    setShowSouvenirModal(true);
  };

  const handleCloseModal = () => {
    setShowSouvenirModal(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        <h2 className="text-xl font-semibold">Étapes importantes</h2>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-2 gap-4">
        {milestones.map((milestone) => {
          const IconComponent = milestone.icon;
          return (
            <button
              key={milestone.id}
              onClick={() => handleMilestoneClick(milestone)}
              className="bg-white rounded-2xl shadow p-4 text-left hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`${milestone.color} p-2 rounded-lg`}>
                  <IconComponent size={20} className="text-white" />
                </div>
                <h3 className="font-medium text-sm">{milestone.title}</h3>
              </div>
            </button>
          );
        })}
      </div>

      {/* Souvenir Modal */}
      <SouvenirModal
        isOpen={showSouvenirModal}
        onClose={handleCloseModal}
        onFileSelect={onFileSelect}
        previewUrl={previewUrl}
        title={title}
        onTitleChange={onTitleChange}
        date={date}
        onDateChange={onDateChange}
        description={description}
        onDescriptionChange={onDescriptionChange}
        onUpload={onUpload}
        uploading={uploading}
      />
    </div>
  );
}