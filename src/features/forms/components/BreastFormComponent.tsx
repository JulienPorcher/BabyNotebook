import { useState, useEffect } from "react";
import { getRoundedDateTime, useFormSubmission } from "../formHelpers";
import FormWrapper from "./FormWrapper";

interface BreastFormProps {
  onSubmit: (data: { leftTime: number; rightTime: number; totalTime: number; comment: string; date_time: string }) => void | Promise<void>;
  onClose: () => void;
}

export default function BreastForm({ onSubmit, onClose }: BreastFormProps) {
  const [leftTime, setLeftTime] = useState(0);
  const [rightTime, setRightTime] = useState(0);
  const [isLeftActive, setIsLeftActive] = useState(false);
  const [isRightActive, setIsRightActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [comment, setComment] = useState("");
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [customLeftTime, setCustomLeftTime] = useState(0);
  const [customRightTime, setCustomRightTime] = useState(0);
  const [dateTime, setDateTime] = useState(getRoundedDateTime());

  const { error, isSubmitting, handleSubmit } = useFormSubmission({ 
    onSubmit: (data: Record<string, any>) => onSubmit(data as { leftTime: number; rightTime: number; totalTime: number; comment: string; date_time: string }),
    onClose 
  });

  const totalTime = leftTime + rightTime;

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if ((isLeftActive || isRightActive) && !isPaused) {
      interval = setInterval(() => {
        if (isLeftActive) {
          setLeftTime(prev => prev + 1);
        }
        if (isRightActive) {
          setRightTime(prev => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLeftActive, isRightActive, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLeftClick = () => {
    if (isRightActive) {
      setIsRightActive(false);
    }
    setIsLeftActive(!isLeftActive);
    setIsPaused(false);
  };

  const handleRightClick = () => {
    if (isLeftActive) {
      setIsLeftActive(false);
    }
    setIsRightActive(!isRightActive);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setLeftTime(0);
    setRightTime(0);
    setIsLeftActive(false);
    setIsRightActive(false);
    setIsPaused(false);
  };

  const handleSetTime = () => {
    setLeftTime(customLeftTime);
    setRightTime(customRightTime);
    setShowTimeSettings(false);
  };

  const handleFormSubmit = async () => {
    const submitData = {
      leftTime,
      rightTime,
      totalTime,
      comment,
      date_time: dateTime
    };
    await handleSubmit(submitData);
  };

  return (
    <FormWrapper
      title="Allaitement"
      onSubmit={handleFormSubmit}
      onClose={onClose}
      error={error}
      isSubmitting={isSubmitting}
      submitButtonColor="bg-pink-500"
    >
      {/* Date/Time Field */}
      <div>
        <label className="block text-sm font-medium mb-1">Date et heure</label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Gauche / Droite timers + boutons */}
      <div className="flex gap-4">
        {/* Gauche */}
        <div className="flex-1 text-center">
          <button
            type="button"
            onClick={handleLeftClick}
            className={`w-full py-3 rounded-lg font-medium ${
              isLeftActive ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700'
            }`}
          >
            Gauche
          <div className="text-2xl font-mono mb-2">{formatTime(leftTime)}</div>
          </button>
        </div>

        {/* Droite */}
        <div className="flex-1 text-center">
          <button
            type="button"
            onClick={handleRightClick}
            className={`w-full py-3 rounded-lg font-medium ${
              isRightActive ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700'
            }`}
          >  
          Droite
          <div className="text-2xl font-mono mb-2">{formatTime(rightTime)}</div>
          </button>
        </div>
      </div>

      {/* Total au centre */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">Total</div>
        <div className="text-3xl font-mono font-semibold">{formatTime(totalTime)}</div>
      </div>

      {/* Control Buttons */}
      {totalTime > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePause}
            className="flex-1 bg-yellow-500 text-white py-2 rounded-lg"
          >
            {isPaused ? 'Reprendre' : 'Pause'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg"
          >
            Reset
          </button>
        </div>
      )}

      {/* Set Time Button */}
      <button
        type="button"
        onClick={() => setShowTimeSettings(true)}
        className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg"
      >
        Définir le temps
      </button>

      {/* Time Settings Modal */}
      {showTimeSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Définir le temps</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Temps gauche (minutes)</label>
                <input
                  type="number"
                  value={customLeftTime}
                  onChange={(e) => setCustomLeftTime(Number(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Temps droite (minutes)</label>
                <input
                  type="number"
                  value={customRightTime}
                  onChange={(e) => setCustomRightTime(Number(e.target.value))}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowTimeSettings(false)}
                className="flex-1 bg-gray-200 py-2 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSetTime}
                className="flex-1 bg-pink-500 text-white py-2 rounded-lg"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Field */}
      <div>
        <label className="block text-sm font-medium mb-1">Commentaire</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded-lg p-2"
          rows={3}
          placeholder="Commentaire..."
        />
      </div>
    </FormWrapper>
  );
}